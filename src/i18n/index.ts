import type { Locale } from "./config";
import { ar } from "./dictionaries/ar";
import { en, type Dictionary } from "./dictionaries/en";

export * from "./config";
export type { Dictionary };

/** Both dictionaries are small and plain modules, so client components can use them too. */
export const dictionaries: Record<Locale, Dictionary> = { en, ar };
export const getDictionary = (l: Locale): Dictionary => dictionaries[l];
