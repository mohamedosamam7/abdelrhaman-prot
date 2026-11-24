/**
 * HOME PAGE CURATION — which photographs, videos and copy appear where.
 * Change the selection here; the layouts stay the same.
 */
import type { Localized } from "@/i18n/config";
import type { DisciplineKey } from "./disciplines";
import { photo } from "./photos";

/* ── Hero — lens intro + photo composition ──────────────────────────────── */

/**
 * Only two slot shapes exist, and at any screen size every photo of the same
 * shape is shown at exactly the same size (set by shared tokens in
 * HeroPhotographyGrid.module.css — there are no per-photo sizes):
 *   portrait   4:5   — supply 1200 × 1500 px (or larger at the same ratio)
 *   landscape  3:2   — supply 1500 × 1000 px (or larger at the same ratio)
 * Images are cropped with object-fit: cover; `focus` is the CSS
 * object-position (x% y%) that keeps the subject in frame.
 *
 * `heroRows` lists, per layout, which slots appear, row by row (left → right in
 * English, mirrored in Arabic). All 12 slots appear on every device, in the
 * same order, as a uniform grid that fits the first screen — all tiles the same
 * size, photos cropped to fill with their focal point:
 *   desktop (≥1024px)  4 columns × 3 rows
 *   tablet  (600–1023) 4 columns × 3 rows
 *   mobile  (<600px)   3 columns × 4 rows
 */
export type HeroSlotType = "portrait" | "landscape";
export type HeroLayout = "desktop" | "tablet" | "mobile";

export const heroSlotSpec: Record<HeroSlotType, { ratio: string; value: number; source: string }> = {
  portrait: { ratio: "4:5", value: 4 / 5, source: "1200 × 1500 px" },
  landscape: { ratio: "3:2", value: 3 / 2, source: "1500 × 1000 px" },
};

export interface HeroSlot {
  id: string;
  /** Photo id from photos.ts (temporary: PDF-extracted, ~450–540px wide). */
  photo: string;
  type: HeroSlotType;
  /** object-position for the crop, e.g. "50% 35%". */
  focus: string;
}

export const heroSlots: HeroSlot[] = [
  { id: "L1", photo: "p6-r2c3", type: "landscape", focus: "50% 45%" },
  { id: "P1", photo: "p5-r2c1", type: "portrait", focus: "38% 40%" },
  { id: "L2", photo: "p4-r3c5", type: "landscape", focus: "50% 62%" },
  { id: "P2", photo: "p9-r2c1", type: "portrait", focus: "48% 45%" },
  { id: "P3", photo: "p7-r2c1", type: "portrait", focus: "45% 40%" },
  { id: "L3", photo: "p6-r2c4", type: "landscape", focus: "50% 40%" },
  { id: "P4", photo: "p1-r3c1", type: "portrait", focus: "52% 40%" },
  { id: "L4", photo: "p3-r2c1", type: "landscape", focus: "50% 50%" },
  { id: "L5", photo: "p9-r2c3", type: "landscape", focus: "50% 55%" },
  { id: "P5", photo: "p2-r3c3", type: "portrait", focus: "50% 40%" },
  { id: "L6", photo: "p7-r2c2", type: "landscape", focus: "50% 45%" },
  { id: "P6", photo: "p8-r3c3", type: "portrait", focus: "50% 40%" },
];

export const heroRows: Record<HeroLayout, string[][]> = {
  desktop: [
    ["L1", "P1", "L2", "P2"],
    ["P3", "L3", "P4", "L4"],
    ["L5", "P5", "L6", "P6"],
  ],
  tablet: [
    ["L1", "P1", "L2", "P2"],
    ["P3", "L3", "P4", "L4"],
    ["L5", "P5", "L6", "P6"],
  ],
  // Same reading order as desktop, three per row.
  mobile: [
    ["L1", "P1", "L2"],
    ["P2", "P3", "L3"],
    ["P4", "L4", "L5"],
    ["P5", "L6", "P6"],
  ],
};

