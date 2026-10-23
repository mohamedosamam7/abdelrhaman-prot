"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, PlayIcon } from "@/components/Icons";
import styles from "./SelectedFrames.module.css";

export interface Frame {
  id: string;
  type: "image" | "video";
  /** Image URL, or video file URL. */
  src: string;
  /** Video poster image URL. */
  poster?: string;
  alt: string;
  position?: string;
  /** Serve the file as-is (small originals; see lib/image.ts). */
  original?: boolean;
  title: string;
  category: string;
  categoryLabel: string;
  href?: string;
}

export interface FrameCategory {
  key: string;
  label: string;
  /** Index of the category's first frame. */
  start: number;
  count: number;
}

interface Props {
  frames: Frame[];
  categories: FrameCategory[];
  /** ms each frame stays before autoplay moves on. */
  interval: number;
}

/** After a visitor navigates, autoplay waits this long before it resumes. */
const IDLE_MS = 8000;
/** Mouse movement (px) that turns a press into a drag rather than a click. */
const DRAG_THRESHOLD = 6;
const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Horizontal gallery on native scrolling (so touch swipe, trackpads and
 * scroll-snap come for free), with mouse dragging, arrows, category jumps and
 * a slow autoplay that yields to the visitor:
 *   paused while hovered, focused, dragged, offscreen, tab hidden or a video
 *   plays; resumes IDLE_MS after the last manual navigation; never runs
 *   with prefers-reduced-motion.
 */
