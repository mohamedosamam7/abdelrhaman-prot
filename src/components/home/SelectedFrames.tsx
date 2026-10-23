import Link from "next/link";
import { ArrowRight } from "@/components/Icons";
import { disciplines } from "@/content/disciplines";
import { selectedFrames, selectedFramesCopy } from "@/content/home";
import { photo } from "@/content/photos";
import { getProject, projectHref } from "@/content/projects";
import { serveOriginal } from "@/lib/image";
import { FramesCarousel, type Frame, type FrameCategory } from "./FramesCarousel";
import styles from "./SelectedFrames.module.css";

/** Resolves the content config into plain, serialisable frames for the client carousel. */
function resolveFrames(): { frames: Frame[]; categories: FrameCategory[] } {
  const order = disciplines.map((d) => d.key);
  const sorted = [...selectedFrames].sort((a, b) => order.indexOf(a.category) - order.indexOf(b.category));

  const frames = sorted.map((item): Frame => {
    const project = item.project ? getProject(item.project) : undefined;
    const label = disciplines.find((d) => d.key === item.category)!.label;
    const base = { id: item.id, title: item.title, category: item.category, categoryLabel: label, href: project ? projectHref(project) : undefined };
    if (item.type === "image") {
      const p = photo(item.src);
      return { ...base, type: "image", src: p.src, alt: p.alt, position: p.position, original: serveOriginal(p.width) };
    }
    const poster = item.poster ? photo(item.poster) : undefined;
    return { ...base, type: "video", src: item.src, poster: poster?.src, alt: item.title, position: poster?.position, original: poster ? serveOriginal(poster.width) : false };
  });

  const categories = disciplines
    .map((d) => ({ key: d.key, label: d.label, start: frames.findIndex((f) => f.category === d.key), count: frames.filter((f) => f.category === d.key).length }))
    .filter((c) => c.count > 0);

  return { frames, categories };
}

/** (01) Selected frames — a horizontal edit across every discipline, images and video. */
export function SelectedFrames() {
  const { frames, categories } = resolveFrames();
  const c = selectedFramesCopy;

  return (
    <section className={`theme-dark ${styles.section}`} aria-labelledby="frames-heading">
      <div className={`container ${styles.head}`}>
        <p className={`t-label ${styles.label}`}>
          {c.label}
        </p>
        <h2 id="frames-heading" className={`t-serif ${styles.heading}`} data-reveal>
          {c.heading.lead} <em className="muted">{c.heading.emphasis}</em>
        </h2>
        <div className={styles.aside}>
          <p className="muted">{c.body}</p>
          <Link href="/work" className={styles.all}>
            <span className="link-line">View all work</span>
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>

      <FramesCarousel frames={frames} categories={categories} interval={c.interval * 1000} />
    </section>
  );
}
