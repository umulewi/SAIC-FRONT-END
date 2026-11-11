import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Briefcase,
  Users,
  Handshake,
  Mail,
  Globe,
  Newspaper,
  ClipboardList,
  Inbox,
  ArrowUpRight,
  CheckCircle2,
} from "lucide-react";
import { getApplications, getCollection, getMessages } from "../../lib/api";

interface CardDef {
  label: string;
  value: number;
  icon: typeof Briefcase;
  to: string;
  badge?: number;
}

function StatCard({ card }: { card: CardDef }) {
  return (
    <Link
      to={card.to}
      className="group relative flex flex-col gap-4 rounded-2xl border border-ink-100 bg-white p-6 transition-all hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-card"
    >
      {!!card.badge && (
        <span className="absolute -right-2 -top-2 flex h-6 min-w-6 items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-bold text-white shadow-soft">
          {card.badge}
        </span>
      )}
      <div className="flex items-center justify-between">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
          <card.icon className="h-5 w-5" />
        </span>
        <ArrowUpRight className="h-4 w-4 text-ink-300 transition-colors group-hover:text-brand-600" />
      </div>
      <div>
        <p className="text-2xl font-bold text-ink-950">{card.value}</p>
        <p className="text-sm text-ink-500">{card.label}</p>
      </div>
    </Link>
  );
}

const gettingStarted = [
  "Edit the Hero, About, and Call to Action sections to update your homepage story.",
  "Add or reorder Services, Programs, and Impact Areas from the sidebar.",
  "Publish Stories to populate the Gallery page, and Job Openings to populate Careers.",
  "Upload real photos anywhere you see an image field — placeholders update instantly.",
  "Review incoming Messages and Job Applications from your site's visitors.",
];

export function DashboardHome() {
  const [counts, setCounts] = useState({
    services: 0,
    team: 0,
    partners: 0,
    sitesApps: 0,
    stories: 0,
    jobs: 0,
    messages: 0,
    unreadMessages: 0,
    applications: 0,
    newApplications: 0,
  });

  useEffect(() => {
    Promise.all([
      getCollection("services"),
      getCollection("team"),
      getCollection("partners"),
      getCollection("sitesApps"),
      getCollection("stories"),
      getCollection("jobOpenings"),
      getMessages(),
      getApplications(),
    ]).then(([services, team, partners, sitesApps, stories, jobs, messages, applications]) => {
      setCounts({
        services: services.length,
        team: team.length,
        partners: partners.length,
        sitesApps: sitesApps.length,
        stories: stories.length,
        jobs: jobs.length,
        messages: messages.length,
        unreadMessages: messages.filter((m) => !m.read).length,
        applications: applications.length,
        newApplications: applications.filter((a) => a.status === "new").length,
      });
    });
  }, []);

  const contentCards: CardDef[] = [
    { label: "Services", value: counts.services, icon: Briefcase, to: "/admin/services" },
    { label: "Team Members", value: counts.team, icon: Users, to: "/admin/team" },
    { label: "Sites & Apps", value: counts.sitesApps, icon: Globe, to: "/admin/sites-apps" },
    { label: "Partners", value: counts.partners, icon: Handshake, to: "/admin/partners" },
  ];

  const activityCards: CardDef[] = [
    { label: "Stories", value: counts.stories, icon: Newspaper, to: "/admin/stories" },
    { label: "Job Openings", value: counts.jobs, icon: ClipboardList, to: "/admin/jobs" },
    {
      label: "Applications",
      value: counts.applications,
      icon: Inbox,
      to: "/admin/applications",
      badge: counts.newApplications,
    },
    {
      label: "Messages",
      value: counts.messages,
      icon: Mail,
      to: "/admin/messages",
      badge: counts.unreadMessages,
    },
  ];

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="text-2xl font-bold text-ink-950">Welcome back</h1>
        <p className="mt-1 text-ink-500">Manage every section of your public website from here.</p>
      </div>

      <div>
        <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-ink-400">Content</h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {contentCards.map((card) => (
            <StatCard key={card.label} card={card} />
          ))}
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-ink-400">Stories, Careers & Inbox</h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {activityCards.map((card) => (
            <StatCard key={card.label} card={card} />
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-ink-100 bg-white p-6">
        <h2 className="font-bold text-ink-950">Getting started</h2>
        <ul className="mt-4 flex flex-col gap-3">
          {gettingStarted.map((tip) => (
            <li key={tip} className="flex items-start gap-3 text-sm text-ink-500">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
