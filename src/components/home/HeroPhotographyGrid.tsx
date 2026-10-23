"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { Photo } from "@/content/photos";
import { site } from "@/content/site";
import { serveOriginal } from "@/lib/image";
import styles from "./HeroPhotographyGrid.module.css";

/**
 * Length of the CSS entrance (HeroPhotographyGrid.module.css): the last frame
 * starts at ~0.85s and moves for ~3.2s; the meta rows finish last.
 */
const INTRO_MS = 4200;
/** Cursor parallax depth per frame, in px at the viewport edge (max ~6). */
const DEPTH = [5, -3, 4, -6, 3, -4, 6, -3];

/**
 * `sizes` per frame — frames are small, so never ship full-resolution
 * files above the fold.
 */
const SIZES = [
  "(max-width: 699px) 50vw, 8vw",
  "(max-width: 699px) 50vw, 26vw",
  "(max-width: 699px) 34vw, 17vw",
  "(max-width: 699px) 34vw, 17vw",
  "8vw",
  "(max-width: 699px) 67vw, 26vw",
  "17vw",
  "(max-width: 699px) 50vw, 26vw",
];

export function HeroPhotographyGrid({ photos }: { photos: Photo[] }) {
  const innerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [settled, setSettled] = useState(false);

  // The entrance itself is pure CSS, so it starts with the first paint —
  // no waiting for hydration, no blank screen, no flash of the final state.
  // JS only notes when it has finished, to hand over to the parallax.
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t = window.setTimeout(() => setSettled(true), reduce ? 0 : INTRO_MS);
    return () => window.clearTimeout(t);
  }, []);

  // After the intro the composition is still; a fine pointer gets a few
  // pixels of depth, nothing more.
  useEffect(() => {
    if (!settled) return;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine) and (min-width: 1024px)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduce) return;

    let tx = 0, ty = 0, x = 0, y = 0, raf = 0;
    const step = () => {
      x += (tx - x) * 0.06;
      y += (ty - y) * 0.06;
      innerRefs.current.forEach((el, i) => {
        if (el) el.style.transform = `translate3d(${(x * DEPTH[i]).toFixed(2)}px, ${(y * DEPTH[i]).toFixed(2)}px, 0)`;
      });
      raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.001 ? requestAnimationFrame(step) : 0;
    };
    const onMove = (e: PointerEvent) => {
      tx = (e.clientX / window.innerWidth - 0.5) * 2;
      ty = (e.clientY / window.innerHeight - 0.5) * 2;
      if (!raf) raf = requestAnimationFrame(step);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [settled]);

  return (
    <section className={`theme-dark ${styles.hero}`} data-settled={settled || undefined} aria-labelledby="hero-name">
      <div className={styles.stage}>
        {photos.slice(0, 8).map((p, i) => (
          <div key={p.id} className={`${styles.tile} ${styles[`t${i}`]}`} style={{ ["--i" as string]: i }}>
            <div
              ref={(el) => {
                innerRefs.current[i] = el;
              }}
              className={styles.inner}
            >
              <Image
                src={p.src}
                alt={p.alt}
                fill
                sizes={SIZES[i]}
                priority={i < 4}
                unoptimized={serveOriginal(p.width)}
                style={{ objectPosition: p.position ?? "50% 50%" }}
              />
            </div>
          </div>
        ))}

        <div className={styles.identity}>
          <div className={`t-meta ${styles.metaRow}`}>
            <p>{site.role}</p>
            <p>
              {site.location.city}, {site.location.country}
            </p>
          </div>

          <h1 id="hero-name" className={`t-hero ${styles.name}`}>
            <span className={styles.mask}>
              <span>{site.name.first}</span>
            </span>
            <span className={styles.mask}>
              <span>{site.name.last}</span>
            </span>
          </h1>

          <div className={`t-meta ${styles.metaRow} ${styles.metaBottom}`}>
            <p className={styles.tagline}>
              {site.tagline[0]}
              <br />
              {site.tagline[1]}
            </p>
            <p className={styles.disciplines}>{site.disciplinesShort.join(" / ")}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
