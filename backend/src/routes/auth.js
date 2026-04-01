import { Router } from "express";
import { query } from "../config/db.js";

const router = Router();

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "email and password are required" });
    }

    const rows = await query(
      `SELECT id, full_name, email, role
       FROM users
       WHERE email = :email AND password = :password
       LIMIT 1`,
      { email, password }
    );

    if (!rows.length) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    return res.json({ user: rows[0] });
  } catch (err) {
    return next(err);
  }
});

router.post("/register", async (req, res, next) => {
  try {
    const { fullName, email, password, role } = req.body;
    if (!fullName || !email || !password || !role) {
      return res.status(400).json({ message: "fullName, email, password, role are required" });
    }

    await query(
      `INSERT INTO users (full_name, email, password, role)
       VALUES (:fullName, :email, :password, :role)`,
      { fullName, email, password, role }
    );

    return res.status(201).json({ message: "Registration successful" });
  } catch (err) {
    if (String(err.message || "").toLowerCase().includes("duplicate")) {
      return res.status(409).json({ message: "Email is already registered" });
    }
    return next(err);
  }
});

export default router;
