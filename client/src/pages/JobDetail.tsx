import { useRef, useState } from "react";
import type { FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Briefcase, CheckCircle2, FileText, Loader2, MapPin, Upload, X } from "lucide-react";
import { useContent } from "../context/ContentContext";
import { Reveal } from "../components/ui/Reveal";
import { Button } from "../components/ui/Button";
import { submitApplication, uploadResume } from "../lib/api";

export function JobDetail() {
  const { id } = useParams();
  const { jobOpenings, loading } = useContent();
  const job = jobOpenings.find((j) => j.id === Number(id));

  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeUrl, setResumeUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (loading) return null;

  if (!job) {
    return (
      <section className="container-page flex flex-col items-center gap-5 py-28 text-center">
        <h1 className="text-2xl font-bold">Role not found</h1>
        <p className="text-ink-500">This opening may have closed or the link is incorrect.</p>
        <Button href="/career" withArrow>
          Back to Careers
        </Button>
      </section>
    );
  }

  const handleFile = async (file: File) => {
    setUploadError(null);
    setUploading(true);
    try {
      const url = await uploadResume(file);
      setResumeUrl(url);
      setResumeFile(file);
    } catch {
      setUploadError("Couldn't upload that file. Please use a PDF or Word document under 10MB.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      await submitApplication({
        jobId: job.id,
        jobTitle: job.title,
        name: form.name,
        email: form.email,
        phone: form.phone,
        message: form.message,
        resumeUrl,
      });
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  return (
    <article>
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50/70 via-white to-white pb-4 pt-20 lg:pt-28">
        <div className="pointer-events-none absolute -top-24 right-0 h-72 w-72 rounded-full bg-brand-200/40 blur-3xl" />
        <div className="container-page relative">
          <Reveal>
            <Link
              to="/career"
              className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-500 transition-colors hover:text-brand-700"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Careers
            </Link>
            <span className="inline-flex items-center gap-2 rounded-full bg-brand-100 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-brand-700">
              {job.type}
            </span>
            <h1 className="mt-5 max-w-2xl text-balance text-3xl font-bold leading-[1.15] sm:text-4xl lg:text-5xl">
              {job.title}
            </h1>
            <p className="mt-4 inline-flex items-center gap-1.5 text-ink-500">
              <MapPin className="h-4 w-4" /> {job.location}
            </p>
          </Reveal>
        </div>
      </section>

      <section className="bg-white py-12 pb-24">
        <div className="container-page grid gap-12 lg:grid-cols-[1.2fr_1fr]">
          <Reveal>
            <div className="flex flex-col gap-5 text-base leading-relaxed text-ink-600">
              {job.description
                .split(/\n+/)
                .filter((p) => p.trim())
                .map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="relative overflow-hidden rounded-3xl border border-ink-100 p-7 shadow-card">
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
                    <h3 className="text-xl font-bold text-ink-950">Application sent!</h3>
                    <p className="max-w-sm text-ink-500">
                      Thanks for applying to {job.title} — our team will review your application and be in touch.
                    </p>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onSubmit={handleSubmit}
                    className="flex flex-col gap-5"
                  >
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-brand-600" />
                      <h2 className="font-bold text-ink-950">Apply for this role</h2>
                    </div>

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
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-semibold text-ink-800">Phone</label>
                      <input
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        className="rounded-xl border border-ink-200 px-4 py-2.5 outline-none transition-shadow focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-semibold text-ink-800">Cover message</label>
                      <textarea
                        rows={3}
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                        placeholder="Tell us why you're a good fit…"
                        className="resize-none rounded-xl border border-ink-200 px-4 py-2.5 outline-none transition-shadow focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-semibold text-ink-800">Resume / CV</label>
                      {resumeFile ? (
                        <div className="flex items-center justify-between rounded-xl border border-brand-200 bg-brand-50/50 px-4 py-2.5">
                          <span className="flex min-w-0 items-center gap-2 text-sm text-ink-700">
                            <FileText className="h-4 w-4 shrink-0 text-brand-600" />
                            <span className="truncate">{resumeFile.name}</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setResumeFile(null);
                              setResumeUrl("");
                            }}
                            className="shrink-0 text-ink-400 hover:text-red-500"
                            aria-label="Remove file"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploading}
                          className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-ink-200 px-4 py-3 text-sm font-medium text-ink-500 transition-colors hover:border-brand-400 hover:text-brand-700 disabled:opacity-60"
                        >
                          {uploading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Upload className="h-4 w-4" />
                          )}
                          {uploading ? "Uploading…" : "Upload PDF or Word (max 10MB)"}
                        </button>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFile(file);
                          e.target.value = "";
                        }}
                      />
                      {uploadError && <p className="text-xs font-medium text-red-600">{uploadError}</p>}
                    </div>

                    <Button type="submit" size="lg" className="w-full justify-center" disabled={status === "loading" || uploading}>
                      {status === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit Application"}
                    </Button>
                    {status === "error" && (
                      <p className="text-center text-sm font-semibold text-red-600">
                        Something went wrong. Please try again.
                      </p>
                    )}
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </Reveal>
        </div>
      </section>
    </article>
  );
}
