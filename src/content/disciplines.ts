import type { Localized } from "@/i18n/config";
import { photo, type Photo } from "./photos";

export type DisciplineKey = "commercial" | "food" | "events" | "sports" | "people";

export interface Discipline {
  key: DisciplineKey;
  index: string;
  title: Localized;
  /** Short label for filters and gallery tabs. */
  label: Localized;
  short: Localized;
  description: Localized;
  /** A representative frame for the discipline. */
  preview: Photo;
}

/**
 * Order here is the order of Work filters and gallery tabs. A discipline only
 * appears publicly when it has public (non-demo) work — see projects.ts.
 * Commercial, food and people currently hold demo projects only.
 */
export const disciplines: Discipline[] = [
  {
    key: "events",
    index: "01",
    title: { en: "Events & Experiences", ar: "الفعاليات والتجارب" },
    label: { en: "Events", ar: "فعاليات" },
    short: { en: "Events", ar: "فعاليات" },
    description: { en: "Hosts, guests and atmosphere at live events after dark.", ar: "المضيفون والضيوف وأجواء الفعاليات بعد الغروب." },
    preview: photo("p2-r2c4"),
  },
  {
    key: "sports",
    index: "02",
    title: { en: "Sports", ar: "الرياضة" },
    label: { en: "Sports", ar: "رياضة" },
    short: { en: "Sports", ar: "رياضة" },
    description: {
      en: "Matchdays, arenas and tournaments — the crowd, the teams behind them and the action.",
      ar: "أيام المباريات والملاعب والبطولات: الجمهور، والفرق خلف الكواليس، والحدث نفسه.",
    },
    preview: photo("p4-r2c3"),
  },
  {
    key: "commercial",
    index: "03",
    title: { en: "Commercial & Product", ar: "التصوير التجاري والمنتجات" },
    label: { en: "Commercial & Product", ar: "تجاري ومنتجات" },
    short: { en: "Commercial / Product", ar: "تجاري / منتجات" },
    description: { en: "Campaigns, products and brand worlds.", ar: "الحملات والمنتجات وهوية العلامات التجارية." },
    preview: photo("commercial-01-02"),
  },
  {
    key: "food",
    index: "04",
    title: { en: "Food & Beverage", ar: "الأطعمة والمشروبات" },
    label: { en: "Food & Beverage", ar: "أطعمة ومشروبات" },
    short: { en: "Food / Beverage", ar: "أطعمة / مشروبات" },
    description: { en: "Food, atmosphere and considered details.", ar: "الطعام والأجواء والتفاصيل المدروسة." },
    preview: photo("food-01-01"),
  },
  {
    key: "people",
    index: "05",
    title: { en: "People & Portraits", ar: "الأشخاص والبورتريه" },
    label: { en: "Portraits", ar: "بورتريه" },
    short: { en: "People / Editorial", ar: "أشخاص / تحريري" },
    description: { en: "Portraiture with character and presence.", ar: "بورتريهات بحضور وشخصية." },
    preview: photo("people-01-01"),
  },
];

export function discipline(key: DisciplineKey): Discipline {
  return disciplines.find((d) => d.key === key)!;
}
