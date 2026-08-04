import { Compass } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Reveal } from "../components/ui/Reveal";

export function NotFound() {
  return (
    <section className="relative flex min-h-[70vh] items-center justify-center overflow-hidden bg-gradient-to-b from-brand-50/70 via-white to-white px-6 py-24">
      <div className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-brand-200/40 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 -left-40 h-80 w-80 rounded-full bg-earth-200/40 blur-3xl" />

      <Reveal className="relative flex flex-col items-center gap-6 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-soft">
          <Compass className="h-8 w-8" />
        </span>
        <p className="font-display text-7xl font-bold text-brand-600 sm:text-8xl">404</p>
        <h1 className="text-balance text-2xl font-bold sm:text-3xl">
          Looks like this path grew somewhere else
        </h1>
        <p className="max-w-md text-balance leading-relaxed text-ink-500">
          The page you're looking for doesn't exist or may have moved. Let's get you back to
          solid ground.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Button href="/" size="lg" withArrow>
            Back to Home
          </Button>
          <Button href="/contact" size="lg" variant="outline">
            Contact Us
          </Button>
        </div>
      </Reveal>
    </section>
  );
}
