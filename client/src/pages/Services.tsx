import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { useContent } from "../context/ContentContext";
import { PageHero } from "../components/sections/PageHero";
import { CTASection } from "../components/sections/CTASection";
import { Media } from "../components/ui/Media";
import { Reveal } from "../components/ui/Reveal";
import { publicServices } from "../lib/services";
import { getMainServiceIcon, getSubServiceIcon } from "../lib/serviceIcons";

export function Services() {
  const { sections } = useContent();
  if (!sections) return null;

  return (
    <>
      <PageHero
        eyebrow="What We Offer"
        title="services built for every stage of your agribusiness"
        subtitle="From ideation to market access, our services are designed around the real challenges entrepreneurs and cooperatives face across Rwanda's agricultural value chain."
      />

      <section className="relative overflow-hidden bg-white py-8 pb-24">
        <div className="pointer-events-none absolute -top-10 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-brand-100/40 blur-3xl" />
        <div className="container-page relative grid gap-8 lg:grid-cols-3">
          {publicServices.map((service, i) => {
            const MainIcon = getMainServiceIcon(service.slug);
            return (
              <Reveal key={service.id} delay={(i % 3) * 0.08}>
                <Link
                  to={`/services/${service.slug}`}
                  className="group flex h-full flex-col overflow-hidden rounded-[2rem] bg-white shadow-card ring-1 ring-ink-900/5 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:ring-brand-200"
                >
                  <div className="relative aspect-[16/11] overflow-hidden">
                    <Media
                      src={service.image}
                      alt={service.title}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-ink-950/80 to-transparent" />
                    <span className="absolute right-5 top-5 rounded-full bg-white/90 px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand-700 backdrop-blur">
                      Service {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="absolute bottom-5 left-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-white ring-1 ring-white/30 backdrop-blur transition-transform duration-300 group-hover:scale-110">
                      <MainIcon className="h-5 w-5" />
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col gap-4 p-7">
                    <h2 className="text-xl font-bold leading-tight sm:text-2xl">{service.title}</h2>
                    <p className="leading-relaxed text-ink-500">{service.description}</p>
                    <div className="flex flex-1 flex-col gap-2.5 border-t border-ink-100 pt-4">
                      {service.subServices.slice(0, 3).map((sub) => {
                        const SubIcon = getSubServiceIcon(sub.slug);
                        return (
                          <span key={sub.slug} className="flex items-center gap-2.5 text-sm text-ink-600">
                            <SubIcon className="h-4 w-4 shrink-0 text-brand-600" />
                            <span className="truncate">{sub.title}</span>
                          </span>
                        );
                      })}
                      {service.subServices.length > 3 && (
                        <span className="pl-6 text-xs font-semibold text-ink-400">
                          +{service.subServices.length - 3} more service areas
                        </span>
                      )}
                    </div>
                    <span className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-brand-700">
                      Explore service
                      <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </span>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </section>

      <CTASection cta={sections.cta} />
    </>
  );
}
