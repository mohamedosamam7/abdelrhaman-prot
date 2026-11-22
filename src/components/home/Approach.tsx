import { Photo } from "@/components/Photo";
import type { ResolvedOf } from "@/cms/types";
import { InlineVideo } from "@/components/media/InlineVideo";
import { getDictionary, tr, type Locale } from "@/i18n";
import { localizePhoto } from "@/lib/content";
import { Words, wordCount } from "@/components/Words";
import styles from "./Approach.module.css";

/** (03) Every frame should say something — one vertical photograph, three principles. */
export function Approach({ lang, sid, data }: { lang: Locale; sid: string; data: ResolvedOf<"textMedia">["data"] }) {
  const { label, body, caption, points } = data;
  const heading = tr(lang, data.heading);
  const photo = localizePhoto(data.media, lang);
  const t = getDictionary(lang);
  return (
    <section className={`theme-light ${styles.section}`} aria-labelledby={`${sid}-heading`}>
      <div className={`container ${styles.grid}`}>
        <figure className={styles.figure}>
          <div className={styles.media}>
            <Photo photo={photo} ratio="4 / 5" sizes="(max-width: 767px) 92vw, 34vw" className={styles.photo} />
            {photo.videoSrc && <InlineVideo src={photo.videoSrc} poster={photo.src} focus={photo.position} label={photo.alt} playLabel={t.frames.play(photo.alt)} />}
          </div>
          <figcaption className={styles.caption}>
            <span>{tr(lang, caption)}</span>
            {photo.placeholder && <span>{t.approach.placeholder}</span>}
          </figcaption>
        </figure>

        <div className={styles.content}>
          <p className="t-label">
            {tr(lang, label)}
          </p>
          <h2 id={`${sid}-heading`} className={`t-serif ${styles.heading}`} data-reveal="words">
            <Words text={heading.lead} /> <em className={styles.em}><Words text={heading.emphasis} start={wordCount(heading.lead)} /></em>
          </h2>
          <p className={`muted ${styles.body}`}>
            {tr(lang, body)}
          </p>

          <ul className={styles.points}>
            {points.map((p, i) => (
              <li key={i} className={styles.point}>
                <span className={styles.index}>{String(i + 1).padStart(2, "0")}</span>
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
