import { useEffect, useMemo, useState } from "react";
import { api } from "./api";
import {
  LayoutDashboard,
  Users,
  Calendar,
  UserCheck,
  LogOut,
  AlertCircle,
  CheckCircle2,
  Edit2,
  Trash2,
  MapPin,
  Navigation,
  Plus,
  Search,
  Home,
  Pill,
  User as UserIcon,
} from "lucide-react";

const tabs = ["dashboard", "patients", "appointments", "staff"];

const defaultPatient = {
  id: null,
  full_name: "",
  dob: "",
  gender: "",
  phone: "",
  address: "",
  medical_condition: "",
  status: "Stable",
  last_visit: "",
  assigned_doctor_id: "",
};

const defaultAppointment = {
  id: null,
  patient_id: "",
  doctor_id: "",
  appointment_time: "",
  type: "Consultation",
  status: "Scheduled",
  notes: "",
};

const defaultStaff = {
  user_id: "",
  department: "",
  specialty: "",
  shift_start: "",
  shift_end: "",
  status: "Active",
};

function toDateInput(value) {
  if (!value) return "";
  return String(value).slice(0, 10);
}

function toDateTimeInput(value) {
  if (!value) return "";
  return String(value).replace(" ", "T").slice(0, 16);
}

function pharmacyMapUrl(pharmacy) {
  if (!pharmacy) {
    return "https://maps.google.com/maps?q=Kigali%20pharmacy&t=&z=13&ie=UTF8&iwloc=&output=embed";
  }
  const q = encodeURIComponent(`loc:${pharmacy.latitude},${pharmacy.longitude} (${pharmacy.name})`);
  return `https://maps.google.com/maps?q=${q}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
}

function directionsUrl(pharmacy) {
  if (!pharmacy) return "#";
  return `https://www.google.com/maps/dir/?api=1&destination=${pharmacy.latitude},${pharmacy.longitude}`;
}

