/**
 * Content documents managed from the dashboard.
 *
 * Every document is stored twice in the database: a private `draft` that the
 * dashboard edits, and the `published` copy the public site reads. Both are
 * validated with these schemas on the server before they are written, and
 * again when read, so a malformed row can never reach a page.
 *
 * Text is bilingual (`L`). Arabic may be left empty while a translation is
 * pending: the dashboard flags it and the public site falls back to English.
 */
import { z } from "zod";

const text = (max: number) => z.string().trim().max(max);

/** Bilingual text. */
export const L = (max = 600) => z.object({ en: text(max), ar: text(max) });
export type LText = { en: string; ar: string };

/** A heading with an emphasised second half, per language. */
export const Heading = z.object({
  en: z.object({ lead: text(120), emphasis: text(120) }),
  ar: z.object({ lead: text(120), emphasis: text(120) }),
});
export type HeadingDoc = z.infer<typeof Heading>;

/**
 * A media reference: `static:<photo id>` for the photographs shipped with the
 * site (src/content/photos.ts), or the UUID of an uploaded media item.
 */
export const MediaRef = z
  .string()
  .regex(/^(static:[a-z0-9-]{1,64}|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i, "Invalid media reference");
export type MediaRefT = z.infer<typeof MediaRef>;

/** CSS object-position, "x% y%". */
export const Focus = z.string().regex(/^\d{1,3}% \d{1,3}%$/, "Use the form 50% 40%");

export const categories = ["events", "sports", "commercial", "food", "people"] as const;
export const Category = z.enum(categories);

export const Slug = z
  .string()
  .trim()
  .min(2)
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Lowercase letters, numbers and single hyphens only");

/** Internal links the dashboard may point to — no free-form URLs into the page. */
export const InternalHref = z
  .string()
  .regex(/^\/(work|contact)?(\?(category|service)=[a-z]+)?$/, "Choose one of the site's own pages");

/* ── Site settings ──────────────────────────────────────────────────────── */

export const gradients = ["classic", "deep", "soft"] as const;

export const Settings = z.object({
  brandName: text(40).min(1),
  fullName: L(80),
  role: L(80),
  location: z.object({ city: L(60), country: L(60), short: L(40) }),
  description: L(300),
  nav: z.object({ home: L(30), work: L(30), contact: L(30), letsTalk: L(30) }),
  contact: z.object({
    heading: Heading,
    subheading: L(160),
    body: L(300),
    instagram: z.object({
      handle: text(60).regex(/^@?[A-Za-z0-9._]{1,30}$/, "Instagram handle"),
      url: z.url().regex(/^https:\/\/(www\.)?instagram\.com\//, "Must be an instagram.com link"),
    }),
    behance: z.object({
      enabled: z.boolean(),
      handle: text(60),
      url: z.union([z.literal(""), z.url().regex(/^https:\/\/(www\.)?behance\.net\//, "Must be a behance.net link")]),
    }),
    email: z.object({ enabled: z.boolean(), value: z.union([z.literal(""), z.email()]) }),
    whatsapp: z.object({
      enabled: z.boolean(),
      number: z.union([z.literal(""), z.string().regex(/^\d{8,15}$/, "Digits only, with country code")]),
      display: text(30),
      message: L(200),
    }),
  }),
  seo: z.object({ homeTitle: L(90), homeDescription: L(200), shareImage: MediaRef.nullable() }),
  theme: z.object({ gradient: z.enum(gradients) }),
});
export type SettingsDoc = z.infer<typeof Settings>;

/* ── Sections ───────────────────────────────────────────────────────────── */

export const heroSlotIds = ["L1", "P1", "L2", "P2", "P3", "L3", "P4", "L4"] as const;
export type HeroSlotId = (typeof heroSlotIds)[number];

const base = { id: z.string().regex(/^[a-z0-9-]{4,40}$/), hidden: z.boolean() };

export const HeroSection = z.object({
  ...base,
  type: z.literal("hero"),
  data: z.object({
    title: L(120),
    meta: L(160),
    /** The eight fixed slots: L* are 3:2 landscapes, P* are 4:5 portraits. */
    slots: z
      .array(z.object({ id: z.enum(heroSlotIds), media: MediaRef, focus: Focus }))
      .length(8)
      .refine((s) => new Set(s.map((x) => x.id)).size === 8, "Each hero slot appears once"),
  }),
});

export const GallerySection = z.object({
  ...base,
  type: z.literal("gallery"),
  data: z.object({
    label: L(60),
    heading: Heading,
    body: L(300),
    interval: z.number().int().min(3).max(15),
    items: z
      .array(z.object({ id: z.string().regex(/^[a-z0-9-]{1,40}$/), media: MediaRef, category: Category, project: Slug.nullable() }))
      .min(1)
      .max(40),
  }),
});

export const ServicesSection = z.object({
  ...base,
  type: z.literal("services"),
  data: z.object({
    label: L(60),
    heading: Heading,
    items: z
      .array(z.object({ key: z.string().regex(/^[a-z]{2,20}$/), title: L(60), description: L(240), cta: L(30), href: InternalHref }))
      .min(1)
      .max(6),
  }),
});

export const TextMediaSection = z.object({
  ...base,
  type: z.literal("textMedia"),
  data: z.object({
    label: L(60),
    heading: Heading,
    body: L(500),
    media: MediaRef,
    caption: L(80),
    points: z.array(z.object({ title: L(40), text: L(160) })).max(4),
  }),
});

export const FeaturedProjectsSection = z.object({
  ...base,
  type: z.literal("featuredProjects"),
  data: z.object({ label: L(60), heading: Heading, body: L(300), limit: z.number().int().min(2).max(9) }),
});

export const ContactSection = z.object({ ...base, type: z.literal("contact"), data: z.object({}) });

export const Section = z.discriminatedUnion("type", [
  HeroSection,
  GallerySection,
  ServicesSection,
  TextMediaSection,
  FeaturedProjectsSection,
  ContactSection,
]);
export type SectionDoc = z.infer<typeof Section>;
export type SectionType = SectionDoc["type"];

export const pageKeys = ["home", "work", "contact"] as const;
export type PageKey = (typeof pageKeys)[number];

/** Which templates each page accepts (system content of Work/Contact is fixed). */
export const allowedSections: Record<PageKey, SectionType[]> = {
  home: ["hero", "gallery", "services", "textMedia", "featuredProjects", "contact"],
  work: ["gallery", "textMedia", "featuredProjects"],
  contact: ["gallery", "textMedia"],
};

export const Page = (key: PageKey) =>
  z
    .object({ sections: z.array(Section).max(20) })
    .superRefine((doc, ctx) => {
      const ids = new Set<string>();
      doc.sections.forEach((s, i) => {
        if (ids.has(s.id)) ctx.addIssue({ code: "custom", message: "Duplicate section id", path: ["sections", i, "id"] });
        ids.add(s.id);
        if (!allowedSections[key].includes(s.type))
          ctx.addIssue({ code: "custom", message: `“${s.type}” isn't available on this page`, path: ["sections", i] });
      });
      const heroes = doc.sections.filter((s) => s.type === "hero");
      if (heroes.length > 1) ctx.addIssue({ code: "custom", message: "Only one hero per page", path: ["sections"] });
      if (heroes.length === 1 && doc.sections[0].type !== "hero")
        ctx.addIssue({ code: "custom", message: "The hero must be the first section", path: ["sections"] });
      if (doc.sections.filter((s) => s.type === "contact").length > 1)
        ctx.addIssue({ code: "custom", message: "Only one contact section per page", path: ["sections"] });
    });
export type PageDoc = { sections: SectionDoc[] };

/* ── Projects ───────────────────────────────────────────────────────────── */

export const Project = z.object({
  slug: Slug,
  category: Category,
  title: L(90),
  summary: L(400),
  year: z.union([z.literal(""), z.string().regex(/^(19|20)\d{2}$/)]),
  cover: MediaRef,
  media: z.array(MediaRef).max(60),
});
export type ProjectDoc = z.infer<typeof Project>;

export const projectStatuses = ["draft", "published", "archived"] as const;

/* ── Media ──────────────────────────────────────────────────────────────── */

export const MediaMeta = z.object({
  alt: L(240),
  description: L(400),
  focus: Focus,
  posterId: z.string().uuid().nullable(),
});

/** Upload limits — enforced by the dashboard, the server and the storage bucket. */
export const uploadLimits = {
  image: { types: ["image/jpeg", "image/png", "image/webp", "image/avif"], maxBytes: 15 * 1024 * 1024 },
  // 50 MB: Supabase's per-file limit on the Free plan (also set on the buckets).
  video: { types: ["video/mp4", "video/webm"], maxBytes: 50 * 1024 * 1024 },
} as const;
