import { Lines } from "@/components/Lines";
import { fullName } from "@/content/site";
import styles from "./WorkIntro.module.css";

/** Work page title and a short introduction; the filters follow below. */
export function WorkIntro() {
  return (
    <div className={`grid ${styles.head}`}>
      <p className={`t-label ${styles.kicker}`}>{fullName} — Photography</p>
      <Lines as="h1" id="work-heading" className={`t-hero ${styles.title}`} lines={["Selected", "Work"]} />
      <p className={`muted ${styles.lead}`}>
        Event and sports photography from Riyadh — the teams who run the night, the crowds and the atmosphere around
        them. Choose a project to see its full sequence.
      </p>
    </div>
  );
}
