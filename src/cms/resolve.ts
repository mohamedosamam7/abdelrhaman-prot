/**
 * Turns documents (media references) into renderable content (photographs).
 * A reference that no longer resolves — a deleted upload, an unknown static
 * id — falls back to the built-in photograph for that place, or is dropped
 * from lists, so a page never renders a broken image.
 */
import { photos, type Photo } from "@/content/photos";
import { heroSlots } from "@/content/home";
import { approach } from "@/content/home";
import type { PageDoc, ProjectDoc, SectionDoc } from "./schema";
import type { CmsProject, ResolvedSection } from "./types";

export interface MediaRow {
  id: string;
  kind: "image" | "video";
  /** Public (or, in preview, signed) URL of the file. */
  url: string;
  width: number | null;
  height: number | null;
  alt: { en: string; ar: string };
  focus: string;
  poster_id: string | null;
}

export type MediaLookup = (ref: string) => Photo | null;

export function mediaLookup(rows: MediaRow[]): MediaLookup {
  const byId = new Map(rows.map((r) => [r.id, r]));
  return (ref) => {
    if (ref.startsWith("static:")) return photos[ref.slice(7)] ?? null;
    const m = byId.get(ref);
    if (!m) return null;
    const poster = m.kind === "video" && m.poster_id ? byId.get(m.poster_id) : undefined;
    // A video needs a poster image to hold its slot (and to show when autoplay
    // is off); without one it is treated as missing and the fallback is used.
    if (m.kind === "video" && !poster) return null;
    const w = m.width ?? poster?.width ?? 1600;
    const h = m.height ?? poster?.height ?? 1000;
    return {
      id: m.id,
      src: m.kind === "video" ? poster!.url : m.url,
      alt: m.alt.en,
      altAr: m.alt.ar,
      width: w,
      height: h,
      position: m.focus,
      placeholder: false,
      kind: m.kind,
      videoSrc: m.kind === "video" ? m.url : undefined,
    };
  };
}

const staticSlot = (id: string) => {
  const s = heroSlots.find((x) => x.id === id);
  return s ? photos[s.photo] : undefined;
};

export function resolveSection(s: SectionDoc, media: MediaLookup): ResolvedSection | null {
  switch (s.type) {
    case "hero":
      return {
        ...s,
        data: {
          ...s.data,
          slots: s.data.slots.map((slot) => ({
            id: slot.id,
            type: slot.id.startsWith("P") ? ("portrait" as const) : ("landscape" as const),
            photo: media(slot.media) ?? staticSlot(slot.id)!,
            focus: slot.focus,
          })),
        },
      };
    case "gallery": {
      const items = s.data.items.flatMap((it) => {
        const photo = media(it.media);
        return photo ? [{ id: it.id, photo, category: it.category, project: it.project }] : [];
      });
      return items.length ? { ...s, data: { ...s.data, items } } : null;
    }
    case "textMedia":
      return { ...s, data: { ...s.data, media: media(s.data.media) ?? approach.photo } };
    default:
      return s;
  }
}

export function resolvePage(doc: PageDoc, media: MediaLookup, includeHidden = false): ResolvedSection[] {
  return doc.sections.filter((s) => includeHidden || !s.hidden).flatMap((s) => resolveSection(s, media) ?? []);
}

export function resolveProject(doc: ProjectDoc & { featured?: boolean }, media: MediaLookup): CmsProject | null {
  const images = doc.media.flatMap((r) => media(r) ?? []);
  const cover = media(doc.cover) ?? images[0];
  if (!cover) return null;
  return {
    slug: doc.slug,
    category: doc.category,
    title: doc.title,
    summary: doc.summary,
    year: doc.year,
    cover,
    images: images.length ? images : [cover],
    featured: !!doc.featured,
  };
}
