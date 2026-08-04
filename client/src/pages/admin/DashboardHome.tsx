import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Briefcase, Users, Handshake, Mail, Globe, ArrowUpRight } from "lucide-react";
import { getCollection, getMessages } from "../../lib/api";

export function DashboardHome() {
  const [counts, setCounts] = useState({ services: 0, team: 0, partners: 0, messages: 0, sitesApps: 0 });

  useEffect(() => {
    Promise.all([
      getCollection("services"),
      getCollection("team"),
      getCollection("partners"),
      getMessages(),
      getCollection("sitesApps"),
    ]).then(([services, team, partners, messages, sitesApps]) => {
      setCounts({
        services: services.length,
        team: team.length,
        partners: partners.length,
        messages: messages.length,
        sitesApps: sitesApps.length,
      });
    });
  }, []);

  const cards = [
    { label: "Services", value: counts.services, icon: Briefcase, to: "/admin/services" },
    { label: "Team Members", value: counts.team, icon: Users, to: "/admin/team" },
    { label: "Sites & Apps", value: counts.sitesApps, icon: Globe, to: "/admin/sites-apps" },
    { label: "Partners", value: counts.partners, icon: Handshake, to: "/admin/partners" },
    { label: "Messages", value: counts.messages, icon: Mail, to: "/admin/messages" },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-ink-950">Welcome back</h1>
        <p className="mt-1 text-ink-500">Manage every section of your public website from here.</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {cards.map((card) => (
          <Link
            key={card.label}
            to={card.to}
            className="group flex flex-col gap-4 rounded-2xl border border-ink-100 bg-white p-6 transition-all hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-card"
          >
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
        ))}
      </div>

      <div className="rounded-2xl border border-ink-100 bg-white p-6">
        <h2 className="font-bold text-ink-950">Getting started</h2>
        <ul className="mt-3 flex flex-col gap-2 text-sm text-ink-500">
          <li>• Edit the Hero, About, and Call to Action sections to update your homepage story.</li>
          <li>• Add or reorder Services, Programs, and Impact Areas using the section pages in the sidebar.</li>
          <li>• Upload real photos anywhere you see an image field — placeholders update instantly.</li>
          <li>• Review incoming Messages from your Contact page visitors.</li>
        </ul>
      </div>
    </div>
  );
}
