import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Image,
  Info,
  BarChart3,
  Heart,
  Briefcase,
  Compass,
  GraduationCap,
  Handshake,
  Users,
  Megaphone,
  Phone,
  PanelBottom,
  Settings,
  Mail,
  LogOut,
  ExternalLink,
  Globe,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { Logo } from "../ui/Logo";

const navGroups: { label: string; items: { to: string; label: string; icon: typeof LayoutDashboard; end?: boolean }[] }[] = [
  {
    label: "Overview",
    items: [{ to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true }],
  },
  {
    label: "Homepage Sections",
    items: [
      { to: "/admin/hero", label: "Hero", icon: Image },
      { to: "/admin/stats", label: "Stats", icon: BarChart3 },
      { to: "/admin/core-values", label: "Core Values", icon: Heart },
      { to: "/admin/services", label: "Services", icon: Briefcase },
      { to: "/admin/about", label: "About", icon: Info },
      { to: "/admin/impact-areas", label: "Impact Areas", icon: Compass },
      { to: "/admin/programs", label: "Programs", icon: GraduationCap },
      { to: "/admin/partners", label: "Partners", icon: Handshake },
      { to: "/admin/cta", label: "Call to Action", icon: Megaphone },
    ],
  },
  {
    label: "Site Content",
    items: [
      { to: "/admin/team", label: "Team", icon: Users },
      { to: "/admin/sites-apps", label: "Sites & Apps", icon: Globe },
      { to: "/admin/contact", label: "Contact Info", icon: Phone },
      { to: "/admin/footer", label: "Footer", icon: PanelBottom },
      { to: "/admin/site", label: "Site Settings", icon: Settings },
      { to: "/admin/messages", label: "Messages", icon: Mail },
    ],
  },
];

export function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen bg-ink-50">
      <aside className="hidden w-72 shrink-0 flex-col border-r border-ink-100 bg-white lg:flex">
        <div className="flex h-20 items-center border-b border-ink-100 px-6">
          <Logo className="h-11" />
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-6">
          {navGroups.map((group) => (
            <div key={group.label} className="mb-6">
              <p className="mb-2 px-3 text-xs font-bold uppercase tracking-wider text-ink-400">
                {group.label}
              </p>
              <div className="flex flex-col gap-1">
                {group.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                        isActive ? "bg-brand-50 text-brand-700" : "text-ink-600 hover:bg-ink-50"
                      }`
                    }
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-ink-100 p-4">
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="mb-2 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-ink-600 hover:bg-ink-50"
          >
            <ExternalLink className="h-4 w-4" /> View live site
          </a>
          <button
            onClick={() => {
              logout();
              navigate("/admin/login");
            }}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4" /> Log out
          </button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex h-20 items-center justify-between border-b border-ink-100 bg-white px-6 lg:px-10">
          <p className="text-sm text-ink-400">Signed in as</p>
          <p className="text-sm font-semibold text-ink-800">{user?.email}</p>
        </header>
        <main className="flex-1 p-6 lg:p-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
