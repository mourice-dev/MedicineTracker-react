import { Router } from "express";
import { query } from "../config/db.js";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const { keyword, role, department, status } = req.query;

    let sql = `
      SELECT u.id AS user_id, u.full_name, u.email, u.role,
             sd.id, sd.department, sd.specialty, sd.shift_start, sd.shift_end,
             COALESCE(sd.status, 'Off Duty') AS status
      FROM users u
      LEFT JOIN staff_details sd ON u.id = sd.user_id
      WHERE u.role IN ('DOCTOR', 'NURSE', 'STAFF')
    `;

    const params = {};

    if (keyword) {
      sql += ` AND (u.full_name LIKE :keyword OR u.email LIKE :keyword)`;
      params.keyword = `%${keyword}%`;
    }

    if (role) {
      sql += ` AND u.role = :role`;
      params.role = role;
    }

    if (department) {
      sql += ` AND sd.department LIKE :department`;
      params.department = `%${department}%`;
    }

    if (status) {
      sql += ` AND sd.status = :status`;
      params.status = status;
    }

    sql += ` ORDER BY u.full_name`;

    const rows = await query(sql, params);
    return res.json(rows);
  } catch (err) {
    return next(err);
  }
});

router.get("/:userId", async (req, res, next) => {
  try {
    const rows = await query(
      `SELECT u.id AS user_id, u.full_name, u.email, u.role,
              sd.id, sd.department, sd.specialty, sd.shift_start, sd.shift_end,
              COALESCE(sd.status, 'Off Duty') AS status
       FROM users u
       LEFT JOIN staff_details sd ON u.id = sd.user_id
       WHERE u.id = :userId
       LIMIT 1`,
      { userId: Number(req.params.userId) }
    );

    if (!rows.length) {
      return res.status(404).json({ message: "Staff member not found" });
    }

    return res.json(rows[0]);
  } catch (err) {
    return next(err);
  }
});

router.put("/:userId", async (req, res, next) => {
  try {
    const userId = Number(req.params.userId);
    const { department, specialty, shift_start, shift_end, status } = req.body;

    const existing = await query(`SELECT id FROM staff_details WHERE user_id = :userId LIMIT 1`, { userId });

    if (!existing.length) {
      await query(
        `INSERT INTO staff_details (user_id, department, specialty, shift_start, shift_end, status)
         VALUES (:userId, :department, :specialty, :shift_start, :shift_end, :status)`,
        {
          userId,
          department: department || null,
          specialty: specialty || null,
          shift_start: shift_start || null,
          shift_end: shift_end || null,
          status: status || "Off Duty",
        }
      );
    } else {
      await query(
        `UPDATE staff_details SET
          department = :department,
          specialty = :specialty,
          shift_start = :shift_start,
          shift_end = :shift_end,
          status = :status
         WHERE user_id = :userId`,
        {
          userId,
          department: department || null,
          specialty: specialty || null,
          shift_start: shift_start || null,
          shift_end: shift_end || null,
          status: status || "Off Duty",
        }
      );
    }

    return res.json({ message: "Staff details updated" });
  } catch (err) {
    return next(err);
  }
});

export default router;
