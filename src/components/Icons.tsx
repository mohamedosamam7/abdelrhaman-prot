/** Small line icons. Decorative by default — label the control, not the icon. */
interface Props {
  className?: string;
  size?: number;
}

const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  focusable: false,
});

export function InstagramIcon({ className, size = 18 }: Props) {
  return (
    <svg {...base(size)} className={className}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.3" cy="6.7" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function BehanceIcon({ className, size = 18 }: Props) {
  return (
    <svg {...base(size)} className={className} viewBox="0 0 24 24">
      <path d="M2.5 6.5h5.2a2.7 2.7 0 0 1 0 5.4H2.5zM2.5 11.9h5.9a2.9 2.9 0 0 1 0 5.8H2.5z" />
      <path d="M15 8h5" />
      <path d="M14 14.2h7.2a3.6 3.6 0 1 0-1.1 2.6" />
    </svg>
  );
}

/** ↗ — leaves the current page or opens a destination. */
export function ArrowUpRight({ className, size = 16 }: Props) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M7 17 17 7M8.5 7H17v8.5" />
    </svg>
  );
}

export function ArrowRight({ className, size = 16 }: Props) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M4 12h15M13.5 6.5 19 12l-5.5 5.5" />
    </svg>
  );
}

export function ChevronLeft({ className, size = 18 }: Props) {
  return (
    <svg {...base(size)} className={className}>
      <path d="m14.5 6-6 6 6 6" />
    </svg>
  );
}

export function ChevronRight({ className, size = 18 }: Props) {
  return (
    <svg {...base(size)} className={className}>
      <path d="m9.5 6 6 6-6 6" />
    </svg>
  );
}

export function PlayIcon({ className, size = 20 }: Props) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M8 5.5v13l10.5-6.5z" fill="currentColor" />
    </svg>
  );
}
