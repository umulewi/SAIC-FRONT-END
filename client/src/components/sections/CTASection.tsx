import type { CtaContent } from "../../types";
import { Button } from "../ui/Button";
import { Reveal } from "../ui/Reveal";

export function CTASection({ cta }: { cta: CtaContent }) {
  return (
    <section className="py-14 lg:py-12">
      <div className="container-page">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2.5rem] bg-brand-600 px-8 py-12 text-center sm:px-16 lg:py-14">
            <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-earth-400/30 blur-3xl" />
            <div className="relative mx-auto flex max-w-2xl flex-col items-center gap-6">
              <h2 className="text-balance text-2xl font-bold text-white sm:text-3xl">{cta.headline}</h2>
              <p className="text-balance text-lg leading-relaxed text-white/85">{cta.body}</p>
              <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                <Button href={cta.primaryCta.href} size="lg" variant="secondary">
                  {cta.primaryCta.label}
                </Button>
                <Button href={cta.secondaryCta.href} size="lg" variant="glass">
                  {cta.secondaryCta.label}
                </Button>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
