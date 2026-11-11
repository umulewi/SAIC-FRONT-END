import type { ImpactArea } from "../../types";
import { Media } from "../ui/Media";
import { Reveal } from "../ui/Reveal";
import { SectionHeading } from "../ui/SectionHeading";

export function ImpactAreas({ areas }: { areas: ImpactArea[] }) {
  if (areas.length === 0) return null;

  return (
    <section className="bg-white py-16 lg:py-12">
      <div className="container-page">
        <Reveal>
          <SectionHeading
            align="center"
            eyebrow="Where We Focus"
            title="Impact across technology, people, and community"
            subtitle="These focus areas show where our work creates the clearest change and how each one contributes to a stronger agricultural value chain."
          />
        </Reveal>

        <div className="mt-10 grid gap-8 lg:grid-cols-3">
          {areas.map((area, i) => (
            <Reveal key={area.id} delay={i * 0.1}>
              <div className="group relative aspect-[4/5] overflow-hidden rounded-3xl shadow-card">
                <Media
                  src={area.image}
                  alt={area.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  gradient={i % 2 === 0 ? "brand" : "earth"}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-950/85 via-ink-950/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-7">
                  <h3 className="text-xl font-bold text-white">{area.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/80">{area.description}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
