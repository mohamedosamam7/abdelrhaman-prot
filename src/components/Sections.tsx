import type { CmsProject, ResolvedSection } from "@/cms/types";
import type { SettingsDoc } from "@/cms/schema";
import { ContactCTA } from "@/components/ContactCTA";
import { Approach } from "@/components/home/Approach";
import { FeaturedProjects } from "@/components/home/FeaturedProjects";
import { HeroPhotographyGrid } from "@/components/home/HeroPhotographyGrid";
import { SelectedFrames } from "@/components/home/SelectedFrames";
import { Services } from "@/components/home/Services";
import type { Locale } from "@/i18n";

interface Props {
  lang: Locale;
  sections: ResolvedSection[];
  settings: SettingsDoc;
  projects: CmsProject[];
}

/** Renders a page's sections with the site's designed templates — no free-form markup. */
export function Sections({ lang, sections, settings, projects }: Props) {
  return sections.map((s) => {
    switch (s.type) {
      case "hero":
        return <HeroPhotographyGrid key={s.id} lang={lang} data={s.data} />;
      case "gallery":
        return <SelectedFrames key={s.id} lang={lang} sid={s.id} data={s.data} projects={projects} />;
      case "services":
        return <Services key={s.id} lang={lang} sid={s.id} data={s.data} />;
      case "textMedia":
        return <Approach key={s.id} lang={lang} sid={s.id} data={s.data} />;
      case "featuredProjects":
        return <FeaturedProjects key={s.id} lang={lang} sid={s.id} data={s.data} projects={projects} />;
      case "contact":
        return <ContactCTA key={s.id} lang={lang} settings={settings} />;
    }
  });
}
