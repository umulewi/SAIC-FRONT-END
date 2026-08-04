import type { Stat } from "../../types";
import { Reveal } from "../ui/Reveal";
import { CountUp } from "../ui/CountUp";

export function StatsBar({ stats }: { stats: Stat[] }) {
  if (stats.length === 0) return null;

  return (
    <section className="border-y border-ink-100 bg-white">
      <div className="container-page grid grid-cols-2 py-12 sm:grid-cols-4 sm:divide-x sm:divide-ink-100">
        {stats.map((stat, i) => (
          <Reveal
            key={stat.id}
            delay={i * 0.08}
            className="group flex flex-col items-center gap-1 px-4 text-center"
          >
            <p className="font-display text-3xl font-bold text-brand-700 transition-transform duration-300 group-hover:-translate-y-0.5 sm:text-4xl">
              <CountUp value={stat.value} />
            </p>
            <p className="text-sm font-medium text-ink-500">{stat.label}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
