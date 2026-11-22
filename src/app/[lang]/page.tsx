import { notFound } from "next/navigation";
import { ContactCTA } from "@/components/ContactCTA";
import { Approach } from "@/components/home/Approach";
import { HeroPhotographyGrid } from "@/components/home/HeroPhotographyGrid";
import { SelectedFrames } from "@/components/home/SelectedFrames";
import { Services } from "@/components/home/Services";
import { isLocale } from "@/i18n";

export default async function HomePage({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return (
    <>
      <HeroPhotographyGrid lang={lang} />
      <SelectedFrames lang={lang} />
      <Services lang={lang} />
      <Approach lang={lang} />
      <ContactCTA lang={lang} />
    </>
  );
}
