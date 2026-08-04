import { Package, Sprout, TrendingUp, Rocket, Users, Handshake } from "lucide-react";
import { useContent } from "../context/ContentContext";
import { PageHero } from "../components/sections/PageHero";
import { CoreValues } from "../components/sections/CoreValues";
import { ImpactAreas } from "../components/sections/ImpactAreas";
import { CTASection } from "../components/sections/CTASection";
import { Media } from "../components/ui/Media";
import { Reveal } from "../components/ui/Reveal";
import { CountUp } from "../components/ui/CountUp";
import { SectionHeading } from "../components/ui/SectionHeading";

const chainSteps = [
  {
    icon: Package,
    title: "Inputs & Services",
    description: "Access to quality seeds, tools, financing, and advisory support that set every agribusiness up to succeed.",
  },
  {
    icon: Sprout,
    title: "Production",
    description: "Hands-on support across crops and livestock — climate-smart techniques that boost yield and resilience.",
  },
  {
    icon: TrendingUp,
    title: "Marketing & Value Addition",
    description: "Helping producers reach markets and add value, turning raw output into sustainable income.",
  },
];

export function About() {
  const { sections, coreValues, impactAreas, stats } = useContent();
  if (!sections) return null;
  const { about, cta } = sections;

  const milestones = [
    {
      icon: Rocket,
      year: "2020",
      title: "SAIC is founded",
      description: "Established to serve Rwanda's agribusiness communities from the ground up.",
    },
    {
      icon: Handshake,
      year: "Since then",
      title: `${stats.find((s) => s.label.includes("Program"))?.value ?? "3"} programs, ${stats.find((s) => s.label.includes("Partner"))?.value ?? "4"} partners`,
      description: "Grew into a network of core programs and partner organizations across the sector.",
    },
    {
      icon: Users,
      year: "Today",
      title: `${stats.find((s) => s.label.includes("Communities"))?.value ?? "500+"} communities`,
      description: "Entrepreneurs, cooperatives, and communities empowered — and still growing.",
    },
  ];

  return (
    <>
      <PageHero
        eyebrow="About SAIC"
        title={about.headline}
        subtitle="A closer look at our mission, our model, and the communities we serve."
      />

      <section className="bg-white py-4 pb-20 lg:pb-24">
        <div className="container-page grid gap-14 lg:grid-cols-2 lg:items-center">
          <Reveal>
            <div className="relative">
              <div className="group aspect-[4/3.3] overflow-hidden rounded-[2rem] shadow-card ring-1 ring-ink-900/5">
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

          <Reveal delay={0.1} className="flex flex-col gap-5">
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-brand-50 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-brand-700">
              Our Story
            </span>
            <h2 className="text-balance text-2xl font-bold sm:text-3xl">
              Building circular agribusiness value chains
            </h2>
            <p className="leading-relaxed text-ink-500">{about.body}</p>
          </Reveal>
        </div>
      </section>

      <section className="relative overflow-hidden bg-ink-50/60 py-20 lg:py-24">
        <div className="container-page">
          <Reveal>
            <SectionHeading
              align="center"
              eyebrow="Our Model"
              title="How we build sustainable value chains"
              subtitle="Every partnership moves through the same circular model — from first inputs to a product ready for market."
            />
          </Reveal>

          <div className="relative mx-auto mt-14 grid max-w-5xl gap-8 sm:grid-cols-3">
            <div className="absolute left-0 right-0 top-8 hidden h-px bg-gradient-to-r from-transparent via-brand-200 to-transparent sm:block" />
            {chainSteps.map((step, i) => (
              <Reveal key={step.title} delay={i * 0.1}>
                <div className="relative flex flex-col items-center text-center">
                  <span className="relative z-10 flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-brand-700 shadow-card ring-1 ring-ink-900/5">
                    <step.icon className="h-6 w-6" />
                  </span>
                  <span className="mt-4 text-xs font-bold uppercase tracking-wider text-brand-600">
                    Step {i + 1}
                  </span>
                  <h3 className="mt-1 text-lg font-bold text-ink-950">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-500">{step.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <CoreValues values={coreValues} />
      <ImpactAreas areas={impactAreas} />

      <section className="bg-white py-20 lg:py-24">
        <div className="container-page">
          <Reveal>
            <SectionHeading align="center" eyebrow="Our Journey" title="From founding to five years of impact" />
          </Reveal>

          <div className="relative mx-auto mt-14 max-w-2xl">
            <div className="absolute left-6 top-2 bottom-2 w-px bg-ink-100" />
            <div className="flex flex-col gap-10">
              {milestones.map((milestone, i) => (
                <Reveal key={milestone.title} delay={i * 0.1}>
                  <div className="relative flex items-start gap-6">
                    <span className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white shadow-soft">
                      <milestone.icon className="h-5 w-5" />
                    </span>
                    <div className="pt-1.5">
                      <p className="text-xs font-bold uppercase tracking-wider text-brand-600">{milestone.year}</p>
                      <h3 className="mt-1 text-lg font-bold text-ink-950">{milestone.title}</h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-ink-500">{milestone.description}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      <CTASection cta={cta} />
    </>
  );
}
