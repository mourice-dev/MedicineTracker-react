import { Router } from "express";
import { query } from "../config/db.js";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const doctors = await query(
      `SELECT id, full_name, email, role
       FROM users
       WHERE role = 'DOCTOR'
       ORDER BY full_name`
    );

    return res.json(doctors);
  } catch (err) {
    return next(err);
  }
});

export default router;
