import type { AboutContent } from "../../types";
import { Media } from "../ui/Media";
import { Reveal } from "../ui/Reveal";
import { SectionHeading } from "../ui/SectionHeading";
import { Button } from "../ui/Button";
import { CountUp } from "../ui/CountUp";

export function AboutSection({ about }: { about: AboutContent }) {
  return (
    <section className="relative overflow-hidden bg-white py-16 lg:py-12">
      <div className="pointer-events-none absolute top-1/3 -left-32 h-72 w-72 rounded-full bg-earth-100/60 blur-3xl" />

      <div className="container-page relative grid gap-10 lg:grid-cols-2 lg:items-center">
        <Reveal>
          <div className="relative">
            <div className="group aspect-[4/3.2] overflow-hidden rounded-[2rem] shadow-card ring-1 ring-ink-900/5">
              <Media
                src={about.image}
                alt={about.headline}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                gradient="earth"
              />
            </div>
            <div className="absolute -bottom-8 -right-6 grid grid-cols-2 gap-3 rounded-2xl bg-white p-5 shadow-card ring-1 ring-ink-900/5 sm:-right-10">
              {about.stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="font-display text-2xl font-bold text-brand-700">
                    <CountUp value={stat.value} />
                  </p>
                  <p className="text-xs font-medium text-ink-400">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <SectionHeading eyebrow={about.eyebrow} title={about.headline} />
          <p className="mx-auto mt-6 max-w-4xl text-balance text-center leading-relaxed text-ink-500 sm:text-lg lg:text-xl">
            {about.body}
          </p>
          <div className="mt-8 flex justify-center">
            <Button href="/about" variant="outline" withArrow>
              Discover our story
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
