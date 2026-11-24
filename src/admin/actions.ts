"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { CMS_TAG } from "@/cms/load";
import { MediaMeta, Page, Project, Settings, Slug, pageKeys, projectStatuses, uploadLimits, type PageKey } from "@/cms/schema";
import { staticPages, staticProjects, staticSettings } from "@/cms/static";
import { getAdmin } from "@/lib/supabase/admin-auth";
import { BUCKET_DRAFT, BUCKET_PUBLIC, supabaseConfigured } from "@/lib/supabase/env";
import { sessionClient } from "@/lib/supabase/server";
import { loadDrafts, refsIn, validateAll, whereUsed } from "./data";
import { ADMIN_LANG_COOKIE } from "./i18n";

export type Result<T = object> =
  | ({ ok: true } & T)
  | { ok: false; error: "unauthorized" | "invalid" | "error" | "in-use" | "conflict"; issues?: { path: string; message: string }[]; detail?: string };

const issuesOf = (e: z.ZodError) => e.issues.map((i) => ({ path: i.path.join("."), message: i.message }));

async function admin() {
  const a = await getAdmin();
  return a;
}

function fail(detail: unknown): Result {
  console.error("[admin]", detail instanceof Error ? detail.message : detail);
  return { ok: false, error: "error" };
}

/* ── Language ───────────────────────────────────────────────────────────── */

export async function setAdminLang(lang: "ar" | "en") {
  (await cookies()).set(ADMIN_LANG_COOKIE, lang === "en" ? "en" : "ar", { path: "/admin", sameSite: "lax", maxAge: 31536000 });
}

/* ── Authentication ─────────────────────────────────────────────────────── */

const Credentials = z.object({ email: z.email().max(200), password: z.string().min(1).max(200) });

/** Returns the typed email on failure: React resets the form after an action, and the address shouldn't have to be typed again. */
export async function signIn(_: unknown, form: FormData): Promise<{ error?: "failed" | "unavailable"; email?: string }> {
  const email = String(form.get("email") ?? "").slice(0, 200);
  if (!supabaseConfigured) return { error: "unavailable", email };
  const parsed = Credentials.safeParse({ email: form.get("email"), password: form.get("password") });
  if (!parsed.success) return { error: "failed", email };
  const supabase = await sessionClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  // One generic message: never reveal whether the address exists.
  if (error) return { error: "failed", email };
  redirect("/admin");
}

