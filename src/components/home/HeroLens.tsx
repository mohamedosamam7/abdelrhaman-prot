import { Logo } from "@/components/brand/Logo";
import styles from "./HeroLens.module.css";

const C = 100; // viewBox centre
const pt = (r: number, a: number) => `${(C + r * Math.cos(a)).toFixed(2)} ${(C + r * Math.sin(a)).toFixed(2)}`;

/** Radius of the glass (viewBox units); the shutter is clipped to it. */
export const GLASS_R = 94;
const SHUTTER_N = 7;

/**
 * Faint static aperture behind the logo — photography language without
 * competing with the wordmark.
 */
const N = 7;
const R_OUT = 80;
const R_OPEN = 30;
const BLADES = Array.from({ length: N }, (_, i) => {
  const a0 = (i / N) * Math.PI * 2 - Math.PI / 2;
  const a1 = ((i + 1) / N) * Math.PI * 2 - Math.PI / 2;
  const twist = 0.62;
  return `M${pt(R_OPEN, a0)}L${pt(R_OPEN, a1)}L${pt(R_OUT + 8, a1 + twist)}L${pt(R_OUT + 8, a0 + twist)}Z`;
});

/**
 * Shutter blade paths for an opening of inradius `r` (viewBox units):
 * r = 0 closes the iris completely; r ≥ GLASS_R hides every blade. Each blade
 * is a large plate whose inner edge is one side of the opening; the blades
 * rotate slightly as they close, like a real iris.
 */
export function shutterPaths(r: number) {
  const twist = 0.9 * (1 - Math.min(r, GLASS_R) / GLASS_R);
  return Array.from({ length: SHUTTER_N }, (_, i) => {
    const phi = (i / SHUTTER_N) * Math.PI * 2 - Math.PI / 2 + twist;
    const nx = Math.cos(phi);
    const ny = Math.sin(phi);
    const tx = -ny;
    const ty = nx;
    const W = 120;
    const D = 200;
    const x0 = C + nx * r;
    const y0 = C + ny * r;
    const p = (x: number, y: number) => `${x.toFixed(2)} ${y.toFixed(2)}`;
    // Wider than the glass on both sides, so the closed iris has no gaps.
    return `M${p(x0 - tx * W, y0 - ty * W)}L${p(x0 + tx * W, y0 + ty * W)}L${p(x0 + tx * W + nx * D, y0 + ty * W + ny * D)}L${p(x0 - tx * W + nx * D, y0 - ty * W + ny * D)}Z`;
  });
}

/**
 * Minimal lens for the hero intro: a single dark glass disc with a fine edge,
 * a soft sheen and a faint aperture, with the E STUDIO logo at its centre
 * (the shared <Logo> vector). The animated shutter sits above the logo.
 */
export function HeroLens() {
  return (
    <div className={styles.lens}>
      <svg className={styles.svg} viewBox="0 0 200 200" aria-hidden="true" focusable="false">
        <defs>
          <radialGradient id="hl-glass" cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor="#0d0205" />
            <stop offset="0.6" stopColor="#1e060b" />
            <stop offset="0.92" stopColor="#3b0c15" />
            <stop offset="1" stopColor="#57202a" />
          </radialGradient>
          <radialGradient id="hl-coat" cx="30%" cy="24%" r="62%">
            <stop offset="0" stopColor="#c47f86" stopOpacity="0.42" />
            <stop offset="0.5" stopColor="#8a2433" stopOpacity="0.12" />
            <stop offset="1" stopColor="#8a2433" stopOpacity="0" />
          </radialGradient>
          <clipPath id="hl-iris">
            <circle cx={C} cy={C} r={R_OUT} />
          </clipPath>
        </defs>

        {/* Glass — switched off under the closed shutter so the photos show through */}
        <g data-lens-core="">
          <circle cx={C} cy={C} r={GLASS_R} fill="url(#hl-glass)" />
          <g clipPath="url(#hl-iris)">
            {BLADES.map((d, i) => (
              <path key={i} d={d} fill="none" stroke="#f3ebdd" strokeOpacity="0.09" strokeWidth="0.6" />
            ))}
          </g>
          <circle cx={C} cy={C} r={GLASS_R} fill="url(#hl-coat)" />
          <g className={styles.glint}>
            <path d="M34 82 A68 68 0 0 1 76 34" fill="none" stroke="#f3ebdd" strokeOpacity="0.4" strokeWidth="1.6" strokeLinecap="round" />
          </g>
        </g>
        {/* One fine edge instead of a barrel */}
        <circle cx={C} cy={C} r={GLASS_R} fill="none" stroke="#f3ebdd" strokeOpacity="0.38" strokeWidth="0.7" />
      </svg>

      {/* GSAP fades this wrapper; the CSS entrance runs on the inner element. */}
      <div className={styles.logo} data-lens-logo="">
        <div className={styles.logoIn}>
          <Logo title="" />
        </div>
      </div>

      {/* Shutter: animated iris drawn above the logo (open = invisible). */}
      <svg className={styles.shutter} viewBox="0 0 200 200" aria-hidden="true" focusable="false">
        <defs>
          <clipPath id="hl-shutter-clip">
            <circle cx={C} cy={C} r={GLASS_R} />
          </clipPath>
          <linearGradient id="hl-shutter-blade" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#5e1824" />
            <stop offset="1" stopColor="#22070c" />
          </linearGradient>
        </defs>
        <g clipPath="url(#hl-shutter-clip)" data-shutter="">
          {shutterPaths(GLASS_R + 4).map((d, i) => (
            <path key={i} d={d} fill="url(#hl-shutter-blade)" stroke="#f3ebdd" strokeOpacity="0.32" strokeWidth="0.6" strokeLinejoin="round" />
          ))}
        </g>
      </svg>
    </div>
  );
}
