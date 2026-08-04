import { Router } from "express";
import type { RowDataPacket, ResultSetHeader } from "mysql2";
import { pool } from "../db/index.js";
import { requireAuth } from "../middleware/auth.js";

export const applicationsRouter = Router();

interface ApplicationRow extends RowDataPacket {
  id: number;
  job_id: number;
  job_title: string;
  name: string;
  email: string;
  phone: string | null;
  message: string | null;
  resume_url: string | null;
  status: string;
  created_at: string;
}

function serialize(row: ApplicationRow) {
  return {
    id: row.id,
    jobId: row.job_id,
    jobTitle: row.job_title,
    name: row.name,
    email: row.email,
    phone: row.phone ?? "",
    message: row.message ?? "",
    resumeUrl: row.resume_url ?? "",
    status: row.status,
    createdAt: row.created_at,
  };
}

applicationsRouter.post("/", async (req, res) => {
  const { jobId, jobTitle, name, email, phone, message, resumeUrl } = req.body as Record<
    string,
    string | number | undefined
  >;
  if (!jobId || !jobTitle || !name || !email) {
    return res.status(400).json({ error: "jobId, jobTitle, name, and email are required" });
  }
  await pool.query(
    "INSERT INTO applications (job_id, job_title, name, email, phone, message, resume_url) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [jobId, jobTitle, name, email, phone ?? "", message ?? "", resumeUrl ?? ""]
  );
  res.status(201).json({ success: true });
});

applicationsRouter.get("/", requireAuth, async (req, res) => {
  const { jobId } = req.query;
  const [rows] = jobId
    ? await pool.query<ApplicationRow[]>(
        "SELECT * FROM applications WHERE job_id = ? ORDER BY created_at DESC",
        [jobId]
      )
    : await pool.query<ApplicationRow[]>("SELECT * FROM applications ORDER BY created_at DESC");
  res.json(rows.map(serialize));
});

applicationsRouter.put("/:id/status", requireAuth, async (req, res) => {
  const { status } = req.body as { status?: string };
  if (!status) return res.status(400).json({ error: "status is required" });
  await pool.query("UPDATE applications SET status = ? WHERE id = ?", [status, req.params.id]);
  res.json({ success: true });
});

applicationsRouter.delete("/:id", requireAuth, async (req, res) => {
  const [result] = await pool.query<ResultSetHeader>("DELETE FROM applications WHERE id = ?", [
    req.params.id,
  ]);
  if (result.affectedRows === 0) return res.status(404).json({ error: "Application not found" });
  res.status(204).end();
});
