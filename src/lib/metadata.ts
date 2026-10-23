import type { Metadata } from "next";
import { fullName } from "@/content/site";

/**
 * Title + description for a page, with matching Open Graph tags. Next.js
 * merges metadata shallowly, so a page that sets only `title` would otherwise
 * share the home page's Open Graph text.
 */
export function pageMetadata(title: string, description: string): Metadata {
  return {
    title,
    description,
    openGraph: { title: `${title} — ${fullName}`, description, type: "website" },
  };
}
