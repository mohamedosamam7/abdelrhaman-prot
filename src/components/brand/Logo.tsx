/**
 * E STUDIO logo — symbol + wordmark as one vector.
 *
 * It draws in `currentColor`, so the cream and burgundy variants are the same
 * geometry recoloured: set `color` (or the `--logo` token) on a parent.
 * Static copies for other uses live in /public/brand (estudio-logo-cream.svg,
 * estudio-logo-burgundy.svg, estudio-mark-*.svg). Keep them in sync if the
 * official vector logo replaces this trace.
 *
 * The geometry is exported so other renderings (the hero intro's masked
 * reveal) draw exactly the same shapes.
 */
export const LOGO_VIEWBOX = "0 0 244 48";

/** The three diagonal bars of the E: centre (cx, cy) and length; all 8.8 thick, rotated −16°. */
export const LOGO_BARS = [
  { cx: 17, cy: 8.8, length: 32 },
  { cx: 14, cy: 24, length: 26 },
  { cx: 17, cy: 39.2, length: 32 },
] as const;
export const LOGO_BAR_THICKNESS = 8.8;
export const LOGO_BAR_ANGLE = -16;

/** STUDIO wordmark strokes (stroke width 1.6). The O is a circle at (225, 24), r 16.2. */
export const LOGO_WORDMARK_PATHS = [
  "M70 11.5C68 8.6 64.9 7 61.3 7C55.6 7 51.8 10.2 51.8 14.9C51.8 19.6 55.4 21.4 60.6 22.9C66.3 24.6 70.6 26.6 70.6 32.4C70.6 37.6 66.6 41 60.6 41C56 41 52.6 38.9 50.8 35.3",
  "M83 7.8H107M95 7.8V41",
  "M120 7V29A12 12 0 0 0 144 29V7",
  "M157.8 7.8V40.2H165A16.2 16.2 0 0 0 165 7.8Z",
  "M195 7V41",
] as const;

export function LogoBars() {
  const t = LOGO_BAR_THICKNESS;
  return (
    <g fill="currentColor">
      {LOGO_BARS.map((b) => (
        <rect
          key={b.cy}
          x={-b.length / 2}
          y={-t / 2}
          width={b.length}
          height={t}
          rx={t / 2}
          transform={`translate(${b.cx} ${b.cy}) rotate(${LOGO_BAR_ANGLE})`}
        />
      ))}
    </g>
  );
}

export function LogoWordmark() {
  return (
    <g fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinejoin="round">
      {LOGO_WORDMARK_PATHS.map((d) => (
        <path key={d} d={d} />
      ))}
      <circle cx="225" cy="24" r="16.2" />
    </g>
  );
}

interface Props {
  className?: string;
  /** Symbol only — for very tight spaces. */
  markOnly?: boolean;
  title?: string;
}

export function Logo({ className, markOnly, title = "E STUDIO" }: Props) {
  return (
    <svg className={className} viewBox={markOnly ? "0 0 34 48" : LOGO_VIEWBOX} role="img" aria-label={title} focusable="false">
      <LogoBars />
      {!markOnly && <LogoWordmark />}
    </svg>
  );
}
