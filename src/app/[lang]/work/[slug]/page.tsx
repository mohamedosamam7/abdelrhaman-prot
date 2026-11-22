import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "@/components/Icons";
import { Lines } from "@/components/Lines";
import { Photo } from "@/components/Photo";
import { ProjectGallery } from "@/components/project/ProjectGallery";
import { discipline } from "@/content/disciplines";
import { DETAIL_MAX, detailProjects, getProject, hasDetailPage, nextProject } from "@/content/projects";
import { getDictionary, isLocale, localeHref, locales, tr } from "@/i18n";
import { localizePhoto } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";
import styles from "./project.module.css";

/** Only projects with enough strong images get a page; others live on /work. */
export const dynamicParams = false;

export function generateStaticParams() {
  return locales.flatMap((lang) => detailProjects.map((p) => ({ lang, slug: p.slug })));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/work/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  const project = getProject(slug);
  if (!project || !isLocale(lang)) return {};
  const t = getDictionary(lang);
  const title = tr(lang, project.title);
  return pageMetadata(
    lang,
    `/work/${slug}`,
    title,
    t.meta.projectDescription(title, tr(lang, discipline(project.category).label), project.images.length),
  );
}

export default async function ProjectPage({ params }: PageProps<"/[lang]/work/[slug]">) {
  const { lang, slug } = await params;
  const project = getProject(slug);
  if (!isLocale(lang) || !project || !hasDetailPage(project)) notFound();
  const t = getDictionary(lang);

  const d = discipline(project.category);
  const next = nextProject(project.slug);
  const title = tr(lang, project.title);
  // A page, not an archive: at most DETAIL_MAX frames, cover first.
  const gallery = project.images.slice(0, DETAIL_MAX).map((p) => localizePhoto(p, lang));

  return (
    <article className="theme-dark">
      <header className={`container grid ${styles.head}`}>
        <nav className={`t-meta ${styles.crumbs}`} aria-label={t.project.breadcrumb}>
          <Link href={localeHref(lang, "/work")} className="link-line">
            {t.project.work}
          </Link>
          <span aria-hidden="true">/</span>
          <Link href={localeHref(lang, `/work?category=${d.key}`)} className="link-line">
            {tr(lang, d.label)}
          </Link>
        </nav>

        <Lines as="h1" className={`t-display ${styles.title}`} lines={[title]} />

        <p className={`t-meta muted ${styles.facts}`}>
          {tr(lang, d.label)} · {t.work.frames(gallery.length)}
          {project.year && ` · ${project.year}`}
        </p>

        {project.summary && <p className={`t-lead ${styles.summary}`}>{project.summary}</p>}
      </header>

      <div className={`container ${styles.gallery}`}>
        <ProjectGallery lang={lang} photos={gallery} title={title} />
      </div>

      <footer className={`container ${styles.next}`}>
        <Link href={localeHref(lang, "/work")} className={`t-meta ${styles.back}`}>
          <ArrowRight size={14} className="back-icon" /> <span className="link-line">{t.project.allWork}</span>
        </Link>
        <Link href={localeHref(lang, `/work/${next.slug}`)} className={`hover-target ${styles.nextLink}`}>
          <span className={styles.nextText}>
            <span className={`t-meta muted`}>{t.project.next}</span>
            <span className={`t-display ${styles.nextTitle}`}>{tr(lang, next.title)}</span>
            <span className="t-meta muted">{tr(lang, discipline(next.category).label)}</span>
          </span>
          <Photo
            photo={localizePhoto(next.cover, lang)}
            ratio="5 / 4"
            sizes="(max-width: 767px) 44vw, 300px"
            className={`hover-zoom ${styles.nextImg}`}
          />
        </Link>
      </footer>
    </article>
  );
}
