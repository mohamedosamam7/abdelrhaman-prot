import { Photo } from "@/components/Photo";
import { approach } from "@/content/home";
import { getDictionary, tr, type Locale } from "@/i18n";
import { localizePhoto } from "@/lib/content";
import { Words, wordCount } from "@/components/Words";
import styles from "./Approach.module.css";

/** (03) Every frame should say something — one vertical photograph, three principles. */
export function Approach({ lang }: { lang: Locale }) {
  const { label, body, caption, points } = approach;
  const heading = tr(lang, approach.heading);
  const photo = localizePhoto(approach.photo, lang);
  return (
    <section className={`theme-light ${styles.section}`} aria-labelledby="approach-heading">
      <div className={`container ${styles.grid}`}>
        <figure className={styles.figure}>
          <Photo photo={photo} ratio="4 / 5" sizes="(max-width: 767px) 92vw, 34vw" className={styles.photo} />
          <figcaption className={styles.caption}>
            <span>{tr(lang, caption)}</span>
            {photo.placeholder && <span>{getDictionary(lang).approach.placeholder}</span>}
          </figcaption>
        </figure>

        <div className={styles.content}>
          <p className="t-label">
            {tr(lang, label)}
          </p>
          <h2 id="approach-heading" className={`t-serif ${styles.heading}`} data-reveal="words">
            <Words text={heading.lead} /> <em className={styles.em}><Words text={heading.emphasis} start={wordCount(heading.lead)} /></em>
          </h2>
          <p className={`muted ${styles.body}`}>
            {tr(lang, body)}
          </p>

          <ul className={styles.points}>
            {points.map((p) => (
              <li key={p.index} className={styles.point}>
                <span className={styles.index}>{p.index}</span>
                <h3 className={`t-serif ${styles.title}`}>{tr(lang, p.title)}</h3>
                <p className="muted">{tr(lang, p.text)}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
