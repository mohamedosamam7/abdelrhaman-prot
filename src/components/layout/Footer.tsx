import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { site } from "@/content/site";
import { getDictionary, localeHref, tr, type Locale } from "@/i18n";
import styles from "./Footer.module.css";

export function Footer({ lang }: { lang: Locale }) {
  const t = getDictionary(lang);
  const { instagram, behance } = site.contact;
  const elsewhere = [
    { label: "Instagram", value: instagram.handle, href: instagram.url },
    ...(!behance.placeholder && behance.url ? [{ label: "Behance", value: behance.handle || t.footer.portfolio, href: behance.url }] : []),
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
            <li><Link className="link-line" href={localeHref(lang, "/")}>{t.nav.home}</Link></li>
            <li><Link className="link-line" href={localeHref(lang, "/work")}>{t.nav.work}</Link></li>
            <li><Link className="link-line" href={localeHref(lang, site.contact.page)}>{t.nav.contact}</Link></li>
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
          © {new Date().getFullYear()} {tr(lang, site.fullName)} · {tr(lang, site.location.city)}
          {lang === "ar" ? "، " : ", "}
          {tr(lang, site.location.country)}
        </p>
        <a className="link-line" href="#top">
          {t.footer.top} ↑
        </a>
      </div>
    </footer>
  );
}
