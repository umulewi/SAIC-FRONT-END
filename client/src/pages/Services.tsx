import { useContent } from "../context/ContentContext";
import { PageHero } from "../components/sections/PageHero";
import { CTASection } from "../components/sections/CTASection";
import { Media } from "../components/ui/Media";
import { Reveal } from "../components/ui/Reveal";
import { ArrowUpRight } from "lucide-react";

export function Services() {
  const { sections, services } = useContent();
  if (!sections) return null;

  return (
    <>
      <PageHero
        eyebrow="What We Offer"
        title="14 services built for every stage of your agribusiness"
        subtitle="From ideation to market access, our services are designed around the real challenges entrepreneurs and cooperatives face across Rwanda's agricultural value chain."
      />

      <section className="bg-white py-4 pb-24">
        <div className="container-page grid gap-8 sm:grid-cols-2">
          {services.map((service, i) => (
            <Reveal key={service.id} delay={(i % 4) * 0.08}>
              <div
                id={service.href.split("#")[1]}
                className="group flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-card ring-1 ring-ink-900/5 transition-transform hover:-translate-y-1 sm:flex-row"
              >
                <div className="aspect-[4/3] w-full overflow-hidden sm:aspect-auto sm:w-2/5">
                  <Media
                    src={service.image}
                    alt={service.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-1 flex-col gap-3 p-7">
                  <h3 className="text-xl font-bold">{service.title}</h3>
                  <p className="flex-1 leading-relaxed text-ink-500">{service.description}</p>
                  <span className="inline-flex w-fit items-center gap-1 text-sm font-semibold text-brand-700">
                    Get in touch
                    <ArrowUpRight className="h-4 w-4" />
                  </span>
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
