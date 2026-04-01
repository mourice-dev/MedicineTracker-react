import { Router } from "express";
import { query } from "../config/db.js";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const [{ totalPatients }] = await query(`SELECT COUNT(*) AS totalPatients FROM patients`);

    const [{ todayAppointments }] = await query(
      `SELECT COUNT(*) AS todayAppointments
       FROM appointments
       WHERE DATE(appointment_time) = CURDATE()`
    );

    const [{ activeStaff }] = await query(
      `SELECT COUNT(*) AS activeStaff
       FROM users u
       LEFT JOIN staff_details sd ON u.id = sd.user_id
       WHERE u.role IN ('DOCTOR', 'NURSE', 'STAFF')
         AND COALESCE(sd.status, 'Off Duty') IN ('Active', 'On Duty')`
    );

    const [{ criticalCases }] = await query(
      `SELECT COUNT(*) AS criticalCases
       FROM appointments
       WHERE status = 'In Progress' OR type = 'Emergency'`
    );

    const upcomingAppointments = await query(
      `SELECT a.id, a.appointment_time, a.status, a.type,
              p.full_name AS patient_name, u.full_name AS doctor_name
       FROM appointments a
       LEFT JOIN patients p ON a.patient_id = p.id
       LEFT JOIN users u ON a.doctor_id = u.id
       WHERE DATE(a.appointment_time) = CURDATE()
       ORDER BY a.appointment_time ASC`
    );

    return res.json({
      totalPatients,
      todayAppointments,
      activeStaff,
      criticalCases,
      upcomingAppointments,
    });
  } catch (err) {
    return next(err);
  }
});

export default router;
