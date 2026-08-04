import { Router } from "express";
import type { RowDataPacket } from "mysql2";
import { pool } from "../db/index.js";
import { requireAuth } from "../middleware/auth.js";

export const sectionsRouter = Router();

interface SectionRow extends RowDataPacket {
  key: string;
  data: unknown;
}

function parseData(data: unknown): unknown {
  return typeof data === "string" ? JSON.parse(data) : data;
}

sectionsRouter.get("/", async (_req, res) => {
  const [rows] = await pool.query<SectionRow[]>("SELECT * FROM sections");
  const result: Record<string, unknown> = {};
  for (const row of rows) {
    result[row.key] = parseData(row.data);
  }
  res.json(result);
});

sectionsRouter.get("/:key", async (req, res) => {
  const [rows] = await pool.query<SectionRow[]>("SELECT * FROM sections WHERE `key` = ?", [
    req.params.key,
  ]);
  if (rows.length === 0) return res.status(404).json({ error: "Section not found" });
  res.json(parseData(rows[0].data));
});

sectionsRouter.put("/:key", requireAuth, async (req, res) => {
  const data = JSON.stringify(req.body ?? {});
  await pool.query(
    "INSERT INTO sections (`key`, data) VALUES (?, ?) ON DUPLICATE KEY UPDATE data = VALUES(data)",
    [req.params.key, data]
  );
  res.json(req.body);
});
