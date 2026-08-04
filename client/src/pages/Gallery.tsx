import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Calendar, Newspaper } from "lucide-react";
import { PageHero } from "../components/sections/PageHero";
import { Media } from "../components/ui/Media";
import { useContent } from "../context/ContentContext";

export function Gallery() {
  const { stories } = useContent();
  const [filter, setFilter] = useState("All");

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(stories.map((s) => s.category).filter(Boolean)))],
    [stories]
  );
  const filtered = useMemo(
    () => (filter === "All" ? stories : stories.filter((s) => s.category === filter)),
    [filter, stories]
  );

  return (
    <>
      <PageHero
        eyebrow="News & Gallery"
        title="Stories from the field"
        subtitle="Updates, event highlights, and stories from the communities and entrepreneurs we work with."
      />

      <section className="bg-white py-4 pb-24">
        <div className="container-page">
          {stories.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-ink-200 py-20 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-ink-50 text-ink-400">
                <Newspaper className="h-6 w-6" />
              </span>
              <p className="text-ink-400">No stories have been published yet.</p>
            </div>
          ) : (
            <>
              <div className="mb-10 flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFilter(cat)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                      filter === cat
                        ? "bg-brand-600 text-white shadow-soft"
                        : "bg-ink-50 text-ink-600 hover:bg-ink-100"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <motion.div layout className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                <AnimatePresence mode="popLayout">
                  {filtered.map((story) => (
                    <motion.div
                      key={story.id}
                      layout
                      initial={{ opacity: 0, scale: 0.94 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.94 }}
                      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <Link
                        to={`/gallery/${story.id}`}
                        className="group block overflow-hidden rounded-3xl bg-white shadow-card ring-1 ring-ink-900/5 transition-all hover:-translate-y-1 hover:shadow-lg"
                      >
                        <div className="relative aspect-[4/3] overflow-hidden">
                          <Media
                            src={story.image}
                            alt={story.title}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            gradient={story.id % 2 === 0 ? "brand" : "earth"}
                          />
                          <div className="absolute inset-0 flex items-end bg-gradient-to-t from-ink-950/70 via-ink-950/0 to-transparent p-5 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-white">
                              Read story <ArrowUpRight className="h-4 w-4" />
                            </span>
                          </div>
                          {story.category && (
                            <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-bold uppercase tracking-wide text-brand-700 backdrop-blur-sm">
                              {story.category}
                            </span>
                          )}
                        </div>
                        <div className="p-6">
                          {story.date && (
                            <p className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-600">
                              <Calendar className="h-3.5 w-3.5" /> {story.date}
                            </p>
                          )}
                          <h3 className="mt-2 text-lg font-bold">{story.title}</h3>
                          {story.excerpt && (
                            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink-500">{story.excerpt}</p>
                          )}
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            </>
          )}
        </div>
      </section>
    </>
  );
}
