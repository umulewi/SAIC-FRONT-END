import type { CoreValue } from "../../types";
import { Icon } from "../ui/Icon";
import { Reveal } from "../ui/Reveal";
import { SectionHeading } from "../ui/SectionHeading";

export function CoreValues({ values }: { values: CoreValue[] }) {
  if (values.length === 0) return null;

  return (
    <section className="bg-white py-20 lg:py-28">
      <div className="container-page">
        <Reveal>
          <SectionHeading
            align="center"
            eyebrow="What Drives Us"
            title="The values behind every partnership"
            subtitle="Three principles guide how we work with entrepreneurs, cooperatives, and communities across Rwanda."
          />
        </Reveal>

        <div className="mt-14 grid gap-6 sm:grid-cols-3">
          {values.map((value, i) => (
            <Reveal key={value.id} delay={i * 0.1}>
              <div className="group h-full rounded-3xl border border-ink-100 bg-white p-8 shadow-card transition-all hover:-translate-y-1 hover:border-brand-200">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-700 transition-colors group-hover:bg-brand-600 group-hover:text-white">
                  <Icon name={value.icon} className="h-6 w-6" />
                </span>
                <h3 className="mt-6 text-xl font-bold">{value.title}</h3>
                <p className="mt-2 leading-relaxed text-ink-500">{value.description}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
