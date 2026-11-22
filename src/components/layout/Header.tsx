"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { Logo } from "@/components/brand/Logo";
import { ArrowUpRight, BehanceIcon, InstagramIcon } from "@/components/Icons";
import { site } from "@/content/site";
import { getDictionary, localeHref, otherLocale, splitLocale, tr, type Locale } from "@/i18n";
import { lockScroll } from "@/lib/scroll";
import styles from "./Header.module.css";

function navItems(lang: Locale) {
  const t = getDictionary(lang).nav;
  return [
    { path: "/", label: t.home, match: (p: string) => p === "/" },
    { path: "/work", label: t.work, match: (p: string) => p.startsWith("/work") },
    { path: site.contact.page, label: t.contact, match: (p: string) => p === site.contact.page },
  ];
}

function useLocalTime(timeZone: string, lang: Locale) {
  const [time, setTime] = useState<string | null>(null);
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat(lang === "ar" ? "ar-SA-u-nu-latn" : "en-GB", { hour: "2-digit", minute: "2-digit", timeZone });
    const tick = () => setTime(fmt.format(new Date()));
    tick();
    const id = window.setInterval(tick, 15_000);
    return () => window.clearInterval(id);
  }, [timeZone, lang]);
  return time;
}

/** Link to the same page (and query string) in the other language. */
function LangLink({ lang, path, search, className }: { lang: Locale; path: string; search?: string; className?: string }) {
  const target = otherLocale(lang);
  const t = getDictionary(target);
  const href = localeHref(target, path) + (search ? `?${search}` : "");
  return (
    <Link
      href={href}
      hrefLang={target}
      lang={target}
      className={className}
      aria-label={t.switchTo}
      onClick={() => {
        document.cookie = `NEXT_LOCALE=${target}; path=/; max-age=31536000; samesite=lax`;
      }}
    >
      {t.langName}
    </Link>
  );
}

function LangSwitchWithQuery({ lang, className }: { lang: Locale; className?: string }) {
  const pathname = usePathname();
  const search = useSearchParams().toString();
  return <LangLink lang={lang} path={splitLocale(pathname).path} search={search} className={className} />;
}

function LanguageSwitch({ lang, className }: { lang: Locale; className?: string }) {
  const pathname = usePathname();
  return (
    <Suspense fallback={<LangLink lang={lang} path={splitLocale(pathname).path} className={className} />}>
      <LangSwitchWithQuery lang={lang} className={className} />
    </Suspense>
  );
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
      const box = header.getBoundingClientRect();
      const y = box.top + box.height / 2;
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

export function Header({ lang }: { lang: Locale }) {
  const pathname = usePathname();
  const path = splitLocale(pathname).path;
  const t = getDictionary(lang);
  const NAV = navItems(lang);
  const ref = useRef<HTMLElement>(null);
  const time = useLocalTime(site.location.timeZone, lang);
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
    const release = lockScroll();
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", close);
      release();
    };
  }, [open]);

  return (
    <header ref={ref} className={`${light && !open ? "theme-light" : "theme-dark"} ${styles.header}`} data-open={open || undefined}>
      <div className={`container ${styles.inner}`}>
        <Link href={localeHref(lang, "/")} className={styles.brand} aria-label={t.brandHome}>
          <Logo className={styles.logo} />
        </Link>

        <nav aria-label={t.nav.primary} className={styles.nav}>
          {NAV.map((n) => (
            <Link key={n.path} href={localeHref(lang, n.path)} className={`link-line ${styles.navLink}`} aria-current={n.match(path) ? "page" : undefined}>
              {n.label}
            </Link>
          ))}
        </nav>

        <div className={styles.actions}>
          <p className={`t-meta ${styles.place}`}>
            {tr(lang, site.location.short)}
            {time && (
              <>
                <span className={styles.dot} aria-hidden="true" />
                <time aria-label={t.localTime}>{time}</time>
              </>
            )}
          </p>

          <LanguageSwitch lang={lang} className={styles.lang} />

          <a className={styles.icon} href={ig.url} target="_blank" rel="noopener noreferrer" aria-label={t.instagramLabel(ig.handle)}>
            <InstagramIcon />
          </a>

          <Link href={localeHref(lang, site.contact.page)} className={styles.cta}>
            {t.nav.letsTalk} <ArrowUpRight size={14} className="dir-icon" />
          </Link>

          <button
            type="button"
            className={styles.menuButton}
            aria-expanded={open}
            aria-controls="site-menu"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="sr-only">{open ? t.menu.close : t.menu.open}</span>
            <span className={styles.burger} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div id="site-menu" className={styles.menu} hidden={!open} data-lenis-prevent>
        <nav aria-label={t.nav.mobile} className="container">
          <ul className={styles.menuList}>
            {NAV.map((n) => (
              <li key={n.path}>
                <Link href={localeHref(lang, n.path)} className={styles.menuLink} aria-current={n.match(path) ? "page" : undefined}>
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className={styles.menuFoot}>
            <div className={styles.menuSocials}>
              <a href={ig.url} target="_blank" rel="noopener noreferrer" className={styles.menuSocial}>
                <InstagramIcon /> <bdi>{ig.handle}</bdi>
                <span className="sr-only"> {t.newTab}</span>
              </a>
              {behance && (
                <a href={behance.url} target="_blank" rel="noopener noreferrer" className={styles.menuSocial}>
                  <BehanceIcon /> Behance
                  <span className="sr-only"> {t.newTab}</span>
                </a>
              )}
            </div>
            <LanguageSwitch lang={lang} className={styles.menuLang} />
            <span className="t-meta muted">
              {tr(lang, site.location.short)}
              {time && ` · ${time}`}
            </span>
          </div>
        </nav>
      </div>
    </header>
  );
}
