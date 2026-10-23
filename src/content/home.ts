/**
 * HOME PAGE CURATION — which photographs, videos and copy appear where.
 * Change the selection here; the layouts stay the same.
 */
import type { DisciplineKey } from "./disciplines";
import { photo } from "./photos";

/**
 * Hero contact sheet — 8 frames. Each position has a fixed shape on the
 * editorial grid, so choose photographs that suit it:
 *   0 narrow portrait (left edge)   1 landscape        2 square
 *   3 portrait                      4 narrow portrait (right edge)
 *   5 landscape                     6 square           7 wide landscape
 * Frames 4 and 6 are dropped on phones.
 */
export const heroPhotos = [
  photo("p6-r1c5"),
  photo("p6-r2c3"),
  photo("p9-r2c1"),
  photo("p5-r2c1"),
  photo("p7-r2c1"),
  photo("p2-r3c3"),
  photo("p6-r2c4"),
  photo("p4-r3c5"),
];

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
 *   title     caption on the card
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
  label: "(01) — Selected work",
  heading: { lead: "Selected", emphasis: "frames" },
  body: "Events and sports across Riyadh — hosts, crowds and the moments in between, in one continuous edit.",
  /** Seconds each frame stays before the gallery moves on. */
  interval: 5,
};

/* ── (02) Services ──────────────────────────────────────────────────────── */

export const services = {
  label: "(02) — Focus",
  heading: { lead: "Three ways of looking,", emphasis: "one standard of light." },
  /**
   * `key` names the service in /contact?service=… links. A row links to the
   * Work page only where real work exists; otherwise it starts an enquiry.
   */
  items: [
    {
      key: "commercial",
      index: "01",
      title: "Commercial & Product",
      description: "Products, packaging and brand still life — lit to show material, form and detail.",
      href: "/contact?service=commercial",
      cta: "Enquire",
    },
    {
      key: "food",
      index: "02",
      title: "Food & Beverage",
      description: "Plates, pours and hands-in-frame moments that make a menu feel tangible.",
      href: "/contact?service=food",
      cta: "Enquire",
    },
    {
      key: "events",
      index: "03",
      title: "Events & Sports",
      description: "Atmosphere, people and peak moments at live activations, venues and matches.",
      href: "/work",
      cta: "View work",
    },
  ],
};

/* ── (03) Every frame should say something ──────────────────────────────── */

export const approach = {
  label: "(03) — Approach",
  heading: { lead: "Every frame should", emphasis: "say something." },
  body: "I focus on light, detail, and the atmosphere that makes a story memorable.",
  /** Vertical image beside the heading (source is ~450px wide — see README). */
  photo: photo("p2-r2c2"),
  caption: "F/— Light study",
  points: [
    { index: "01", title: "Light", text: "Shaped deliberately, never left to chance." },
    { index: "02", title: "Detail", text: "Texture, material and the small gestures." },
    { index: "03", title: "Atmosphere", text: "The feeling of being in the room." },
  ],
};
