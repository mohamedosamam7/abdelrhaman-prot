import { notFound } from "next/navigation";
import { getContent } from "@/cms/load";
import { Sections } from "@/components/Sections";
import { isLocale } from "@/i18n";

export default async function HomePage({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const { pages, settings, projects } = await getContent();
  return <Sections lang={lang} sections={pages.home} settings={settings} projects={projects} />;
}
