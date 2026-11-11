import { GraduationCap, Handshake, Tractor } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Program } from "../../types";
import { Reveal } from "../ui/Reveal";
import { SectionHeading } from "../ui/SectionHeading";

const programIcons: LucideIcon[] = [GraduationCap, Handshake, Tractor];

export function ProgramsSection({ programs }: { programs: Program[] }) {
  if (programs.length === 0) return null;

  return (
    <section className="relative overflow-hidden bg-ink-950 py-16 lg:py-12">
      <div className="pointer-events-none absolute top-0 right-0 h-96 w-96 rounded-full bg-brand-700/30 blur-3xl" />
      <div className="container-page relative">
        <Reveal>
          <SectionHeading
            align="center"
            light
            eyebrow="Our Programs"
            title="Three programs, one shared mission"
            subtitle="Each program focuses on a different part of the ecosystem, but they all work together to help communities learn, build, and grow with practical support."
          />
        </Reveal>

        <div className="mx-auto mt-10 grid max-w-5xl gap-6 sm:grid-cols-3">
          {programs.map((program, i) => {
            const IconCmp = programIcons[i % programIcons.length];
            return (
              <Reveal key={program.id} delay={i * 0.1}>
                <div className="h-full rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm transition-colors hover:border-brand-400/40 hover:bg-white/10">
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 text-white">
                    <IconCmp className="h-6 w-6" strokeWidth={1.75} />
                  </span>
                  <p className="mt-6 text-xs font-bold uppercase tracking-wider text-brand-300">
                    {program.acronym}
                  </p>
                  <h3 className="mt-1 text-xl font-bold text-white">{program.name}</h3>
                  <p className="mt-3 leading-relaxed text-white/70">{program.description}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
