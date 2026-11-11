import { Award } from "lucide-react";
import { useContent } from "../context/ContentContext";
import { PageHero } from "../components/sections/PageHero";
import { CTASection } from "../components/sections/CTASection";
import { Media } from "../components/ui/Media";
import { InitialsAvatar } from "../components/ui/InitialsAvatar";
import { Reveal } from "../components/ui/Reveal";
import { FacebookIcon, LinkedinIcon, TwitterIcon } from "../components/ui/SocialIcons";

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
        <div className="container-page grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {team.map((member, i) => (
            <Reveal key={member.id} delay={(i % 4) * 0.08} className="h-full">
              <div className="group flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-card ring-1 ring-ink-900/5 transition-all hover:-translate-y-1 hover:shadow-lg">
                <div className="relative aspect-[4/4.2] shrink-0 overflow-hidden">
                  {member.photo ? (
                    <Media
                      src={member.photo}
                      alt={member.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <InitialsAvatar
                      name={member.name}
                      className="h-full w-full transition-transform duration-500 group-hover:scale-105"
                    />
                  )}
                  
                  <div className="absolute inset-x-0 bottom-0 flex justify-center gap-2 bg-gradient-to-t from-ink-950/80 via-ink-950/20 to-transparent p-4 opacity-0 transition-all duration-300 group-hover:opacity-100">
                    {[LinkedinIcon, TwitterIcon, FacebookIcon].map((IconCmp, idx) => (
                      <span
                        key={idx}
                        className="flex h-9 w-9 translate-y-2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm transition-all duration-300 hover:bg-white hover:text-brand-700 group-hover:translate-y-0"
                        style={{ transitionDelay: `${idx * 40}ms` }}
                      >
                        <IconCmp className="h-4 w-4" />
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="text-lg font-bold">{member.name}</h3>
                  <p className="text-sm font-semibold text-brand-700">{member.role}</p>
                  <p className="mt-3 line-clamp-4 text-sm leading-relaxed text-ink-500">{member.bio}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {featured.length > 0 && (
        <section className="relative overflow-hidden bg-gradient-to-b from-earth-50/70 via-white to-white py-14 pb-24">
          <div className="pointer-events-none absolute -top-16 right-10 h-64 w-64 rounded-full bg-earth-200/30 blur-3xl" />
          <div className="container-page relative">
            <Reveal>
              <div className="mx-auto mb-10 flex max-w-xl flex-col items-center gap-3 text-center">
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
                featured.length > 1 ? "sm:grid-cols-2 lg:grid-cols-3" : "max-w-2xl"
              }`}
            >
              {featured.map((member, i) => (
                <Reveal key={member.id} delay={i * 0.1}>
                  <div className="group relative flex flex-col overflow-hidden rounded-[2rem] bg-white shadow-xl ring-1 ring-earth-200 sm:flex-row">
                    <div className="relative aspect-square w-full shrink-0 overflow-hidden sm:w-56">
                      {member.photo ? (
                        <Media
                          src={member.photo}
                          alt={member.name}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <InitialsAvatar name={member.name} className="h-full w-full" />
                      )}
                      <span className="absolute left-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-earth-500 text-white shadow-lg">
                        <Award className="h-4 w-4" />
                      </span>
                    </div>
                    <div className="flex flex-1 flex-col justify-center p-7">
                      
                      <h3 className="mt-2 text-xl font-bold text-ink-950">{member.name}</h3>
                      <p className="text-sm font-semibold text-brand-700">{member.role}</p>
                      <p className="mt-3 text-sm leading-relaxed text-ink-500">{member.bio}</p>
                    </div>
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
