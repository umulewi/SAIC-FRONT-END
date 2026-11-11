import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { useContent } from "../context/ContentContext";
import { CTASection } from "../components/sections/CTASection";
import { StatsBar } from "../components/sections/StatsBar";
import { Media } from "../components/ui/Media";
import { Reveal } from "../components/ui/Reveal";
import { Button } from "../components/ui/Button";
import { findService } from "../lib/services";
import { getMainServiceIcon, getSubServiceIcon } from "../lib/serviceIcons";

export function ServiceDetail() {
  const { serviceSlug } = useParams();
  const { sections, stats } = useContent();
  const service = findService(serviceSlug);

  if (!service) {
    return (
      <section className="container-page flex flex-col items-center gap-5 py-28 text-center">
        <h1 className="text-2xl font-bold">Service not found</h1>
        <p className="text-ink-500">This service may have moved or the link is incorrect.</p>
        <Button href="/services" withArrow>
          Back to Services
        </Button>
      </section>
    );
  }

  const MainIcon = getMainServiceIcon(service.slug);

  return (
    <article>
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50/70 via-white to-white pb-4 pt-16 lg:pt-20">
        <div className="pointer-events-none absolute -top-24 right-0 h-72 w-72 rounded-full bg-brand-200/40 blur-3xl" />
        <div className="container-page relative">
          <Reveal>
            <Link
              to="/services"
              className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-500 transition-colors hover:text-brand-700"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Services
            </Link>
          </Reveal>
        </div>
      </section>

      <Reveal delay={0.05}>
        <div className="container-page">
          <div className="relative overflow-hidden rounded-[2rem] shadow-card ring-1 ring-ink-900/5">
            <div className="aspect-[4/3] w-full sm:aspect-[16/8] lg:aspect-[21/9]">
              <Media src={service.image} alt={service.title} className="h-full w-full object-cover" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-ink-950/90 via-ink-950/40 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-7 lg:p-10">
              <div className="flex flex-wrap items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 text-white ring-1 ring-white/30 backdrop-blur">
                  <MainIcon className="h-5 w-5" />
                </span>
                <span className="rounded-full bg-white/15 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white ring-1 ring-white/30 backdrop-blur">
                  {service.subServices.length} service areas
                </span>
              </div>
              <h1 className="mt-4 max-w-3xl text-balance text-2xl font-bold leading-[1.15] text-white sm:text-3xl lg:text-4xl">
                {service.title}
              </h1>
              <p className="mt-3 max-w-2xl text-balance leading-relaxed text-white/85 sm:text-lg">
                {service.description}
              </p>
              {service.content && (
                <p className="mt-2 max-w-2xl text-balance leading-relaxed text-white/70">{service.content}</p>
              )}
            </div>
          </div>
        </div>
      </Reveal>

      {stats.length > 0 && <StatsBar stats={stats} />}

      <section className="bg-white py-14 lg:py-16">
        <div className="container-page">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-xl font-bold text-ink-900 sm:text-2xl">What we provide</h2>
            <p className="mt-3 leading-relaxed text-ink-500">
              Each area below is a focused, hands-on engagement — open any of them for a full breakdown of what's
              included.
            </p>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {service.subServices.map((sub, i) => {
              const SubIcon = getSubServiceIcon(sub.slug);
              return (
                <Reveal key={sub.slug} delay={(i % 6) * 0.06}>
                  <Link
                    to={`/services/${service.slug}/${sub.slug}`}
                    className="group flex h-full flex-col rounded-2xl bg-ink-50/60 p-6 ring-1 ring-ink-900/5 transition-all duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-card hover:ring-brand-200"
                  >
                    <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-brand-700 shadow-sm ring-1 ring-ink-900/5 transition-colors duration-300 group-hover:bg-brand-600 group-hover:text-white">
                      <SubIcon className="h-5 w-5" />
                    </span>
                    <h3 className="mt-4 font-bold text-ink-900">{sub.title}</h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-600">{sub.summary}</p>
                    <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-700">
                      Learn more
                      <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </span>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {sections && <CTASection cta={sections.cta} />}
    </article>
  );
}
