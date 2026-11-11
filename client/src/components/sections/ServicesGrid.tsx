import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import type { Service } from "../../types";
import { Media } from "../ui/Media";
import { Reveal } from "../ui/Reveal";
import { SectionHeading } from "../ui/SectionHeading";
import { Button } from "../ui/Button";

export function ServicesGrid({ services }: { services: Service[] }) {
  if (services.length === 0) return null;
  const preview = services.slice(0, 3);

  return (
    <section className="bg-ink-50/60 py-16 lg:py-12">
      <div className="container-page">
        <Reveal>
          <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 text-center">
            <SectionHeading
              align="center"
              eyebrow="What We Offer"
              title="Comprehensive support for every stage of growth"
              subtitle="Each service is built to solve a specific challenge, from early planning and technical guidance to market readiness and long-term business support for agribusinesses."
            />
            <Button href="/services" variant="outline" withArrow className="shrink-0">
              View all services
            </Button>
          </div>
        </Reveal>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {preview.map((service, i) => (
            <Reveal key={service.id} delay={i * 0.08}>
              <Link
                to={service.href}
                className="group flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-card ring-1 ring-ink-900/5 transition-transform hover:-translate-y-1"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <Media
                    src={service.image}
                    alt={service.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-1 flex-col gap-2 p-6">
                  <h3 className="text-lg font-bold">{service.title}</h3>
                  <p className="flex-1 text-sm leading-relaxed text-ink-500">{service.description}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand-700">
                    Learn more
                    <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
