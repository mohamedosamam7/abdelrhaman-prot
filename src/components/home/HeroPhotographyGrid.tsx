"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import Image from "next/image";
import { useRef } from "react";
import type { ResolvedOf } from "@/cms/types";
import { InlineVideo } from "@/components/media/InlineVideo";
import { heroRows, type HeroLayout } from "@/content/home";
import { getDictionary, tr, type Locale } from "@/i18n";
import { localizePhoto } from "@/lib/content";
import { serveOriginal } from "@/lib/image";
import { GLASS_R, HeroLens, shutterPaths } from "./HeroLens";
import styles from "./HeroPhotographyGrid.module.css";

gsap.registerPlugin(useGSAP);

const LAYOUTS: HeroLayout[] = ["desktop", "tablet", "mobile"];

/**
 * Intro timing (seconds from first paint; the lens entrance itself is CSS).
 *   0.00–0.90  A  lens appears, complete logo fades in
 *   0.90–1.45  B  hold — logo fully readable
 *   1.45–1.75  C  the aperture closes over the logo; under the closed
 *                 shutter the logo and glass are switched off
 *   1.79–3.30  D  the aperture reopens onto the photos: each is revealed
 *                 through a circular mask from the lens centre while it
 *                 moves out to its place (45ms apart); the edge fades
 *   ~3.0–3.4      caption last
 */
// The photo mask (reveal) opens a little faster than the aperture (open), so the
// photography always fills the opening.
const T = { close: 1.45, closeDur: 0.3, beat: 0.04, open: 0.55, expand: 1.2, stagger: 0.045, reveal: 0.45, rimOut: 0.45 };
const ROT = { desktop: 4, tablet: 3.5, mobile: 3 } as const;
/**
 * Rendered image widths per layout. Tiles are uniform and photos are cropped
 * with object-fit: cover, so a 3:2 photo in a taller tile renders wider than
 * the tile (height × 1.5); a 4:5 photo renders at the tile width.
 */
const SIZES = {
  desktop: { portrait: "25vw", landscape: "25vw" },
  tablet: { portrait: "24vw", landscape: "36vw" },
  mobile: { portrait: "30vw", landscape: "56vw" },
} as const;

/**
 * Once per visit: set when the intro finishes or is skipped. It lives in the
 * client bundle, so returning Home by client navigation (links, Back/Forward)
 * shows the finished composition, while a reload or new visit plays again.
 */
let introPlayed = false;

