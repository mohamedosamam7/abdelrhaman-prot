"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { Photo } from "@/content/photos";
import { getDictionary, type Locale } from "@/i18n";
import { serveOriginal } from "@/lib/image";
import { lockScroll } from "@/lib/scroll";
import styles from "./Lightbox.module.css";

interface Props {
  lang: Locale;
  photos: Photo[];
  index: number | null;
  onChange: (i: number | null) => void;
  title: string;
}

/**
 * Full-screen viewer built on the native <dialog>: focus is trapped and
 * restored by the browser, Esc closes, ←/→ step (mirrored in Arabic, where
 * "next" lies to the left), and touch swipes work.
 */
export function Lightbox({ lang, photos, index, onChange, title }: Props) {
  const t = getDictionary(lang).lightbox;
  const rtl = lang === "ar";
  const ref = useRef<HTMLDialogElement>(null);
  const startX = useRef<number | null>(null);
  const isOpen = index !== null;
  const count = photos.length;

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (isOpen && !d.open) d.showModal();
    else if (!isOpen && d.open) d.close();
  }, [isOpen]);

  // The page behind stays put while the viewer is open. The lock is released
  // when it closes or unmounts (browser Back, a link), never left behind.
  useEffect(() => (isOpen ? lockScroll() : undefined), [isOpen]);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    const onClose = () => onChange(null);
    d.addEventListener("close", onClose);
    return () => d.removeEventListener("close", onClose);
  }, [onChange]);

  const step = (dir: 1 | -1) => {
    if (index === null) return;
    onChange((index + dir + count) % count);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") step(rtl ? -1 : 1);
    if (e.key === "ArrowLeft") step(rtl ? 1 : -1);
  };

  // Preload neighbours so stepping feels instant.
  const neighbours = index === null ? [] : [photos[(index + 1) % count], photos[(index - 1 + count) % count]];
  const current = index === null ? null : photos[index];

  return (
    <dialog
      ref={ref}
      className={`theme-dark ${styles.dialog}`}
      aria-label={t.viewer(title)}
      onKeyDown={onKeyDown}
      onPointerDown={(e) => (startX.current = (e.target as HTMLElement).closest("video") ? null : e.clientX)}
      onPointerUp={(e) => {
        if (startX.current === null) return;
        const dx = e.clientX - startX.current;
        startX.current = null;
        if (e.pointerType !== "mouse" && Math.abs(dx) > 50) step((dx < 0) !== rtl ? 1 : -1);
      }}
    >
      {current && (
        <>
          <div className={styles.bar}>
            <p className="t-meta">
              {title}
              <span className="muted">
                {" — "}
                <bdi dir="ltr">
                  {String(index! + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
                </bdi>
              </span>
            </p>
            <button type="button" className={`t-meta ${styles.close}`} onClick={() => onChange(null)} autoFocus>
              {t.close}
            </button>
          </div>

          <figure className={styles.stage}>
            {/* Capped at 1.5× the file's real size so small originals aren't blown up. */}
            <div
              className={styles.imageWrap}
              key={current.id}
              style={{ maxWidth: current.width * 1.5, maxHeight: current.height * 1.5 }}
            >
              {current.videoSrc ? (
                <LightboxVideo key={current.id} src={current.videoSrc} poster={current.src} label={current.alt} failed={t.videoFailed} openFile={t.openFile} />
              ) : (
                <Image src={current.src} alt={current.alt} fill sizes="100vw" quality={85} unoptimized={serveOriginal(current.width)} className={styles.image} />
              )}
            </div>
            <figcaption className={`t-meta muted ${styles.caption}`}>{current.alt}</figcaption>
          </figure>

          {count > 1 && (
            <>
              <button type="button" className={`${styles.nav} ${styles.prev}`} onClick={() => step(-1)} aria-label={t.prevLabel}>
                <span className="t-meta">
                  <span className="dir-icon" aria-hidden="true">←</span> {t.prev}
                </span>
              </button>
              <button type="button" className={`${styles.nav} ${styles.next}`} onClick={() => step(1)} aria-label={t.nextLabel}>
                <span className="t-meta">
                  {t.next} <span className="dir-icon" aria-hidden="true">→</span>
                </span>
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

/**
 * A project video in the viewer: native controls, inline, never autoplayed
 * with sound; only the selected video is loaded. A file that fails to load
 * shows a message and a direct link instead of a blank frame.
 */
function LightboxVideo({ src, poster, label, failed, openFile }: { src: string; poster: string; label: string; failed: string; openFile: string }) {
  const [error, setError] = useState(false);
  if (error) {
    return (
      <p className={styles.videoError} role="alert">
        {failed}{" "}
        <a href={src} target="_blank" rel="noopener noreferrer">
          {openFile}
        </a>
      </p>
    );
  }
  return <video className={styles.video} src={src} poster={poster} controls playsInline preload="metadata" aria-label={label} onError={() => setError(true)} />;
}
