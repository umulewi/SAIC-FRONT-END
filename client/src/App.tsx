import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ContentProvider } from "./context/ContentContext";
import { PublicLayout } from "./components/layout/PublicLayout";
import { ProtectedRoute } from "./components/admin/ProtectedRoute";
import { Logo } from "./components/ui/Logo";

import { Home } from "./pages/Home";
import { About } from "./pages/About";
import { Services } from "./pages/Services";
import { SitesApps } from "./pages/SitesApps";
import { Team } from "./pages/Team";
import { Gallery } from "./pages/Gallery";
import { Career } from "./pages/Career";
import { Contact } from "./pages/Contact";
import { NotFound } from "./pages/NotFound";
import { ScrollToTop } from "./components/ui/ScrollToTop";
import { ScrollProgress } from "./components/ui/ScrollProgress";

const AdminLayout = lazy(() =>
  import("./components/layout/AdminLayout").then((m) => ({ default: m.AdminLayout }))
);
const Login = lazy(() => import("./pages/admin/Login").then((m) => ({ default: m.Login })));
const DashboardHome = lazy(() =>
  import("./pages/admin/DashboardHome").then((m) => ({ default: m.DashboardHome }))
);
const HeroEditor = lazy(() => import("./pages/admin/HeroEditor").then((m) => ({ default: m.HeroEditor })));
const AboutEditor = lazy(() => import("./pages/admin/AboutEditor").then((m) => ({ default: m.AboutEditor })));
const CtaEditor = lazy(() => import("./pages/admin/CtaEditor").then((m) => ({ default: m.CtaEditor })));
const ContactEditor = lazy(() =>
  import("./pages/admin/ContactEditor").then((m) => ({ default: m.ContactEditor }))
);
const FooterEditor = lazy(() =>
  import("./pages/admin/FooterEditor").then((m) => ({ default: m.FooterEditor }))
);
const SiteEditor = lazy(() => import("./pages/admin/SiteEditor").then((m) => ({ default: m.SiteEditor })));
const StatsEditor = lazy(() => import("./pages/admin/StatsEditor").then((m) => ({ default: m.StatsEditor })));
const CoreValuesEditor = lazy(() =>
  import("./pages/admin/CoreValuesEditor").then((m) => ({ default: m.CoreValuesEditor }))
);
const ServicesEditor = lazy(() =>
  import("./pages/admin/ServicesEditor").then((m) => ({ default: m.ServicesEditor }))
);
const ImpactAreasEditor = lazy(() =>
  import("./pages/admin/ImpactAreasEditor").then((m) => ({ default: m.ImpactAreasEditor }))
);
const ProgramsEditor = lazy(() =>
  import("./pages/admin/ProgramsEditor").then((m) => ({ default: m.ProgramsEditor }))
);
const PartnersEditor = lazy(() =>
  import("./pages/admin/PartnersEditor").then((m) => ({ default: m.PartnersEditor }))
);
const TeamEditor = lazy(() => import("./pages/admin/TeamEditor").then((m) => ({ default: m.TeamEditor })));
const SitesAppsEditor = lazy(() =>
  import("./pages/admin/SitesAppsEditor").then((m) => ({ default: m.SitesAppsEditor }))
);
const Messages = lazy(() => import("./pages/admin/Messages").then((m) => ({ default: m.Messages })));

function AdminFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-50">
      <Logo className="h-12 animate-pulse" />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ScrollProgress />
        <ScrollToTop />
        <Routes>
          <Route
            path="/admin/login"
            element={
              <Suspense fallback={<AdminFallback />}>
                <Login />
              </Suspense>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <Suspense fallback={<AdminFallback />}>
                  <AdminLayout />
                </Suspense>
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardHome />} />
            <Route path="hero" element={<HeroEditor />} />
            <Route path="about" element={<AboutEditor />} />
            <Route path="cta" element={<CtaEditor />} />
            <Route path="contact" element={<ContactEditor />} />
            <Route path="footer" element={<FooterEditor />} />
            <Route path="site" element={<SiteEditor />} />
            <Route path="stats" element={<StatsEditor />} />
            <Route path="core-values" element={<CoreValuesEditor />} />
            <Route path="services" element={<ServicesEditor />} />
            <Route path="impact-areas" element={<ImpactAreasEditor />} />
            <Route path="programs" element={<ProgramsEditor />} />
            <Route path="partners" element={<PartnersEditor />} />
            <Route path="team" element={<TeamEditor />} />
            <Route path="sites-apps" element={<SitesAppsEditor />} />
            <Route path="messages" element={<Messages />} />
          </Route>

          <Route
            element={
              <ContentProvider>
                <PublicLayout />
              </ContentProvider>
            }
          >
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/services" element={<Services />} />
            <Route path="/sites-apps" element={<SitesApps />} />
            <Route path="/team" element={<Team />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/career" element={<Career />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
