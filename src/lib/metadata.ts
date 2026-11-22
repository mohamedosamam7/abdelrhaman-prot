import type { Metadata } from "next";
import { site } from "@/content/site";
import { localeHref, locales, siteUrl, tr, type Locale } from "@/i18n/config";

/** Canonical URL for this page plus hreflang alternates for every language. */
export function alternates(lang: Locale, path: string): Metadata["alternates"] {
  return {
    canonical: `${siteUrl}${localeHref(lang, path)}`,
    languages: {
      ...Object.fromEntries(locales.map((l) => [l, `${siteUrl}${localeHref(l, path)}`])),
      "x-default": `${siteUrl}${localeHref("en", path)}`,
    },
  };
}

/**
 * Title + description for a page, with matching Open Graph tags and
 * canonical/hreflang. Next.js merges metadata shallowly, so each page sets
 * its own Open Graph text.
 */
export function pageMetadata(lang: Locale, path: string, title: string, description: string): Metadata {
  return {
    title,
    description,
    alternates: alternates(lang, path),
    openGraph: {
      title: `${title} — ${tr(lang, site.fullName)}`,
      description,
      type: "website",
      locale: lang === "ar" ? "ar_SA" : "en_US",
      url: `${siteUrl}${localeHref(lang, path)}`,
    },
  };
}
