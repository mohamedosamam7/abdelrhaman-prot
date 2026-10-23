"use client";

import { useEffect } from "react";

const SELECTOR = "[data-reveal]:not(.is-in)";

/**
 * One shared IntersectionObserver for every [data-reveal] element.
 *
 * Fail-safe order: content is visible in the server HTML. On start-up this
 * marks everything already on (or above) the screen as revealed, and only
 * then adds `.reveal-ready` to <html>, which hides what is still below the
 * fold. If this component never runs, nothing is ever hidden.
 *
 * Elements reveal once, slightly before they enter the viewport so fast
 * scrolling never shows empty sections. A MutationObserver picks up content
 * that appears later (client-side navigation, lazily rendered parts).
 *
 * Safety net: a jump of more than a screen in one frame (fling, End key,
 * scrollbar drag, anchor link) can carry an element from below the viewport
 * to above it without the IntersectionObserver ever seeing it on screen. A
 * cheap rAF-throttled scroll check reveals anything already reached or passed.
 */
export function RevealObserver() {
  useEffect(() => {
    const root = document.documentElement;
    if (!("IntersectionObserver" in window)) return;

    const pending = new Set<Element>();
    const reveal = (el: Element) => {
      el.classList.add("is-in");
      pending.delete(el);
      io.unobserve(el);
    };

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) reveal(entry.target);
      },
      // Positive bottom margin: start revealing ~15% of a screen early.
      { rootMargin: "0px 0px 15% 0px", threshold: 0 },
    );

    const track = (els: Iterable<Element>) => {
      const limit = window.innerHeight * 1.15;
      for (const el of els) {
        // Already on screen (or scrolled past): show without waiting.
        if (el.getBoundingClientRect().top < limit) el.classList.add("is-in");
        else {
          pending.add(el);
          io.observe(el);
        }
      }
    };

    let raf = 0;
    const sweep = () => {
      raf = 0;
      const limit = window.innerHeight * 1.15;
      pending.forEach((el) => el.getBoundingClientRect().top < limit && reveal(el));
    };
    const onScroll = () => {
      if (pending.size && !raf) raf = requestAnimationFrame(sweep);
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    track(document.querySelectorAll(SELECTOR));
    root.classList.add("reveal-ready");

    const mo = new MutationObserver((records) => {
      const added: Element[] = [];
      for (const r of records) {
        r.addedNodes.forEach((n) => {
          if (!(n instanceof Element)) return;
          if (n.matches(SELECTOR)) added.push(n);
          n.querySelectorAll(SELECTOR).forEach((el) => added.push(el));
        });
      }
      if (added.length) track(added);
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      root.classList.remove("reveal-ready");
    };
  }, []);

  return null;
}
