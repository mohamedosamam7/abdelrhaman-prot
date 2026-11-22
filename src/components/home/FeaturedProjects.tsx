import { projectCard } from "@/cms/cards";
import type { SettingsDoc } from "@/cms/schema";
import type { CmsProject, ResolvedOf } from "@/cms/types";
import { Words, wordCount } from "@/components/Words";
import { WorkGalleryView } from "@/components/work/WorkGallery";
import { getDictionary, localeHref, tr, type Locale } from "@/i18n";
import styles from "./Services.module.css";

/** Featured projects: the projects marked "featured" in the dashboard, in their order. */
export function FeaturedProjects({ lang, sid, data, projects, settings }: { lang: Locale; sid: string; data: ResolvedOf<"featuredProjects">["data"]; projects: CmsProject[]; settings: SettingsDoc }) {
  const t = getDictionary(lang);
  const chosen = projects.filter((p) => p.featured).slice(0, data.limit);
  if (!chosen.length) return null;
  const heading = tr(lang, data.heading);
  return (
    <section className={`theme-dark ${styles.section}`} aria-labelledby={`${sid}-heading`}>
      <div className={`container ${styles.head}`}>
        <p className={`t-label ${styles.label}`}>{tr(lang, data.label)}</p>
        <h2 id={`${sid}-heading`} className={`t-serif ${styles.heading}`} data-reveal="words">
          <Words text={heading.lead} /> <em className="muted"><Words text={heading.emphasis} start={wordCount(heading.lead)} /></em>
        </h2>
        {tr(lang, data.body) && <p className={`muted ${styles.intro}`}>{tr(lang, data.body)}</p>}
      </div>
      <div className="container">
        <WorkGalleryView
          lang={lang}
          showFilters={false}
          cards={chosen.map((p) => projectCard(p, lang, settings))}
          filters={[]}
          labels={{ all: t.work.all, filterLabel: t.work.filterLabel, base: localeHref(lang, "/work") }}
          active="all"
        />
      </div>
    </section>
  );
}
