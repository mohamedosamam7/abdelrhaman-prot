import type { MetadataRoute } from "next";
import { getPublishedContent } from "@/cms/load";
import { detailProjects } from "@/cms/projects";
import { localeHref, locales, siteUrl } from "@/i18n/config";

/** Every public page in both languages, each listing its alternate. */
// Rendered per request (from the cached published content) so a project is
// listed as soon as it is published, not after the file's next regeneration.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { projects } = await getPublishedContent();
  const paths = ["/", "/work", "/contact", ...detailProjects(projects).map((p) => `/work/${p.slug}`)];
  return paths.flatMap((path) =>
    locales.map((lang) => ({
      url: siteUrl + localeHref(lang, path),
      changeFrequency: "monthly" as const,
      priority: path === "/" ? 1 : path === "/work" ? 0.8 : 0.6,
      alternates: { languages: Object.fromEntries(locales.map((l) => [l, siteUrl + localeHref(l, path)])) },
    })),
  );
}
