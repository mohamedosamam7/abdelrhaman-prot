/**
 * PROJECTS — add, remove or reorder projects here; every page updates.
 *
 * Real projects come first: the client's own event and sports coverage from
 * the supplied portfolio PDF, grouped by the event each photograph belongs
 * to (one PDF page = one event). Titles are neutral descriptions of what is
 * visible — not client, brand or campaign names — and no dates or summaries
 * are given because none were supplied. Rename only with approved names.
 *
 * Demo projects (`demo: true`) are generated placeholders. They stay in the
 * data but are excluded from every public listing, gallery and detail page.
 *
 * `images`  the project's frames in display order; the first is usually the cover.
 * A project gets a detail page when it has at least DETAIL_MIN images
 * (pages show at most DETAIL_MAX).
 */
import { photo, type Photo } from "./photos";
import type { DisciplineKey } from "./disciplines";

export interface Project {
  slug: string;
  title: string;
  category: DisciplineKey;
  /** Optional — leave out until confirmed; nothing is shown when absent. */
  year?: string;
  /** Optional short line shown on the project page. Leave empty if unknown. */
  summary?: string;
  cover: Photo;
  images: Photo[];
  /** Curated frames for previews. Defaults to the first images. */
  highlights?: Photo[];
  /** True while the title is a neutral placeholder. */
  placeholder: boolean;
  /** Generated demo content — kept in the data, never shown publicly. */
  demo?: boolean;
}

const set = (prefix: string, count: number) =>
  Array.from({ length: count }, (_, i) => photo(`${prefix}-${String(i + 1).padStart(2, "0")}`));

const pick = (...ids: string[]) => ids.map(photo);

/** A real project: cover first, then the rest of the frames. */
function real(slug: string, title: string, category: DisciplineKey, ids: string[]): Project {
  const images = pick(...ids);
  return { slug, title, category, cover: images[0], images, placeholder: false };
}

