import { photo, type Photo } from "./photos";

export type DisciplineKey = "commercial" | "food" | "events" | "sports" | "people";

export interface Discipline {
  key: DisciplineKey;
  index: string;
  title: string;
  /** Short label for filters and gallery tabs. */
  label: string;
  short: string;
  description: string;
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
    title: "Events & Experiences",
    label: "Events",
    short: "Events",
    description: "Hosts, guests and atmosphere at live events after dark.",
    preview: photo("p2-r2c4"),
  },
  {
    key: "sports",
    index: "02",
    title: "Sports",
    label: "Sports",
    short: "Sports",
    description: "Matchdays, arenas and tournaments — the crowd, the teams behind them and the action.",
    preview: photo("p4-r2c3"),
  },
  {
    key: "commercial",
    index: "03",
    title: "Commercial & Product",
    label: "Commercial & Product",
    short: "Commercial / Product",
    description: "Campaigns, products and brand worlds.",
    preview: photo("commercial-01-02"),
  },
  {
    key: "food",
    index: "04",
    title: "Food & Beverage",
    label: "Food & Beverage",
    short: "Food / Beverage",
    description: "Food, atmosphere and considered details.",
    preview: photo("food-01-01"),
  },
  {
    key: "people",
    index: "05",
    title: "People & Portraits",
    label: "Portraits",
    short: "People / Editorial",
    description: "Portraiture with character and presence.",
    preview: photo("people-01-01"),
  },
];

export function discipline(key: DisciplineKey): Discipline {
  return disciplines.find((d) => d.key === key)!;
}
