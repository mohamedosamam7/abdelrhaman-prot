"use client";

import { useState } from "react";
import { PlayIcon } from "@/components/Icons";
import { Photo } from "@/components/Photo";
import type { Photo as PhotoData } from "@/content/photos";
import { getDictionary, type Locale } from "@/i18n";
import { Lightbox } from "./Lightbox";
import styles from "./ProjectGallery.module.css";

/**
 * A project's frames as an even grid (3 / 2 columns). Cells are sized close
 * to the photographs' real pixel widths, so nothing is blown up; each frame
 * opens in the lightbox.
 */
export function ProjectGallery({ lang, photos, title }: { lang: Locale; photos: PhotoData[]; title: string }) {
  const [open, setOpen] = useState<number | null>(null);
  const t = getDictionary(lang);

  return (
    <>
      <ul className={styles.grid}>
        {photos.map((p, i) => (
          <li key={p.id}>
            <button
              type="button"
              className={`hover-target ${styles.item}`}
              onClick={() => setOpen(i)}
              aria-label={t.project.open(i + 1, photos.length, p.alt)}
            >
              <Photo
                photo={p}
                ratio="6 / 5"
                sizes="(max-width: 767px) 50vw, (max-width: 1279px) 33vw, 460px"
                priority={i < 3}
                className="hover-zoom"
              />
              {/* Videos show their poster here and play in the viewer. */}
              {p.videoSrc && (
                <span className={styles.play} aria-hidden="true">
                  <PlayIcon />
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>

      <Lightbox lang={lang} photos={photos} index={open} onChange={setOpen} title={title} />
    </>
  );
}
