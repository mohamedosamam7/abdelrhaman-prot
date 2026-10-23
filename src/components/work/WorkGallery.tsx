"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { CSSProperties } from "react";
import styles from "./WorkGallery.module.css";

export interface WorkCard {
  slug: string;
  href: string;
  title: string;
  category: string;
  categoryLabel: string;
  count: number;
  cover: { src: string; alt: string; position?: string; original?: boolean };
}

export interface WorkFilter {
  key: string;
  label: string;
  count: number;
}

interface ViewProps {
  cards: WorkCard[];
  filters: WorkFilter[];
  active: string;
}

/** Reads the active filter from the URL (?category=events). */
export function WorkGallery({ cards, filters }: Omit<ViewProps, "active">) {
  const requested = useSearchParams().get("category");
  const active = filters.some((f) => f.key === requested) ? requested! : "all";
  return <WorkGalleryView cards={cards} filters={filters} active={active} />;
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
export function WorkGalleryView({ cards, filters, active }: ViewProps) {
  const shown = active === "all" ? cards : cards.filter((c) => c.category === active);
  const cols = shown.length === 4 || shown.length === 2 ? 2 : shown.length === 1 ? 1 : 3;

  return (
    <div className={styles.wrap}>
      <nav className={styles.filters} aria-label="Filter projects by category">
        {[{ key: "all", label: "All work", count: cards.length }, ...filters].map((f) => (
          <Link
            key={f.key}
            href={f.key === "all" ? "/work" : `/work?category=${f.key}`}
            scroll={false}
            className={styles.filter}
            aria-current={active === f.key ? "true" : undefined}
          >
            {f.label}
            <span className={styles.filterCount}>{String(f.count).padStart(2, "0")}</span>
          </Link>
        ))}
      </nav>

      <p className="sr-only" aria-live="polite">
        Showing {shown.length} {shown.length === 1 ? "project" : "projects"}
      </p>

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
                  {c.categoryLabel} · {c.count} frames
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
