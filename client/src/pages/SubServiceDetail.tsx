import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Sparkles } from "lucide-react";
import { useContent } from "../context/ContentContext";
import { CTASection } from "../components/sections/CTASection";
import { Media } from "../components/ui/Media";
import { Reveal } from "../components/ui/Reveal";
import { Button } from "../components/ui/Button";
import { findSubService } from "../lib/services";
import { getSubServiceIcon } from "../lib/serviceIcons";

export function SubServiceDetail() {
  const { serviceSlug, subSlug } = useParams();
  const { sections } = useContent();
  const { service, subService } = findSubService(serviceSlug, subSlug);

  if (!service || !subService) {
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

  const otherSubServices = service.subServices.filter((s) => s.slug !== subService.slug);
  const SubIcon = getSubServiceIcon(subService.slug);

  return (
    <article>
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50/70 via-white to-white pb-4 pt-16 lg:pt-20">
        <div className="pointer-events-none absolute -top-24 right-0 h-72 w-72 rounded-full bg-brand-200/40 blur-3xl" />
        <div className="container-page relative">
          <Reveal>
            <Link
              to={`/services/${service.slug}`}
              className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-500 transition-colors hover:text-brand-700"
            >
              <ArrowLeft className="h-4 w-4" /> Back to {service.title}
            </Link>
          </Reveal>
        </div>
      </section>

      <Reveal delay={0.05}>
        <div className="container-page">
          <div className="relative overflow-hidden rounded-[2rem] shadow-card ring-1 ring-ink-900/5">
            <div className="aspect-[4/3] w-full sm:aspect-[16/8] lg:aspect-[21/9]">
              <Media src={subService.image} alt={subService.title} className="h-full w-full object-cover" />
            </div>
            <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-ink-950/90 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-7 lg:p-10">
              <div className="flex flex-wrap items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 text-white ring-1 ring-white/30 backdrop-blur">
                  <SubIcon className="h-5 w-5" />
                </span>
                <span className="rounded-full bg-white/15 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white ring-1 ring-white/30 backdrop-blur">
                  {service.title}
                </span>
              </div>
              <h1 className="mt-4 max-w-3xl text-balance text-2xl font-bold leading-[1.15] text-white sm:text-3xl lg:text-4xl">
                {subService.title}
              </h1>
              <p className="mt-3 max-w-2xl text-balance leading-relaxed text-white/85 sm:text-lg">
                {subService.summary}
              </p>
            </div>
          </div>
        </div>
      </Reveal>

      <section className="bg-white py-12 lg:py-16">
        <div className="container-page grid gap-12 lg:grid-cols-[1.2fr_1fr]">
          <Reveal>
            <div className="flex flex-col gap-5 text-base leading-relaxed text-ink-600 sm:text-lg">
              <p>{subService.intro}</p>
            </div>

            <div className="mt-10">
              <h2 className="flex items-center gap-2 text-lg font-bold text-ink-900">
                <Sparkles className="h-5 w-5 text-brand-600" /> What this includes
              </h2>
              <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                {subService.includes.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2.5 rounded-xl border-l-2 border-brand-300 bg-ink-50/60 p-4 text-sm leading-relaxed text-ink-700"
                  >
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-10">
              <h2 className="text-lg font-bold text-ink-900">Why it matters</h2>
              <ul className="mt-5 flex flex-col gap-3">
                {subService.benefits.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2.5 text-sm leading-relaxed text-ink-700 sm:text-base"
                  >
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-12 border-t border-ink-100 pt-8">
              <Button href="/contact" withArrow>
                Talk to our team about this service
              </Button>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="rounded-3xl border border-ink-100 p-7 shadow-card">
              <h3 className="font-bold text-ink-900">More under {service.title}</h3>
              <div className="mt-5 flex flex-col gap-1">
                {otherSubServices.slice(0, 6).map((sub) => {
                  const Icon = getSubServiceIcon(sub.slug);
                  return (
                    <Link
                      key={sub.slug}
                      to={`/services/${service.slug}/${sub.slug}`}
                      className="group flex items-center gap-3 rounded-xl p-3 text-sm font-semibold text-ink-700 transition-colors hover:bg-brand-50 hover:text-brand-700"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-ink-50 text-ink-500 transition-colors group-hover:bg-white group-hover:text-brand-700">
                        <Icon className="h-4 w-4" />
                      </span>
                      {sub.title}
                    </Link>
                  );
                })}
              </div>
              <Link
                to={`/services/${service.slug}`}
                className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700"
              >
                View all {service.title} services
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {sections && <CTASection cta={sections.cta} />}
    </article>
  );
}
