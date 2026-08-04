import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { Reveal } from "../ui/Reveal";

export function PageHero({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle?: string }) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-brand-50/70 via-white to-white py-20 lg:py-28">
      <div className="pointer-events-none absolute -top-24 right-0 h-72 w-72 rounded-full bg-brand-200/40 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 -left-24 h-56 w-56 rounded-full bg-earth-200/30 blur-3xl" />
      <div
        className="pointer-events-none absolute inset-0 opacity-40 [background-image:radial-gradient(var(--color-brand-300)_1px,transparent_1px)] [background-size:28px_28px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_0%,black_20%,transparent_75%)]"
        aria-hidden="true"
      />

      <div className="container-page relative">
        <Reveal>
          <nav className="mb-5 flex items-center gap-1.5 text-sm text-ink-400">
            <Link to="/" className="font-medium transition-colors hover:text-brand-700">
              Home
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="font-medium text-ink-600">{eyebrow}</span>
          </nav>
          <span className="inline-flex items-center gap-2 rounded-full bg-brand-100 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-brand-700">
            {eyebrow}
          </span>
          <h1 className="mt-5 max-w-2xl text-balance text-4xl font-bold leading-[1.1] sm:text-5xl">{title}</h1>
          {subtitle && <p className="mt-5 max-w-xl text-balance text-lg leading-relaxed text-ink-500">{subtitle}</p>}
        </Reveal>
      </div>
    </section>
  );
}
