import type { Partner } from "../../types";
import { Reveal } from "../ui/Reveal";
import { Media } from "../ui/Media";

export function PartnersGrid({ partners }: { partners: Partner[] }) {
  if (partners.length === 0) return null;

  return (
    <section className="bg-white py-16 lg:py-20">
      <div className="container-page">
        <Reveal>
          <p className="text-center text-sm font-bold uppercase tracking-wider text-ink-400">
            Trusted by leading organizations across Rwanda
          </p>
        </Reveal>

        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {partners.map((partner, i) => (
            <Reveal key={partner.id} delay={i * 0.05}>
              <div className="group flex h-28 items-center justify-center rounded-2xl border border-ink-100 bg-white p-6 transition-all hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-card">
                {partner.logo ? (
                  <Media
                    src={partner.logo}
                    alt={partner.name}
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <span className="text-center text-base font-bold tracking-tight text-ink-300 transition-colors group-hover:text-brand-600">
                    {partner.name}
                  </span>
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
