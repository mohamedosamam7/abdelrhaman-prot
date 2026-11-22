"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { setAdminLang } from "@/admin/actions";

export function LangSwitch({ to, label, className }: { to: "ar" | "en"; label: string; className?: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      className={className ?? "btn small secondary"}
      lang={to}
      disabled={pending}
      onClick={() => start(async () => { await setAdminLang(to); router.refresh(); })}
    >
      {label}
    </button>
  );
}
