import type { CmsProject } from "./types";

/** A project gets its own page with at least this many frames; pages show at most DETAIL_MAX. */
export const DETAIL_MIN = 4;
export const DETAIL_MAX = 12;

export const hasDetailPage = (p: CmsProject) => p.images.length >= DETAIL_MIN;

/** Detail page when there is one, otherwise the Work page filtered to its category. */
export const projectHref = (p: CmsProject) => (hasDetailPage(p) ? `/work/${p.slug}` : `/work?category=${p.category}`);

export const detailProjects = (list: CmsProject[]) => list.filter(hasDetailPage);

export const findProject = (list: CmsProject[], slug: string) => list.find((p) => p.slug === slug);

export function nextProject(list: CmsProject[], slug: string) {
  const d = detailProjects(list);
  const i = d.findIndex((p) => p.slug === slug);
  return d.length > 1 ? d[(i + 1) % d.length] : undefined;
}
