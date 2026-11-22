"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavLink({ href, className, children }: { href: string; className?: string; children: React.ReactNode }) {
  const path = usePathname();
  const current = href === "/admin" ? path === "/admin" : path === href || path.startsWith(`${href}/`);
  return (
    <Link href={href} className={className} aria-current={current ? "page" : undefined}>
      {children}
    </Link>
  );
}
