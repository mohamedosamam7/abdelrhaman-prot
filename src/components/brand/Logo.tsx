/**
 * E STUDIO logo — symbol + wordmark as one vector.
 *
 * It draws in `currentColor`, so the cream and burgundy variants are the same
 * geometry recoloured: set `color` (or the `--logo` token) on a parent.
 * Static copies for other uses live in /public/brand (estudio-logo-cream.svg,
 * estudio-logo-burgundy.svg, estudio-mark-*.svg). Keep them in sync if the
 * official vector logo replaces this trace.
 */
interface Props {
  className?: string;
  /** Symbol only — for very tight spaces. */
  markOnly?: boolean;
  title?: string;
}

export function Logo({ className, markOnly, title = "E STUDIO" }: Props) {
  return (
    <svg
      className={className}
      viewBox={markOnly ? "0 0 34 48" : "0 0 244 48"}
      role="img"
      aria-label={title}
      focusable="false"
    >
      <g fill="currentColor">
      <rect x="-16" y="-4.4" width="32" height="8.8" rx="4.4" transform="translate(17 8.8) rotate(-16)" />
      <rect x="-13" y="-4.4" width="26" height="8.8" rx="4.4" transform="translate(14 24) rotate(-16)" />
      <rect x="-16" y="-4.4" width="32" height="8.8" rx="4.4" transform="translate(17 39.2) rotate(-16)" />
      </g>
      {!markOnly && (
        <g fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinejoin="round">
        <path d="M70 11.5C68 8.6 64.9 7 61.3 7C55.6 7 51.8 10.2 51.8 14.9C51.8 19.6 55.4 21.4 60.6 22.9C66.3 24.6 70.6 26.6 70.6 32.4C70.6 37.6 66.6 41 60.6 41C56 41 52.6 38.9 50.8 35.3" />
        <path d="M83 7.8H107M95 7.8V41" />
        <path d="M120 7V29A12 12 0 0 0 144 29V7" />
        <path d="M157.8 7.8V40.2H165A16.2 16.2 0 0 0 165 7.8Z" />
        <path d="M195 7V41" />
        <circle cx="225" cy="24" r="16.2" />
        </g>
      )}
    </svg>
  );
}
