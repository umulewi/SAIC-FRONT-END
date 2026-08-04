import { useState } from "react";
import { motion } from "framer-motion";
import { Sprout, ArrowRight, Play } from "lucide-react";
import type { Hero as HeroType } from "../../types";
import { Button } from "../ui/Button";
import { Media } from "../ui/Media";
import { VideoLightbox } from "../ui/VideoLightbox";

export function Hero({ hero }: { hero: HeroType }) {
  const [videoOpen, setVideoOpen] = useState(false);

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-brand-50/70 via-white to-white">
      <div className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-brand-200/40 blur-3xl" />
      <div className="pointer-events-none absolute top-40 -left-40 h-80 w-80 rounded-full bg-earth-200/40 blur-3xl" />

      <div className="container-page relative grid gap-14 py-20 lg:grid-cols-2 lg:items-center lg:py-28">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-start gap-6"
        >
          <span className="inline-flex items-center gap-2 rounded-full bg-brand-100 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-brand-700">
            <Sprout className="h-3.5 w-3.5" />
            {hero.eyebrow}
          </span>
          <h1 className="text-balance text-4xl font-bold leading-[1.08] sm:text-5xl lg:text-6xl">
            {hero.headline}
          </h1>
          <p className="max-w-xl text-balance text-lg leading-relaxed text-ink-500">
            {hero.subheadline}
          </p>
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Button href={hero.primaryCta.href} size="lg" withArrow>
              {hero.primaryCta.label}
            </Button>
            <Button href={hero.secondaryCta.href} size="lg" variant="outline">
              {hero.secondaryCta.label}
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
          className="relative"
        >
          <div className="group relative aspect-[4/3.4] overflow-hidden rounded-[2rem] shadow-card ring-1 ring-ink-900/5">
            <Media src={hero.image} alt={hero.headline} className="h-full w-full object-cover" gradient="ink" />

            {hero.video && (
              <>
                <div className="absolute inset-0 bg-ink-950/10 transition-colors group-hover:bg-ink-950/25" />
                <button
                  onClick={() => setVideoOpen(true)}
                  className="absolute inset-0 flex items-center justify-center"
                  aria-label="Play video"
                >
                  <span className="relative flex h-20 w-20 items-center justify-center">
                    <span className="absolute inset-0 rounded-full bg-white/30 backdrop-blur-sm transition-transform duration-300 group-hover:scale-110" />
                    <span className="absolute inset-0 animate-ping rounded-full bg-white/20" />
                    <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-white text-brand-700 shadow-lg transition-transform duration-300 group-hover:scale-105">
                      <Play className="h-5 w-5 translate-x-0.5" fill="currentColor" />
                    </span>
                  </span>
                </button>
                <span className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-white/90 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-ink-700 backdrop-blur-sm">
                  Watch our story
                </span>
              </>
            )}
          </div>
          <div className="absolute -bottom-6 -left-6 flex items-center gap-3 rounded-2xl bg-white p-4 shadow-card ring-1 ring-ink-900/5 sm:-left-10">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-600 text-white">
              <ArrowRight className="h-5 w-5 -rotate-45" />
            </span>
            <div>
              <p className="text-sm font-bold text-ink-950">500+ Communities</p>
              <p className="text-xs text-ink-400">empowered across Rwanda</p>
            </div>
          </div>
        </motion.div>
      </div>

      {hero.video && (
        <VideoLightbox src={hero.video} open={videoOpen} onClose={() => setVideoOpen(false)} />
      )}
    </section>
  );
}
