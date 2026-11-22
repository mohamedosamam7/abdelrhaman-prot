"use client";

import gsap from "gsap";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { getLenis, setLenis } from "@/lib/scroll";

/**
 * Lenis smooth scrolling for mouse wheels and trackpads only.
 *
 * - Touch scrolling stays native (syncTouch off): no hijacked swipes, and a
 *   swipe that starts on the horizontal gallery still scrolls the page.
 * - Driven by GSAP's ticker, so the page has a single animation loop.
 * - Not started with prefers-reduced-motion (live changes respected).
 * - Overlays (dialog, mobile menu) opt out with data-lenis-prevent and pause
 *   it through lib/scroll's counted lock.
 * - On route change any momentum is cancelled, so the new page starts where
 *   Next.js put it (top, or the restored position on Back/Forward).
 */
export function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    let lenis: Lenis | null = null;
    const tick = (time: number) => lenis?.raf(time * 1000);

    const start = () => {
      if (lenis || media.matches) return;
      lenis = new Lenis({
        autoRaf: false,
        lerp: 0.12,
        smoothWheel: true,
        syncTouch: false,
        anchors: false,
        stopInertiaOnNavigate: true,
        prevent: (node) => !!node.closest("dialog, [data-lenis-prevent]"),
      });
      gsap.ticker.add(tick);
      setLenis(lenis);
    };
    const stop = () => {
      if (!lenis) return;
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenis = null;
      setLenis(null);
    };
    const onPref = () => (media.matches ? stop() : start());

    start();
    media.addEventListener("change", onPref);
    return () => {
      media.removeEventListener("change", onPref);
      stop();
    };
  }, []);

  // A new page: drop any remaining wheel momentum and re-measure.
  useEffect(() => {
    const l = getLenis();
    if (!l) return;
    l.scrollTo(window.scrollY, { immediate: true, force: true });
    l.resize();
  }, [pathname]);

  return null;
}
