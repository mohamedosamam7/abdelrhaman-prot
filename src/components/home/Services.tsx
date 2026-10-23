import Link from "next/link";
import { ArrowUpRight } from "@/components/Icons";
import { services } from "@/content/home";
import styles from "./Services.module.css";

/** (02) Three services, each a row into its Work category. */
export function Services() {
  const { label, heading, items } = services;
  return (
    <section className={`theme-dark theme-deep ${styles.section}`} aria-labelledby="services-heading">
      <div className={`container ${styles.head}`}>
        <p className={`t-label ${styles.label}`}>
          {label}
        </p>
        <h2 id="services-heading" className={`t-serif ${styles.heading}`}>
          {heading.lead} <em className="muted">{heading.emphasis}</em>
        </h2>
      </div>

      <ul className={`container ${styles.list}`}>
        {items.map((s) => (
          <li key={s.index}>
            <Link href={s.href} className={styles.row}>
              <span className={styles.index}>{s.index}</span>
              <span className={`t-serif ${styles.title}`}>{s.title}</span>
              <span className={`muted ${styles.desc}`}>{s.description}</span>
              <span className={styles.action}>
                <span className={styles.cta}>{s.cta}</span>
                <span className={styles.arrow} aria-hidden="true">
                  <ArrowUpRight size={18} />
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
