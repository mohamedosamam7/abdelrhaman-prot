"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

/**
 * Sidebar link. Dashboard pages are private and rendered per request, so they
 * are not prefetched on every page view (that rendered all of them, twice);
 * a page is prefetched only when the pointer or keyboard focus reaches its link.
 */
export function NavLink({ href, className, children }: { href: string; className?: string; children: React.ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const current = href === "/admin" ? path === "/admin" : path === href || path.startsWith(`${href}/`);
  const warm = () => router.prefetch(href);
  return (
    <Link href={href} prefetch={false} onMouseEnter={warm} onFocus={warm} className={className} aria-current={current ? "page" : undefined}>
      {children}
    </Link>
  );
}
