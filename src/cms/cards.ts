import { discipline, type DisciplineKey } from "@/content/disciplines";
import type { WorkCard } from "@/components/work/WorkGallery";
import { getDictionary, localeHref, tr, type Locale } from "@/i18n";
import { localizePhoto } from "@/lib/content";
import { serveOriginal } from "@/lib/image";
import { projectHref } from "./projects";
import type { CmsProject } from "./types";

/** Project → the serialisable card the Work grid and featured section render. */
export function projectCard(p: CmsProject, lang: Locale): WorkCard {
  const t = getDictionary(lang);
  const cover = localizePhoto(p.cover, lang);
  return {
    slug: p.slug,
    href: localeHref(lang, projectHref(p)),
    title: tr(lang, p.title),
    category: p.category,
    categoryLabel: tr(lang, discipline(p.category as DisciplineKey).label),
    frames: t.work.frames(p.images.length),
    cover: { src: cover.src, alt: cover.alt, position: cover.position, original: serveOriginal(cover.width) },
  };
}
