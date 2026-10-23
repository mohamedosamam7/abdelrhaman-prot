import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Lines } from "@/components/Lines";
import { Photo } from "@/components/Photo";
import { ProjectGallery } from "@/components/project/ProjectGallery";
import { discipline } from "@/content/disciplines";
import { DETAIL_MAX, detailProjects, getProject, hasDetailPage, nextProject } from "@/content/projects";
import { pageMetadata } from "@/lib/metadata";
import styles from "./project.module.css";

/** Only projects with enough strong images get a page; others live on /work. */
export const dynamicParams = false;

export function generateStaticParams() {
  return detailProjects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const project = getProject((await params).slug);
  if (!project) return {};
  return pageMetadata(
    project.title,
    `${project.title} — ${discipline(project.category).label.toLowerCase()} photography by Abdelrahman Fathy, Riyadh. ${project.images.length} frames.`,
  );
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const project = getProject((await params).slug);
  if (!project || !hasDetailPage(project)) notFound();

  const d = discipline(project.category);
  const next = nextProject(project.slug);
  // A page, not an archive: at most DETAIL_MAX frames, cover first.
  const gallery = project.images.slice(0, DETAIL_MAX);

  return (
    <article className="theme-dark">
      <header className={`container grid ${styles.head}`}>
        <nav className={`t-meta ${styles.crumbs}`} aria-label="Breadcrumb">
          <Link href="/work" className="link-line">
            Work
          </Link>
          <span aria-hidden="true">/</span>
          <Link href={`/work?category=${d.key}`} className="link-line">
            {d.label}
          </Link>
        </nav>

        <Lines as="h1" className={`t-display ${styles.title}`} lines={[project.title]} />

        <p className={`t-meta muted ${styles.facts}`}>
          {d.label} · {gallery.length} frames{project.year && ` · ${project.year}`}
        </p>

        {project.summary && <p className={`t-lead ${styles.summary}`}>{project.summary}</p>}
      </header>

      <div className={`container ${styles.gallery}`}>
        <ProjectGallery photos={gallery} title={project.title} />
      </div>

      <footer className={`container ${styles.next}`}>
        <Link href="/work" className={`t-meta ${styles.back}`}>
          <span aria-hidden="true">←</span> <span className="link-line">All work</span>
        </Link>
        <Link href={`/work/${next.slug}`} className={`hover-target ${styles.nextLink}`}>
          <span className={styles.nextText}>
            <span className={`t-meta muted`}>Next project</span>
            <span className={`t-display ${styles.nextTitle}`}>{next.title}</span>
            <span className="t-meta muted">{discipline(next.category).label}</span>
          </span>
          <Photo photo={next.cover} ratio="5 / 4" sizes="(max-width: 767px) 44vw, 300px" className={`hover-zoom ${styles.nextImg}`} />
        </Link>
      </footer>
    </article>
  );
}
