import { Lines } from "@/components/Lines";
import { getDictionary, type Locale } from "@/i18n";
import styles from "./WorkIntro.module.css";

/** Work page title and a short introduction; the filters follow below. */
export function WorkIntro({ lang }: { lang: Locale }) {
  const t = getDictionary(lang).work;
  return (
    <div className={`grid ${styles.head}`}>
      <p className={`t-label ${styles.kicker}`}>{t.kicker}</p>
      <Lines as="h1" id="work-heading" className={`t-hero ${styles.title}`} lines={t.title} />
      <p className={`muted ${styles.lead}`}>{t.lead}</p>
    </div>
  );
}
