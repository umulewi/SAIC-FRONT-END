import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { useContent } from "../../context/ContentContext";
import { Logo } from "../ui/Logo";

export function PublicLayout() {
  const { loading, error, sections, refresh } = useContent();

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3">
        <Logo className="h-12 animate-pulse" />
        <p className="text-sm text-ink-400">Loading SAIC…</p>
      </div>
    );
  }

  if (error || !sections) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="max-w-sm text-ink-500">
          {error ?? "Something went wrong loading the site."}
        </p>
        <button
          onClick={() => refresh()}
          className="rounded-full bg-brand-600 px-5 py-2 text-sm font-semibold text-white"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 pt-20">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
