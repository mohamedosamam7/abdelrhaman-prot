"use client";

import { useSearchParams } from "next/navigation";
import { services } from "@/content/home";

/**
 * When the visitor arrives from a service row (/contact?service=food), name
 * the service they are asking about. Nothing renders for other visits.
 */
export function ServiceContext({ className }: { className?: string }) {
  const key = useSearchParams().get("service");
  const service = services.items.find((s) => s.key === key);
  if (!service) return null;
  return (
    <p className={className}>
      Enquiring about <strong>{service.title}</strong> photography — mention it in your message.
    </p>
  );
}
