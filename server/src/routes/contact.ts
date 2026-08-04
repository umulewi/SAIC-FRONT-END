import { Router } from "express";
import type { RowDataPacket, ResultSetHeader } from "mysql2";
import { pool } from "../db/index.js";
import { requireAuth } from "../middleware/auth.js";

export const contactRouter = Router();

interface MessageRow extends RowDataPacket {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  created_at: string;
  read: number;
}

contactRouter.post("/", async (req, res) => {
  const { name, email, subject, message } = req.body as Record<string, string | undefined>;
  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: "All fields are required" });
  }
  await pool.query("INSERT INTO messages (name, email, subject, message) VALUES (?, ?, ?, ?)", [
    name,
    email,
    subject,
    message,
  ]);
  res.status(201).json({ success: true });
});

contactRouter.get("/", requireAuth, async (_req, res) => {
  const [rows] = await pool.query<MessageRow[]>("SELECT * FROM messages ORDER BY created_at DESC");
  res.json(
    rows.map((r) => ({
      id: r.id,
      name: r.name,
      email: r.email,
      subject: r.subject,
      message: r.message,
      createdAt: r.created_at,
      read: !!r.read,
    }))
  );
});

contactRouter.put("/:id/read", requireAuth, async (req, res) => {
  await pool.query("UPDATE messages SET `read` = 1 WHERE id = ?", [req.params.id]);
  res.json({ success: true });
});

contactRouter.delete("/:id", requireAuth, async (req, res) => {
  const [result] = await pool.query<ResultSetHeader>("DELETE FROM messages WHERE id = ?", [
    req.params.id,
  ]);
  if (result.affectedRows === 0) return res.status(404).json({ error: "Message not found" });
  res.status(204).end();
});
