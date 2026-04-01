import { Router } from "express";
import { query } from "../config/db.js";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const { keyword, dateFrom, dateTo, status } = req.query;

    let sql = `
      SELECT p.*, u.full_name AS doctor_name
      FROM patients p
      LEFT JOIN users u ON p.assigned_doctor_id = u.id
      WHERE 1=1
    `;

    const params = {};

    if (keyword) {
      sql += ` AND (p.full_name LIKE :keyword OR p.phone LIKE :keyword OR p.medical_condition LIKE :keyword)`;
      params.keyword = `%${keyword}%`;
    }

    if (dateFrom) {
      sql += ` AND p.last_visit >= :dateFrom`;
      params.dateFrom = dateFrom;
    }

    if (dateTo) {
      sql += ` AND p.last_visit <= :dateTo`;
      params.dateTo = dateTo;
    }

    if (status) {
      sql += ` AND p.status = :status`;
      params.status = status;
    }

    sql += ` ORDER BY p.id DESC`;

    const rows = await query(sql, params);
    return res.json(rows);
  } catch (err) {
    return next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const rows = await query(
      `SELECT p.*, u.full_name AS doctor_name
       FROM patients p
       LEFT JOIN users u ON p.assigned_doctor_id = u.id
       WHERE p.id = :id
       LIMIT 1`,
      { id: Number(req.params.id) }
    );

    if (!rows.length) {
      return res.status(404).json({ message: "Patient not found" });
    }

    return res.json(rows[0]);
  } catch (err) {
    return next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const {
      full_name,
      dob,
      gender,
      phone,
      address,
      medical_condition,
      status,
      last_visit,
      assigned_doctor_id,
    } = req.body;

    if (!full_name) {
      return res.status(400).json({ message: "full_name is required" });
    }

    const result = await query(
      `INSERT INTO patients (
        full_name, dob, gender, phone, address, medical_condition, status, last_visit, assigned_doctor_id
      ) VALUES (
        :full_name, :dob, :gender, :phone, :address, :medical_condition, :status, :last_visit, :assigned_doctor_id
      )`,
      {
        full_name,
        dob: dob || null,
        gender: gender || null,
        phone: phone || null,
        address: address || null,
        medical_condition: medical_condition || null,
        status: status || "Stable",
        last_visit: last_visit || null,
        assigned_doctor_id: assigned_doctor_id || null,
      }
    );

    return res.status(201).json({ id: result.insertId, message: "Patient created" });
  } catch (err) {
    return next(err);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const {
      full_name,
      dob,
      gender,
      phone,
      address,
      medical_condition,
      status,
      last_visit,
      assigned_doctor_id,
    } = req.body;

    await query(
      `UPDATE patients SET
        full_name = :full_name,
        dob = :dob,
        gender = :gender,
        phone = :phone,
        address = :address,
        medical_condition = :medical_condition,
        status = :status,
        last_visit = :last_visit,
        assigned_doctor_id = :assigned_doctor_id
       WHERE id = :id`,
      {
        id,
        full_name,
        dob: dob || null,
        gender: gender || null,
        phone: phone || null,
        address: address || null,
        medical_condition: medical_condition || null,
        status: status || "Stable",
        last_visit: last_visit || null,
        assigned_doctor_id: assigned_doctor_id || null,
      }
    );

    return res.json({ message: "Patient updated" });
  } catch (err) {
    return next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    await query(`DELETE FROM patients WHERE id = :id`, { id: Number(req.params.id) });
    return res.json({ message: "Patient deleted" });
  } catch (err) {
    return next(err);
  }
});

export default router;