export async function signOut() {
  const supabase = await sessionClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

export async function requestReset(_: unknown, form: FormData): Promise<{ sent?: boolean }> {
  const email = z.email().max(200).safeParse(form.get("email"));
  if (email.success && supabaseConfigured) {
    const h = await headers();
    const origin = `${h.get("x-forwarded-proto") ?? "https"}://${h.get("host")}`;
    const supabase = await sessionClient();
    await supabase.auth.resetPasswordForEmail(email.data, { redirectTo: `${origin}/admin/auth/confirm?next=/admin/reset` });
  }
  // Same answer either way (no account enumeration).
  return { sent: true };
}

export async function updatePassword(_: unknown, form: FormData): Promise<{ error?: "rules" | "expired"; done?: boolean }> {
  const password = z.string().min(10).max(200).safeParse(form.get("password"));
  if (!password.success) return { error: "rules" };
  const supabase = await sessionClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return { error: "expired" };
  const { error } = await supabase.auth.updateUser({ password: password.data });
  if (error) {
    console.error("[admin] updatePassword:", error.code ?? "", error.message);
    return { error: error.code === "weak_password" ? "rules" : "expired" };
  }
  return { done: true };
}

/* ── Drafts ─────────────────────────────────────────────────────────────── */

export async function saveSettings(doc: unknown): Promise<Result> {
  const a = await admin();
  if (!a) return { ok: false, error: "unauthorized" };
  const parsed = Settings.safeParse(doc);
  if (!parsed.success) return { ok: false, error: "invalid", issues: issuesOf(parsed.error) };
  const { error } = await a.supabase.from("site_settings").upsert({ id: 1, draft: parsed.data, updated_by: a.userId });
  return error ? fail(error) : { ok: true };
}

export async function savePage(key: PageKey, doc: unknown): Promise<Result> {
  const a = await admin();
  if (!a) return { ok: false, error: "unauthorized" };
  if (!pageKeys.includes(key)) return { ok: false, error: "invalid" };
  const parsed = Page(key).safeParse(doc);
  if (!parsed.success) return { ok: false, error: "invalid", issues: issuesOf(parsed.error) };
  const media = await videosNeedPosters(a.supabase, parsed.data);
  if (media) return { ok: false, error: "invalid", issues: [media] };
  const { error } = await a.supabase.from("pages").upsert({ key, draft: parsed.data, updated_by: a.userId });
  return error ? fail(error) : { ok: true };
}

/** A video used in a slot must have a poster image (it holds the slot's ratio). */
async function videosNeedPosters(db: Awaited<ReturnType<typeof sessionClient>>, doc: unknown) {
  const ids = [...refsIn(doc)];
  if (!ids.length) return null;
  const { data } = await db.from("media").select("id, kind, poster_id").in("id", ids);
  const bad = (data ?? []).find((m) => m.kind === "video" && !m.poster_id);
  return bad ? { path: "media", message: "video-needs-poster" } : null;
}

const NewProject = z.object({ slug: Slug, title: z.string().trim().min(1).max(90) });

export async function createProject(input: unknown): Promise<Result<{ id: string }>> {
  const a = await admin();
  if (!a) return { ok: false, error: "unauthorized" };
  const parsed = NewProject.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid", issues: issuesOf(parsed.error) };
  const { data: last } = await a.supabase.from("projects").select("sort").order("sort", { ascending: false }).limit(1).maybeSingle();
  // A new project needs a cover before it can be published; it starts as a draft.
  const draft = { slug: parsed.data.slug, category: "events", title: { en: parsed.data.title, ar: "" }, summary: { en: "", ar: "" }, year: "", cover: "static:p1-r1c4", media: [] };
  const { data, error } = await a.supabase
    .from("projects")
    .insert({ slug: parsed.data.slug, status: "draft", sort: (last?.sort ?? 0) + 1, draft, updated_by: a.userId })
    .select("id")
    .single();
  if (error?.code === "23505") return { ok: false, error: "conflict", issues: [{ path: "slug", message: "slug-taken" }] };
  return error ? (fail(error) as Result<{ id: string }>) : { ok: true, id: data.id };
}

const ProjectSave = z.object({
  doc: Project,
  status: z.enum(projectStatuses),
  featured: z.boolean(),
});

export async function saveProject(id: string, input: unknown): Promise<Result> {
  const a = await admin();
  if (!a) return { ok: false, error: "unauthorized" };
  if (!z.uuid().safeParse(id).success) return { ok: false, error: "invalid" };
  const parsed = ProjectSave.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid", issues: issuesOf(parsed.error) };
  const media = await videosNeedPosters(a.supabase, parsed.data.doc);
  if (media) return { ok: false, error: "invalid", issues: [media] };
  const { error } = await a.supabase
    .from("projects")
    .update({ slug: parsed.data.doc.slug, draft: parsed.data.doc, status: parsed.data.status, featured: parsed.data.featured, updated_by: a.userId })
    .eq("id", id);
  if (error?.code === "23505") return { ok: false, error: "conflict", issues: [{ path: "slug", message: "slug-taken" }] };
  return error ? fail(error) : { ok: true };
}

export async function reorderProjects(ids: unknown): Promise<Result> {
  const a = await admin();
  if (!a) return { ok: false, error: "unauthorized" };
  const parsed = z.array(z.uuid()).max(500).safeParse(ids);
  if (!parsed.success) return { ok: false, error: "invalid" };
  for (const [i, id] of parsed.data.entries()) {
    const { error } = await a.supabase.from("projects").update({ sort: i }).eq("id", id);
    if (error) return fail(error);
  }
  return { ok: true };
}

/** Only never-published drafts can be deleted; published work is archived instead. */
export async function deleteDraftProject(id: string): Promise<Result> {
  const a = await admin();
  if (!a) return { ok: false, error: "unauthorized" };
  if (!z.uuid().safeParse(id).success) return { ok: false, error: "invalid" };
  const { error } = await a.supabase.from("projects").delete().eq("id", id).is("published", null).eq("status", "draft");
  return error ? fail(error) : { ok: true };
}

/* ── Media ──────────────────────────────────────────────────────────────── */

const NewMedia = z.object({
  path: z.string().regex(/^uploads\/\d{4}\/[0-9a-f-]{36}\.(jpg|jpeg|png|webp|avif|mp4|webm)$/),
  mime: z.string(),
  bytes: z.number().int().positive(),
  width: z.number().int().positive().max(20000).nullable(),
  height: z.number().int().positive().max(20000).nullable(),
  duration: z.number().nonnegative().max(3600).nullable(),
  name: z.string().max(200),
});

/**
 * Called after the browser has uploaded a file straight to the private
 * bucket. The server re-checks the stored object (it must exist, with an
 * allowed type and size) before the library row is created.
 */
export async function registerMedia(input: unknown): Promise<Result<{ id: string }>> {
  const a = await admin();
  if (!a) return { ok: false, error: "unauthorized" };
  const parsed = NewMedia.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid", issues: issuesOf(parsed.error) };
  const m = parsed.data;
  const kind = m.mime.startsWith("video/") ? "video" : "image";
  const limits = uploadLimits[kind];
  const folder = m.path.slice(0, m.path.lastIndexOf("/"));
  const file = m.path.slice(m.path.lastIndexOf("/") + 1);
  const { data: listed, error: listError } = await a.supabase.storage.from(BUCKET_DRAFT).list(folder, { search: file, limit: 1 });
  const obj = listed?.find((o) => o.name === file);
  const size = Number(obj?.metadata?.size ?? 0);
  const type = String(obj?.metadata?.mimetype ?? "");
  if (listError || !obj || !(limits.types as readonly string[]).includes(type) || size > limits.maxBytes || size <= 0) {
    await a.supabase.storage.from(BUCKET_DRAFT).remove([m.path]);
    return { ok: false, error: "invalid", issues: [{ path: "file", message: "rejected" }] };
  }
  const { data, error } = await a.supabase
    .from("media")
    .insert({ kind, draft_path: m.path, mime: type, bytes: size, width: m.width, height: m.height, duration_seconds: m.duration, original_name: m.name, created_by: a.userId })
    .select("id")
    .single();
  return error ? (fail(error) as Result<{ id: string }>) : { ok: true, id: data.id };
}

export async function updateMedia(id: string, meta: unknown): Promise<Result> {
  const a = await admin();
  if (!a) return { ok: false, error: "unauthorized" };
  if (!z.uuid().safeParse(id).success) return { ok: false, error: "invalid" };
  const parsed = MediaMeta.safeParse(meta);
  if (!parsed.success) return { ok: false, error: "invalid", issues: issuesOf(parsed.error) };
  if (parsed.data.posterId) {
    const { data: poster } = await a.supabase.from("media").select("kind").eq("id", parsed.data.posterId).maybeSingle();
    if (poster?.kind !== "image") return { ok: false, error: "invalid", issues: [{ path: "posterId", message: "poster-must-be-image" }] };
  }
  const { error } = await a.supabase
    .from("media")
    .update({ alt: parsed.data.alt, description: parsed.data.description, focus: parsed.data.focus, poster_id: parsed.data.posterId })
    .eq("id", id);
  return error ? fail(error) : { ok: true };
}

export async function deleteMedia(id: string): Promise<Result<{ usedIn?: string[] }>> {
  const a = await admin();
  if (!a) return { ok: false, error: "unauthorized" };
  if (!z.uuid().safeParse(id).success) return { ok: false, error: "invalid" };
  const used = await whereUsed(a.supabase, id);
  if (used.length) return { ok: false, error: "in-use", detail: used.join(", ") };
  const { data: row } = await a.supabase.from("media").select("draft_path, public_path").eq("id", id).maybeSingle();
  if (!row) return { ok: true };
  const { error } = await a.supabase.from("media").delete().eq("id", id);
  if (error) return fail(error);
  await a.supabase.storage.from(BUCKET_DRAFT).remove([row.draft_path]);
  if (row.public_path) await a.supabase.storage.from(BUCKET_PUBLIC).remove([row.public_path]);
  return { ok: true };
}

/* ── Publishing ─────────────────────────────────────────────────────────── */

export async function publishAll(note: string): Promise<Result<{ problems?: string[] }>> {
  const a = await admin();
  if (!a) return { ok: false, error: "unauthorized" };
  try {
    const drafts = await loadDrafts(a.supabase);
    const problems = validateAll(drafts);
    if (problems.length) return { ok: false, error: "invalid", issues: problems.map((p) => ({ path: p, message: "invalid" })) };

    // 1. Media referenced by what is about to go live → public bucket.
    const ids = new Set<string>();
    if (drafts.settings) refsIn(drafts.settings.draft).forEach((i) => ids.add(i));
    drafts.pages.forEach((p) => refsIn(p.draft).forEach((i) => ids.add(i)));
    drafts.projects.filter((p) => p.status === "published").forEach((p) => refsIn(p.draft).forEach((i) => ids.add(i)));
    if (ids.size) {
      const { data: rows, error } = await a.supabase.from("media").select("id, kind, draft_path, public_path, width, height, alt, focus, poster_id").in("id", [...ids]);
      if (error) throw error;
      // Video posters go live with their video.
      const posterIds = (rows ?? []).map((r) => r.poster_id).filter((x): x is string => !!x && !ids.has(x));
      const posters = posterIds.length ? (await a.supabase.from("media").select("id, kind, draft_path, public_path, width, height, alt, focus, poster_id").in("id", posterIds)).data ?? [] : [];
      for (const m of [...(rows ?? []), ...posters]) {
        if (!m.public_path) {
          const { error: copyError } = await a.supabase.storage.from(BUCKET_DRAFT).copy(m.draft_path, m.draft_path, { destinationBucket: BUCKET_PUBLIC });
          if (copyError && !/exists/i.test(copyError.message)) throw copyError;
        }
        const published_meta = { kind: m.kind, width: m.width, height: m.height, alt: m.alt, focus: m.focus, poster_id: m.poster_id };
        const { error: upError } = await a.supabase.from("media").update({ public_path: m.draft_path, published_meta }).eq("id", m.id);
        if (upError) throw upError;
      }
    }

    // 2. Drafts → published, in one transaction (with a restorable snapshot).
    const { error } = await a.supabase.rpc("publish_all", { note: z.string().max(200).catch("").parse(note) || null });
    if (error) throw error;

    // 3. The public site picks it up immediately.
    revalidateTag(CMS_TAG, { expire: 0 });
    revalidatePath("/[lang]", "layout");
    revalidatePath("/sitemap.xml");
    return { ok: true };
  } catch (e) {
    return fail(e) as Result<{ problems?: string[] }>;
  }
}

/**
 * Adds the site's built-in content to the dashboard as drafts — only what is
 * missing. Existing settings, pages and projects (matched by slug) are never
 * overwritten, so running it again changes nothing and duplicates nothing.
 * A backup of the current drafts is recorded first.
 */
export async function importStatic(): Promise<Result<{ added?: string[]; skipped?: string[] }>> {
  const a = await admin();
  if (!a) return { ok: false, error: "unauthorized" };
  try {
    const current = await loadDrafts(a.supabase);
    const { error: backupError } = await a.supabase.from("revisions").insert({
      entity: "snapshot",
      entity_key: "drafts",
      data: { settings: current.settings?.draft ?? null, pages: Object.fromEntries(current.pages.map((p) => [p.key, p.draft])), projects: current.projects.map((p) => ({ slug: p.slug, draft: p.draft, status: p.status, featured: p.featured, sort: p.sort })) },
      note: "Before import of built-in content",
      created_by: a.userId,
    });
    if (backupError) throw backupError;

    const added: string[] = [];
    const skipped: string[] = [];

    if (current.settings) skipped.push("settings");
    else {
      const { error } = await a.supabase.from("site_settings").insert({ id: 1, draft: staticSettings(), updated_by: a.userId });
      if (error && error.code !== "23505") throw error;
      added.push("settings");
    }
    const pages = staticPages();
    for (const key of pageKeys) {
      if (current.pages.some((p) => p.key === key)) {
        skipped.push(`page:${key}`);
        continue;
      }
      const { error } = await a.supabase.from("pages").insert({ key, draft: pages[key], updated_by: a.userId });
      if (error && error.code !== "23505") throw error;
      added.push(`page:${key}`);
    }
    const existing = new Set(current.projects.map((p) => p.slug));
    for (const p of staticProjects()) {
      const { featured, sort, ...doc } = p;
      if (existing.has(doc.slug)) {
        skipped.push(`project:${doc.slug}`);
        continue;
      }
      const { error } = await a.supabase.from("projects").insert({ slug: doc.slug, status: "published", featured, sort, draft: doc, updated_by: a.userId });
      // 23505 = created meanwhile (double click / second tab): leave it as is.
      if (error && error.code !== "23505") throw error;
      added.push(`project:${doc.slug}`);
    }
    return { ok: true, added, skipped };
  } catch (e) {
    return fail(e) as Result<{ added?: string[]; skipped?: string[] }>;
  }
}

/** Copies a saved version back into the drafts (nothing goes live until published). */
export async function restoreRevision(id: number): Promise<Result> {
  const a = await admin();
  if (!a) return { ok: false, error: "unauthorized" };
  if (!Number.isInteger(id)) return { ok: false, error: "invalid" };
  try {
    const { data: rev, error } = await a.supabase.from("revisions").select("entity, entity_key, data").eq("id", id).single();
    if (error) throw error;
    const d = rev.data as { settings?: unknown; pages?: Record<string, unknown>; projects?: { id?: string; slug?: string; published?: unknown; draft?: unknown }[] };
    if (d.settings && Settings.safeParse(d.settings).success) await a.supabase.from("site_settings").update({ draft: d.settings }).eq("id", 1);
    for (const key of pageKeys) {
      const doc = d.pages?.[key];
      if (doc && Page(key).safeParse(doc).success) await a.supabase.from("pages").update({ draft: doc }).eq("key", key);
    }
    for (const p of d.projects ?? []) {
      const doc = (p.published ?? p.draft) as Record<string, unknown> | null;
      const parsed = doc ? Project.safeParse(doc) : null;
      if (!parsed?.success) continue;
      if (p.id) await a.supabase.from("projects").update({ draft: parsed.data, slug: parsed.data.slug }).eq("id", p.id);
      else await a.supabase.from("projects").update({ draft: parsed.data }).eq("slug", parsed.data.slug);
    }
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}
