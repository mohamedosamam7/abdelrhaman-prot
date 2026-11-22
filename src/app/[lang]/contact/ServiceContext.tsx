"use client";

import { useSearchParams } from "next/navigation";
import { services } from "@/content/home";
import { getDictionary, tr, type Locale } from "@/i18n";

/**
 * When the visitor arrives from a service row (/contact?service=food), name
 * the service they are asking about. Nothing renders for other visits.
 */
export function ServiceContext({ lang, className }: { lang: Locale; className?: string }) {
  const key = useSearchParams().get("service");
  const service = services.items.find((s) => s.key === key);
  if (!service) return null;
  const [before, name, after] = getDictionary(lang).contact.enquiring(tr(lang, service.title));
  return (
    <p className={className}>
      {before}
      <strong>{name}</strong>
      {after}
    </p>
  );
}
