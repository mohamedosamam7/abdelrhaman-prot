import Link from "next/link";
import { ArrowRight } from "@/components/Icons";
import { findProject, projectHref } from "@/cms/projects";
import type { CmsProject, ResolvedOf } from "@/cms/types";
import { disciplines } from "@/content/disciplines";
import { getDictionary, localeHref, tr, type Locale } from "@/i18n";
import { localizePhoto } from "@/lib/content";
import { serveOriginal } from "@/lib/image";
import { FramesCarousel, type Frame, type FrameCategory } from "./FramesCarousel";
import { Words, wordCount } from "@/components/Words";
import styles from "./SelectedFrames.module.css";

type Data = ResolvedOf<"gallery">["data"];

/** Resolves the section into plain, serialisable frames for the client carousel. */
function resolveFrames(lang: Locale, data: Data, projects: CmsProject[]): { frames: Frame[]; categories: FrameCategory[] } {
  const order = disciplines.map((d) => d.key as string);
  const sorted = [...data.items].sort((a, b) => order.indexOf(a.category) - order.indexOf(b.category));

  const frames = sorted.map((item): Frame => {
    const project = item.project ? findProject(projects, item.project) : undefined;
    const label = tr(lang, disciplines.find((d) => d.key === item.category)!.label);
    const p = localizePhoto(item.photo, lang);
    // The caption is the linked project's title in the visitor's language, else the media's alt text.
    const title = project ? tr(lang, project.title) : p.alt;
    const base = { id: item.id, title, category: item.category, categoryLabel: label, href: project ? localeHref(lang, projectHref(project)) : undefined };
    if (p.videoSrc) {
      return { ...base, type: "video", src: p.videoSrc, poster: p.src, alt: p.alt, position: p.position, original: serveOriginal(p.width) };
    }
    return { ...base, type: "image", src: p.src, alt: p.alt, position: p.position, original: serveOriginal(p.width) };
  });

  const categories = disciplines
    .map((d) => ({ key: d.key, label: tr(lang, d.label), start: frames.findIndex((f) => f.category === d.key), count: frames.filter((f) => f.category === d.key).length }))
    .filter((c) => c.count > 0);

  return { frames, categories };
}

/** (01) Selected frames — a horizontal edit across every discipline, images and video. */
export function SelectedFrames({ lang, sid, data, projects }: { lang: Locale; sid: string; data: Data; projects: CmsProject[] }) {
  const { frames, categories } = resolveFrames(lang, data, projects);
  const c = data;
  const heading = tr(lang, c.heading);

  return (
    <section className={`theme-dark ${styles.section}`} aria-labelledby={`${sid}-heading`}>
      <div className={`container ${styles.head}`}>
        <p className={`t-label ${styles.label}`}>
          {tr(lang, c.label)}
        </p>
        <h2 id={`${sid}-heading`} className={`t-serif ${styles.heading}`} data-reveal="words">
          <Words text={heading.lead} /> <em className="muted"><Words text={heading.emphasis} start={wordCount(heading.lead)} /></em>
        </h2>
        <div className={styles.aside}>
          <p className="muted">{tr(lang, c.body)}</p>
          <Link href={localeHref(lang, "/work")} className={styles.all}>
            <span className="link-line">{getDictionary(lang).frames.viewAll}</span>
            <ArrowRight size={15} className="dir-icon" />
          </Link>
        </div>
      </div>

      <FramesCarousel lang={lang} frames={frames} categories={categories} interval={c.interval * 1000} />
    </section>
  );
}
