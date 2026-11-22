/**
 * The site's built-in content expressed as dashboard documents.
 *
 * Two uses:
 *   1. Fallback — whenever Supabase is not configured, unreachable, or has
 *      not been imported yet, the public site renders these documents, so a
 *      database problem can never blank a page.
 *   2. Import — the dashboard's one-time "import current site" step writes
 *      exactly these documents to the database (idempotently).
 */
import { approach, heroCopy, heroSlots, selectedFrames, selectedFramesCopy, services } from "@/content/home";
import { projects } from "@/content/projects";
import { site } from "@/content/site";
import { en } from "@/i18n/dictionaries/en";
import { ar } from "@/i18n/dictionaries/ar";
import type { HeroSlotId, PageDoc, PageKey, ProjectDoc, SettingsDoc } from "./schema";

const ref = (photoId: string) => `static:${photoId}`;

export function staticSettings(): SettingsDoc {
  const c = site.contact;
  return {
    brandName: site.brand.name,
    fullName: site.fullName,
    role: site.role,
    location: { city: site.location.city, country: site.location.country, short: site.location.short },
    description: site.description,
    nav: {
      home: { en: en.nav.home, ar: ar.nav.home },
      work: { en: en.nav.work, ar: ar.nav.work },
      contact: { en: en.nav.contact, ar: ar.nav.contact },
      letsTalk: { en: en.nav.letsTalk, ar: ar.nav.letsTalk },
    },
    contact: {
      heading: c.heading,
      subheading: c.subheading,
      body: c.body,
      instagram: { handle: c.instagram.handle, url: c.instagram.url },
      behance: { enabled: !c.behance.placeholder && !!c.behance.url, handle: c.behance.handle, url: c.behance.url },
      email: { enabled: !c.email.placeholder && !!c.email.value, value: c.email.value },
      whatsapp: {
        enabled: !c.whatsapp.placeholder && !!c.whatsapp.value,
        number: c.whatsapp.value,
        display: c.whatsapp.display,
        message: c.whatsapp.message,
      },
    },
    seo: {
      homeTitle: { en: en.meta.homeTitle, ar: ar.meta.homeTitle },
      homeDescription: site.description,
      shareImage: null,
    },
    theme: { gradient: "classic" },
  };
}

export function staticPages(): Record<PageKey, PageDoc> {
  return {
    home: {
      sections: [
        {
          id: "hero",
          type: "hero",
          hidden: false,
          data: {
            title: heroCopy.title,
            meta: heroCopy.meta,
            slots: heroSlots.map((s) => ({ id: s.id as HeroSlotId, media: ref(s.photo), focus: s.focus })),
          },
        },
        {
          id: "selected-frames",
          type: "gallery",
          hidden: false,
          data: {
            label: selectedFramesCopy.label,
            heading: selectedFramesCopy.heading,
            body: selectedFramesCopy.body,
            interval: selectedFramesCopy.interval,
            // Only image items exist in the built-in content.
            items: selectedFrames.map((f) => ({ id: f.id, media: ref(f.src), category: f.category, project: f.project ?? null })),
          },
        },
        {
          id: "services",
          type: "services",
          hidden: false,
          data: {
            label: services.label,
            heading: services.heading,
            items: services.items.map((s) => ({ key: s.key, title: s.title, description: s.description, cta: s.cta, href: s.href })),
          },
        },
        {
          id: "approach",
          type: "textMedia",
          hidden: false,
          data: {
            label: approach.label,
            heading: approach.heading,
            body: approach.body,
            media: ref(approach.photo.id),
            caption: approach.caption,
            points: approach.points.map((p) => ({ title: p.title, text: p.text })),
          },
        },
        { id: "contact", type: "contact", hidden: false, data: {} },
      ],
    },
    work: { sections: [] },
    contact: { sections: [] },
  };
}

/** Public (non-demo) projects, in their current order. */
export function staticProjects(): (ProjectDoc & { featured: boolean; sort: number })[] {
  return projects
    .filter((p) => !p.demo)
    .map((p, i) => ({
      slug: p.slug,
      category: p.category as ProjectDoc["category"],
      title: p.title,
      summary: { en: p.summary ?? "", ar: "" },
      year: p.year ?? "",
      cover: ref(p.cover.id),
      media: p.images.map((img) => ref(img.id)),
      featured: i < 6,
      sort: i,
    }));
}
