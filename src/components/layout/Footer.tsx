import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import type { SettingsDoc } from "@/cms/schema";
import { behanceLink } from "@/lib/contact";
import { getDictionary, localeHref, tr, type Locale } from "@/i18n";
import styles from "./Footer.module.css";

export function Footer({ lang, settings }: { lang: Locale; settings: SettingsDoc }) {
  const t = getDictionary(lang);
  const { instagram } = settings.contact;
  const behance = behanceLink(settings.contact);
  const elsewhere = [
    { label: "Instagram", value: instagram.handle, href: instagram.url },
    ...(behance ? [{ label: "Behance", value: behance.handle || t.footer.portfolio, href: behance.url }] : []),
  ];

  return (
    <footer className={`theme-dark theme-deep ${styles.footer}`}>
      <div className={`container ${styles.inner}`}>
        <Link href={localeHref(lang, "/")} className={styles.brand} aria-label={t.brandHome}>
          <Logo className={styles.logo} />
        </Link>

        <nav className={styles.col} aria-label={t.footer.nav}>
          <p className="t-label">{t.footer.pages}</p>
          <ul>
            <li><Link className="link-line" href={localeHref(lang, "/")}>{tr(lang, settings.nav.home)}</Link></li>
            <li><Link className="link-line" href={localeHref(lang, "/work")}>{tr(lang, settings.nav.work)}</Link></li>
            <li><Link className="link-line" href={localeHref(lang, "/contact")}>{tr(lang, settings.nav.contact)}</Link></li>
          </ul>
        </nav>

        <div className={styles.col}>
          <p className="t-label">{t.footer.elsewhere}</p>
          <ul>
            {elsewhere.map((s) => (
              <li key={s.label}>
                <a className="link-line" href={s.href} target="_blank" rel="noopener noreferrer">
                  {s.label}
                  <span className={`muted ${styles.handle}`}>
                    <bdi dir="ltr">{s.value}</bdi>
                  </span>
                  <span className="sr-only"> {t.newTab}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className={`container ${styles.bottom}`}>
        <p>
          © {new Date().getFullYear()} {tr(lang, settings.fullName)} · {tr(lang, settings.location.city)}
          {lang === "ar" ? "، " : ", "}
          {tr(lang, settings.location.country)}
        </p>
        <a className="link-line" href="#top">
          {t.footer.top} ↑
        </a>
      </div>
    </footer>
  );
}
