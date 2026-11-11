import { Link } from "react-router-dom";
import { Briefcase, MapPin, HeartHandshake, TrendingUp, Users2, Sparkles, ArrowUpRight } from "lucide-react";
import { PageHero } from "../components/sections/PageHero";
import { SectionHeading } from "../components/ui/SectionHeading";
import { Reveal } from "../components/ui/Reveal";
import { Button } from "../components/ui/Button";
import { useContent } from "../context/ContentContext";

const perks = [
  {
    icon: TrendingUp,
    title: "Real Impact",
    description: "Work that visibly changes livelihoods across Rwanda's agricultural communities.",
  },
  {
    icon: Users2,
    title: "Collaborative Culture",
    description: "A close-knit, supportive team that values mentorship over hierarchy.",
  },
  {
    icon: Sparkles,
    title: "Room to Grow",
    description: "Hands-on learning across incubation, advisory, and training programs.",
  },
  {
    icon: HeartHandshake,
    title: "Purpose-Driven",
    description: "Every role ties directly back to community and economic development.",
  },
];

export function Career() {
  const { sections, jobOpenings } = useContent();

  return (
    <>
      <PageHero
        eyebrow="Careers at SAIC"
        title="Help build Rwanda's agribusiness future"
        subtitle="See what it means to work here, learn about the team culture, and explore opportunities that directly support sustainable agriculture, advisory work, and community development across Rwanda."
      />

      <section className="bg-white py-12 lg:py-12">
        <div className="container-page">
          <Reveal>
            <SectionHeading
              align="center"
              eyebrow="Why SAIC"
              title="A team worth joining"
              subtitle="We value collaboration, learning, and meaningful work, so this section shows the environment, expectations, and growth opportunities you can expect on the team."
            />
          </Reveal>
          <div className="mx-auto mt-12 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {perks.map((perk, i) => (
              <Reveal key={perk.title} delay={i * 0.08}>
                <div className="group h-full rounded-3xl border border-ink-100 p-6 transition-all hover:-translate-y-1 hover:border-brand-200 hover:shadow-card">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-700 transition-colors group-hover:bg-brand-600 group-hover:text-white">
                    <perk.icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-5 font-bold text-ink-950">{perk.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-500">{perk.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-ink-50/60 py-12 pb-16 lg:pb-16">
        <div className="container-page">
          <Reveal>
            <SectionHeading
              align="center"
              eyebrow="Open Roles"
              title="Current opportunities"
              subtitle="Each opening includes a short overview so you can quickly understand the role, the location, the responsibilities, and the kind of experience we are looking for."
            />
          </Reveal>

          {jobOpenings.length === 0 ? (
            <Reveal delay={0.1}>
              <div className="mt-10 flex flex-col items-center gap-3 rounded-3xl border border-dashed border-ink-200 bg-white py-16 text-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-ink-50 text-ink-400">
                  <Briefcase className="h-6 w-6" />
                </span>
                <p className="text-ink-400">No open roles right now — check back soon for new opportunities, future openings, and new ways to contribute.</p>
              </div>
            </Reveal>
          ) : (
            <div className="mt-10 flex flex-col gap-4">
              {jobOpenings.map((role, i) => (
                <Reveal key={role.id} delay={i * 0.08}>
                  <Link
                    to={`/career/${role.id}`}
                    className="group flex flex-col items-start justify-between gap-4 rounded-3xl border border-ink-100 bg-white p-6 transition-all hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-card sm:flex-row sm:items-center"
                  >
                    <div className="flex items-start gap-4">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                        <Briefcase className="h-5 w-5" />
                      </span>
                      <div>
                        <h3 className="text-lg font-bold">{role.title}</h3>
                        <div className="mt-1 flex flex-wrap items-center gap-4 text-sm text-ink-500">
                          <span className="inline-flex items-center gap-1.5">
                            <MapPin className="h-4 w-4" /> {role.location}
                          </span>
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-ink-50 px-2.5 py-0.5 text-xs font-semibold text-ink-600">
                            {role.type}
                          </span>
                        </div>
                      </div>
                    </div>
                    <span className="inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-ink-200 px-5 py-2.5 text-sm font-semibold text-ink-800 transition-colors group-hover:border-brand-600 group-hover:text-brand-700 sm:w-auto">
                      View & Apply
                      <ArrowUpRight className="h-4 w-4" />
                    </span>
                  </Link>
                </Reveal>
              ))}
            </div>
          )}

          <Reveal delay={0.3}>
            <div className="relative mt-10 overflow-hidden rounded-3xl bg-brand-600 p-8 text-center sm:p-10">
              <div className="pointer-events-none absolute -top-16 -right-16 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-earth-400/25 blur-3xl" />
              <p className="relative text-balance text-lg text-white/90">
                Don't see a role that fits? Send us your CV — we review talent continuously and may reach out when a matching opportunity opens across programs or support teams.
              </p>
              <div className="relative mt-5">
                <Button href={sections ? `mailto:${sections.contact.email}` : "/contact"} variant="secondary" withArrow>
                  Get in Touch
                </Button>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
