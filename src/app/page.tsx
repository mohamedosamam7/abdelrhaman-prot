import { HeroPhotographyGrid } from "@/components/home/HeroPhotographyGrid";
import { SelectedFrames } from "@/components/home/SelectedFrames";
import { Services } from "@/components/home/Services";
import { Approach } from "@/components/home/Approach";
import { ContactCTA } from "@/components/ContactCTA";
import { heroPhotos } from "@/content/home";

export default function HomePage() {
  return (
    <>
      <HeroPhotographyGrid photos={heroPhotos} />
      <SelectedFrames />
      <Services />
      <Approach />
      <ContactCTA />
    </>
  );
}
