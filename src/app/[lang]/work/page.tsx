import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ContactCTA } from "@/components/ContactCTA";
import { WorkGallery, WorkGalleryView, type WorkCard, type WorkFilter } from "@/components/work/WorkGallery";
import { WorkIntro } from "@/components/work/WorkIntro";
import { projectCard } from "@/cms/cards";
import { getContent } from "@/cms/load";
import { Sections } from "@/components/Sections";
import { disciplines } from "@/content/disciplines";
import { getDictionary, isLocale, localeHref, tr } from "@/i18n";
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

  const { projects, settings, pages } = await getContent();
  const cards: WorkCard[] = projects.map((p) => projectCard(p, lang));
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
      <Sections lang={lang} sections={pages.work} settings={settings} projects={projects} />
      <ContactCTA lang={lang} settings={settings} />
    </>
  );
}
