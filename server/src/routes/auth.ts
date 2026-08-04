import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { RowDataPacket } from "mysql2";
import { pool } from "../db/index.js";
import { JWT_SECRET } from "../middleware/auth.js";

export const authRouter = Router();

interface UserRow extends RowDataPacket {
  id: number;
  email: string;
  password_hash: string;
}

authRouter.post("/login", async (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string };
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const [rows] = await pool.query<UserRow[]>("SELECT * FROM users WHERE email = ?", [
    email.toLowerCase().trim(),
  ]);
  const user = rows[0];

  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "12h" });
  res.json({ token, user: { id: user.id, email: user.email } });
});
