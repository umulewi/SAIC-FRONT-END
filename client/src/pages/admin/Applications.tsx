import { useEffect, useMemo, useState } from "react";
import { FileText, Mail, MailOpen, Phone, Trash2 } from "lucide-react";
import type { Application } from "../../types";
import { deleteApplication, getApplications, resolveAssetUrl, updateApplicationStatus } from "../../lib/api";
import { useConfirm } from "../../context/ConfirmContext";

export function Applications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [jobFilter, setJobFilter] = useState("All");
  const confirm = useConfirm();

  const load = async () => {
    setLoading(true);
    setApplications(await getApplications());
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const jobTitles = useMemo(
    () => ["All", ...Array.from(new Set(applications.map((a) => a.jobTitle)))],
    [applications]
  );
  const filtered = useMemo(
    () => (jobFilter === "All" ? applications : applications.filter((a) => a.jobTitle === jobFilter)),
    [applications, jobFilter]
  );

  const handleOpen = async (app: Application) => {
    if (app.status === "new") {
      await updateApplicationStatus(app.id, "reviewed");
      setApplications((prev) => prev.map((a) => (a.id === app.id ? { ...a, status: "reviewed" } : a)));
    }
  };

  const handleDelete = async (id: number, name: string) => {
    const ok = await confirm({
      title: `Delete ${name}'s application?`,
      description: "This application and its resume link will be permanently removed. This cannot be undone.",
      confirmLabel: "Delete",
    });
    if (!ok) return;
    await deleteApplication(id);
    setApplications((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-ink-950">Job Applications</h2>
          <p className="mt-1 text-sm text-ink-500">Submissions from your Careers page application forms.</p>
        </div>
        {jobTitles.length > 1 && (
          <select
            value={jobFilter}
            onChange={(e) => setJobFilter(e.target.value)}
            className="rounded-xl border border-ink-200 px-3.5 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          >
            {jobTitles.map((title) => (
              <option key={title} value={title}>
                {title}
              </option>
            ))}
          </select>
        )}
      </div>

      {loading ? (
        <p className="text-sm text-ink-400">Loading…</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-ink-400">No applications yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((app) => (
            <details
              key={app.id}
              onToggle={(e) => e.currentTarget.open && handleOpen(app)}
              className="group rounded-2xl border border-ink-100 bg-white p-5 open:border-brand-200"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  {app.status === "new" ? (
                    <Mail className="h-4 w-4 shrink-0 text-brand-600" />
                  ) : (
                    <MailOpen className="h-4 w-4 shrink-0 text-ink-300" />
                  )}
                  <div className="min-w-0">
                    <p
                      className={`truncate ${
                        app.status === "new" ? "font-bold text-ink-950" : "font-medium text-ink-700"
                      }`}
                    >
                      {app.name}
                    </p>
                    <p className="truncate text-xs text-ink-400">
                      Applied for <span className="font-medium text-ink-600">{app.jobTitle}</span> · {app.email}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="text-xs text-ink-400">{new Date(app.createdAt).toLocaleDateString()}</span>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleDelete(app.id, app.name);
                    }}
                    className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-red-500 hover:bg-red-50"
                    aria-label="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </summary>

              <div className="mt-4 flex flex-col gap-3 border-t border-ink-100 pt-4 text-sm">
                {app.phone && (
                  <p className="flex items-center gap-2 text-ink-600">
                    <Phone className="h-4 w-4 text-ink-400" /> {app.phone}
                  </p>
                )}
                {app.message && <p className="whitespace-pre-wrap leading-relaxed text-ink-600">{app.message}</p>}
                {app.resumeUrl && (
                  <a
                    href={resolveAssetUrl(app.resumeUrl)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex w-fit items-center gap-1.5 rounded-lg bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-100"
                  >
                    <FileText className="h-3.5 w-3.5" /> View resume
                  </a>
                )}
              </div>
            </details>
          ))}
        </div>
      )}
    </div>
  );
}
