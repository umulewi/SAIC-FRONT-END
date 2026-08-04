import { ArrowUpRight, Globe, LayoutGrid } from "lucide-react";
import { useContent } from "../context/ContentContext";
import { PageHero } from "../components/sections/PageHero";
import { Media } from "../components/ui/Media";
import { Reveal } from "../components/ui/Reveal";

function hostnameOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export function SitesApps() {
  const { sitesApps } = useContent();

  return (
    <>
      <PageHero
        eyebrow="Sites & Apps"
        title="Our digital tools and platforms"
        subtitle="A directory of websites and applications built and maintained by SAIC and our programs."
      />

      <section className="bg-white py-4 pb-24">
        <div className="container-page">
          {sitesApps.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-ink-200 py-20 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-ink-50 text-ink-400">
                <LayoutGrid className="h-6 w-6" />
              </span>
              <p className="text-ink-400">No sites or apps have been added yet.</p>
            </div>
          ) : (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {sitesApps.map((item, i) => (
                <Reveal key={item.id} delay={(i % 3) * 0.08}>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="group flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-card ring-1 ring-ink-900/5 transition-all hover:-translate-y-1 hover:shadow-lg hover:ring-brand-200"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <Media
                        src={item.image}
                        alt={item.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-ink-600 backdrop-blur-sm">
                        <Globe className="h-3.5 w-3.5 text-brand-600" />
                        {hostnameOf(item.url)}
                      </span>
                    </div>
                    <div className="flex flex-1 flex-col gap-2 p-6">
                      <h3 className="text-lg font-bold">{item.title}</h3>
                      <p className="flex-1 text-sm leading-relaxed text-ink-500">{item.description}</p>
                      <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700">
                        Visit site
                        <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </span>
                    </div>
                  </a>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
