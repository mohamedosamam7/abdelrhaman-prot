import { Lines } from "@/components/Lines";
import type { PageIntroDoc } from "@/cms/schema";
import { getDictionary, tr, type Locale } from "@/i18n";
import styles from "./WorkIntro.module.css";

/** Work page title and a short introduction; the filters follow below. */
/** `intro` comes from the dashboard (Pages → Work); the dictionary is the fallback. */
export function WorkIntro({ lang, intro }: { lang: Locale; intro?: PageIntroDoc }) {
  const d = getDictionary(lang).work;
  const lines = intro ? tr(lang, intro.title).split(/\r?\n/).map((l) => l.trim()).filter(Boolean) : [];
  const t = {
    kicker: (intro && tr(lang, intro.kicker)) || d.kicker,
    title: lines.length ? lines : d.title,
    lead: (intro && tr(lang, intro.lead)) || d.lead,
  };
  return (
    <div className={`grid ${styles.head}`}>
      <p className={`t-label ${styles.kicker}`}>{t.kicker}</p>
      <Lines as="h1" id="work-heading" className={`t-hero ${styles.title}`} lines={t.title} />
      <p className={`muted ${styles.lead}`}>{t.lead}</p>
    </div>
  );
}
