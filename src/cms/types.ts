/**
 * Resolved content: documents with every media reference replaced by the
 * photograph (or video) it points to. This is what the public pages render.
 */
import type { Photo } from "@/content/photos";
import type { HeadingDoc, LText, PageKey, SectionDoc, SettingsDoc } from "./schema";

export type { Photo };

type Resolve<S> = S extends { type: "hero"; data: infer D }
  ? { type: "hero"; data: Omit<D, "slots"> & { slots: { id: string; type: "portrait" | "landscape"; photo: Photo; focus: string }[] } }
  : S extends { type: "gallery"; data: infer D }
    ? { type: "gallery"; data: Omit<D, "items"> & { items: { id: string; photo: Photo; category: string; project: string | null }[] } }
    : S extends { type: "textMedia"; data: infer D }
      ? { type: "textMedia"; data: Omit<D, "media"> & { media: Photo } }
      : S;

export type ResolvedSection = { id: string; hidden: boolean } & Resolve<SectionDoc>;
export type ResolvedOf<T extends ResolvedSection["type"]> = Extract<ResolvedSection, { type: T }>;

export interface CmsProject {
  slug: string;
  category: string;
  title: LText;
  summary: LText;
  year: string;
  cover: Photo;
  images: Photo[];
  featured: boolean;
}

export interface SiteContent {
  settings: SettingsDoc;
  shareImage: Photo | null;
  pages: Record<PageKey, ResolvedSection[]>;
  /** Published (or, in preview, draft) projects in display order. */
  projects: CmsProject[];
  /** "static" = built-in content (no database or it failed), "published", or "draft" (preview). */
  source: "static" | "published" | "draft";
}

export type { HeadingDoc, LText };