export const heroCopy = {
  /** The page's h1 — keeps the photographer's name in the content. */
  title: { en: "Abdelrahman Fathy — Professional Photographer", ar: "عبدالرحمن فتحي — مصوّر محترف" } satisfies Localized,
  meta: {
    en: "Riyadh, Saudi Arabia · Events / Sports / Commercial / Food",
    ar: "الرياض، السعودية · فعاليات / رياضة / تجاري / أطعمة ومشروبات",
  } satisfies Localized,
};

/* ── (01) Selected frames — horizontal gallery ──────────────────────────── */

/**
 * One gallery item. Images and videos share the same track.
 *
 *   id        unique key
 *   type      "image" | "video"
 *   src       image: a photo id from photos.ts
 *             video: a file path (e.g. "/video/reel-01.mp4") or full URL
 *   poster    video only — a photo id shown before playback (recommended;
 *             without it the card shows a plain frame with a play button)
 *   title     caption on the card (English fallback; the card shows the
 *             linked project's localized title when `project` is set)
 *   category  which tab the item belongs to (see disciplines.ts)
 *   project   optional project slug — the card then links to that project
 *
 * Items are grouped by category in the order of disciplines.ts, so each tab
 * jumps to one continuous run. Within a category, order follows this list.
 *
 * Videos are never preloaded and never autoplay; they play with sound only
 * after the visitor presses play. Put video files in /public/video, keep
 * them short and web-encoded (H.264 MP4, ≤ 1080p).
 *
 * Example video item:
 *   { id: "reel-01", type: "video", src: "/video/reel-01.mp4", poster: "p6-r1c3",
 *     title: "Event Reel 01", category: "sports", project: "wrestling-arena-night" },
 */
export type FrameItem = {
  id: string;
  title: string;
  category: DisciplineKey;
  project?: string;
} & ({ type: "image"; src: string } | { type: "video"; src: string; poster?: string });

export const selectedFrames: FrameItem[] = [
  { id: "e1", type: "image", src: "p1-r1c4", title: "Heritage Nights", category: "events", project: "heritage-nights" },
  { id: "e2", type: "image", src: "p1-r3c3", title: "Heritage Nights", category: "events", project: "heritage-nights" },
  { id: "e3", type: "image", src: "p2-r1c3", title: "Old Town Evenings", category: "events", project: "old-town-evenings" },
  { id: "e4", type: "image", src: "p2-r3c5", title: "Old Town Evenings", category: "events", project: "old-town-evenings" },
  { id: "e5", type: "image", src: "p5-r1c2", title: "Concert Night", category: "events", project: "concert-night" },
  { id: "e6", type: "image", src: "p5-r2c2", title: "Concert Night", category: "events", project: "concert-night" },
  { id: "e7", type: "image", src: "p7-r1c3", title: "Festival After Dark", category: "events", project: "festival-after-dark" },
  { id: "e8", type: "image", src: "p8-r2c2", title: "Arrivals & Parking", category: "events", project: "arrivals-and-parking" },

  { id: "s1", type: "image", src: "p4-r1c2", title: "Matchday at the Arena", category: "sports", project: "matchday-at-the-arena" },
  { id: "s2", type: "image", src: "p4-r3c2", title: "Matchday at the Arena", category: "sports", project: "matchday-at-the-arena" },
  { id: "s3", type: "image", src: "p6-r3c3", title: "Wrestling Arena Night", category: "sports", project: "wrestling-arena-night" },
  { id: "s4", type: "image", src: "p6-r3c5", title: "Wrestling Arena Night", category: "sports", project: "wrestling-arena-night" },
  { id: "s5", type: "image", src: "p9-r1c3", title: "Padel Tournament", category: "sports", project: "padel-tournament" },
  { id: "s6", type: "image", src: "p9-r3c3", title: "Padel Tournament", category: "sports", project: "padel-tournament" },
  { id: "s7", type: "image", src: "p3-r2c4", title: "Football Fan Zone", category: "sports", project: "football-fan-zone" },
  { id: "s8", type: "image", src: "p3-r3c4", title: "Football Fan Zone", category: "sports", project: "football-fan-zone" },
];

