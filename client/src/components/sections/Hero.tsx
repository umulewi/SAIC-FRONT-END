import type { Hero as HeroType } from "../../types";

// Bundled with the client as a static asset (client/public/video/hero.mp4) and
// referenced directly on purpose — not sourced from the CMS/database. That
// keeps it identical across every environment (local, staging, production)
// regardless of what's stored in the hero section's `video` field.
const HERO_VIDEO_SRC = "/video/hero.mp4";

export function Hero({ hero }: { hero: HeroType }) {
  return (
    <section className="relative isolate -mt-20 flex min-h-[560px] items-center overflow-hidden bg-ink-950 sm:min-h-[640px] lg:min-h-[720px]">
      {/* Visually hidden — the page still needs exactly one h1 for SEO/accessibility, but this hero is video-only by design. */}
      <h1 className="sr-only">{hero.headline}</h1>

      <div className="absolute inset-0 -z-10">
        <video className="h-full w-full object-cover" src={HERO_VIDEO_SRC} autoPlay muted loop playsInline />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950/50 via-transparent to-ink-950/20" />
      </div>
    </section>
  );
}
