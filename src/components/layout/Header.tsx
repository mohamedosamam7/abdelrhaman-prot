"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Logo } from "@/components/brand/Logo";
import { ArrowUpRight, BehanceIcon, InstagramIcon } from "@/components/Icons";
import { site } from "@/content/site";
import styles from "./Header.module.css";

const NAV = [
  { href: "/", label: "Home", match: (p: string) => p === "/" },
  { href: "/work", label: "Work", match: (p: string) => p.startsWith("/work") },
  { href: site.contact.page, label: "Contact", match: (p: string) => p === site.contact.page },
];

function useLocalTime(timeZone: string) {
  const [time, setTime] = useState<string | null>(null);
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone });
    const tick = () => setTime(fmt.format(new Date()));
    tick();
    const id = window.setInterval(tick, 15_000);
    return () => window.clearInterval(id);
  }, [timeZone]);
  return time;
}

/**
 * Follows the section sitting behind the header: over a `.theme-light`
 * section the header turns cream with the burgundy logo, otherwise it stays
 * burgundy with the cream logo.
 */
function useHeaderTheme(ref: React.RefObject<HTMLElement | null>, pathname: string) {
  const [light, setLight] = useState(false);
  useEffect(() => {
    let raf = 0;
    const check = () => {
      raf = 0;
      const header = ref.current;
      if (!header) return;
      const y = header.offsetHeight / 2;
      const under = document
        .elementsFromPoint(window.innerWidth / 2, y)
        .find((el) => !header.contains(el));
      setLight(Boolean(under?.closest(".theme-light")));
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(check);
    };
    check();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [ref, pathname]);
  return light;
}

export function Header() {
  const pathname = usePathname();
  const ref = useRef<HTMLElement>(null);
  const time = useLocalTime(site.location.timeZone);
  const light = useHeaderTheme(ref, pathname);
  const [open, setOpen] = useState(false);
  const ig = site.contact.instagram;
  const behance = !site.contact.behance.placeholder && site.contact.behance.url ? site.contact.behance : null;

  // Close the mobile menu on navigation and on Escape.
  useEffect(() => setOpen(false), [pathname]);
  // While open: Escape closes, the page behind doesn't scroll, and leaving
  // the open state (close, navigation or unmount) always releases the lock.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const close = () => window.matchMedia("(min-width: 768px)").matches && setOpen(false);
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", close);
    document.documentElement.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", close);
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  return (
    <header ref={ref} className={`${light && !open ? "theme-light" : "theme-dark"} ${styles.header}`} data-open={open || undefined}>
      <div className={`container ${styles.inner}`}>
        <Link href="/" className={styles.brand} aria-label={`${site.brand.name} — home`}>
          <Logo className={styles.logo} />
        </Link>

        <nav aria-label="Primary" className={styles.nav}>
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className={`link-line ${styles.navLink}`} aria-current={n.match(pathname) ? "page" : undefined}>
              {n.label}
            </Link>
          ))}
        </nav>

        <div className={styles.actions}>
          <p className={`t-meta ${styles.place}`}>
            {site.location.short}
            {time && (
              <>
                <span className={styles.dot} aria-hidden="true" />
                <time aria-label={`Local time in ${site.location.city}`}>{time}</time>
              </>
            )}
          </p>

          <a className={styles.icon} href={ig.url} target="_blank" rel="noopener noreferrer" aria-label={`Instagram ${ig.handle} (opens in a new tab)`}>
            <InstagramIcon />
          </a>

          <Link href={site.contact.page} className={styles.cta}>
            Let’s Talk <ArrowUpRight size={14} />
          </Link>

          <button
            type="button"
            className={styles.menuButton}
            aria-expanded={open}
            aria-controls="site-menu"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
            <span className={styles.burger} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div id="site-menu" className={styles.menu} hidden={!open}>
        <nav aria-label="Mobile" className="container">
          <ul className={styles.menuList}>
            {NAV.map((n) => (
              <li key={n.href}>
                <Link href={n.href} className={styles.menuLink} aria-current={n.match(pathname) ? "page" : undefined}>
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className={styles.menuFoot}>
            <div className={styles.menuSocials}>
              <a href={ig.url} target="_blank" rel="noopener noreferrer" className={styles.menuSocial}>
                <InstagramIcon /> {ig.handle}
                <span className="sr-only"> on Instagram (opens in a new tab)</span>
              </a>
              {behance && (
                <a href={behance.url} target="_blank" rel="noopener noreferrer" className={styles.menuSocial}>
                  <BehanceIcon /> Behance
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              )}
            </div>
            <span className="t-meta muted">
              {site.location.short}
              {time && ` · ${time}`}
            </span>
          </div>
        </nav>
      </div>
    </header>
  );
}
