import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
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
  Newspaper,
  ClipboardList,
  Inbox,
  Menu,
  X,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { Logo } from "../ui/Logo";
import { InitialsAvatar } from "../ui/InitialsAvatar";

type NavItem = { to: string; label: string; icon: typeof LayoutDashboard; end?: boolean };

const navGroups: { label: string; items: NavItem[] }[] = [
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
    ],
  },
  {
    label: "Stories & Careers",
    items: [
      { to: "/admin/stories", label: "Stories", icon: Newspaper },
      { to: "/admin/jobs", label: "Job Openings", icon: ClipboardList },
      { to: "/admin/applications", label: "Applications", icon: Inbox },
    ],
  },
  {
    label: "Inbox",
    items: [{ to: "/admin/messages", label: "Messages", icon: Mail }],
  },
];

const flatNav = navGroups.flatMap((g) => g.items);

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex-1 overflow-y-auto px-4 py-6">
      {navGroups.map((group) => (
        <div key={group.label} className="mb-6">
          <p className="mb-2 px-3 text-xs font-bold uppercase tracking-wider text-ink-400">{group.label}</p>
          <div className="flex flex-col gap-1">
            {group.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={onNavigate}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl border-l-[3px] py-2.5 pl-[9px] pr-3 text-sm font-semibold transition-colors ${
                    isActive
                      ? "border-brand-600 bg-brand-50 text-brand-700"
                      : "border-transparent text-ink-600 hover:bg-ink-50"
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
  );
}

function SidebarFooter({ onLogout }: { onLogout: () => void }) {
  return (
    <div className="border-t border-ink-100 p-4">
      <a
        href="/"
        target="_blank"
        rel="noreferrer"
        className="mb-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-ink-600 hover:bg-ink-50"
      >
        <ExternalLink className="h-4 w-4" /> View live site
      </a>
      <button
        onClick={onLogout}
        className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50"
      >
        <LogOut className="h-4 w-4" /> Log out
      </button>
    </div>
  );
}

export function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem("saic_sidebar_collapsed") === "1");

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    localStorage.setItem("saic_sidebar_collapsed", collapsed ? "1" : "0");
  }, [collapsed]);

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  const currentPage =
    flatNav.find((item) => (item.end ? location.pathname === item.to : location.pathname.startsWith(item.to))) ??
    flatNav[0];

  return (
    <div className="flex min-h-screen bg-ink-50">
      <aside
        className={`hidden shrink-0 overflow-hidden border-r border-ink-100 bg-white transition-[width] duration-300 ease-in-out lg:flex ${
          collapsed ? "w-0 border-r-0" : "w-72"
        }`}
      >
        <div className="flex h-full w-72 flex-col">
          <div className="flex h-20 items-center border-b border-ink-100 px-6">
            <Logo className="h-11" />
          </div>
          <SidebarNav />
          <SidebarFooter onLogout={handleLogout} />
        </div>
      </aside>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-ink-950/50 lg:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-white shadow-xl lg:hidden"
            >
              <div className="flex h-20 items-center justify-between border-b border-ink-100 px-6">
                <Logo className="h-11" />
                <button
                  onClick={() => setMobileOpen(false)}
                  className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-ink-500 hover:bg-ink-50"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <SidebarNav onNavigate={() => setMobileOpen(false)} />
              <SidebarFooter onLogout={handleLogout} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex flex-1 flex-col">
        <header className="flex h-20 items-center justify-between gap-4 border-b border-ink-100 bg-white px-4 sm:px-6 lg:px-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-lg text-ink-600 hover:bg-ink-50 lg:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <button
              onClick={() => setCollapsed((v) => !v)}
              className="hidden h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-lg text-ink-600 hover:bg-ink-50 lg:flex"
              aria-label={collapsed ? "Show sidebar" : "Hide sidebar"}
              title={collapsed ? "Show sidebar" : "Hide sidebar"}
            >
              {collapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
            </button>
            {collapsed && (
              <>
                <Logo className="hidden h-8 lg:block" />
                <div className="hidden h-8 w-px bg-ink-100 lg:block" />
              </>
            )}
            <div>
              <p className="text-xs font-medium text-ink-400">Dashboard</p>
              <h1 className="font-display text-lg font-bold text-ink-950">{currentPage.label}</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-ink-800">{user?.email}</p>
              <p className="text-xs text-ink-400">Administrator</p>
            </div>
            <InitialsAvatar name={user?.email?.split("@")[0] ?? "Admin"} className="h-10 w-10 rounded-full" />
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
