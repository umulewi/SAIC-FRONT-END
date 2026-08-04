import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, ArrowUp, ChevronRight } from "lucide-react";
import { useContent } from "../../context/ContentContext";
import { FacebookIcon, TwitterIcon, InstagramIcon, YoutubeIcon } from "../ui/SocialIcons";
import { Logo } from "../ui/Logo";

const socialIcons: Record<string, typeof FacebookIcon> = {
  facebook: FacebookIcon,
  twitter: TwitterIcon,
  instagram: InstagramIcon,
  youtube: YoutubeIcon,
};

function FooterLinkList({ links }: { links: { label: string; href: string }[] }) {
  return (
    <ul className="flex flex-col gap-3 text-sm">
      {links.map((link) => (
        <li key={link.href}>
          <Link
            to={link.href}
            className="group inline-flex items-center gap-1 text-ink-400 transition-colors hover:text-brand-300"
          >
            <ChevronRight className="h-3.5 w-3.5 -translate-x-1.5 text-brand-500 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100" />
            <span className="transition-transform duration-200 group-hover:translate-x-0.5">
              {link.label}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function SectionHeading({ children }: { children: ReactNode }) {
  return (
    <h4 className="mb-5 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-white">
      <span className="h-3.5 w-1 rounded-full bg-brand-500" />
      {children}
    </h4>
  );
}

export function Footer() {
  const { sections } = useContent();
  if (!sections) return null;

  const { footer, contact, site } = sections;

  return (
    <footer className="relative overflow-hidden bg-ink-950 text-ink-200">
      <div className="pointer-events-none absolute -top-40 left-1/4 h-96 w-96 rounded-full bg-brand-700/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 right-0 h-80 w-80 rounded-full bg-earth-600/10 blur-3xl" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.15] [background-image:radial-gradient(white_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_20%_0%,black_0%,transparent_70%)]"
        aria-hidden="true"
      />

      <div className="container-page relative grid gap-12 py-20 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        <div className="flex flex-col gap-5">
          <Link to="/" className="flex w-fit items-center">
            <Logo className="h-12 brightness-0 invert" />
          </Link>
          <p className="max-w-sm text-sm leading-relaxed text-ink-400">{footer.about}</p>
          <div className="flex gap-3 pt-1">
            {Object.entries(site.social).map(([key, url]) => {
              const IconCmp = socialIcons[key];
              if (!IconCmp) return null;
              return (
                <a
                  key={key}
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-ink-300 ring-1 ring-white/10 transition-all hover:-translate-y-0.5 hover:bg-brand-600 hover:text-white hover:ring-brand-600"
                  aria-label={key}
                >
                  <IconCmp className="h-4 w-4" />
                </a>
              );
            })}
          </div>
        </div>

        <div>
          <SectionHeading>Company</SectionHeading>
          <FooterLinkList links={footer.companyLinks} />
        </div>

        <div>
          <SectionHeading>Resources</SectionHeading>
          <FooterLinkList links={footer.resourceLinks} />
        </div>

        <div>
          <SectionHeading>Contact</SectionHeading>
          <ul className="flex flex-col gap-4 text-sm text-ink-400">
            <li>
              <a href={`mailto:${contact.email}`} className="group flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/5 text-brand-400 ring-1 ring-white/10 transition-colors group-hover:bg-brand-600 group-hover:text-white group-hover:ring-brand-600">
                  <Mail className="h-4 w-4" />
                </span>
                <span className="pt-2 transition-colors group-hover:text-brand-300">{contact.email}</span>
              </a>
            </li>
            <li>
              <a href={`tel:${contact.phone.replace(/\s/g, "")}`} className="group flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/5 text-brand-400 ring-1 ring-white/10 transition-colors group-hover:bg-brand-600 group-hover:text-white group-hover:ring-brand-600">
                  <Phone className="h-4 w-4" />
                </span>
                <span className="pt-2 transition-colors group-hover:text-brand-300">{contact.phone}</span>
              </a>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/5 text-brand-400 ring-1 ring-white/10">
                <MapPin className="h-4 w-4" />
              </span>
              <span className="pt-2">{contact.address}</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="relative border-t border-white/10">
        <div className="container-page flex flex-col items-center justify-between gap-3 py-6 text-xs text-ink-500 sm:flex-row">
          <p>{footer.copyright}</p>
          <div className="flex items-center gap-5">
            
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="flex items-center gap-1.5 transition-colors hover:text-brand-300"
              aria-label="Back to top"
            >
              Back to top
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/5 ring-1 ring-white/10">
                <ArrowUp className="h-3 w-3" />
              </span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
