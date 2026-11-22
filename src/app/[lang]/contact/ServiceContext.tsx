"use client";

import { useSearchParams } from "next/navigation";
import { getDictionary, type Locale } from "@/i18n";

/**
 * When the visitor arrives from a service row (/contact?service=food), name
 * the service they are asking about. Nothing renders for other visits.
 */
/** `services`: key → service name in the visitor's language (from the home page's services section). */
export function ServiceContext({ lang, className, services }: { lang: Locale; className?: string; services: Record<string, string> }) {
  const key = useSearchParams().get("service");
  const name0 = key ? services[key] : undefined;
  if (!name0) return null;
  const [before, name, after] = getDictionary(lang).contact.enquiring(name0);
  return (
    <p className={className}>
      {before}
      <strong>{name}</strong>
      {after}
    </p>
  );
}
