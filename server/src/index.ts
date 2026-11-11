import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { initDb, pool } from "./db/index.js";
import { authRouter } from "./routes/auth.js";
import { sectionsRouter } from "./routes/sections.js";
import { collectionsRouter } from "./routes/collections.js";
import { uploadRouter } from "./routes/upload.js";
import { contactRouter } from "./routes/contact.js";
import { applicationsRouter } from "./routes/applications.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.resolve(__dirname, "../uploads")));

app.use("/api/auth", authRouter);
app.use("/api/sections", sectionsRouter);
app.use("/api/collections", collectionsRouter);
app.use("/api/upload", uploadRouter);
app.use("/api/contact", contactRouter);
app.use("/api/applications", applicationsRouter);

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

// Simple uptime ping — confirms the process is alive, no DB round-trip.
app.get("/check", (_req, res) => {
  res.json({ status: "ok", uptime: process.uptime(), timestamp: new Date().toISOString() });
});

// Full readiness check — also confirms the database is actually reachable.
app.get("/check/db", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok", database: "connected", timestamp: new Date().toISOString() });
  } catch (err) {
    res.status(503).json({
      status: "error",
      database: "disconnected",
      error: err instanceof Error ? err.message : "Unknown error",
      timestamp: new Date().toISOString(),
    });
  }
});

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;

// No top-level await here on purpose: some hosts (e.g. Namecheap/LiteSpeed's
// lsnode.js) load the compiled entry file via require(), and Node's require()
// support for ESM only works for synchronous modules. A top-level await makes
// this module "asynchronous" and breaks under require() with
// ERR_REQUIRE_ASYNC_MODULE. Using .then()/.catch() keeps the module synchronous.
initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`SAIC API server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to initialize database:", err);
    process.exit(1);
  });
