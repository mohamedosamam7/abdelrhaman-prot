import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { photos } from "@/content/photos";
import { photoAltAr } from "@/content/photo-alt-ar";
import { BUCKET_DRAFT } from "@/lib/supabase/env";
import { Page, pageKeys, Project, Settings, type LText, type PageDoc, type PageKey, type ProjectDoc, type SettingsDoc } from "@/cms/schema";

export interface ProjectRow {
  id: string;
  slug: string;
  status: "draft" | "published" | "archived";
  featured: boolean;
  sort: number;
  draft: ProjectDoc;
  published: unknown;
  updated_at: string;
  published_at: string | null;
}

export interface MediaItem {
  id: string;
  kind: "image" | "video";
  draft_path: string;
  public_path: string | null;
  mime: string;
  bytes: number;
  width: number | null;
  height: number | null;
  poster_id: string | null;
  alt: LText;
  description: LText;
  focus: string;
  original_name: string | null;
  created_at: string;
  /** Short-lived signed URL (draft bucket) for display in the dashboard. */
  url: string;
}

/** What the picker offers: uploads plus the photographs shipped with the site. */
export interface PickerItem {
  ref: string;
  kind: "image" | "video";
  url: string;
  posterUrl?: string;
  label: string;
  builtIn: boolean;
}

export async function loadDrafts(db: SupabaseClient) {
  const [settings, pages, projects] = await Promise.all([
    db.from("site_settings").select("draft, published, updated_at, published_at").eq("id", 1).maybeSingle(),
    db.from("pages").select("key, draft, published, updated_at, published_at"),
    db.from("projects").select("id, slug, status, featured, sort, draft, published, updated_at, published_at").order("sort").order("slug"),
  ]);
  const err = settings.error || pages.error || projects.error;
  if (err) throw new Error(err.message);
  return {
    settings: settings.data as { draft: SettingsDoc; published: unknown; updated_at: string; published_at: string | null } | null,
    pages: (pages.data ?? []) as { key: PageKey; draft: PageDoc; published: unknown; updated_at: string; published_at: string | null }[],
    projects: (projects.data ?? []) as ProjectRow[],
  };
}

export async function loadMedia(db: SupabaseClient): Promise<MediaItem[]> {
  const { data, error } = await db
    .from("media")
    .select("id, kind, draft_path, public_path, mime, bytes, width, height, poster_id, alt, description, focus, original_name, created_at")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  const rows = data ?? [];
  const signed = rows.length ? await db.storage.from(BUCKET_DRAFT).createSignedUrls(rows.map((r) => r.draft_path), 60 * 60) : { data: [] };
  const urls = new Map((signed.data ?? []).map((s) => [s.path, s.signedUrl]));
  return rows.map((r) => ({ ...(r as Omit<MediaItem, "url">), url: urls.get(r.draft_path) ?? "" }));
}

export function pickerItems(media: MediaItem[]): PickerItem[] {
  const byId = new Map(media.map((m) => [m.id, m]));
  const uploads: PickerItem[] = media.map((m) => ({
    ref: m.id,
    kind: m.kind,
    url: m.url,
    posterUrl: m.poster_id ? byId.get(m.poster_id)?.url : undefined,
    label: m.alt.en || m.alt.ar || m.original_name || m.id.slice(0, 8),
    builtIn: false,
  }));
  const builtIn: PickerItem[] = Object.values(photos)
    .filter((p) => !p.placeholder)
    .map((p) => ({ ref: `static:${p.id}`, kind: "image" as const, url: p.src, label: `${p.alt} · ${photoAltAr[p.id] ?? ""}`, builtIn: true }));
  return [...uploads, ...builtIn];
}

/* ── References ─────────────────────────────────────────────────────────── */

const UUID = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;

/** Every uploaded-media id referenced by a document (as a set). */
export function refsIn(doc: unknown): Set<string> {
  return new Set((JSON.stringify(doc ?? null).match(UUID) ?? []).map((s) => s.toLowerCase()));
}

/** Where a media item is used (drafts and live content), for delete protection. */
export async function whereUsed(db: SupabaseClient, mediaId: string): Promise<string[]> {
  const id = mediaId.toLowerCase();
  const { settings, pages, projects } = await loadDrafts(db);
  const places: string[] = [];
  if (settings && (refsIn(settings.draft).has(id) || refsIn(settings.published).has(id))) places.push("settings");
  for (const p of pages) if (refsIn(p.draft).has(id) || refsIn(p.published).has(id)) places.push(`page:${p.key}`);
  for (const p of projects) if (refsIn(p.draft).has(id) || refsIn(p.published).has(id)) places.push(`project:${p.slug}`);
  const posters = await db.from("media").select("id").eq("poster_id", mediaId);
  for (const m of posters.data ?? []) places.push(`poster:${m.id}`);
  return places;
}

/* ── Validation of whole drafts (used before publishing) ────────────────── */

export function validateAll(d: Awaited<ReturnType<typeof loadDrafts>>) {
  const problems: string[] = [];
  if (d.settings && !Settings.safeParse(d.settings.draft).success) problems.push("settings");
  for (const key of pageKeys) {
    const row = d.pages.find((p) => p.key === key);
    if (row && !Page(key).safeParse(row.draft).success) problems.push(`page:${key}`);
  }
  for (const p of d.projects) if (p.status === "published" && !Project.safeParse(p.draft).success) problems.push(`project:${p.slug}`);
  return problems;
}

/* ── Missing translations ───────────────────────────────────────────────── */

/** Paths of bilingual fields with English but no Arabic (or the reverse). */
export function missingTranslations(doc: unknown, prefix = ""): string[] {
  const out: string[] = [];
  const walk = (v: unknown, path: string) => {
    if (!v || typeof v !== "object") return;
    const o = v as Record<string, unknown>;
    if (typeof o.en === "string" && typeof o.ar === "string") {
      if (!!o.en.trim() !== !!o.ar.trim()) out.push(path);
      return;
    }
    for (const [k, val] of Object.entries(o)) walk(val, path ? `${path}.${k}` : k);
  };
  walk(doc, prefix);
  return out;
}

/** media id → places it is used (drafts or live), computed in one pass. */
export function usageMap(d: Awaited<ReturnType<typeof loadDrafts>>, media: MediaItem[]): Record<string, string[]> {
  const map: Record<string, string[]> = {};
  const add = (ids: Set<string>, place: string) => ids.forEach((id) => (map[id] ??= []).includes(place) || map[id].push(place));
  if (d.settings) add(new Set([...refsIn(d.settings.draft), ...refsIn(d.settings.published)]), "settings");
  for (const p of d.pages) add(new Set([...refsIn(p.draft), ...refsIn(p.published)]), `page:${p.key}`);
  for (const p of d.projects) add(new Set([...refsIn(p.draft), ...refsIn(p.published)]), `project:${p.slug}`);
  for (const m of media) if (m.poster_id) add(new Set([m.poster_id.toLowerCase()]), `poster:${m.original_name ?? m.id.slice(0, 8)}`);
  return map;
}
