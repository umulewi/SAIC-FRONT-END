import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2, Lock, Mail, LayoutDashboard, Newspaper, ShieldCheck } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../../components/ui/Button";
import { Logo } from "../../components/ui/Logo";

const features = [
  { icon: LayoutDashboard, text: "Edit every section of your site — no code required" },
  { icon: Newspaper, text: "Publish stories, job openings, and manage applications" },
  { icon: ShieldCheck, text: "Changes go live instantly, secured behind your login" },
];

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
      navigate("/admin");
    } catch {
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-ink-950 lg:flex lg:flex-col lg:justify-between lg:p-14">
        <div className="pointer-events-none absolute -top-40 left-1/3 h-96 w-96 rounded-full bg-brand-700/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 right-0 h-80 w-80 rounded-full bg-earth-600/15 blur-3xl" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.15] [background-image:radial-gradient(white_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_20%_0%,black_0%,transparent_70%)]"
          aria-hidden="true"
        />

        <Logo className="relative h-12 brightness-0 invert" />

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative flex flex-col gap-8"
        >
          <h2 className="max-w-md text-balance text-3xl font-bold leading-tight text-white">
            Manage every corner of your website from one place.
          </h2>
          <div className="flex flex-col gap-4">
            {features.map((f) => (
              <div key={f.text} className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-brand-300 ring-1 ring-white/10">
                  <f.icon className="h-4 w-4" />
                </span>
                <p className="pt-1.5 text-sm leading-relaxed text-ink-300">{f.text}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <p className="relative text-xs text-ink-500">
          © {new Date().getFullYear()} Stewardship Agribusiness Incubation Center
        </p>
      </div>

      <div className="flex flex-col items-center justify-center bg-white px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-sm"
        >
          <div className="flex flex-col items-center gap-3 text-center lg:hidden">
            <Logo className="h-14" />
          </div>
          <div className="mt-6 text-center lg:mt-0 lg:text-left">
            <h1 className="text-2xl font-bold text-ink-950">Welcome back</h1>
            <p className="mt-1.5 text-sm text-ink-500">Sign in to manage your website content.</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-ink-800">Email</label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@stewardincubation.com"
                  className="w-full rounded-xl border border-ink-200 py-2.5 pl-11 pr-4 text-sm outline-none transition-shadow focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-ink-800">Password</label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-ink-200 py-2.5 pl-11 pr-11 text-sm outline-none transition-shadow focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm font-medium text-red-600"
              >
                {error}
              </motion.p>
            )}

            <Button type="submit" size="lg" className="mt-2 w-full justify-center" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign in"}
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
