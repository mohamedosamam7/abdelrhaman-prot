import { photoAltAr } from "@/content/photo-alt-ar";
import type { Photo } from "@/content/photos";
import type { Locale } from "@/i18n/config";

/** The photo with its alt text in the requested language (falls back to English). */
export function localizePhoto(p: Photo, lang: Locale): Photo {
  return lang === "ar" ? { ...p, alt: photoAltAr[p.id] ?? p.alt } : p;
}

/** Photo IDs that are public but have no Arabic alt yet — surfaced in dev/build checks. */
export function missingArabicAlts(ids: string[]): string[] {
  return ids.filter((id) => !photoAltAr[id]);
}
