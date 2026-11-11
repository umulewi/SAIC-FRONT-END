import { Award } from "lucide-react";
import { useContent } from "../context/ContentContext";
import { PageHero } from "../components/sections/PageHero";
import { CTASection } from "../components/sections/CTASection";
import { Media } from "../components/ui/Media";
import { InitialsAvatar } from "../components/ui/InitialsAvatar";
import { Reveal } from "../components/ui/Reveal";

export function Team() {
  const { sections, team } = useContent();
  if (!sections) return null;

  const featured = team.filter((member) => member.employeeOfTheYear);

  return (
    <>
      <PageHero
        eyebrow="Our Team"
        title="The people driving Rwanda's agribusiness transformation"
        subtitle="Meet the advisors, coordinators, and specialists behind the work, and see how each role contributes to the programs, services, and partnerships we deliver every day."
      />

      <section className={`bg-white py-4 ${featured.length > 0 ? "" : "pb-24"}`}>
        <div className="container-page grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {team.map((member, i) => (
            <Reveal key={member.id} delay={(i % 4) * 0.08} className="h-full">
              <div className="group relative aspect-[3/4] overflow-hidden rounded-[1.75rem] shadow-card ring-1 ring-ink-900/5 transition-all duration-500 hover:shadow-2xl">
                {member.photo ? (
                  <Media
                    src={member.photo}
                    alt={member.name}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                ) : (
                  <InitialsAvatar
                    name={member.name}
                    className="h-full w-full transition-transform duration-700 group-hover:scale-110"
                  />
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-ink-950/95 via-ink-950/25 to-transparent transition-opacity duration-500 group-hover:from-ink-950/95 group-hover:via-ink-950/60" />

                <div className="absolute inset-x-0 bottom-0 p-6">
                  <h3 className="text-lg font-bold text-white">{member.name}</h3>
                  <p className="text-sm font-semibold text-brand-300">{member.role}</p>

                  <div className="grid grid-rows-[0fr] transition-all duration-500 group-hover:grid-rows-[1fr]">
                    <div className="overflow-hidden">
                      <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-white/80">{member.bio}</p>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {featured.length > 0 && (
        <section className="relative overflow-hidden bg-gradient-to-b from-earth-50/70 via-white to-white py-16 pb-24">
          <div className="pointer-events-none absolute -top-20 right-10 h-72 w-72 rounded-full bg-earth-200/30 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 -left-20 h-64 w-64 rounded-full bg-brand-200/20 blur-3xl" />
          <div
            className="pointer-events-none absolute inset-0 opacity-40 [background-image:radial-gradient(var(--color-earth-300)_1px,transparent_1px)] [background-size:28px_28px] [mask-image:radial-gradient(ellipse_60%_55%_at_50%_0%,black_15%,transparent_70%)]"
            aria-hidden="true"
          />

          <div className="container-page relative">
            <Reveal>
              <div className="mx-auto mb-12 flex max-w-xl flex-col items-center gap-3 text-center">
                <span className="inline-flex items-center gap-2 rounded-full bg-earth-100 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-earth-700">
                  <Award className="h-3.5 w-3.5" /> Employee of the Year
                </span>
                <h2 className="text-xl font-bold sm:text-2xl">Recognizing outstanding contribution</h2>
                <p className="leading-relaxed text-ink-500">
                  Celebrating the team member{featured.length > 1 ? "s" : ""} whose dedication and impact stood out
                  this year.
                </p>
              </div>
            </Reveal>

            <div
              className={`mx-auto grid gap-8 ${
                featured.length > 1 ? "sm:grid-cols-2 lg:grid-cols-3" : "max-w-md"
              }`}
            >
              {featured.map((member, i) => (
                <Reveal key={member.id} delay={i * 0.1}>
                  <div className="relative flex flex-col items-center overflow-hidden rounded-[2rem] bg-white p-8 text-center shadow-2xl ring-1 ring-earth-200 transition-transform duration-300 hover:-translate-y-1">
                    <div className="pointer-events-none absolute -top-10 left-1/2 h-32 w-32 -translate-x-1/2 rounded-full bg-earth-200/40 blur-2xl" />

                    <div className="relative h-32 w-32 shrink-0 rounded-full bg-gradient-to-br from-earth-300 via-earth-500 to-earth-700 p-1.5 shadow-lg">
                      <div className="h-full w-full overflow-hidden rounded-full ring-4 ring-white">
                        {member.photo ? (
                          <Media src={member.photo} alt={member.name} className="h-full w-full object-cover" />
                        ) : (
                          <InitialsAvatar name={member.name} className="h-full w-full" />
                        )}
                      </div>
                      <span className="absolute -bottom-1 -right-1 flex h-10 w-10 items-center justify-center rounded-full bg-earth-500 text-white shadow-md ring-4 ring-white">
                        <Award className="h-4 w-4" />
                      </span>
                    </div>

                    <h3 className="relative mt-5 text-xl font-bold text-ink-950">{member.name}</h3>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      <CTASection cta={sections.cta} />
    </>
  );
}
