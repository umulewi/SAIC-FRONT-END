import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { initDb } from "./db/index.js";
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

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;

await initDb();
app.listen(PORT, () => {
  console.log(`SAIC API server running on http://localhost:${PORT}`);
});
