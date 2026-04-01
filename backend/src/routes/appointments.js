import { Router } from "express";
import { query } from "../config/db.js";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const { keyword, searchDate, timeFrom, timeTo, status, type } = req.query;

    let sql = `
      SELECT a.*, p.full_name AS patient_name, u.full_name AS doctor_name
      FROM appointments a
      LEFT JOIN patients p ON a.patient_id = p.id
      LEFT JOIN users u ON a.doctor_id = u.id
      WHERE 1=1
    `;

    const params = {};

    if (keyword) {
      sql += ` AND (p.full_name LIKE :keyword OR u.full_name LIKE :keyword OR a.notes LIKE :keyword)`;
      params.keyword = `%${keyword}%`;
    }

    if (searchDate) {
      sql += ` AND DATE(a.appointment_time) = :searchDate`;
      params.searchDate = searchDate;
    }

    if (timeFrom) {
      sql += ` AND TIME(a.appointment_time) >= :timeFrom`;
      params.timeFrom = `${timeFrom}:00`;
    }

    if (timeTo) {
      sql += ` AND TIME(a.appointment_time) <= :timeTo`;
      params.timeTo = `${timeTo}:00`;
    }

    if (status) {
      sql += ` AND a.status = :status`;
      params.status = status;
    }

    if (type) {
      sql += ` AND a.type = :type`;
      params.type = type;
    }

    sql += ` ORDER BY a.appointment_time DESC`;

    const rows = await query(sql, params);
    return res.json(rows);
  } catch (err) {
    return next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const rows = await query(
      `SELECT a.*, p.full_name AS patient_name, u.full_name AS doctor_name
       FROM appointments a
       LEFT JOIN patients p ON a.patient_id = p.id
       LEFT JOIN users u ON a.doctor_id = u.id
       WHERE a.id = :id
       LIMIT 1`,
      { id: Number(req.params.id) }
    );

    if (!rows.length) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    return res.json(rows[0]);
  } catch (err) {
    return next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { patient_id, doctor_id, appointment_time, type, status, notes } = req.body;

    if (!patient_id || !doctor_id || !appointment_time) {
      return res.status(400).json({ message: "patient_id, doctor_id, appointment_time are required" });
    }

    const result = await query(
      `INSERT INTO appointments (patient_id, doctor_id, appointment_time, type, status, notes)
       VALUES (:patient_id, :doctor_id, :appointment_time, :type, :status, :notes)`,
      {
        patient_id,
        doctor_id,
        appointment_time,
        type: type || null,
        status: status || "Scheduled",
        notes: notes || null,
      }
    );

    return res.status(201).json({ id: result.insertId, message: "Appointment created" });
  } catch (err) {
    return next(err);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const { patient_id, doctor_id, appointment_time, type, status, notes } = req.body;

    await query(
      `UPDATE appointments SET
        patient_id = :patient_id,
        doctor_id = :doctor_id,
        appointment_time = :appointment_time,
        type = :type,
        status = :status,
        notes = :notes
       WHERE id = :id`,
      {
        id: Number(req.params.id),
        patient_id,
        doctor_id,
        appointment_time,
        type: type || null,
        status: status || "Scheduled",
        notes: notes || null,
      }
    );

    return res.json({ message: "Appointment updated" });
  } catch (err) {
    return next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    await query(`DELETE FROM appointments WHERE id = :id`, { id: Number(req.params.id) });
    return res.json({ message: "Appointment deleted" });
  } catch (err) {
    return next(err);
  }
});

export default router;
