import { Suspense } from "react";
import { WorkGallery, WorkGalleryView, type WorkCard, type WorkFilter } from "@/components/work/WorkGallery";
import { WorkIntro } from "@/components/work/WorkIntro";
import { ContactCTA } from "@/components/ContactCTA";
import { disciplines, discipline } from "@/content/disciplines";
import { projectHref, publicProjects } from "@/content/projects";
import { serveOriginal } from "@/lib/image";
import { pageMetadata } from "@/lib/metadata";
import styles from "./work.module.css";

export const metadata = pageMetadata(
  "Work",
  "Event and sports photography by Abdelrahman Fathy in Riyadh — nine projects, filterable by category.",
);

export default function WorkPage() {
  const cards: WorkCard[] = publicProjects.map((p) => ({
    slug: p.slug,
    href: projectHref(p),
    title: p.title,
    category: p.category,
    categoryLabel: discipline(p.category).label,
    count: p.images.length,
    cover: { src: p.cover.src, alt: p.cover.alt, position: p.cover.position, original: serveOriginal(p.cover.width) },
  }));
  // Only categories with real, public work get a filter.
  const filters: WorkFilter[] = disciplines
    .map((d) => ({ key: d.key, label: d.label, count: cards.filter((c) => c.category === d.key).length }))
    .filter((f) => f.count > 0);

  return (
    <>
      <section className={`theme-dark ${styles.work}`} aria-labelledby="work-heading">
        <div className="container">
          <WorkIntro />
          {/* Fallback = the full "All work" grid, so the static HTML is never empty. */}
          <Suspense fallback={<WorkGalleryView cards={cards} filters={filters} active="all" />}>
            <WorkGallery cards={cards} filters={filters} />
          </Suspense>
        </div>
      </section>
      <ContactCTA />
    </>
  );
}