export function HeroPhotographyGrid({ lang, data }: { lang: Locale; data: ResolvedOf<"hero">["data"] }) {
  const SLOT = Object.fromEntries(data.slots.map((s) => [s.id, s]));
  const t = getDictionary(lang);
  const root = useRef<HTMLElement>(null);

  useGSAP(
    (_, contextSafe) => {
      const hero = root.current;
      // Already finished during this visit (or never requested): never replay.
      if (!hero || hero.dataset.intro === undefined) return;

      // One owner: a cleaned-up run (Strict Mode, remount) must never touch the
      // DOM again, so every deferred callback checks `alive` first.
      let alive = true;
      let done = false;

      const finish = () => {
        introPlayed = true;
        delete hero.dataset.intro;
        delete hero.dataset.gsap;
      };
      const motionOk =
        document.documentElement.classList.contains("motion-ok") &&
        !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const layoutEl = [...hero.querySelectorAll<HTMLElement>("[data-layout]")].find((l) => l.offsetParent !== null);
      const lens = hero.querySelector<HTMLElement>("[data-lens]");
      const logo = hero.querySelector<HTMLElement>("[data-lens-logo]");
      if (!motionOk || !layoutEl || !lens || !logo) return finish();

      const kind = layoutEl.dataset.layout as HeroLayout;
      const lines = [...hero.querySelectorAll<HTMLElement>("[data-line]")];
      const tiles = [...layoutEl.querySelectorAll<HTMLElement>("[data-slot]")];

      // If the CSS fail-safe already showed the final layout, skip the intro:
      // visible photos are never pulled back behind the lens.
      const lensStyle = getComputedStyle(lens.parentElement!);
      const alreadyRevealed =
        tiles.some((t) => parseFloat(getComputedStyle(t).opacity) > 0.01) ||
        lensStyle.visibility === "hidden" ||
        parseFloat(lensStyle.opacity) < 0.05;
      if (alreadyRevealed) return finish();

      // Claim the intro before the next paint, while every photo is invisible:
      // measuring the final layout and stacking photos behind the lens is never seen.
      hero.dataset.gsap = "";

      const L = lens.getBoundingClientRect();
      const cx = L.left + L.width / 2;
      const cy = L.top + L.height / 2;
      const rects = tiles.map((t) => t.getBoundingClientRect());
      // Nearest photos leave first, so the composition opens outward.
      const order = tiles
        .map((t, i) => ({ t, i, d: Math.hypot(rects[i].left + rects[i].width / 2 - cx, rects[i].top + rects[i].height / 2 - cy) }))
        .sort((a, b) => a.d - b.d);

      // Shutter: blade paths are redrawn from one animated value, the opening radius.
      const core = lens.querySelector<SVGGElement>("[data-lens-core]");
      const blades = [...lens.querySelectorAll<SVGPathElement>("[data-shutter] path")];
      if (!core || !blades.length) return finish();
      const iris = { r: GLASS_R + 4 };
      const drawIris = () => {
        const d = shutterPaths(iris.r);
        blades.forEach((b, i) => b.setAttribute("d", d[i]));
      };

      // Hidden start: every photo centred on the lens, about the size of the glass
      // (uniform scale), and masked to nothing — it can only appear through the
      // circular reveal that grows from the lens centre.
      const glassPx = (GLASS_R / 200) * L.width;
      order.forEach(({ t, i }, k) => {
        const r = rects[i];
        gsap.set(t, {
          x: cx - (r.left + r.width / 2),
          y: cy - (r.top + r.height / 2),
          // ~80% of the glass: close to final size, so the travel has almost no zoom.
          scale: (glassPx * 1.6) / r.height,
          rotation: (k % 2 ? 1 : -1) * ROT[kind] * (0.5 + (k % 3) / 4),
          zIndex: order.length - k,
          opacity: 0,
          clipPath: "circle(0px at 50% 50%)",
        });
      });
      gsap.set(lines, { yPercent: 115 });

      // ── One timeline (position 0 = T.close): logo → shutter closes → opens into photos.
      const tl = gsap.timeline({ paused: true, onComplete: () => complete() });
      // C: the aperture closes over the logo.
      tl.to(iris, { r: 0, duration: T.closeDur, ease: "power3.in", onUpdate: drawIris }, 0);
      // Fully closed: switch the logo and glass off underneath, so neither can reappear.
      const closed = T.closeDur;
      tl.set([logo, core], { opacity: 0 }, closed);
      // D: reopen onto the photography, from the same centre.
      const open = closed + T.beat;
      tl.to(iris, { r: GLASS_R + 4, duration: T.open, ease: "power2.out", onUpdate: drawIris }, open);
      tl.set(tiles, { opacity: 1 }, open);
      tl.to(lens, { opacity: 0, scale: 0.94, duration: T.rimOut, ease: "power2.in" }, open + 0.1);
      order.forEach(({ t, i }, k) => {
        const s = open + k * T.stagger;
        const full = Math.hypot(rects[i].width, rects[i].height) / 2 + 2;
        // Masked reveal and outward travel overlap; the mask is released fully,
        // so no edge is cut while the photo is moving.
        tl.to(t, { clipPath: `circle(${full}px at 50% 50%)`, duration: T.reveal, ease: "power2.out" }, s);
        tl.to(t, { x: 0, y: 0, scale: 1, rotation: 0, duration: T.expand, ease: "power4.out" }, s);
      });
      tl.to(lines, { yPercent: 0, duration: 0.5, ease: "power3.out", stagger: 0.08 }, ">-0.35");

      // ── End state: hand everything back to CSS. Only the live owner may do this.
      const complete = () => {
        if (!alive || done) return;
        done = true;
        gsap.set(tiles, { clearProps: "transform,opacity,zIndex,clipPath" });
        gsap.set([...lines, lens, logo, core], { clearProps: "transform,opacity" });
        iris.r = GLASS_R + 4;
        drawIris();
        finish();
        teardown();
      };
      // Interruptions (scrolled past, resized, watchdog): jump to the final layout once.
      const skip = () => {
        if (!alive || done) return;
        tl.progress(1, true);
        tl.kill();
        complete();
      };
      const heroTop = hero.getBoundingClientRect().top;
      const onScroll = () => hero.getBoundingClientRect().bottom < heroTop && skip();
      const width = window.innerWidth;
      const onResize = () => Math.abs(window.innerWidth - width) > 1 && skip();
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onResize);
      const watchdog = gsap.delayedCall(8, skip);
      let startCall: gsap.core.Tween | undefined;

      function teardown() {
        watchdog.kill();
        startCall?.kill();
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onResize);
      }

      // ── Start on the lens's own clock (late hydration = longer hold), after a
      // bounded wait for the photos to decode.
      const lensAnim = lens.querySelector("svg")?.getAnimations?.()[0];
      const elapsed = () => (Number(lensAnim?.currentTime) || 0) / 1000;
      // Only photos that are on screen once in place are waited for: rows below
      // the fold stay lazy and never hold up the intro.
      const imgs = tiles
        .filter((_, i) => rects[i].top < window.innerHeight)
        .map((t) => t.querySelector("img"))
        .filter(Boolean) as HTMLImageElement[];
      const decoded = Promise.all(imgs.map((i) => i.decode().catch(() => undefined)));
      const capped = new Promise((r) => setTimeout(r, 1200));
      const start = contextSafe!(() => {
        if (!alive || done) return;
        startCall = gsap.delayedCall(Math.max(0, T.close - elapsed()), () => alive && !done && tl.play());
      });
      Promise.race([decoded, capped]).then(start);

      return () => {
        // This run is over; useGSAP reverts its inline styles, so a following
        // run starts from the CSS-hidden state.
        alive = false;
        tl.kill();
        teardown();
        // Blade paths are set directly (not by a tween), so reset them here.
        iris.r = GLASS_R + 4;
        drawIris();
      };
    },
    { scope: root },
  );

  return (
    <section ref={root} className={`theme-dark ${styles.hero}`} data-intro={introPlayed ? undefined : ""} aria-labelledby="hero-title">
      <div className={styles.inner}>
        <div className={styles.stage}>
          {LAYOUTS.map((layout) => (
            <div key={layout} className={`${styles.layout} ${styles[layout]}`} data-layout={layout}>
              {heroRows[layout].map((row, r) => (
                <div key={r} className={styles.row}>
                  {row.map((id) => {
                    const slot = SLOT[id];
                    const p = localizePhoto(slot.photo, lang);
                    return (
                      <div key={id} className={styles.tile} data-slot={id} data-type={slot.type}>
                        <Image
                          src={p.src}
                          alt={p.alt}
                          fill
                          // Lazy on purpose: only one of the three layouts is displayed, and
                          // browsers skip lazy images in display:none layouts. The visible
                          // layout is on screen, so its photos still load immediately.
                          loading="lazy"
                          unoptimized={serveOriginal(p.width)}
                          sizes={SIZES[layout][slot.type]}
                          style={{ objectPosition: slot.focus }}
                        />
                        {p.videoSrc && (
                          <InlineVideo src={p.videoSrc} poster={p.src || undefined} focus={slot.focus} label={p.alt} playLabel={t.frames.play(p.alt)} afterIntro />
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          ))}

          {/* Intro-only lens; the header keeps its own logo. */}
          <div className={styles.lensWrap} aria-hidden="true">
            <div className={styles.lens} data-lens="">
              <HeroLens />
            </div>
          </div>
        </div>

        <div className={styles.caption}>
          <h1 id="hero-title" className={`t-meta ${styles.title}`}>
            <span className={styles.lineMask}>
              <span data-line="">{tr(lang, data.title)}</span>
            </span>
          </h1>
          <p className={`t-meta ${styles.meta}`}>
            <span className={styles.lineMask}>
              <span data-line="">{tr(lang, data.meta)}</span>
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}
