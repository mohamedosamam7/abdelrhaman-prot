"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import type { Photo } from "@/content/photos";
import { serveOriginal } from "@/lib/image";
import styles from "./Lightbox.module.css";

interface Props {
  photos: Photo[];
  index: number | null;
  onChange: (i: number | null) => void;
  title: string;
}

/**
 * Full-screen viewer built on the native <dialog>: focus is trapped and
 * restored by the browser, Esc closes, ←/→ step, and touch swipes work.
 */
export function Lightbox({ photos, index, onChange, title }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const startX = useRef<number | null>(null);
  const isOpen = index !== null;
  const count = photos.length;

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (isOpen && !d.open) {
      d.showModal();
      document.documentElement.style.overflow = "hidden";
    } else if (!isOpen && d.open) {
      d.close();
    }
  }, [isOpen]);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    const onClose = () => {
      document.documentElement.style.overflow = "";
      onChange(null);
    };
    d.addEventListener("close", onClose);
    return () => d.removeEventListener("close", onClose);
  }, [onChange]);

  // Leaving the page with the viewer open (browser Back, a link) must never
  // leave the page unscrollable.
  useEffect(() => () => void (document.documentElement.style.overflow = ""), []);

  const step = (dir: 1 | -1) => {
    if (index === null) return;
    onChange((index + dir + count) % count);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") step(1);
    if (e.key === "ArrowLeft") step(-1);
  };

  // Preload neighbours so stepping feels instant.
  const neighbours = index === null ? [] : [photos[(index + 1) % count], photos[(index - 1 + count) % count]];
  const current = index === null ? null : photos[index];

  return (
    <dialog
      ref={ref}
      className={`theme-dark ${styles.dialog}`}
      aria-label={`${title} — image viewer`}
      onKeyDown={onKeyDown}
      onPointerDown={(e) => (startX.current = e.clientX)}
      onPointerUp={(e) => {
        if (startX.current === null) return;
        const dx = e.clientX - startX.current;
        startX.current = null;
        if (e.pointerType !== "mouse" && Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
      }}
    >
      {current && (
        <>
          <div className={styles.bar}>
            <p className="t-meta">
              {title}
              <span className="muted"> — {String(index! + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}</span>
            </p>
            <button type="button" className={`t-meta ${styles.close}`} onClick={() => onChange(null)} autoFocus>
              Close
            </button>
          </div>

          <figure className={styles.stage}>
            {/* Capped at 1.5× the file's real size so small originals aren't blown up. */}
            <div
              className={styles.imageWrap}
              key={current.id}
              style={{ maxWidth: current.width * 1.5, maxHeight: current.height * 1.5 }}
            >
              <Image src={current.src} alt={current.alt} fill sizes="100vw" quality={85} unoptimized={serveOriginal(current.width)} className={styles.image} />
            </div>
            <figcaption className={`t-meta muted ${styles.caption}`}>{current.alt}</figcaption>
          </figure>

          {count > 1 && (
            <>
              <button type="button" className={`${styles.nav} ${styles.prev}`} onClick={() => step(-1)} aria-label="Previous image">
                <span className="t-meta">← Prev</span>
              </button>
              <button type="button" className={`${styles.nav} ${styles.next}`} onClick={() => step(1)} aria-label="Next image">
                <span className="t-meta">Next →</span>
              </button>
            </>
          )}

          <div className={styles.preload} aria-hidden="true">
            {neighbours.map((p) => (
              <Image key={p.id} src={p.src} alt="" fill sizes="100vw" quality={85} unoptimized={serveOriginal(p.width)} />
            ))}
          </div>
        </>
      )}
    </dialog>
  );
}
