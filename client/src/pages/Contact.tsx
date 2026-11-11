import { useState } from "react";
import type { FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Mail, Phone, MapPin, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { useContent } from "../context/ContentContext";
import { PageHero } from "../components/sections/PageHero";
import { Reveal } from "../components/ui/Reveal";
import { Button } from "../components/ui/Button";
import { api } from "../lib/api";

const infoCards = (contact: { email: string; phone: string; address: string }) => [
  { icon: Mail, label: "Email", value: contact.email, href: `mailto:${contact.email}` },
  { icon: Phone, label: "Phone", value: contact.phone, href: `tel:${contact.phone.replace(/\s/g, "")}` },
  { icon: MapPin, label: "Address", value: contact.address, href: undefined },
];

export function Contact() {
  const { sections } = useContent();
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  if (!sections) return null;
  const { contact } = sections;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      await api.post("/contact", form);
      setStatus("success");
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch {
      setStatus("error");
    }
  };

  return (
    <>
      <PageHero
        eyebrow="Contact Us"
        title="Let's talk about your agribusiness"
        subtitle="Use this page to reach the team, ask about programs, start a partnership conversation, or request support for your agribusiness plans, projects, or next steps."
      />

      <section className="bg-white py-4 pb-24">
        <div className="container-page grid gap-12 lg:grid-cols-[1fr_1.3fr]">
          <Reveal className="flex flex-col gap-4">
            {infoCards(contact).map((card) => {
              const inner = (
                <>
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700 transition-colors group-hover:bg-brand-600 group-hover:text-white">
                    <card.icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-ink-950">{card.label}</p>
                    <p className="text-ink-500 transition-colors group-hover:text-brand-700">{card.value}</p>
                  </div>
                </>
              );
              return card.href ? (
                <a
                  key={card.label}
                  href={card.href}
                  className="group flex items-start gap-4 rounded-2xl border border-ink-100 p-5 transition-all hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-card"
                >
                  {inner}
                </a>
              ) : (
                <div
                  key={card.label}
                  className="group flex items-start gap-4 rounded-2xl border border-ink-100 p-5 transition-all hover:border-brand-200 hover:shadow-card"
                >
                  {inner}
                </div>
              );
            })}
            {contact.mapEmbedUrl && (
              <div className="overflow-hidden rounded-2xl border border-ink-100">
                <iframe
                  src={contact.mapEmbedUrl}
                  className="h-56 w-full grayscale-[20%]"
                  style={{ border: 0 }}
                  loading="lazy"
                  title="Map"
                />
              </div>
            )}
          </Reveal>

          <Reveal delay={0.1}>
            <div className="relative overflow-hidden rounded-3xl border border-ink-100 p-8 shadow-card">
              <AnimatePresence mode="wait">
                {status === "success" ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center gap-4 py-10 text-center"
                  >
                    <motion.span
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 260, damping: 16, delay: 0.1 }}
                      className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 text-brand-600"
                    >
                      <CheckCircle2 className="h-8 w-8" />
                    </motion.span>
                    <h3 className="text-xl font-bold text-ink-950">Message sent!</h3>
                    <p className="max-w-sm text-ink-500">
                      Thanks for reaching out — our team will get back to you within 1–2 business days.
                    </p>
                    <Button variant="outline" onClick={() => setStatus("idle")}>
                      Send another message
                    </Button>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onSubmit={handleSubmit}
                  >
                    <div className="grid gap-5 sm:grid-cols-2">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-ink-800">Full name</label>
                        <input
                          required
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          className="rounded-xl border border-ink-200 px-4 py-2.5 outline-none transition-shadow focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-ink-800">Email</label>
                        <input
                          required
                          type="email"
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          className="rounded-xl border border-ink-200 px-4 py-2.5 outline-none transition-shadow focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                        />
                      </div>
                    </div>
                    <div className="mt-5 flex flex-col gap-1.5">
                      <label className="text-sm font-semibold text-ink-800">Subject</label>
                      <input
                        required
                        value={form.subject}
                        onChange={(e) => setForm({ ...form, subject: e.target.value })}
                        className="rounded-xl border border-ink-200 px-4 py-2.5 outline-none transition-shadow focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                      />
                    </div>
                    <div className="mt-5 flex flex-col gap-1.5">
                      <label className="text-sm font-semibold text-ink-800">Message</label>
                      <textarea
                        required
                        rows={5}
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                        className="resize-none rounded-xl border border-ink-200 px-4 py-2.5 outline-none transition-shadow focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                      />
                    </div>

                    <div className="mt-6 flex items-center gap-4">
                      <Button type="submit" size="lg" disabled={status === "loading"}>
                        {status === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send Message"}
                      </Button>
                      {status === "error" && (
                        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-red-600">
                          <AlertCircle className="h-4 w-4" /> Something went wrong. Please try again.
                        </span>
                      )}
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
