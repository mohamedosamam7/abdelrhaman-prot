import "server-only";
import { unstable_cache } from "next/cache";
import { draftMode } from "next/headers";
import { cache } from "react";
import { BUCKET_DRAFT, publicMediaUrl, supabaseConfigured } from "@/lib/supabase/env";
import { getAdmin } from "@/lib/supabase/admin-auth";
import { publicClient } from "@/lib/supabase/server";
import { mediaLookup, resolvePage, resolveProject, type MediaRow } from "./resolve";
import { Page, pageKeys, Project, Settings, type PageDoc, type PageKey, type ProjectDoc, type SettingsDoc } from "./schema";
import { staticPages, staticProjects, staticSettings } from "./static";
import type { SiteContent } from "./types";

/** Cache tag shared by everything the public site reads from the database. */
export const CMS_TAG = "cms";

interface RawContent {
  settings: unknown;
  pages: Record<string, unknown>;
  projects: unknown[];
  media: MediaRow[];
}

/** Published content in one round trip, cached until the next publish. */
const fetchPublished = unstable_cache(
  async (): Promise<RawContent | null> => {
    const { data, error } = await publicClient().rpc("published_content");
    if (error) throw new Error(`published_content: ${error.message}`);
    const raw = data as { settings: unknown; pages: Record<string, unknown>; projects: unknown[]; media: (Omit<MediaRow, "url"> & { path: string })[] };
    return { ...raw, media: (raw.media ?? []).map((m) => ({ ...m, url: publicMediaUrl(m.path) })) };
  },
  ["cms-published-v1"],
  { tags: [CMS_TAG] },
);

/** Drafts for an administrator's preview (never cached, never public). */
async function fetchDrafts(): Promise<RawContent | null> {
  const admin = await getAdmin();
  if (!admin) return null;
  const db = admin.supabase;
  const [settings, pages, projects, media] = await Promise.all([
    db.from("site_settings").select("draft").eq("id", 1).maybeSingle(),
    db.from("pages").select("key, draft"),
    db.from("projects").select("draft, featured, sort, status").neq("status", "archived").order("sort").order("slug"),
    db.from("media").select("id, kind, draft_path, width, height, alt, focus, poster_id"),
  ]);
  const err = settings.error || pages.error || projects.error || media.error;
  if (err) throw new Error(`drafts: ${err.message}`);
  const paths = (media.data ?? []).map((m) => m.draft_path as string);
  const signed = paths.length ? await db.storage.from(BUCKET_DRAFT).createSignedUrls(paths, 60 * 60) : { data: [] };
  const urlOf = new Map((signed.data ?? []).map((s) => [s.path, s.signedUrl]));
  return {
    settings: settings.data?.draft ?? null,
    pages: Object.fromEntries((pages.data ?? []).map((p) => [p.key, p.draft])),
    projects: (projects.data ?? []).map((p) => ({ ...(p.draft as object), featured: p.featured, sort: p.sort })),
    media: (media.data ?? []).map((m) => ({ ...(m as Omit<MediaRow, "url">), url: urlOf.get(m.draft_path) ?? "" })),
  };
}

function build(raw: RawContent | null, source: SiteContent["source"]): SiteContent {
  const media = mediaLookup(raw?.media ?? []);
  const fallbackPages = staticPages();

  // Each document is validated on read; anything invalid or missing falls
  // back to the built-in content for that document only.
  const settingsParsed = raw?.settings ? Settings.safeParse(raw.settings) : null;
  const settings: SettingsDoc = settingsParsed?.success ? settingsParsed.data : staticSettings();

  const pages = {} as SiteContent["pages"];
  for (const key of pageKeys) {
    const parsed = raw?.pages?.[key] ? Page(key).safeParse(raw.pages[key]) : null;
    const doc: PageDoc = parsed?.success ? parsed.data : fallbackPages[key];
    pages[key as PageKey] = resolvePage(doc, media);
  }

  const projectDocs: (ProjectDoc & { featured: boolean })[] =
    raw && raw.projects.length
      ? raw.projects.flatMap((p) => {
          const parsed = Project.safeParse(p);
          return parsed.success ? [{ ...parsed.data, featured: !!(p as { featured?: boolean }).featured }] : [];
        })
      : staticProjects();
  const projects = projectDocs.flatMap((d) => resolveProject(d, media) ?? []);

  const shareImage = settings.seo.shareImage ? media(settings.seo.shareImage) : null;
  const usedDb = !!raw && (settingsParsed?.success || raw.projects.length > 0);
  return { settings, shareImage, pages, projects, source: usedDb ? source : "static" };
}

/**
 * The content for this request. Public visitors get the published content
 * (or the built-in content when the database is unavailable). An
 * administrator with Draft Mode on sees the current drafts.
 */
export const getContent = cache(async (): Promise<SiteContent> => {
  if (!supabaseConfigured) return build(null, "static");
  try {
    if ((await draftMode()).isEnabled) {
      const drafts = await fetchDrafts();
      if (drafts) return build(drafts, "draft");
    }
    return build(await fetchPublished(), "published");
  } catch (e) {
    console.error("[cms] falling back to built-in content:", e instanceof Error ? e.message : e);
    return build(null, "static");
  }
});

/**
 * Published content only, for code that runs outside a request
 * (generateStaticParams, the sitemap) where Draft Mode doesn't exist.
 */
export const getPublishedContent = cache(async (): Promise<SiteContent> => {
  if (!supabaseConfigured) return build(null, "static");
  try {
    return build(await fetchPublished(), "published");
  } catch (e) {
    console.error("[cms] falling back to built-in content:", e instanceof Error ? e.message : e);
    return build(null, "static");
  }
});
