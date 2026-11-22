import { discipline, type DisciplineKey } from "@/content/disciplines";
import { tr, type Locale } from "@/i18n/config";
import type { SettingsDoc } from "./schema";

/** A category's display name: the dashboard's name if set, else the built-in one. */
export function categoryLabel(settings: SettingsDoc, key: string, lang: Locale): string {
  const custom = settings.categories?.[key as keyof NonNullable<SettingsDoc["categories"]>];
  return (custom && tr(lang, custom)) || tr(lang, discipline(key as DisciplineKey).label);
}
