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

  return (
    <>
      <PageHero
        eyebrow="Our Team"
        title="The people driving Rwanda's agribusiness transformation"
        subtitle="A multidisciplinary team of program leads, advisors, and educators dedicated to building sustainable agribusinesses."
      />

      <section className="bg-white py-4 pb-24">
        <div className="container-page grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {team.map((member, i) => (
            <Reveal key={member.id} delay={(i % 4) * 0.08}>
              <div className="group overflow-hidden rounded-3xl bg-white shadow-card ring-1 ring-ink-900/5 transition-all hover:-translate-y-1 hover:shadow-lg">
                <div className="relative aspect-[4/4.2] overflow-hidden">
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
                <div className="p-6">
                  <h3 className="text-lg font-bold">{member.name}</h3>
                  <p className="text-sm font-semibold text-brand-700">{member.role}</p>
                  <p className="mt-3 text-sm leading-relaxed text-ink-500">{member.bio}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <CTASection cta={sections.cta} />
    </>
  );
}
