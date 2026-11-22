"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { CSSProperties } from "react";
import { getDictionary, type Locale } from "@/i18n";
import styles from "./WorkGallery.module.css";

export interface WorkCard {
  slug: string;
  href: string;
  title: string;
  category: string;
  categoryLabel: string;
  /** Localized frame count, e.g. "12 frames". */
  frames: string;
  cover: { src: string; alt: string; position?: string; original?: boolean };
}

export interface WorkFilter {
  key: string;
  label: string;
  count: number;
}

export interface WorkLabels {
  all: string;
  filterLabel: string;
  /** Localized /work path the filter links build on. */
  base: string;
}

interface ViewProps {
  lang: Locale;
  /** False for the featured-projects section: cards only. */
  showFilters?: boolean;
  cards: WorkCard[];
  filters: WorkFilter[];
  labels: WorkLabels;
  active: string;
}

/** Reads the active filter from the URL (?category=events). */
export function WorkGallery(props: Omit<ViewProps, "active">) {
  const requested = useSearchParams().get("category");
  const active = props.filters.some((f) => f.key === requested) ? requested! : "all";
  return <WorkGalleryView {...props} active={active} />;
}

/**
 * Filterable project grid. Filters are links (?category=…) that add a
 * history entry, so they work before hydration, survive refresh, and browser
 * back/forward steps through the filters.
 *
 * Layout never strands a lone card: 4 projects sit 2 × 2, other counts use
 * 3 columns with a centred last row; on phones an odd count makes the first
 * card full width.
 */
export function WorkGalleryView({ lang, cards, filters, labels, active, showFilters = true }: ViewProps) {
  const shown = active === "all" ? cards : cards.filter((c) => c.category === active);
  const cols = shown.length === 4 || shown.length === 2 ? 2 : shown.length === 1 ? 1 : 3;

  return (
    <div className={styles.wrap}>
      {showFilters && (
      <nav className={styles.filters} aria-label={labels.filterLabel}>
        {[{ key: "all", label: labels.all, count: cards.length }, ...filters].map((f) => (
          <Link
            key={f.key}
            href={f.key === "all" ? labels.base : `${labels.base}?category=${f.key}`}
            scroll={false}
            className={styles.filter}
            aria-current={active === f.key ? "true" : undefined}
          >
            {f.label}
            <span className={styles.filterCount}>{String(f.count).padStart(2, "0")}</span>
          </Link>
        ))}
      </nav>
      )}

      {showFilters && (
        <p className="sr-only" aria-live="polite">
          {getDictionary(lang).work.showing(shown.length)}
        </p>
      )}

      <ul
        className={styles.grid}
        data-odd={shown.length % 2 === 1 || undefined}
        data-cols={cols}
        style={{ ["--cols" as string]: cols } as CSSProperties}
      >
        {shown.map((c, i) => (
          <li key={c.slug} className={styles.item}>
            <Link href={c.href} className={styles.card}>
              <span className={styles.media}>
                <Image
                  src={c.cover.src}
                  alt={c.cover.alt}
                  fill
                  sizes={i === 0 ? "(max-width: 767px) 100vw, 34vw" : "(max-width: 767px) 50vw, 34vw"}
                  priority={i < 3}
                  unoptimized={c.cover.original}
                  style={{ objectPosition: c.cover.position ?? "50% 50%" }}
                />
              </span>
              <span className={styles.meta}>
                <span className={`t-serif ${styles.title}`}>{c.title}</span>
                <span className={styles.details}>
                  {c.categoryLabel} · {c.frames}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
