"use client";

import { useEffect, useRef, useState } from "react";
import { PlayIcon } from "@/components/Icons";
import styles from "./InlineVideo.module.css";

interface Props {
  src: string;
  /** Poster URL — the frame shown until (and unless) the video plays. */
  poster?: string;
  /** object-position for the crop. */
  focus?: string;
  label: string;
  playLabel: string;
  /** Hero tiles: hold playback until the intro has finished (never stalls it). */
  afterIntro?: boolean;
}

/**
 * A muted, looping, inline video for media slots (hero tiles, text + media).
 *
 * - Nothing is downloaded until the slot is on screen (preload="none" and no
 *   src until then), so a page with several videos never loads them all.
 * - Plays only while visible; pauses offscreen and when the tab is hidden.
 * - Always muted: audio never autoplays.
 * - With prefers-reduced-motion, or when the browser blocks autoplay, the
 *   poster stays and a play button starts it on request.
 * - The poster image underneath stays in the layout, so the slot keeps its
 *   exact aspect ratio whatever the video's own dimensions are.
 */
export function InlineVideo({ src, poster, focus, label, playLabel, afterIntro }: Props) {
  const ref = useRef<HTMLVideoElement>(null);
  const [armed, setArmed] = useState(false);
  const [needsTap, setNeedsTap] = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setNeedsTap(true);
      return;
    }
    let visible = false;
    const introDone = () => !afterIntro || !v.closest("[data-intro]");

    const tryPlay = () => {
      if (!visible || document.hidden || !introDone()) return;
      setArmed(true);
      v.play().then(
        () => setNeedsTap(false),
        () => setNeedsTap(true), // autoplay blocked: offer a play button
      );
    };
    const pause = () => v.pause();

    const io = new IntersectionObserver(
      ([e]) => {
        visible = e.isIntersecting;
        if (visible) tryPlay();
        else pause();
      },
      { threshold: 0.35 },
    );
    io.observe(v);
    const onVis = () => (document.hidden ? pause() : tryPlay());
    document.addEventListener("visibilitychange", onVis);
    // The hero removes data-intro when its sequence ends.
    const mo = afterIntro ? new MutationObserver(() => introDone() && tryPlay()) : null;
    const hero = v.closest("[data-intro]");
    if (mo && hero) mo.observe(hero, { attributes: true, attributeFilter: ["data-intro"] });

    return () => {
      io.disconnect();
      mo?.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      v.pause();
    };
  }, [afterIntro]);

  return (
    <span className={styles.wrap}>
      <video
        ref={ref}
        className={styles.video}
        data-playing={playing || undefined}
        src={armed ? src : undefined}
        poster={poster}
        muted
        loop
        playsInline
        preload="none"
        aria-label={label}
        style={{ objectPosition: focus ?? "50% 50%" }}
        onPlaying={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />
      {needsTap && !playing && (
        <button
          type="button"
          className={styles.play}
          onClick={() => {
            setArmed(true);
            requestAnimationFrame(() => ref.current?.play().catch(() => undefined));
          }}
        >
          <PlayIcon />
          <span className="sr-only">{playLabel}</span>
        </button>
      )}
    </span>
  );
}
