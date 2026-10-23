import { Photo } from "@/components/Photo";
import { approach } from "@/content/home";
import styles from "./Approach.module.css";

/** (03) Every frame should say something — one vertical photograph, three principles. */
export function Approach() {
  const { label, heading, body, photo, caption, points } = approach;
  return (
    <section className={`theme-light ${styles.section}`} aria-labelledby="approach-heading">
      <div className={`container ${styles.grid}`}>
        <figure className={styles.figure}>
          <Photo photo={photo} ratio="4 / 5" sizes="(max-width: 767px) 92vw, 34vw" className={styles.photo} />
          <figcaption className={styles.caption}>
            <span>{caption}</span>
            {photo.placeholder && <span>Placeholder image</span>}
          </figcaption>
        </figure>

        <div className={styles.content}>
          <p className="t-label">
            {label}
          </p>
          <h2 id="approach-heading" className={`t-serif ${styles.heading}`} data-reveal>
            {heading.lead} <em className={styles.em}>{heading.emphasis}</em>
          </h2>
          <p className={`muted ${styles.body}`}>
            {body}
          </p>

          <ul className={styles.points}>
            {points.map((p) => (
              <li key={p.index} className={styles.point}>
                <span className={styles.index}>{p.index}</span>
                <h3 className={`t-serif ${styles.title}`}>{p.title}</h3>
                <p className="muted">{p.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
