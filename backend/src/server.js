import express from "express";
import { fileURLToPath } from "url";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";

import * as authRoutesModule from "./routes/auth.js";
import * as patientRoutesModule from "./routes/patients.js";
import * as appointmentRoutesModule from "./routes/appointments.js";
import * as staffRoutesModule from "./routes/staff.js";
import * as dashboardRoutesModule from "./routes/dashboard.js";
import * as doctorRoutesModule from "./routes/doctors.js";
import * as medicineRoutesModule from "./routes/medicine.js";

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 4000);

const unwrapRouter = (moduleValue) => moduleValue?.default ?? moduleValue;

const authRoutes = unwrapRouter(authRoutesModule);
const patientRoutes = unwrapRouter(patientRoutesModule);
const appointmentRoutes = unwrapRouter(appointmentRoutesModule);
const staffRoutes = unwrapRouter(staffRoutesModule);
const dashboardRoutes = unwrapRouter(dashboardRoutesModule);
const doctorRoutes = unwrapRouter(doctorRoutesModule);
const medicineRoutes = unwrapRouter(medicineRoutesModule);

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/medicine", medicineRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: "Server error", detail: err.message });
});

export default app;

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  app.listen(port, () => {
    console.log(`MedicTrack API listening on http://localhost:${port}`);
  });
}
