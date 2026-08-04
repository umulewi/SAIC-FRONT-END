import { Router } from "express";
import type { RowDataPacket, ResultSetHeader } from "mysql2";
import { pool } from "../db/index.js";
import { requireAuth } from "../middleware/auth.js";

export const collectionsRouter = Router();

const ALLOWED_COLLECTIONS = new Set([
  "services",
  "coreValues",
  "impactAreas",
  "programs",
  "partners",
  "team",
  "stats",
  "sitesApps",
  "stories",
  "jobOpenings",
]);

interface ItemRow extends RowDataPacket {
  id: number;
  collection: string;
  order_index: number;
  data: unknown;
}

function assertCollection(name: string, res: import("express").Response): boolean {
  if (!ALLOWED_COLLECTIONS.has(name)) {
    res.status(400).json({ error: `Unknown collection "${name}"` });
    return false;
  }
  return true;
}

function serialize(row: ItemRow) {
  const data = typeof row.data === "string" ? JSON.parse(row.data) : row.data;
  return { id: row.id, order: row.order_index, ...(data as object) };
}

collectionsRouter.get("/:name", async (req, res) => {
  const { name } = req.params;
  if (!assertCollection(name, res)) return;
  const [rows] = await pool.query<ItemRow[]>(
    "SELECT * FROM items WHERE collection = ? ORDER BY order_index ASC, id ASC",
    [name]
  );
  res.json(rows.map(serialize));
});

collectionsRouter.post("/:name", requireAuth, async (req, res) => {
  const { name } = req.params;
  if (!assertCollection(name, res)) return;
  const { order, ...fields } = req.body ?? {};

  const [maxRows] = await pool.query<RowDataPacket[]>(
    "SELECT MAX(order_index) as maxOrder FROM items WHERE collection = ?",
    [name]
  );
  const maxOrder = maxRows[0]?.maxOrder as number | null;
  const orderIndex = order ?? (maxOrder ?? -1) + 1;

  const [result] = await pool.query<ResultSetHeader>(
    "INSERT INTO items (collection, order_index, data) VALUES (?, ?, ?)",
    [name, orderIndex, JSON.stringify(fields)]
  );

  const [rows] = await pool.query<ItemRow[]>("SELECT * FROM items WHERE id = ?", [
    result.insertId,
  ]);
  res.status(201).json(serialize(rows[0]));
});

collectionsRouter.put("/:name/:id", requireAuth, async (req, res) => {
  const { name, id } = req.params;
  if (!assertCollection(name, res)) return;

  const [existingRows] = await pool.query<ItemRow[]>(
    "SELECT * FROM items WHERE id = ? AND collection = ?",
    [id, name]
  );
  if (existingRows.length === 0) return res.status(404).json({ error: "Item not found" });

  const { order, ...fields } = req.body ?? {};
  const orderIndex = order ?? existingRows[0].order_index;

  await pool.query("UPDATE items SET order_index = ?, data = ? WHERE id = ?", [
    orderIndex,
    JSON.stringify(fields),
    id,
  ]);

  const [rows] = await pool.query<ItemRow[]>("SELECT * FROM items WHERE id = ?", [id]);
  res.json(serialize(rows[0]));
});

collectionsRouter.delete("/:name/:id", requireAuth, async (req, res) => {
  const { name, id } = req.params;
  if (!assertCollection(name, res)) return;
  const [result] = await pool.query<ResultSetHeader>(
    "DELETE FROM items WHERE id = ? AND collection = ?",
    [id, name]
  );
  if (result.affectedRows === 0) return res.status(404).json({ error: "Item not found" });
  res.status(204).end();
});
