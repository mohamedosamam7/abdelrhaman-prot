import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ContactCTA } from "@/components/ContactCTA";
import { WorkGallery, WorkGalleryView, type WorkCard, type WorkFilter } from "@/components/work/WorkGallery";
import { WorkIntro } from "@/components/work/WorkIntro";
import { discipline, disciplines } from "@/content/disciplines";
import { projectHref, publicProjects } from "@/content/projects";
import { getDictionary, isLocale, localeHref, tr } from "@/i18n";
import { localizePhoto } from "@/lib/content";
import { serveOriginal } from "@/lib/image";
import { pageMetadata } from "@/lib/metadata";
import styles from "./work.module.css";

export async function generateMetadata({ params }: PageProps<"/[lang]/work">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = getDictionary(lang);
  return pageMetadata(lang, "/work", t.meta.workTitle, t.meta.workDescription);
}

export default async function WorkPage({ params }: PageProps<"/[lang]/work">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDictionary(lang);

  const cards: WorkCard[] = publicProjects.map((p) => {
    const cover = localizePhoto(p.cover, lang);
    return {
      slug: p.slug,
      href: localeHref(lang, projectHref(p)),
      title: tr(lang, p.title),
      category: p.category,
      categoryLabel: tr(lang, discipline(p.category).label),
      frames: t.work.frames(p.images.length),
      cover: { src: cover.src, alt: cover.alt, position: cover.position, original: serveOriginal(cover.width) },
    };
  });
  // Only categories with real, public work get a filter.
  const filters: WorkFilter[] = disciplines
    .map((d) => ({ key: d.key, label: tr(lang, d.label), count: cards.filter((c) => c.category === d.key).length }))
    .filter((f) => f.count > 0);
  const labels = { all: t.work.all, filterLabel: t.work.filterLabel, base: localeHref(lang, "/work") };

  return (
    <>
      <section className={`theme-dark ${styles.work}`} aria-labelledby="work-heading">
        <div className="container">
          <WorkIntro lang={lang} />
          {/* Fallback = the full "All work" grid, so the static HTML is never empty. */}
          <Suspense fallback={<WorkGalleryView lang={lang} cards={cards} filters={filters} labels={labels} active="all" />}>
            <WorkGallery lang={lang} cards={cards} filters={filters} labels={labels} />
          </Suspense>
        </div>
      </section>
      <ContactCTA lang={lang} />
    </>
  );
}
