import Link from "next/link";
import { ArrowUpRight } from "@/components/Icons";
import { services } from "@/content/home";
import { localeHref, tr, type Locale } from "@/i18n";
import { Words, wordCount } from "@/components/Words";
import styles from "./Services.module.css";

/** (02) Three services, each a row into its Work category. */
export function Services({ lang }: { lang: Locale }) {
  const { label, items } = services;
  const heading = tr(lang, services.heading);
  return (
    <section className={`theme-dark theme-deep ${styles.section}`} aria-labelledby="services-heading">
      <div className={`container ${styles.head}`}>
        <p className={`t-label ${styles.label}`}>
          {tr(lang, label)}
        </p>
        <h2 id="services-heading" className={`t-serif ${styles.heading}`} data-reveal="words">
          <Words text={heading.lead} /> <em className="muted"><Words text={heading.emphasis} start={wordCount(heading.lead)} /></em>
        </h2>
      </div>

      <ul className={`container ${styles.list}`}>
        {items.map((s) => (
          <li key={s.index}>
            <Link href={localeHref(lang, s.href)} className={styles.row}>
              <span className={styles.index}>{s.index}</span>
              <span className={`t-serif ${styles.title}`}>{tr(lang, s.title)}</span>
              <span className={`muted ${styles.desc}`}>{tr(lang, s.description)}</span>
              <span className={styles.action}>
                <span className={styles.cta}>{tr(lang, s.cta)}</span>
                <span className={styles.arrow} aria-hidden="true">
                  <ArrowUpRight size={18} className="dir-icon" />
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
