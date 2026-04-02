import { Router } from "express";
import { query } from "../config/db.js";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const [{ totalpatients }] = await query(`SELECT COUNT(*)::int AS totalpatients FROM patients`);

    const [{ todayappointments }] = await query(
      `SELECT COUNT(*)::int AS todayappointments
       FROM appointments
       WHERE appointment_time::date = CURRENT_DATE`
    );

    const [{ activestaff }] = await query(
      `SELECT COUNT(*)::int AS activestaff
       FROM users u
       LEFT JOIN staff_details sd ON u.id = sd.user_id
       WHERE u.role IN ('DOCTOR', 'NURSE', 'STAFF')
         AND COALESCE(sd.status, 'Off Duty') IN ('Active', 'On Duty')`
    );

    const [{ criticalcases }] = await query(
      `SELECT COUNT(*)::int AS criticalcases
       FROM appointments
       WHERE status = 'In Progress' OR type = 'Emergency'`
    );

    const upcomingAppointments = await query(
      `SELECT a.id, a.appointment_time, a.status, a.type,
              p.full_name AS patient_name, u.full_name AS doctor_name
       FROM appointments a
       LEFT JOIN patients p ON a.patient_id = p.id
       LEFT JOIN users u ON a.doctor_id = u.id
       WHERE a.appointment_time::date = CURRENT_DATE
       ORDER BY a.appointment_time ASC`
    );

    return res.json({
      totalPatients: totalpatients || 0,
      todayAppointments: todayappointments || 0,
      activeStaff: activestaff || 0,
      criticalCases: criticalcases || 0,
      upcomingAppointments: upcomingAppointments || [],
    });
  } catch (err) {
    return next(err);
  }
});

export default router;
