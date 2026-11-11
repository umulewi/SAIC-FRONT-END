import { useContent } from "../context/ContentContext";
import { Hero } from "../components/sections/Hero";
import { StatsBar } from "../components/sections/StatsBar";
import { CoreValues } from "../components/sections/CoreValues";
import { ServicesGrid } from "../components/sections/ServicesGrid";
import { AboutSection } from "../components/sections/AboutSection";
import { ImpactAreas } from "../components/sections/ImpactAreas";
import { ProgramsSection } from "../components/sections/ProgramsSection";
import { PartnersGrid } from "../components/sections/PartnersGrid";
import { CTASection } from "../components/sections/CTASection";
import { publicServices } from "../lib/services";

export function Home() {
  const { sections, stats, coreValues, impactAreas, programs, partners } = useContent();
  if (!sections) return null;

  return (
    <>
      <Hero hero={sections.hero} />
      <StatsBar stats={stats} />
      <CoreValues values={coreValues} />
      <ServicesGrid services={publicServices} />
      <AboutSection about={sections.about} />
      <ImpactAreas areas={impactAreas} />
      <ProgramsSection programs={programs} />
      <PartnersGrid partners={partners} />
      <CTASection cta={sections.cta} />
    </>
  );
}
