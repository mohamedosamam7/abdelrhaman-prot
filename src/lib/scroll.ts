import type Lenis from "lenis";

/**
 * Page-scroll ownership shared by the smooth scroller, the mobile menu and
 * the lightbox.
 *
 * Locks are counted, so two overlays never release each other's lock, and
 * every lock also pauses Lenis (an `overflow: hidden` page can still be
 * moved programmatically, which is how Lenis scrolls).
 */
let lenis: Lenis | null = null;
let locks = 0;

export function setLenis(instance: Lenis | null) {
  lenis = instance;
  if (instance && locks > 0) instance.stop();
}

export function getLenis() {
  return lenis;
}

/** Stop the page from scrolling; call the returned function to release (idempotent). */
export function lockScroll(): () => void {
  locks++;
  if (locks === 1) {
    document.documentElement.style.overflow = "hidden";
    lenis?.stop();
  }
  let released = false;
  return () => {
    if (released) return;
    released = true;
    locks = Math.max(0, locks - 1);
    if (locks === 0) {
      document.documentElement.style.overflow = "";
      lenis?.start();
    }
  };
}
