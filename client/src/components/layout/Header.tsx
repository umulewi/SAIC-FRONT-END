import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { ArrowUpRight, ChevronDown, Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useContent } from "../../context/ContentContext";
import { publicServices } from "../../lib/services";
import { getMainServiceIcon, getSubServiceIcon } from "../../lib/serviceIcons";
import { Button } from "../ui/Button";
import { Logo } from "../ui/Logo";

export function Header() {
  const { sections } = useContent();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [activeService, setActiveService] = useState(publicServices[0]?.slug ?? "");
  const [mobileService, setMobileService] = useState<number | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setScrolled(window.scrollY > 12);
    setServicesOpen(false);
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!servicesOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setServicesOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [servicesOpen]);

  const nav = sections?.site.nav ?? [];
  const serviceNav = publicServices;
  const activeServiceData = serviceNav.find((service) => service.slug === activeService) ?? serviceNav[0];

  // Only the homepage has a full-bleed dark video hero sitting directly
  // beneath the transparent header — everywhere else has a light background
  // up top, so the header needs light-on-dark styling only in that one case.
  const overDarkHero = location.pathname === "/" && !scrolled;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white/90 shadow-sm backdrop-blur-md" : "bg-transparent"
      }`}
    >
      <div className="container-page flex h-20 items-center justify-between">
        <Link to="/" className="flex items-center">
          <Logo className={`h-12 transition-all duration-300 ${overDarkHero ? "brightness-0 invert" : ""}`} />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {nav.map((item) => (
            item.label === "Services" ? (
              <div key={item.href} className="relative">
                <button
                  type="button"
                  onClick={() => setServicesOpen((value) => !value)}
                  className={`relative flex cursor-pointer items-center gap-1 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                    servicesOpen || location.pathname.startsWith("/services")
                      ? "text-brand-700"
                      : overDarkHero
                        ? "text-white/90 hover:text-white"
                        : "text-ink-600 hover:text-brand-700"
                  }`}
                >
                  {item.label}
                  <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${servicesOpen ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence>
                  {servicesOpen && (
                    <motion.div
                      key="services-backdrop"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="fixed inset-0 top-20 z-40 bg-ink-950/20 backdrop-blur-[2px]"
                      onClick={() => setServicesOpen(false)}
                    />
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {servicesOpen && activeServiceData && (
                    <motion.div
                      key="services-panel"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                      className="fixed inset-x-0 top-20 z-50 overflow-hidden rounded-b-[2rem] bg-white shadow-2xl ring-1 ring-ink-900/5"
                    >
                      <div className="container-page">
                        <div className="flex flex-wrap items-center gap-1 border-b border-ink-100 py-3">
                          {serviceNav.map((service) => {
                            const MainIcon = getMainServiceIcon(service.slug);
                            return (
                              <button
                                key={service.id}
                                type="button"
                                onMouseEnter={() => setActiveService(service.slug)}
                                onClick={() => setActiveService(service.slug)}
                                className={`relative flex cursor-pointer items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-semibold transition-colors ${
                                  activeService === service.slug ? "text-brand-700" : "text-ink-600 hover:text-brand-700"
                                }`}
                              >
                                {activeService === service.slug && (
                                  <motion.span
                                    layoutId="services-tab-active"
                                    className="absolute inset-0 -z-10 rounded-full bg-brand-50"
                                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                                  />
                                )}
                                <MainIcon className="h-4 w-4" />
                                {service.title}
                                <ChevronDown
                                  className={`h-3.5 w-3.5 transition-transform duration-300 ${
                                    activeService === service.slug ? "rotate-180" : ""
                                  }`}
                                />
                              </button>
                            );
                          })}
                        </div>

                        <AnimatePresence mode="wait">
                          <motion.div
                            key={activeServiceData.slug}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{ duration: 0.18 }}
                          >
                            <div className="grid gap-x-10 gap-y-1 py-6 lg:grid-cols-3">
                              {activeServiceData.subServices.map((sub) => {
                                const SubIcon = getSubServiceIcon(sub.slug);
                                return (
                                  <Link
                                    key={sub.slug}
                                    to={`/services/${activeServiceData.slug}/${sub.slug}`}
                                    onClick={() => setServicesOpen(false)}
                                    className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-600 transition-colors hover:bg-brand-50 hover:text-brand-700"
                                  >
                                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-ink-50 text-ink-500 transition-colors group-hover:bg-white group-hover:text-brand-700">
                                      <SubIcon className="h-4 w-4" />
                                    </span>
                                    <span className="flex-1">{sub.title}</span>
                                    <ArrowUpRight className="h-3.5 w-3.5 shrink-0 -translate-x-1 text-brand-600 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100" />
                                  </Link>
                                );
                              })}
                            </div>
                            <div className="flex flex-col gap-3 border-t border-ink-100 bg-ink-50/50 px-3 py-5 sm:flex-row sm:items-center sm:justify-between">
                              <p className="max-w-xl text-sm leading-relaxed text-ink-500">
                                {activeServiceData.description}
                              </p>
                              <Link
                                to={`/services/${activeServiceData.slug}`}
                                onClick={() => setServicesOpen(false)}
                                className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap text-sm font-bold text-brand-700 transition-colors hover:text-brand-800"
                              >
                                View all {activeServiceData.title}
                                <ArrowUpRight className="h-4 w-4" />
                              </Link>
                            </div>
                          </motion.div>
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <NavLink
                key={item.href}
                to={item.href}
                className={({ isActive }) =>
                  `relative rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                    isActive
                      ? "text-brand-700"
                      : overDarkHero
                        ? "text-white/90 hover:text-white"
                        : "text-ink-600 hover:text-brand-700"
                  }`
                }
                end={item.href === "/"}
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.span
                        layoutId="nav-active-pill"
                        className="absolute inset-0 -z-10 rounded-full bg-brand-50"
                        transition={{ type: "spring", stiffness: 380, damping: 32 }}
                      />
                    )}
                    {item.label}
                  </>
                )}
              </NavLink>
            )
          ))}
        </nav>

        <div className="hidden lg:block">
          <Button href="/contact" size="md">
            Get in Touch
          </Button>
        </div>

        <button
          className={`flex h-10 w-10 cursor-pointer items-center justify-center rounded-full transition-colors lg:hidden ${
            overDarkHero ? "text-white" : "text-ink-800"
          }`}
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden border-t border-ink-100 bg-white lg:hidden"
          >
            <div className="container-page flex max-h-[calc(100vh-5rem)] flex-col gap-1 overflow-y-auto py-4">
              {nav.map((item) => (
                item.label === "Services" ? (
                  <div key={item.href}>
                    <button
                      type="button"
                      onClick={() => setServicesOpen((value) => !value)}
                      className="flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-2.5 text-left text-base font-semibold text-ink-700"
                    >
                      Services
                      <ChevronDown className={`h-4 w-4 transition-transform ${servicesOpen ? "rotate-180" : ""}`} />
                    </button>
                    {servicesOpen && (
                      <div className="ml-3 border-l border-brand-200 pl-3">
                        {serviceNav.map((service) => (
                          <div key={service.id}>
                            <button
                              type="button"
                              onClick={() => setMobileService(mobileService === service.id ? null : service.id)}
                              className="flex w-full cursor-pointer items-center justify-between py-2 text-left text-sm font-semibold text-ink-700"
                            >
                              {service.title}
                              <ChevronDown className={`h-4 w-4 transition-transform ${mobileService === service.id ? "rotate-180" : ""}`} />
                            </button>
                            {mobileService === service.id && (
                              <div className="flex flex-col pb-2 pl-3">
                                {service.subServices.map((sub) => (
                                  <Link
                                    key={sub.slug}
                                    to={`/services/${service.slug}/${sub.slug}`}
                                    onClick={() => setOpen(false)}
                                    className="block py-1.5 text-sm text-ink-500"
                                  >
                                    {sub.title}
                                  </Link>
                                ))}
                                <Link
                                  to={`/services/${service.slug}`}
                                  onClick={() => setOpen(false)}
                                  className="block py-1.5 text-sm font-semibold text-brand-700"
                                >
                                  View all {service.title}
                                </Link>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <NavLink
                    key={item.href}
                    to={item.href}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      `rounded-lg px-3 py-2.5 text-base font-semibold ${
                        isActive ? "bg-brand-50 text-brand-700" : "text-ink-700"
                      }`
                    }
                    end={item.href === "/"}
                  >
                    {item.label}
                  </NavLink>
                )
              ))}
              <div className="mt-2">
                <Button href="/contact" size="md" className="w-full">
                  Get in Touch
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
