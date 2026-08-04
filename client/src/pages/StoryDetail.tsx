import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Calendar } from "lucide-react";
import { useContent } from "../context/ContentContext";
import { Media } from "../components/ui/Media";
import { Reveal } from "../components/ui/Reveal";
import { Button } from "../components/ui/Button";

export function StoryDetail() {
  const { id } = useParams();
  const { stories, loading } = useContent();
  const story = stories.find((s) => s.id === Number(id));

  if (loading) return null;

  if (!story) {
    return (
      <section className="container-page flex flex-col items-center gap-5 py-28 text-center">
        <h1 className="text-2xl font-bold">Story not found</h1>
        <p className="text-ink-500">This story may have been removed or the link is incorrect.</p>
        <Button href="/gallery" withArrow>
          Back to Stories
        </Button>
      </section>
    );
  }

  return (
    <article>
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50/70 via-white to-white pb-4 pt-20 lg:pt-28">
        <div className="pointer-events-none absolute -top-24 right-0 h-72 w-72 rounded-full bg-brand-200/40 blur-3xl" />
        <div className="container-page relative">
          <Reveal>
            <Link
              to="/gallery"
              className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-500 transition-colors hover:text-brand-700"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Stories
            </Link>
            <div className="flex flex-wrap items-center gap-3">
              {story.category && (
                <span className="inline-flex items-center gap-2 rounded-full bg-brand-100 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-brand-700">
                  {story.category}
                </span>
              )}
              {story.date && (
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-400">
                  <Calendar className="h-4 w-4" /> {story.date}
                </span>
              )}
            </div>
            <h1 className="mt-5 max-w-3xl text-balance text-3xl font-bold leading-[1.15] sm:text-4xl lg:text-5xl">
              {story.title}
            </h1>
            {story.excerpt && (
              <p className="mt-5 max-w-2xl text-balance text-lg leading-relaxed text-ink-500">{story.excerpt}</p>
            )}
          </Reveal>
        </div>
      </section>

      <Reveal delay={0.1}>
        <div className="container-page">
          <div className="aspect-[16/9] overflow-hidden rounded-[2rem] shadow-card ring-1 ring-ink-900/5">
            <Media src={story.image} alt={story.title} className="h-full w-full object-cover" />
          </div>
        </div>
      </Reveal>

      <section className="bg-white py-16">
        <div className="container-page">
          <Reveal delay={0.15} className="mx-auto max-w-2xl">
            <div className="flex flex-col gap-5 text-base leading-relaxed text-ink-600">
              {story.content
                ? story.content
                    .split(/\n+/)
                    .filter((p) => p.trim())
                    .map((paragraph, i) => <p key={i}>{paragraph}</p>)
                : story.excerpt && <p>{story.excerpt}</p>}
            </div>

            <div className="mt-12 border-t border-ink-100 pt-8">
              <Button href="/gallery" variant="outline" withArrow>
                Back to all stories
              </Button>
            </div>
          </Reveal>
        </div>
      </section>
    </article>
  );
}
