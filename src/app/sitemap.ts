import type { MetadataRoute } from "next";
import { detailProjects } from "@/content/projects";
import { localeHref, locales, siteUrl } from "@/i18n/config";

/** Every public page in both languages, each listing its alternate. */
export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ["/", "/work", "/contact", ...detailProjects.map((p) => `/work/${p.slug}`)];
  return paths.flatMap((path) =>
    locales.map((lang) => ({
      url: siteUrl + localeHref(lang, path),
      changeFrequency: "monthly" as const,
      priority: path === "/" ? 1 : path === "/work" ? 0.8 : 0.6,
      alternates: { languages: Object.fromEntries(locales.map((l) => [l, siteUrl + localeHref(l, path)])) },
    })),
  );
}