export const projects: Project[] = [
  // ── Client work (PEAK portfolio PDF; page noted for each) ────────────────
  real("heritage-nights", "Heritage Nights", "events", // p1
    ["p1-r1c3", "p1-r1c1", "p1-r1c4", "p1-r2c3", "p1-r1c5", "p1-r2c4", "p1-r3c1", "p1-r3c2", "p1-r3c3", "p1-r3c5", "p1-r1c2", "p1-r2c1"]),
  real("matchday-at-the-arena", "Matchday at the Arena", "sports", // p4
    ["p4-r2c3", "p4-r1c1", "p4-r1c2", "p4-r1c3", "p4-r1c4", "p4-r1c5", "p4-r2c2", "p4-r2c4", "p4-r3c2", "p4-r3c3", "p4-r3c4", "p4-r3c5"]),
  real("concert-night", "Concert Night", "events", // p5
    ["p5-r2c3", "p5-r1c1", "p5-r1c2", "p5-r1c4", "p5-r1c5", "p5-r2c1", "p5-r2c2", "p5-r2c4", "p5-r3c1", "p5-r3c2", "p5-r3c3", "p5-r3c4"]),
  real("padel-tournament", "Padel Tournament", "sports", // p9
    ["p9-r2c3", "p9-r1c1", "p9-r1c3", "p9-r1c2", "p9-r1c4", "p9-r2c1", "p9-r2c2", "p9-r2c4", "p9-r2c5", "p9-r3c1", "p9-r3c3", "p9-r3c5"]),
  real("old-town-evenings", "Old Town Evenings", "events", // p2
    ["p2-r2c4", "p2-r1c1", "p2-r1c2", "p2-r1c3", "p2-r1c4", "p2-r2c1", "p2-r2c2", "p2-r2c5", "p2-r3c2", "p2-r3c3", "p2-r3c4", "p2-r3c5"]),
  real("wrestling-arena-night", "Wrestling Arena Night", "sports", // p6
    ["p6-r1c3", "p6-r1c1", "p6-r1c4", "p6-r1c5", "p6-r2c1", "p6-r2c3", "p6-r2c4", "p6-r2c5", "p6-r3c2", "p6-r3c3", "p6-r3c4", "p6-r3c5"]),
  real("festival-after-dark", "Festival After Dark", "events", // p7
    ["p7-r2c2", "p7-r1c1", "p7-r1c2", "p7-r1c3", "p7-r1c5", "p7-r2c1", "p7-r2c4", "p7-r2c5", "p7-r3c1", "p7-r3c2", "p7-r3c3", "p7-r3c4"]),
  real("football-fan-zone", "Football Fan Zone", "sports", // p3
    ["p3-r1c2", "p3-r1c3", "p3-r1c4", "p3-r1c5", "p3-r2c1", "p3-r2c2", "p3-r2c3", "p3-r2c4", "p3-r2c5", "p3-r3c2", "p3-r3c4", "p3-r3c5"]),
  real("arrivals-and-parking", "Arrivals & Parking", "events", // p8
    ["p8-r1c3", "p8-r1c1", "p8-r1c2", "p8-r1c4", "p8-r1c5", "p8-r2c2", "p8-r2c3", "p8-r2c5", "p8-r3c1", "p8-r3c2", "p8-r3c3", "p8-r3c4"]),

  // ── Demo placeholders (hidden) ──────────────────────────────────────────
  {
    slug: "commercial-project-01",
    title: "Commercial Project 01",
    category: "commercial",
    cover: photo("commercial-01-01"),
    images: set("commercial-01", 6),
    highlights: pick("commercial-01-01", "commercial-01-02", "commercial-01-05", "commercial-01-04"),
    placeholder: true,
    demo: true,
  },
  {
    slug: "product-series-02",
    title: "Product Series 02",
    category: "commercial",
    cover: photo("commercial-02-01"),
    images: set("commercial-02", 5),
    highlights: pick("commercial-02-02"),
    placeholder: true,
    demo: true,
  },
  {
    slug: "food-story-01",
    title: "Food Story 01",
    category: "food",
    cover: photo("food-01-01"),
    images: set("food-01", 6),
    highlights: pick("food-01-01", "food-01-02", "food-01-03", "food-01-04"),
    placeholder: true,
    demo: true,
  },
  {
    slug: "hospitality-project-02",
    title: "Hospitality Project 02",
    category: "food",
    cover: photo("food-02-01"),
    images: set("food-02", 5),
    highlights: pick("food-02-01"),
    placeholder: true,
    demo: true,
  },
  {
    slug: "event-project-01",
    title: "Event Project 01",
    category: "events",
    cover: photo("events-01-08"),
    images: set("events-01", 8),
    highlights: pick("events-01-01", "events-01-02", "events-01-04", "events-01-06", "events-01-08"),
    placeholder: true,
    demo: true,
  },
  {
    slug: "event-project-02",
    title: "Event Project 02",
    category: "events",
    cover: photo("events-02-06"),
    images: set("events-02", 6),
    highlights: pick("events-02-04"),
    placeholder: true,
    demo: true,
  },
  {
    slug: "portrait-series-01",
    title: "Portrait Series 01",
    category: "people",
    cover: photo("people-01-01"),
    images: set("people-01", 5),
    highlights: pick("people-01-01", "people-01-02", "people-01-03"),
    placeholder: true,
    demo: true,
  },
  {
    slug: "portrait-series-02",
    title: "Portrait Series 02",
    category: "people",
    cover: photo("people-02-01"),
    images: set("people-02", 4),
    highlights: pick("people-02-03"),
    placeholder: true,
    demo: true,
  },
];

export const DETAIL_MIN = 4;
export const DETAIL_MAX = 12;

/** Everything the public site may show: real work only. */
export const publicProjects = projects.filter((p) => !p.demo);

export function hasDetailPage(p: Project) {
  return !p.demo && p.images.length >= DETAIL_MIN;
}

/** Detail page when there is one, otherwise the Work page filtered to its category. */
export function projectHref(p: Project) {
  return hasDetailPage(p) ? `/work/${p.slug}` : `/work?category=${p.category}`;
}

export const detailProjects = publicProjects.filter(hasDetailPage);

export function highlightsOf(p: Project, max: number) {
  return (p.highlights ?? p.images).slice(0, max);
}

/** Public projects only — demo slugs resolve to nothing. */
export function getProject(slug: string) {
  return publicProjects.find((p) => p.slug === slug);
}

export function projectsIn(category: DisciplineKey) {
  return publicProjects.filter((p) => p.category === category);
}

export function nextProject(slug: string) {
  const i = detailProjects.findIndex((p) => p.slug === slug);
  return detailProjects[(i + 1) % detailProjects.length];
}
