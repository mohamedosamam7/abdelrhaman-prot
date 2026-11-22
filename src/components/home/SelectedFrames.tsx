import Link from "next/link";
import { ArrowRight } from "@/components/Icons";
import { disciplines } from "@/content/disciplines";
import { selectedFrames, selectedFramesCopy } from "@/content/home";
import { photo } from "@/content/photos";
import { getProject, projectHref } from "@/content/projects";
import { getDictionary, localeHref, tr, type Locale } from "@/i18n";
import { localizePhoto } from "@/lib/content";
import { serveOriginal } from "@/lib/image";
import { FramesCarousel, type Frame, type FrameCategory } from "./FramesCarousel";
import { Words, wordCount } from "@/components/Words";
import styles from "./SelectedFrames.module.css";

/** Resolves the content config into plain, serialisable frames for the client carousel. */
function resolveFrames(lang: Locale): { frames: Frame[]; categories: FrameCategory[] } {
  const order = disciplines.map((d) => d.key);
  const sorted = [...selectedFrames].sort((a, b) => order.indexOf(a.category) - order.indexOf(b.category));

  const frames = sorted.map((item): Frame => {
    const project = item.project ? getProject(item.project) : undefined;
    const label = tr(lang, disciplines.find((d) => d.key === item.category)!.label);
    // The caption is the project's title in the visitor's language; item.title is the fallback.
    const title = project ? tr(lang, project.title) : item.title;
    const base = { id: item.id, title, category: item.category, categoryLabel: label, href: project ? localeHref(lang, projectHref(project)) : undefined };
    if (item.type === "image") {
      const p = localizePhoto(photo(item.src), lang);
      return { ...base, type: "image", src: p.src, alt: p.alt, position: p.position, original: serveOriginal(p.width) };
    }
    const poster = item.poster ? photo(item.poster) : undefined;
    return { ...base, type: "video", src: item.src, poster: poster?.src, alt: title, position: poster?.position, original: poster ? serveOriginal(poster.width) : false };
  });

  const categories = disciplines
    .map((d) => ({ key: d.key, label: tr(lang, d.label), start: frames.findIndex((f) => f.category === d.key), count: frames.filter((f) => f.category === d.key).length }))
    .filter((c) => c.count > 0);

  return { frames, categories };
}

/** (01) Selected frames — a horizontal edit across every discipline, images and video. */
export function SelectedFrames({ lang }: { lang: Locale }) {
  const { frames, categories } = resolveFrames(lang);
  const c = selectedFramesCopy;
  const heading = tr(lang, c.heading);

  return (
    <section className={`theme-dark ${styles.section}`} aria-labelledby="frames-heading">
      <div className={`container ${styles.head}`}>
        <p className={`t-label ${styles.label}`}>
          {tr(lang, c.label)}
        </p>
        <h2 id="frames-heading" className={`t-serif ${styles.heading}`} data-reveal="words">
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