export function FramesCarousel({ frames, categories, interval }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLUListElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLSpanElement>(null);
  const [index, setIndex] = useState(0);
  const [forcedCat, setForcedCat] = useState<string | null>(null);
  const [fading, setFading] = useState(false);
  const [atEnd, setAtEnd] = useState(false);
  const [autoplay, setAutoplay] = useState(false);

  // Mutable autoplay state — read every frame, never needs a re-render.
  const st = useRef({ hover: false, focus: false, drag: false, video: false, inView: false, holdUntil: 0, elapsed: 0, index: 0, reduce: false });
  const count = frames.length;

  /* ── Geometry ─────────────────────────────────────────────────────────── */

  const items = () => Array.from(trackRef.current?.children ?? []) as HTMLElement[];
  const maxScroll = () => {
    const t = trackRef.current!;
    return t.scrollWidth - t.clientWidth;
  };
  const offsetOf = (i: number) => {
    const els = items();
    return els[i] ? els[i].offsetLeft - els[0].offsetLeft : 0;
  };

  const goTo = useCallback((i: number, smooth = true) => {
    const t = trackRef.current;
    if (!t) return;
    const left = Math.min(offsetOf(Math.max(0, Math.min(count - 1, i))), maxScroll());
    t.scrollTo({ left, behavior: smooth && !st.current.reduce ? "smooth" : "auto" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count]);

  /** Back to the start without a long rewind: fade out, jump, fade in. */
  const loopToStart = useCallback(() => {
    if (st.current.reduce) return goTo(0, false);
    setFading(true);
    window.setTimeout(() => {
      goTo(0, false);
      setFading(false);
    }, 450);
  }, [goTo]);

  const advance = useCallback(() => {
    const t = trackRef.current;
    if (!t) return;
    if (t.scrollLeft >= maxScroll() - 4) loopToStart();
    else goTo(st.current.index + 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [goTo, loopToStart]);

  /** Any deliberate navigation by the visitor: reset the timer and hold. */
  const userNavigated = () => {
    st.current.holdUntil = performance.now() + IDLE_MS;
    st.current.elapsed = 0;
  };

  /* ── Scroll → active index ─────────────────────────────────────────────── */

  useEffect(() => {
    const t = trackRef.current;
    if (!t) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const max = maxScroll();
      const end = t.scrollLeft >= max - 4;
      let best = 0;
      if (end && max > 0) best = count - 1;
      else {
        let dist = Infinity;
        items().forEach((_, i) => {
          const d = Math.abs(offsetOf(i) - t.scrollLeft);
          if (d < dist) [dist, best] = [d, i];
        });
      }
      st.current.index = best;
      setIndex(best);
      setAtEnd(end && max > 0);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    t.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      t.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count]);

  /* ── Autoplay ─────────────────────────────────────────────────────────── */

  useEffect(() => {
    const s = st.current;
    s.reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (s.reduce || count < 2) return;
    setAutoplay(true);

    let raf = 0;
    let last = 0;
    const tick = (now: number) => {
      const dt = last ? Math.min(now - last, 100) : 0;
      last = now;
      const paused = s.hover || s.focus || s.drag || s.video || document.hidden || now < s.holdUntil;
      if (!paused) {
        s.elapsed += dt;
        if (s.elapsed >= interval) {
          s.elapsed = 0;
          advance();
        }
      }
      progressRef.current?.style.setProperty("--p", (s.elapsed / interval).toFixed(4));
      raf = requestAnimationFrame(tick);
    };
    const start = () => {
      if (!raf) {
        last = 0;
        raf = requestAnimationFrame(tick);
      }
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };

    // Only animate (and only let videos play) while the gallery is on screen.
    const io = new IntersectionObserver(
      ([e]) => {
        s.inView = e.isIntersecting;
        if (e.isIntersecting) start();
        else stop();
      },
      { threshold: 0.35 },
    );
    if (wrapRef.current) io.observe(wrapRef.current);
    return () => {
      stop();
      io.disconnect();
    };
  }, [advance, interval, count]);

  /* ── Mouse drag (touch uses native scrolling) ──────────────────────────── */

  useEffect(() => {
    const t = trackRef.current;
    if (!t) return;
    let startX = 0;
    let startLeft = 0;
    let moved = false;
    let active = false;

    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      // Leave video controls and buttons alone.
      if ((e.target as HTMLElement).closest("video, button")) return;
      active = true;
      moved = false;
      startX = e.clientX;
      startLeft = t.scrollLeft;
    };
    const onMove = (e: PointerEvent) => {
      if (!active) return;
      const dx = e.clientX - startX;
      if (!moved && Math.abs(dx) < DRAG_THRESHOLD) return;
      if (!moved) {
        moved = true;
        st.current.drag = true;
        t.dataset.dragging = "";
      }
      t.scrollLeft = startLeft - dx;
    };
    const onUp = () => {
      if (!active) return;
      active = false;
      if (!moved) return;
      delete t.dataset.dragging;
      st.current.drag = false;
      userNavigated();
      setForcedCat(null);
      goTo(st.current.index);
    };
    // A drag must not also follow the link under the cursor.
    const onClick = (e: MouseEvent) => {
      if (moved) {
        e.preventDefault();
        e.stopPropagation();
        moved = false;
      }
    };
    t.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    t.addEventListener("click", onClick, true);
    return () => {
      t.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      t.removeEventListener("click", onClick, true);
    };
  }, [goTo]);

  /* ── Video coordination ───────────────────────────────────────────────── */

  // One video at a time, and none playing once scrolled out of the track.
  useEffect(() => {
    const t = trackRef.current;
    if (!t) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => !e.isIntersecting && (e.target as HTMLVideoElement).pause()),
      { root: t, threshold: 0.5 },
    );
    const observe = () => t.querySelectorAll("video").forEach((v) => io.observe(v));
    const mo = new MutationObserver(observe);
    mo.observe(t, { childList: true, subtree: true });
    observe();
    // …and none once the gallery itself leaves the viewport.
    const page = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) t.querySelectorAll("video").forEach((v) => v.pause());
    });
    page.observe(t);
    return () => {
      io.disconnect();
      mo.disconnect();
      page.disconnect();
    };
  }, []);

  const onVideoPlay = (v: HTMLVideoElement) => {
    trackRef.current?.querySelectorAll("video").forEach((o) => o !== v && o.pause());
    st.current.video = true;
  };
  const onVideoStop = () => {
    const any = Array.from(trackRef.current?.querySelectorAll("video") ?? []).some((v) => !v.paused);
    st.current.video = any;
    if (!any) userNavigated();
  };

  /* ── Categories ───────────────────────────────────────────────────────── */

  const derivedCat = frames[index]?.category;
  const activeCat = forcedCat ?? derivedCat;

  const jumpTo = (c: FrameCategory) => {
    userNavigated();
    setForcedCat(c.key);
    goTo(c.start);
  };

  // Release a pinned category once the visitor (or autoplay) moves on.
  useEffect(() => {
    if (forcedCat && derivedCat === forcedCat) setForcedCat(null);
  }, [derivedCat, forcedCat]);

  // Keep the active tab visible in the scrollable tab row on phones.
  useEffect(() => {
    const row = tabsRef.current;
    const btn = row?.querySelector<HTMLElement>(`[data-cat="${activeCat}"]`);
    if (!row || !btn) return;
    const left = btn.offsetLeft - row.offsetLeft;
    if (left < row.scrollLeft || left + btn.offsetWidth > row.scrollLeft + row.clientWidth) {
      row.scrollTo({ left: Math.max(0, left - 16), behavior: st.current.reduce ? "auto" : "smooth" });
    }
  }, [activeCat]);

  /* ── Controls ─────────────────────────────────────────────────────────── */

  const prev = () => {
    userNavigated();
    setForcedCat(null);
    goTo(index - 1);
  };
  const next = () => {
    userNavigated();
    setForcedCat(null);
    if (atEnd) loopToStart();
    else goTo(index + 1);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if ((e.target as HTMLElement).closest("video")) return;
    if (e.key === "ArrowRight") {
      e.preventDefault();
      next();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      prev();
    }
  };

  return (
    <div
      ref={wrapRef}
      className={styles.carousel}
      role="region"
      aria-roledescription="carousel"
      aria-label="Selected frames"
      onKeyDown={onKeyDown}
      onFocus={() => (st.current.focus = true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) st.current.focus = false;
      }}
    >
      <div className={`container ${styles.bar}`}>
        <div ref={tabsRef} className={styles.tabs} aria-label="Jump to category" role="group">
          {categories.map((c) => (
            <button
              key={c.key}
              type="button"
              data-cat={c.key}
              className={styles.tab}
              aria-pressed={activeCat === c.key}
              onClick={() => jumpTo(c)}
            >
              {c.label}
              <span className={styles.tabCount}>{pad(c.count)}</span>
            </button>
          ))}
        </div>
        <p className={styles.counter}>
          <span className="sr-only">Frame </span>
          {pad(index + 1)} <span aria-hidden="true">/</span>
          <span className="sr-only"> of </span> {pad(count)}
        </p>
      </div>

      <div
        className={styles.viewport}
        onPointerEnter={(e) => e.pointerType === "mouse" && (st.current.hover = true)}
        onPointerLeave={(e) => {
          if (e.pointerType !== "mouse") return;
          st.current.hover = false;
          st.current.holdUntil = Math.max(st.current.holdUntil, performance.now() + 1500);
        }}
      >
        {autoplay && <span ref={progressRef} className={styles.progress} aria-hidden="true" />}

        <ul
          ref={trackRef}
          className={styles.track}
          data-fading={fading || undefined}
          onWheel={(e) => Math.abs(e.deltaX) > Math.abs(e.deltaY) && (userNavigated(), setForcedCat(null))}
          onTouchStart={() => {
            userNavigated();
            setForcedCat(null);
          }}
        >
          {frames.map((f, i) => (
            <li
              key={f.id}
              className={styles.card}
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${count}: ${f.title}`}
              data-active={i === index || undefined}
            >
              {f.type === "video" ? (
                <VideoCard frame={f} onPlay={onVideoPlay} onStop={onVideoStop} />
              ) : (
                <ImageCard frame={f} />
              )}
            </li>
          ))}
        </ul>

        <button type="button" className={`${styles.nav} ${styles.prev}`} onClick={prev} disabled={index === 0} aria-label="Previous frame">
          <ChevronLeft />
        </button>
        <button type="button" className={`${styles.nav} ${styles.next}`} onClick={next} aria-label={atEnd ? "Back to first frame" : "Next frame"}>
          <ChevronRight />
        </button>
      </div>
    </div>
  );
}

function Caption({ frame }: { frame: Frame }) {
  return (
    <span className={styles.caption}>
      <span className={styles.captionTitle}>{frame.title}</span>
      <span className={styles.captionCat}>{frame.categoryLabel}</span>
    </span>
  );
}

function ImageCard({ frame }: { frame: Frame }) {
  const media = (
    <>
      <span className={styles.media}>
        <Image
          src={frame.src}
          alt={frame.alt}
          fill
          draggable={false}
          unoptimized={frame.original}
          sizes="(max-width: 767px) 118vw, (max-width: 1023px) 56vw, 35vw"
          style={{ objectPosition: frame.position ?? "50% 50%" }}
        />
      </span>
      <Caption frame={frame} />
    </>
  );
  return frame.href ? (
    <Link href={frame.href} className={styles.cardLink} draggable={false}>
      {media}
      <span className="sr-only"> — view project</span>
    </Link>
  ) : (
    <div className={styles.cardLink}>{media}</div>
  );
}

/**
 * Poster + play button until the visitor asks for the video; only then is
 * the file requested. Plays with native controls and sound — never on its own.
 */
function VideoCard({ frame, onPlay, onStop }: { frame: Frame; onPlay: (v: HTMLVideoElement) => void; onStop: () => void }) {
  const [started, setStarted] = useState(false);

  return (
    <div className={styles.cardLink} data-video>
      <span className={styles.media}>
        {started ? (
          <video
            src={frame.src}
            poster={frame.poster}
            controls
            playsInline
            autoPlay
            preload="metadata"
            aria-label={frame.title}
            onPlay={(e) => onPlay(e.currentTarget)}
            onPause={onStop}
            onEnded={onStop}
          />
        ) : (
          <>
            {frame.poster && (
              <Image
                src={frame.poster}
                alt=""
                fill
                draggable={false}
                unoptimized={frame.original}
                sizes="(max-width: 767px) 118vw, (max-width: 1023px) 56vw, 35vw"
                style={{ objectPosition: frame.position ?? "50% 50%" }}
              />
            )}
            <button type="button" className={styles.play} onClick={() => setStarted(true)}>
              <PlayIcon />
              <span className="sr-only">Play video: {frame.title}</span>
            </button>
          </>
        )}
      </span>
      {!started && <Caption frame={frame} />}
      {started && frame.href && (
        <Link href={frame.href} className={styles.videoLink}>
          View project
        </Link>
      )}
    </div>
  );
}
