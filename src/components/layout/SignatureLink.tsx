"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * The credit link at the very end of every page. Its script font is applied
 * only once the footer approaches the viewport: browsers fetch a web font as
 * soon as any laid-out text uses it, and otherwise this 26 KB font competes
 * with the hero photos during the first load (measured in Lighthouse).
 */
export function SignatureLink({ fontFamily, className, href, children }: { fontFamily: string; className: string; href: string; children: ReactNode }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const [near, setNear] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setNear(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin: "800px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <a ref={ref} className={className} style={near ? { fontFamily } : undefined} href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  );
}