export const selectedFramesCopy = {
  label: { en: "(01) — Selected work", ar: "(01) — أعمال مختارة" } satisfies Localized,
  heading: {
    en: { lead: "Selected", emphasis: "frames" },
    ar: { lead: "لقطات", emphasis: "مختارة" },
  } satisfies Localized<{ lead: string; emphasis: string }>,
  body: {
    en: "Events and sports across Riyadh — hosts, crowds and the moments in between, in one continuous edit.",
    ar: "فعاليات ورياضة من قلب الرياض: الضيوف والجمهور وكل اللحظات بينهما، في مشهد واحد متصل.",
  } satisfies Localized,
  /** Seconds each frame stays before the gallery moves on. */
  interval: 5,
};

/* ── (02) Services ──────────────────────────────────────────────────────── */

export const services = {
  label: { en: "(02) — Focus", ar: "(02) — خدماتنا" } satisfies Localized,
  heading: {
    en: { lead: "Three ways of looking,", emphasis: "one standard of light." },
    ar: { lead: "ثلاثة مجالات،", emphasis: "ومعيار واحد للضوء." },
  } satisfies Localized<{ lead: string; emphasis: string }>,
  /**
   * `key` names the service in /contact?service=… links. A row links to the
   * Work page only where real work exists; otherwise it starts an enquiry.
   */
  items: [
    {
      key: "commercial",
      index: "01",
      title: { en: "Commercial & Product", ar: "تجاري ومنتجات" },
      description: {
        en: "Products, packaging and brand still life — lit to show material, form and detail.",
        ar: "المنتجات والتغليف وصور العلامات التجارية، بإضاءة تُظهر الخامة والشكل والتفاصيل.",
      },
      href: "/contact?service=commercial",
      cta: { en: "Enquire", ar: "استفسر" },
    },
    {
      key: "food",
      index: "02",
      title: { en: "Food & Beverage", ar: "أطعمة ومشروبات" },
      description: {
        en: "Plates, pours and hands-in-frame moments that make a menu feel tangible.",
        ar: "أطباق ومشروبات ولحظات تقديم تجعل قائمتك ملموسة.",
      },
      href: "/contact?service=food",
      cta: { en: "Enquire", ar: "استفسر" },
    },
    {
      key: "events",
      index: "03",
      title: { en: "Events & Sports", ar: "فعاليات ورياضة" },
      description: {
        en: "Atmosphere, people and peak moments at live activations, venues and matches.",
        ar: "الأجواء والناس وأقوى اللحظات في الفعاليات والمواقع والمباريات.",
      },
      href: "/work",
      cta: { en: "View work", ar: "تصفّح الأعمال" },
    },
  ],
};

/* ── (03) Every frame should say something ──────────────────────────────── */

export const approach = {
  label: { en: "(03) — Approach", ar: "(03) — أسلوبنا" } satisfies Localized,
  heading: {
    en: { lead: "Every frame should", emphasis: "say something." },
    ar: { lead: "كل لقطة", emphasis: "لها ما تقوله." },
  } satisfies Localized<{ lead: string; emphasis: string }>,
  body: {
    en: "I focus on light, detail, and the atmosphere that makes a story memorable.",
    ar: "نركّز على الضوء والتفاصيل والأجواء التي تجعل القصة تبقى في الذاكرة.",
  } satisfies Localized,
  /** Vertical image beside the heading (source is ~450px wide — see README). */
  photo: photo("p2-r2c2"),
  caption: { en: "F/— Light study", ar: "F/— دراسة ضوء" } satisfies Localized,
  points: [
    { index: "01", title: { en: "Light", ar: "الضوء" }, text: { en: "Shaped deliberately, never left to chance.", ar: "نشكّله بعناية، ولا نتركه للصدفة." } },
    { index: "02", title: { en: "Detail", ar: "التفاصيل" }, text: { en: "Texture, material and the small gestures.", ar: "الملمس والخامة والإيماءات الصغيرة." } },
    { index: "03", title: { en: "Atmosphere", ar: "الأجواء" }, text: { en: "The feeling of being in the room.", ar: "إحساس أنك في قلب المكان." } },
  ] satisfies { index: string; title: Localized; text: Localized }[],
};
