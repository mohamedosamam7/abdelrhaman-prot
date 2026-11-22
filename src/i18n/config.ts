/**
 * Locales, URL helpers and the localized-value type used by all content.
 *
 * Fallback policy: content fields are typed `Localized` (both languages are
 * required at compile time). Where a value can legitimately be missing (e.g.
 * future CMS data, photo alt text), `tr()` falls back to English — never to an
 * empty string — so the page is always complete.
 */
export const locales = ["en", "ar"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

export const isLocale = (v: string | undefined | null): v is Locale => !!v && (locales as readonly string[]).includes(v);
export const dirOf = (l: Locale): "ltr" | "rtl" => (l === "ar" ? "rtl" : "ltr");
export const otherLocale = (l: Locale): Locale => (l === "ar" ? "en" : "ar");

export type Localized<T = string> = Record<Locale, T>;

/** Pick a localized value, falling back to English if the requested one is missing. */
export function tr<T>(l: Locale, v: Partial<Localized<T>>): T {
  return (v[l] ?? v.en) as T;
}

/** "/work" → "/ar/work"; "/" → "/ar"; keeps any "?query" or "#hash". */
export function localeHref(l: Locale, path = "/"): string {
  if (/^[a-z]+:/i.test(path) || path.startsWith("#")) return path;
  const clean = path.startsWith("/") ? path : `/${path}`;
  return clean === "/" ? `/${l}` : clean.startsWith("/?") ? `/${l}${clean.slice(1)}` : `/${l}${clean}`;
}

/** Split "/ar/work/x" → { locale: "ar", path: "/work/x" }. */
export function splitLocale(pathname: string): { locale: Locale | null; path: string } {
  const [, first, ...rest] = pathname.split("/");
  if (isLocale(first)) return { locale: first, path: `/${rest.join("/")}`.replace(/\/$/, "") || "/" };
  return { locale: null, path: pathname || "/" };
}

/**
 * Public site origin for canonical URLs, hreflang and the sitemap.
 * NEXT_PUBLIC_SITE_URL wins (set it when a custom domain is added). On Vercel
 * the project's production domain is used otherwise, including in preview
 * builds, so a preview URL never becomes the canonical one.
 */
export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "") ||
  "http://localhost:3000"
).replace(/\/$/, "");