function MobileFrame({ children }) {
  return (
    <div className="mobile-frame">
      <div className="mobile-status">
        <span>9:41</span>
        <div className="mobile-status-icons">
          <div className="mobile-battery" />
          <div className="mobile-dot" />
        </div>
      </div>
      <div className="mobile-content">{children}</div>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("medictrack_user");
    return raw ? JSON.parse(raw) : null;
  });

  const [authMode, setAuthMode] = useState("login");
  const [tab, setTab] = useState("dashboard");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [dashboard, setDashboard] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [allPatients, setAllPatients] = useState([]);

  const [patients, setPatients] = useState([]);
  const [patientFilter, setPatientFilter] = useState({ keyword: "", dateFrom: "", dateTo: "", status: "" });
  const [patientForm, setPatientForm] = useState(defaultPatient);

  const [appointments, setAppointments] = useState([]);
  const [appointmentFilter, setAppointmentFilter] = useState({ keyword: "", searchDate: "", timeFrom: "", timeTo: "", status: "", type: "" });
  const [appointmentForm, setAppointmentForm] = useState(defaultAppointment);

  const [staff, setStaff] = useState([]);
  const [staffFilter, setStaffFilter] = useState({ keyword: "", role: "", department: "", status: "" });
  const [staffForm, setStaffForm] = useState(defaultStaff);

  const [authForm, setAuthForm] = useState({ fullName: "", email: "", password: "", role: "STAFF" });

  const [showWelcomeMap, setShowWelcomeMap] = useState(false);
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState("Kigali");
  const [pharmacies, setPharmacies] = useState([]);
  const [selectedPharmacy, setSelectedPharmacy] = useState(null);

  const patientQuery = useMemo(() => new URLSearchParams(patientFilter).toString(), [patientFilter]);
  const appointmentQuery = useMemo(() => new URLSearchParams(appointmentFilter).toString(), [appointmentFilter]);
  const staffQuery = useMemo(() => new URLSearchParams(staffFilter).toString(), [staffFilter]);

  useEffect(() => {
    api.doctors().then(setDoctors).catch(() => {});
    api.patients().then(setAllPatients).catch(() => {});

    api.medicineCities().then((items) => {
      setCities(items);
      if (items.length) {
        const city = items.includes("Kigali") ? "Kigali" : items[0];
        setSelectedCity(city);
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedCity) return;
    api.medicinePharmacies(selectedCity).then((rows) => {
      setPharmacies(rows);
      setSelectedPharmacy(rows[0] || null);
    }).catch(() => {});
  }, [selectedCity]);

  useEffect(() => {
    if (!user) return;

    const loaders = {
      dashboard: () => api.dashboard().then(setDashboard),
      patients: () => api.patients(patientQuery).then(setPatients),
      appointments: () => api.appointments(appointmentQuery).then(setAppointments),
      staff: () => api.staff(staffQuery).then(setStaff),
    };

    loaders[tab]().catch((e) => setError(e.message));
  }, [user, tab, patientQuery, appointmentQuery, staffQuery]);

  async function handleAuthSubmit(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    try {
      if (authMode === "login") {
        const data = await api.login({ email: authForm.email, password: authForm.password });
        setUser(data.user);
        localStorage.setItem("medictrack_user", JSON.stringify(data.user));
        setMessage("Welcome back");
      } else {
        await api.register({
          fullName: authForm.fullName,
          email: authForm.email,
          password: authForm.password,
          role: authForm.role,
        });
        setMessage("Registration successful. You can now log in.");
        setAuthMode("login");
      }
    } catch (e) {
      setError(e.message);
    }
  }

  function logout() {
    setUser(null);
    localStorage.removeItem("medictrack_user");
  }

  async function savePatient(event) {
    event.preventDefault();
    try {
      if (patientForm.id) {
        await api.updatePatient(patientForm.id, patientForm);
      } else {
        await api.addPatient(patientForm);
      }
      setPatientForm(defaultPatient);
      setPatients(await api.patients(patientQuery));
      setAllPatients(await api.patients());
    } catch (e) {
      setError(e.message);
    }
  }

  async function deletePatient(id) {
    await api.deletePatient(id);
    setPatients(await api.patients(patientQuery));
    setAllPatients(await api.patients());
  }

  async function saveAppointment(event) {
    event.preventDefault();
    try {
      const payload = {
        ...appointmentForm,
        appointment_time: appointmentForm.appointment_time.replace("T", " ") + ":00",
      };
      if (appointmentForm.id) {
        await api.updateAppointment(appointmentForm.id, payload);
      } else {
        await api.addAppointment(payload);
      }
      setAppointmentForm(defaultAppointment);
      setAppointments(await api.appointments(appointmentQuery));
    } catch (e) {
      setError(e.message);
    }
  }

  async function deleteAppointment(id) {
    await api.deleteAppointment(id);
    setAppointments(await api.appointments(appointmentQuery));
  }

  async function saveStaff(event) {
    event.preventDefault();
    try {
      await api.updateStaff(staffForm.user_id, staffForm);
      setStaffForm(defaultStaff);
      setStaff(await api.staff(staffQuery));
    } catch (e) {
      setError(e.message);
    }
  }

  if (!user) {
    return (
      <main className="auth-layout">
        <div className="auth-presentation-title">
          <h1>MedTrack UI</h1>
          <p>Login + pharmacy map preview</p>
        </div>

        <div className={`auth-presentation ${showWelcomeMap ? "show-map" : ""}`}>
          <MobileFrame>
            <form className="phone-login-screen" onSubmit={handleAuthSubmit}>
              <div className="phone-logo">
                <Plus size={44} strokeWidth={3} />
              </div>

              <div className="phone-form-stack">
                {authMode === "register" && (
                  <input
                    placeholder="Full Name"
                    value={authForm.fullName}
                    onChange={(e) => setAuthForm((p) => ({ ...p, fullName: e.target.value }))}
                    required
                  />
                )}

                <input
                  placeholder="Email"
                  type="email"
                  value={authForm.email}
                  onChange={(e) => setAuthForm((p) => ({ ...p, email: e.target.value }))}
                  required
                />

                <input
                  placeholder="Password"
                  type="password"
                  value={authForm.password}
                  onChange={(e) => setAuthForm((p) => ({ ...p, password: e.target.value }))}
                  required
                />

                {authMode === "register" && (
                  <select value={authForm.role} onChange={(e) => setAuthForm((p) => ({ ...p, role: e.target.value }))}>
                    <option>STAFF</option>
                    <option>NURSE</option>
                    <option>DOCTOR</option>
                    <option>ADMIN</option>
                  </select>
                )}
              </div>

              <button type="submit" className="phone-login-btn">
                {authMode === "login" ? "Log In" : "Create Account"}
              </button>

              <button type="button" className="phone-link-btn" onClick={() => setAuthMode((m) => (m === "login" ? "register" : "login"))}>
                {authMode === "login" ? "Need an account? Register" : "Already have an account? Sign in"}
              </button>

              <button type="button" className="phone-link-btn" onClick={() => setShowWelcomeMap((v) => !v)}>
                <MapPin size={16} /> {showWelcomeMap ? "Hide Pharmacy Map" : "Show Pharmacy Map"}
              </button>

              {message && <div className="ok"><CheckCircle2 size={18} /> {message}</div>}
              {error && <div className="err"><AlertCircle size={18} /> {error}</div>}
            </form>
          </MobileFrame>

          {showWelcomeMap && (
            <MobileFrame>
              <div className="phone-map-screen">
                <div className="phone-map-search">
                  <Search size={16} />
                  <select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)}>
                    {cities.length ? cities.map((city) => <option key={city}>{city}</option>) : <option>Kigali</option>}
                  </select>
                </div>

                <div className="phone-map-canvas">
                  <iframe
                    title="pharmacy-map-login"
                    src={pharmacyMapUrl(selectedPharmacy)}
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    style={{ border: 0 }}
                    allowFullScreen
                  />
                </div>

                {selectedPharmacy && (
                  <div className="phone-map-card">
                    <div className="phone-map-card-top">
                      <div>
                        <h3>{selectedPharmacy.name}</h3>
                        <p>{selectedPharmacy.address}</p>
                        <small>{selectedPharmacy.phone || "Phone not available"}</small>
                      </div>
                      <span className="distance-pill">Pharmacy</span>
                    </div>

                    <a
                      href={directionsUrl(selectedPharmacy)}
                      target="_blank"
                      rel="noreferrer"
                      className="phone-directions-btn"
                    >
                      Get Directions <Navigation size={16} />
                    </a>
                  </div>
                )}

                {!!pharmacies.length && (
                  <div className="phone-pharmacy-list">
                    {pharmacies.map((ph) => (
                      <button
                        key={ph.id}
                        type="button"
                        className={`pharmacy-chip ${selectedPharmacy?.id === ph.id ? "active" : ""}`}
                        onClick={() => setSelectedPharmacy(ph)}
                      >
                        {ph.name}
                      </button>
                    ))}
                  </div>
                )}

                <div className="phone-bottom-nav">
                  <Home size={20} />
                  <Pill size={20} />
                  <MapPin size={20} className="active" />
                  <UserIcon size={20} />
                </div>
              </div>
            </MobileFrame>
          )}
        </div>
      </main>
    );
  }

  const navIcon = {
    dashboard: LayoutDashboard,
    patients: Users,
    appointments: Calendar,
    staff: UserCheck,
  };

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-header"><h1>MedicTrack</h1></div>
        <nav className="sidebar-nav">
          {tabs.map((item) => {
            const Icon = navIcon[item];
            return (
              <button key={item} className={`nav-item ${tab === item ? "active" : ""}`} onClick={() => setTab(item)}>
                <Icon size={18} /><span style={{ textTransform: "capitalize" }}>{item}</span>
              </button>
            );
          })}
        </nav>
        <div className="user-profile">
          <div className="user-info">
            <span className="user-name">{user.full_name}</span>
            <span className="user-role">{user.role}</span>
          </div>
          <button className="logout-btn" onClick={logout}><LogOut size={18} /></button>
        </div>
      </aside>

      <main className="main-content">
        <div className="page-header">
          <h2 className="page-title" style={{ textTransform: "capitalize" }}>{tab}</h2>
        </div>

        {error && <div className="err"><AlertCircle size={18} /> {error}</div>}
        {message && <div className="ok"><CheckCircle2 size={18} /> {message}</div>}

        {tab === "dashboard" && dashboard && (
          <section className="grid4">
            <div className="card stat-card"><span className="stat-label">Total Patients</span><strong className="stat-value">{dashboard.totalPatients}</strong></div>
            <div className="card stat-card"><span className="stat-label">Today Appointments</span><strong className="stat-value">{dashboard.todayAppointments}</strong></div>
            <div className="card stat-card"><span className="stat-label">Active Staff</span><strong className="stat-value">{dashboard.activeStaff}</strong></div>
            <div className="card stat-card"><span className="stat-label">Critical Cases</span><strong className="stat-value">{dashboard.criticalCases}</strong></div>
          </section>
        )}

        {tab === "patients" && (
          <section>
            <div className="toolbar">
              <input placeholder="Search patient" value={patientFilter.keyword} onChange={(e) => setPatientFilter((p) => ({ ...p, keyword: e.target.value }))} />
              <input type="date" value={patientFilter.dateFrom} onChange={(e) => setPatientFilter((p) => ({ ...p, dateFrom: e.target.value }))} />
              <input type="date" value={patientFilter.dateTo} onChange={(e) => setPatientFilter((p) => ({ ...p, dateTo: e.target.value }))} />
              <select value={patientFilter.status} onChange={(e) => setPatientFilter((p) => ({ ...p, status: e.target.value }))}>
                <option value="">All status</option><option>Stable</option><option>Critical</option><option>Attention</option><option>Discharged</option>
              </select>
            </div>

            <form className="card" onSubmit={savePatient}>
              <h3 className="card-title">Patient Form</h3>
              <div className="grid2">
                <input placeholder="Full Name" value={patientForm.full_name} onChange={(e) => setPatientForm((p) => ({ ...p, full_name: e.target.value }))} required />
                <input type="date" value={patientForm.dob} onChange={(e) => setPatientForm((p) => ({ ...p, dob: e.target.value }))} />
                <select value={patientForm.gender} onChange={(e) => setPatientForm((p) => ({ ...p, gender: e.target.value }))}><option value="">Gender</option><option>Male</option><option>Female</option><option>Other</option></select>
                <input placeholder="Phone" value={patientForm.phone} onChange={(e) => setPatientForm((p) => ({ ...p, phone: e.target.value }))} />
                <input placeholder="Medical condition" value={patientForm.medical_condition} onChange={(e) => setPatientForm((p) => ({ ...p, medical_condition: e.target.value }))} />
                <select value={patientForm.status} onChange={(e) => setPatientForm((p) => ({ ...p, status: e.target.value }))}><option>Stable</option><option>Critical</option><option>Attention</option><option>Discharged</option></select>
                <input type="date" value={patientForm.last_visit} onChange={(e) => setPatientForm((p) => ({ ...p, last_visit: e.target.value }))} />
                <select value={patientForm.assigned_doctor_id} onChange={(e) => setPatientForm((p) => ({ ...p, assigned_doctor_id: e.target.value }))}>
                  <option value="">Assign doctor</option>
                  {doctors.map((d) => <option key={d.id} value={d.id}>{d.full_name}</option>)}
                </select>
              </div>
              <textarea placeholder="Address" value={patientForm.address} onChange={(e) => setPatientForm((p) => ({ ...p, address: e.target.value }))} style={{ marginTop: "0.75rem" }} />
              <div className="row" style={{ marginTop: "0.75rem" }}>
                <button type="submit">Save</button>
                <button type="button" className="ghost" onClick={() => setPatientForm(defaultPatient)}>Reset</button>
              </div>
            </form>

            <div className="table-container">
              <table>
                <thead><tr><th>Name</th><th>Condition</th><th>Status</th><th>Doctor</th><th>Action</th></tr></thead>
                <tbody>
                  {patients.map((p) => (
                    <tr key={p.id}>
                      <td>{p.full_name}</td>
                      <td>{p.medical_condition || "-"}</td>
                      <td>{p.status}</td>
                      <td>{p.doctor_name || "Unassigned"}</td>
                      <td>
                        <button className="icon-btn" onClick={() => setPatientForm({ ...p, dob: toDateInput(p.dob), last_visit: toDateInput(p.last_visit) })}><Edit2 size={16} /></button>
                        <button className="icon-btn danger" onClick={() => deletePatient(p.id)}><Trash2 size={16} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {tab === "appointments" && (
          <section>
            <div className="toolbar">
              <input placeholder="Search" value={appointmentFilter.keyword} onChange={(e) => setAppointmentFilter((p) => ({ ...p, keyword: e.target.value }))} />
              <input type="date" value={appointmentFilter.searchDate} onChange={(e) => setAppointmentFilter((p) => ({ ...p, searchDate: e.target.value }))} />
              <input type="time" value={appointmentFilter.timeFrom} onChange={(e) => setAppointmentFilter((p) => ({ ...p, timeFrom: e.target.value }))} />
              <input type="time" value={appointmentFilter.timeTo} onChange={(e) => setAppointmentFilter((p) => ({ ...p, timeTo: e.target.value }))} />
            </div>

            <form className="card" onSubmit={saveAppointment}>
              <h3 className="card-title">Appointment Form</h3>
              <div className="grid2">
                <select value={appointmentForm.patient_id} onChange={(e) => setAppointmentForm((p) => ({ ...p, patient_id: e.target.value }))} required>
                  <option value="">Select patient</option>
                  {allPatients.map((p) => <option key={p.id} value={p.id}>{p.full_name}</option>)}
                </select>
                <select value={appointmentForm.doctor_id} onChange={(e) => setAppointmentForm((p) => ({ ...p, doctor_id: e.target.value }))} required>
                  <option value="">Select doctor</option>
                  {doctors.map((d) => <option key={d.id} value={d.id}>{d.full_name}</option>)}
                </select>
                <input type="datetime-local" value={appointmentForm.appointment_time} onChange={(e) => setAppointmentForm((p) => ({ ...p, appointment_time: e.target.value }))} required />
                <input placeholder="Type" value={appointmentForm.type} onChange={(e) => setAppointmentForm((p) => ({ ...p, type: e.target.value }))} />
                <input placeholder="Status" value={appointmentForm.status} onChange={(e) => setAppointmentForm((p) => ({ ...p, status: e.target.value }))} />
              </div>
              <textarea placeholder="Notes" value={appointmentForm.notes} onChange={(e) => setAppointmentForm((p) => ({ ...p, notes: e.target.value }))} style={{ marginTop: "0.75rem" }} />
              <div className="row" style={{ marginTop: "0.75rem" }}>
                <button type="submit">Save</button>
                <button type="button" className="ghost" onClick={() => setAppointmentForm(defaultAppointment)}>Reset</button>
              </div>
            </form>

            <div className="table-container">
              <table>
                <thead><tr><th>Patient</th><th>Doctor</th><th>Time</th><th>Status</th><th>Action</th></tr></thead>
                <tbody>
                  {appointments.map((a) => (
                    <tr key={a.id}>
                      <td>{a.patient_name}</td>
                      <td>{a.doctor_name}</td>
                      <td>{toDateTimeInput(a.appointment_time).replace("T", " ")}</td>
                      <td>{a.status}</td>
                      <td>
                        <button className="icon-btn" onClick={() => setAppointmentForm({ ...a, appointment_time: toDateTimeInput(a.appointment_time) })}><Edit2 size={16} /></button>
                        <button className="icon-btn danger" onClick={() => deleteAppointment(a.id)}><Trash2 size={16} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {tab === "staff" && (
          <section>
            <div className="toolbar">
              <input placeholder="Search staff" value={staffFilter.keyword} onChange={(e) => setStaffFilter((p) => ({ ...p, keyword: e.target.value }))} />
              <input placeholder="Role" value={staffFilter.role} onChange={(e) => setStaffFilter((p) => ({ ...p, role: e.target.value }))} />
              <input placeholder="Department" value={staffFilter.department} onChange={(e) => setStaffFilter((p) => ({ ...p, department: e.target.value }))} />
              <input placeholder="Status" value={staffFilter.status} onChange={(e) => setStaffFilter((p) => ({ ...p, status: e.target.value }))} />
            </div>

            <form className="card" onSubmit={saveStaff}>
              <h3 className="card-title">Staff Assignment</h3>
              <div className="grid2">
                <select value={staffForm.user_id} onChange={(e) => setStaffForm((p) => ({ ...p, user_id: e.target.value }))} required>
                  <option value="">Select staff</option>
                  {staff.map((s) => <option key={s.user_id} value={s.user_id}>{s.full_name} ({s.role})</option>)}
                </select>
                <input placeholder="Department" value={staffForm.department} onChange={(e) => setStaffForm((p) => ({ ...p, department: e.target.value }))} />
                <input placeholder="Specialty" value={staffForm.specialty} onChange={(e) => setStaffForm((p) => ({ ...p, specialty: e.target.value }))} />
                <input type="time" value={staffForm.shift_start} onChange={(e) => setStaffForm((p) => ({ ...p, shift_start: e.target.value }))} />
                <input type="time" value={staffForm.shift_end} onChange={(e) => setStaffForm((p) => ({ ...p, shift_end: e.target.value }))} />
                <input placeholder="Status" value={staffForm.status} onChange={(e) => setStaffForm((p) => ({ ...p, status: e.target.value }))} />
              </div>
              <div style={{ marginTop: "0.75rem" }}><button type="submit">Save</button></div>
            </form>

            <div className="table-container">
              <table>
                <thead><tr><th>Name</th><th>Role</th><th>Department</th><th>Status</th><th>Action</th></tr></thead>
                <tbody>
                  {staff.map((s) => (
                    <tr key={s.user_id}>
                      <td>{s.full_name}</td><td>{s.role}</td><td>{s.department || "-"}</td><td>{s.status}</td>
                      <td><button className="icon-btn" onClick={() => setStaffForm({ ...s })}><Edit2 size={16} /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
