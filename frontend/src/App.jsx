import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  Users,
  Calendar,
  UserPlus,
  Search,
  Bell,
  Settings,
  LogOut,
  Stethoscope,
  FileText,
  LayoutDashboard,
  Menu,
  Clock,
  Lock,
  Mail,
  ArrowRight,
  MapPin,
  LocateFixed,
  ExternalLink,
  Pencil,
  Trash2,
  Plus,
  AlertCircle,
} from 'lucide-react';
import { api } from './api';

const BRAND_LOGO_SRC = '/branding/medt.png';

const initialPatientForm = {
  id: null,
  full_name: '',
  dob: '',
  gender: '',
  phone: '',
  address: '',
  medical_condition: '',
  status: 'Stable',
  last_visit: '',
  assigned_doctor_id: '',
};

const initialAppointmentForm = {
  id: null,
  patient_id: '',
  doctor_id: '',
  appointment_time: '',
  type: 'Consultation',
  status: 'Scheduled',
  notes: '',
};

const initialStaffForm = {
  user_id: null,
  department: '',
  specialty: '',
  shift_start: '',
  shift_end: '',
  status: 'On Duty',
};

function formatDate(input) {
  if (!input) return '-';
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return input;
  return date.toLocaleDateString();
}

function formatDateTime(input) {
  if (!input) return '-';
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return input;
  return date.toLocaleString();
}

function toDateInputValue(input) {
  if (!input) return '';
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
}

function toDateTimeInputValue(input) {
  if (!input) return '';
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return '';
  const tzOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
}

const SidebarItem = ({ icon: Icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center w-full px-6 py-3 text-sm font-medium transition-colors duration-200 ${
      active ? 'text-teal-600 bg-teal-50 border-r-4 border-teal-600' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
    }`}
  >
    <Icon size={20} className="mr-3" />
    {label}
  </button>
);

const Badge = ({ status }) => {
  const styles = {
    Stable: 'bg-green-100 text-green-700',
    Discharged: 'bg-gray-100 text-gray-700',
    Attention: 'bg-amber-100 text-amber-700',
    Critical: 'bg-rose-100 text-rose-700',
    'On Duty': 'bg-green-100 text-green-700',
    Active: 'bg-green-100 text-green-700',
    'In Surgery': 'bg-purple-100 text-purple-700',
    'On Break': 'bg-orange-100 text-orange-700',
    Completed: 'bg-green-100 text-green-700',
    'In Progress': 'bg-blue-100 text-blue-700',
    Scheduled: 'bg-slate-100 text-slate-700',
  };

  return <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${styles[status] || 'bg-gray-100 text-gray-600'}`}>{status || 'N/A'}</span>;
};

const FormField = ({ label, children }) => (
  <label className="block">
    <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">{label}</span>
    {children}
  </label>
);

const inputClass =
  'w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white';

const buildPharmacyLinks = (location) => {
  const searchUrl = location
    ? `https://www.google.com/maps/search/pharmacy/@${location.latitude},${location.longitude},15z`
    : 'https://www.google.com/maps/search/pharmacy+near+me';

  const embedUrl = location
    ? `https://www.google.com/maps?q=pharmacy&ll=${location.latitude},${location.longitude}&z=15&output=embed`
    : 'https://www.google.com/maps?q=pharmacy&z=14&output=embed';

  return { searchUrl, embedUrl };
};

const LocationPharmacyPanel = ({ location, locationStatus, locationError, onRequestLocation, variant = 'split' }) => {
  const hasLocation = Boolean(location);
  const { searchUrl, embedUrl } = buildPharmacyLinks(location);
  const wrapperClassName = variant === 'stacked'
    ? 'bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden'
    : 'bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden';
  const gridClassName = variant === 'stacked'
    ? 'grid grid-cols-1'
    : 'grid lg:grid-cols-[1.05fr_0.95fr]';
  const mapMinHeight = variant === 'stacked' ? 'min-h-[300px]' : 'min-h-[320px]';

  return (
    <div className={wrapperClassName}>
      <div className={gridClassName}>
        <div className="p-6 lg:p-8 bg-gradient-to-br from-emerald-50 via-white to-teal-50">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold mb-4">
            <LocateFixed size={14} className="mr-1" />
            Pharmacy help near you
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-3">Find the nearest pharmacy in seconds</h3>
          <p className="text-slate-600 max-w-xl mb-6">
            Share your location and MedicTrack will open Google Maps around your position so the closest pharmacy is easy to reach.
          </p>

          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3">
            <button
              type="button"
              onClick={onRequestLocation}
              className="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-teal-600 text-white font-bold shadow-lg shadow-teal-600/20 hover:bg-teal-700 transition"
            >
              <MapPin size={18} className="mr-2" />
              {hasLocation ? 'Update my location' : 'Allow location access'}
            </button>

            <a
              href={searchUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center px-5 py-3 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold hover:border-teal-300 hover:text-teal-700 transition"
            >
              <ExternalLink size={18} className="mr-2" />
              Open in Google Maps
            </a>
          </div>

          <div className="mt-5 inline-flex items-center rounded-lg bg-white border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700">
            <span className="mr-2 h-2.5 w-2.5 rounded-full bg-emerald-500" />
            {locationStatus === 'granted'
              ? 'Location shared and ready'
              : locationStatus === 'loading'
                ? 'Waiting for your location permission'
                : 'Request location to personalize nearby results'}
          </div>

          {locationError && (
            <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{locationError}</div>
          )}
        </div>

        <div className="bg-slate-900 p-3 lg:p-4">
          <div className={`rounded-xl overflow-hidden border border-white/10 bg-slate-950 shadow-2xl h-full ${mapMinHeight}`}>
            <iframe
              title="Nearby pharmacies on Google Maps"
              src={embedUrl}
              className={`w-full h-full ${mapMinHeight}`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const LoginView = ({ onLogin, onRequestLocation, location, locationStatus, locationError }) => (
  <div className="min-h-screen flex bg-slate-50">
    <div className="hidden lg:flex lg:w-1/2 bg-teal-600 text-white flex-col justify-between p-12 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500 rounded-bl-full opacity-50" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-700 rounded-tr-full opacity-50" />

      <div className="relative z-10 max-w-xl">
        <div className="mb-8">
          <img src={BRAND_LOGO_SRC} alt="MedicTrack logo" className="h-24 w-auto object-contain" />
        </div>
        <h1 className="text-4xl font-bold leading-tight mb-4">Streamline Your Healthcare Operations</h1>
        <p className="text-teal-100 text-lg max-w-md">
          Manage patients, staff, and appointments with our comprehensive healthcare management system designed for modern facilities.
        </p>
      </div>

      <div className="relative z-10 max-w-xl space-y-4">
        <div>
          <p className="text-teal-100 text-sm font-semibold tracking-wide uppercase">Emergency Assist</p>
          <h3 className="text-2xl font-bold mt-1">Find a nearby pharmacy quickly</h3>
        </div>

        <LocationPharmacyPanel
          variant="stacked"
          location={location}
          locationStatus={locationStatus}
          locationError={locationError}
          onRequestLocation={onRequestLocation}
        />
      </div>
    </div>

    <div className="w-full lg:w-1/2 flex flex-col justify-center items-stretch p-6 sm:p-8 lg:p-12">
      <div className="w-full max-w-md mx-auto space-y-6 lg:space-y-8">
        <div className="lg:hidden flex items-center justify-center mb-8">
          <img src={BRAND_LOGO_SRC} alt="MedicTrack logo" className="h-20 w-auto object-contain" />
        </div>

        <div className="text-center lg:text-left">
          <h2 className="text-3xl font-bold text-slate-900">Welcome back</h2>
          <p className="mt-2 text-slate-500">Please enter your details to sign in.</p>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); onLogin(); }} className="mt-8 space-y-6">
          <div className="space-y-5">
            <FormField label="Email address">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input type="email" defaultValue="admin@medictrack.com" className={`pl-10 ${inputClass}`} />
              </div>
            </FormField>

            <FormField label="Password">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input type="password" defaultValue="password123" className={`pl-10 ${inputClass}`} />
              </div>
            </FormField>
          </div>

          <button
            type="submit"
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-teal-600 hover:bg-teal-700"
          >
            Sign in
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>
      </div>
    </div>
  </div>
);

const DashboardView = ({ location, locationStatus, locationError, onRequestLocation, dashboard }) => {
  const stats = [
    { label: 'Total Patients', value: dashboard.totalPatients, icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Appointments Today', value: dashboard.todayAppointments, icon: Calendar, color: 'text-teal-600', bg: 'bg-teal-100' },
    { label: 'Active Staff', value: dashboard.activeStaff, icon: Stethoscope, color: 'text-indigo-600', bg: 'bg-indigo-100' },
    { label: 'Critical Cases', value: dashboard.criticalCases, icon: Activity, color: 'text-rose-600', bg: 'bg-rose-100' },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-teal-800 to-teal-600 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-2">Welcome Back, Dr. Admin</h2>
          <p className="text-teal-100 max-w-xl">Manage operations and monitor patient flow with real-time updates.</p>
        </div>
      </div>

      <LocationPharmacyPanel
        variant="split"
        location={location}
        locationStatus={locationStatus}
        locationError={locationError}
        onRequestLocation={onRequestLocation}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                <h3 className="text-2xl font-bold text-slate-800 mt-1">{stat.value ?? 0}</h3>
              </div>
              <div className={`p-2 rounded-lg ${stat.bg}`}>
                <stat.icon size={20} className={stat.color} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <h3 className="text-lg font-bold text-slate-800 mb-4">Today Appointments</h3>
        <div className="space-y-3">
          {(dashboard.upcomingAppointments || []).slice(0, 5).map((appt) => (
            <div key={appt.id} className="flex items-center justify-between border border-slate-100 rounded-lg px-4 py-3">
              <div>
                <p className="font-semibold text-slate-800">{appt.patient_name || 'Unknown patient'}</p>
                <p className="text-sm text-slate-500">{appt.type || 'General'} with {appt.doctor_name || 'Unassigned'}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-slate-700">{formatDateTime(appt.appointment_time)}</p>
                <Badge status={appt.status} />
              </div>
            </div>
          ))}
          {(!dashboard.upcomingAppointments || dashboard.upcomingAppointments.length === 0) && (
            <p className="text-sm text-slate-500">No appointments scheduled for today.</p>
          )}
        </div>
      </div>
    </div>
  );
};

const PatientsView = ({ doctors, patients, form, setForm, saving, onSave, onDelete, onEdit, onCancelEdit }) => (
  <div className="space-y-6">
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-slate-800">Patients CRUD</h2>
        {form.id && (
          <button onClick={onCancelEdit} className="text-sm font-semibold text-slate-600 hover:text-slate-800">Cancel Edit</button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        <FormField label="Full Name"><input className={inputClass} value={form.full_name} onChange={(e) => setForm((p) => ({ ...p, full_name: e.target.value }))} /></FormField>
        <FormField label="DOB"><input type="date" className={inputClass} value={form.dob} onChange={(e) => setForm((p) => ({ ...p, dob: e.target.value }))} /></FormField>
        <FormField label="Gender"><input className={inputClass} value={form.gender} onChange={(e) => setForm((p) => ({ ...p, gender: e.target.value }))} /></FormField>
        <FormField label="Phone"><input className={inputClass} value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} /></FormField>
        <FormField label="Condition"><input className={inputClass} value={form.medical_condition} onChange={(e) => setForm((p) => ({ ...p, medical_condition: e.target.value }))} /></FormField>
        <FormField label="Status">
          <select className={inputClass} value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}>
            <option>Stable</option>
            <option>Attention</option>
            <option>Critical</option>
            <option>Discharged</option>
          </select>
        </FormField>
        <FormField label="Last Visit"><input type="date" className={inputClass} value={form.last_visit} onChange={(e) => setForm((p) => ({ ...p, last_visit: e.target.value }))} /></FormField>
        <FormField label="Assigned Doctor">
          <select className={inputClass} value={form.assigned_doctor_id} onChange={(e) => setForm((p) => ({ ...p, assigned_doctor_id: e.target.value }))}>
            <option value="">Unassigned</option>
            {doctors.map((doctor) => (
              <option key={doctor.id} value={doctor.id}>{doctor.full_name}</option>
            ))}
          </select>
        </FormField>
      </div>

      <div className="mt-4 flex gap-2">
        <button onClick={onSave} disabled={saving} className="bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-teal-700 disabled:opacity-60">
          {form.id ? 'Update Patient' : 'Add Patient'}
        </button>
      </div>
    </div>

    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-x-auto">
      <table className="w-full text-left">
        <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
          <tr>
            <th className="px-6 py-4">Name</th>
            <th className="px-6 py-4">Age / DOB</th>
            <th className="px-6 py-4">Condition</th>
            <th className="px-6 py-4">Doctor</th>
            <th className="px-6 py-4">Last Visit</th>
            <th className="px-6 py-4">Status</th>
            <th className="px-6 py-4">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {patients.map((pt) => (
            <tr key={pt.id} className="hover:bg-slate-50">
              <td className="px-6 py-4 font-medium text-slate-800">{pt.full_name}</td>
              <td className="px-6 py-4 text-sm text-slate-600">{formatDate(pt.dob)}</td>
              <td className="px-6 py-4 text-sm text-slate-600">{pt.medical_condition || '-'}</td>
              <td className="px-6 py-4 text-sm text-slate-600">{pt.doctor_name || 'Unassigned'}</td>
              <td className="px-6 py-4 text-sm text-slate-600">{formatDate(pt.last_visit)}</td>
              <td className="px-6 py-4"><Badge status={pt.status} /></td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <button onClick={() => onEdit(pt)} className="p-2 text-slate-500 hover:text-teal-700"><Pencil size={16} /></button>
                  <button onClick={() => onDelete(pt.id)} className="p-2 text-slate-500 hover:text-rose-700"><Trash2 size={16} /></button>
                </div>
              </td>
            </tr>
          ))}
          {patients.length === 0 && (
            <tr><td colSpan={7} className="px-6 py-6 text-sm text-slate-500">No patients found.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);

const AppointmentsView = ({ doctors, patients, appointments, form, setForm, saving, onSave, onDelete, onEdit, onCancelEdit }) => (
  <div className="space-y-6">
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-slate-800">Appointments CRUD</h2>
        {form.id && <button onClick={onCancelEdit} className="text-sm font-semibold text-slate-600 hover:text-slate-800">Cancel Edit</button>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        <FormField label="Patient">
          <select className={inputClass} value={form.patient_id} onChange={(e) => setForm((p) => ({ ...p, patient_id: e.target.value }))}>
            <option value="">Select patient</option>
            {patients.map((pt) => <option key={pt.id} value={pt.id}>{pt.full_name}</option>)}
          </select>
        </FormField>
        <FormField label="Doctor">
          <select className={inputClass} value={form.doctor_id} onChange={(e) => setForm((p) => ({ ...p, doctor_id: e.target.value }))}>
            <option value="">Select doctor</option>
            {doctors.map((doctor) => <option key={doctor.id} value={doctor.id}>{doctor.full_name}</option>)}
          </select>
        </FormField>
        <FormField label="Time"><input type="datetime-local" className={inputClass} value={form.appointment_time} onChange={(e) => setForm((p) => ({ ...p, appointment_time: e.target.value }))} /></FormField>
        <FormField label="Type"><input className={inputClass} value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))} /></FormField>
        <FormField label="Status">
          <select className={inputClass} value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}>
            <option>Scheduled</option>
            <option>In Progress</option>
            <option>Completed</option>
          </select>
        </FormField>
        <FormField label="Notes"><input className={inputClass} value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} /></FormField>
      </div>

      <div className="mt-4">
        <button onClick={onSave} disabled={saving} className="bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-teal-700 disabled:opacity-60">
          {form.id ? 'Update Appointment' : 'Add Appointment'}
        </button>
      </div>
    </div>

    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-x-auto">
      <table className="w-full text-left">
        <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
          <tr>
            <th className="px-6 py-4">Time</th>
            <th className="px-6 py-4">Patient</th>
            <th className="px-6 py-4">Type</th>
            <th className="px-6 py-4">Doctor</th>
            <th className="px-6 py-4">Status</th>
            <th className="px-6 py-4">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {appointments.map((apt) => (
            <tr key={apt.id} className="hover:bg-slate-50">
              <td className="px-6 py-4 text-sm text-slate-600">{formatDateTime(apt.appointment_time)}</td>
              <td className="px-6 py-4 text-sm text-slate-700">{apt.patient_name || '-'}</td>
              <td className="px-6 py-4 text-sm text-slate-700">{apt.type || '-'}</td>
              <td className="px-6 py-4 text-sm text-slate-700">{apt.doctor_name || '-'}</td>
              <td className="px-6 py-4"><Badge status={apt.status} /></td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <button onClick={() => onEdit(apt)} className="p-2 text-slate-500 hover:text-teal-700"><Pencil size={16} /></button>
                  <button onClick={() => onDelete(apt.id)} className="p-2 text-slate-500 hover:text-rose-700"><Trash2 size={16} /></button>
                </div>
              </td>
            </tr>
          ))}
          {appointments.length === 0 && (
            <tr><td colSpan={6} className="px-6 py-6 text-sm text-slate-500">No appointments found.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);

const StaffView = ({ staff, form, setForm, onSave, onEdit }) => (
  <div className="space-y-6">
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
      <h2 className="text-lg font-bold text-slate-800 mb-4">Staff Management (Update)</h2>
      <p className="text-sm text-slate-500 mb-4">Backend currently supports update for staff details. Select a staff member from table and save changes.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        <FormField label="Department"><input className={inputClass} value={form.department} onChange={(e) => setForm((p) => ({ ...p, department: e.target.value }))} /></FormField>
        <FormField label="Specialty"><input className={inputClass} value={form.specialty} onChange={(e) => setForm((p) => ({ ...p, specialty: e.target.value }))} /></FormField>
        <FormField label="Status"><input className={inputClass} value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))} /></FormField>
        <FormField label="Shift Start"><input type="time" className={inputClass} value={form.shift_start} onChange={(e) => setForm((p) => ({ ...p, shift_start: e.target.value }))} /></FormField>
        <FormField label="Shift End"><input type="time" className={inputClass} value={form.shift_end} onChange={(e) => setForm((p) => ({ ...p, shift_end: e.target.value }))} /></FormField>
      </div>
      <div className="mt-4">
        <button onClick={onSave} disabled={!form.user_id} className="bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-teal-700 disabled:opacity-60">
          Update Selected Staff
        </button>
      </div>
    </div>

    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-x-auto">
      <table className="w-full text-left">
        <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
          <tr>
            <th className="px-6 py-4">Name</th>
            <th className="px-6 py-4">Role</th>
            <th className="px-6 py-4">Department</th>
            <th className="px-6 py-4">Shift</th>
            <th className="px-6 py-4">Status</th>
            <th className="px-6 py-4">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {staff.map((member) => (
            <tr key={member.user_id} className="hover:bg-slate-50">
              <td className="px-6 py-4 text-sm font-medium text-slate-800">{member.full_name}</td>
              <td className="px-6 py-4 text-sm text-slate-600">{member.role}</td>
              <td className="px-6 py-4 text-sm text-slate-600">{member.department || '-'}</td>
              <td className="px-6 py-4 text-sm text-slate-600">{member.shift_start && member.shift_end ? `${member.shift_start} - ${member.shift_end}` : '-'}</td>
              <td className="px-6 py-4"><Badge status={member.status} /></td>
              <td className="px-6 py-4">
                <button onClick={() => onEdit(member)} className="p-2 text-slate-500 hover:text-teal-700"><Pencil size={16} /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const ReportsView = ({ patients, appointments, staff }) => {
  const patientsByStatus = useMemo(() => {
    return patients.reduce((acc, p) => {
      const key = p.status || 'Unknown';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
  }, [patients]);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <h2 className="text-xl font-bold text-slate-800 mb-2">Reports</h2>
        <p className="text-sm text-slate-500">Map removed from reports. This page now focuses on operational summaries.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-100 p-5"><p className="text-sm text-slate-500">Total Patients</p><p className="text-3xl font-bold text-slate-800">{patients.length}</p></div>
        <div className="bg-white rounded-xl border border-slate-100 p-5"><p className="text-sm text-slate-500">Total Appointments</p><p className="text-3xl font-bold text-slate-800">{appointments.length}</p></div>
        <div className="bg-white rounded-xl border border-slate-100 p-5"><p className="text-sm text-slate-500">Total Staff</p><p className="text-3xl font-bold text-slate-800">{staff.length}</p></div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-4">Patient Status Breakdown</h3>
        <div className="flex flex-wrap gap-3">
          {Object.entries(patientsByStatus).map(([status, count]) => (
            <div key={status} className="border border-slate-200 rounded-lg px-4 py-2">
              <p className="text-xs text-slate-500 uppercase">{status}</p>
              <p className="text-xl font-bold text-slate-800">{count}</p>
            </div>
          ))}
          {Object.keys(patientsByStatus).length === 0 && <p className="text-sm text-slate-500">No patient data available.</p>}
        </div>
      </div>
    </div>
  );
};

export default function MedicTrackApp() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [location, setLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState('idle');
  const [locationError, setLocationError] = useState('');

  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [staff, setStaff] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [dashboard, setDashboard] = useState({ totalPatients: 0, todayAppointments: 0, activeStaff: 0, criticalCases: 0, upcomingAppointments: [] });
  const [saving, setSaving] = useState(false);
  const [globalError, setGlobalError] = useState('');

  const [patientForm, setPatientForm] = useState(initialPatientForm);
  const [appointmentForm, setAppointmentForm] = useState(initialAppointmentForm);
  const [staffForm, setStaffForm] = useState(initialStaffForm);

  const loadCoreData = async () => {
    try {
      setGlobalError('');
      const [dashboardRes, doctorsRes, patientsRes, appointmentsRes, staffRes] = await Promise.all([
        api.dashboard(),
        api.doctors(),
        api.patients(),
        api.appointments(),
        api.staff(),
      ]);
      setDashboard(dashboardRes || {});
      setDoctors(doctorsRes || []);
      setPatients(patientsRes || []);
      setAppointments(appointmentsRes || []);
      setStaff(staffRes || []);
    } catch (err) {
      setGlobalError(err.message || 'Unable to load records.');
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      loadCoreData();
    }
  }, [isLoggedIn]);

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('error');
      setLocationError('Your browser does not support location sharing. Open Google Maps and search for pharmacies manually.');
      return;
    }

    setLocationStatus('loading');
    setLocationError('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({ latitude: position.coords.latitude, longitude: position.coords.longitude });
        setLocationStatus('granted');
      },
      (error) => {
        setLocationStatus('error');
        setLocationError(
          error.code === error.PERMISSION_DENIED
            ? 'Location access was denied. You can still open the Google Maps pharmacy search link.'
            : 'We could not get your location right now. Try again or open the Google Maps pharmacy search link.'
        );
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  };

  const savePatient = async () => {
    if (!patientForm.full_name.trim()) {
      setGlobalError('Patient full name is required.');
      return;
    }
    try {
      setSaving(true);
      const payload = {
        full_name: patientForm.full_name,
        dob: patientForm.dob || null,
        gender: patientForm.gender || null,
        phone: patientForm.phone || null,
        address: patientForm.address || null,
        medical_condition: patientForm.medical_condition || null,
        status: patientForm.status || 'Stable',
        last_visit: patientForm.last_visit || null,
        assigned_doctor_id: patientForm.assigned_doctor_id ? Number(patientForm.assigned_doctor_id) : null,
      };
      if (patientForm.id) {
        await api.updatePatient(patientForm.id, payload);
      } else {
        await api.addPatient(payload);
      }
      setPatientForm(initialPatientForm);
      await loadCoreData();
    } catch (err) {
      setGlobalError(err.message || 'Failed to save patient.');
    } finally {
      setSaving(false);
    }
  };

  const editPatient = (pt) => {
    setPatientForm({
      id: pt.id,
      full_name: pt.full_name || '',
      dob: toDateInputValue(pt.dob),
      gender: pt.gender || '',
      phone: pt.phone || '',
      address: pt.address || '',
      medical_condition: pt.medical_condition || '',
      status: pt.status || 'Stable',
      last_visit: toDateInputValue(pt.last_visit),
      assigned_doctor_id: pt.assigned_doctor_id ? String(pt.assigned_doctor_id) : '',
    });
  };

  const deletePatient = async (id) => {
    if (!window.confirm('Delete this patient?')) return;
    try {
      await api.deletePatient(id);
      await loadCoreData();
    } catch (err) {
      setGlobalError(err.message || 'Failed to delete patient.');
    }
  };

  const saveAppointment = async () => {
    if (!appointmentForm.patient_id || !appointmentForm.doctor_id || !appointmentForm.appointment_time) {
      setGlobalError('Patient, doctor, and appointment time are required.');
      return;
    }
    try {
      setSaving(true);
      const payload = {
        patient_id: Number(appointmentForm.patient_id),
        doctor_id: Number(appointmentForm.doctor_id),
        appointment_time: appointmentForm.appointment_time,
        type: appointmentForm.type || null,
        status: appointmentForm.status || 'Scheduled',
        notes: appointmentForm.notes || null,
      };
      if (appointmentForm.id) {
        await api.updateAppointment(appointmentForm.id, payload);
      } else {
        await api.addAppointment(payload);
      }
      setAppointmentForm(initialAppointmentForm);
      await loadCoreData();
    } catch (err) {
      setGlobalError(err.message || 'Failed to save appointment.');
    } finally {
      setSaving(false);
    }
  };

  const editAppointment = (apt) => {
    setAppointmentForm({
      id: apt.id,
      patient_id: apt.patient_id ? String(apt.patient_id) : '',
      doctor_id: apt.doctor_id ? String(apt.doctor_id) : '',
      appointment_time: toDateTimeInputValue(apt.appointment_time),
      type: apt.type || 'Consultation',
      status: apt.status || 'Scheduled',
      notes: apt.notes || '',
    });
  };

  const deleteAppointment = async (id) => {
    if (!window.confirm('Delete this appointment?')) return;
    try {
      await api.deleteAppointment(id);
      await loadCoreData();
    } catch (err) {
      setGlobalError(err.message || 'Failed to delete appointment.');
    }
  };

  const editStaff = (member) => {
    setStaffForm({
      user_id: member.user_id,
      department: member.department || '',
      specialty: member.specialty || '',
      shift_start: member.shift_start ? String(member.shift_start).slice(0, 5) : '',
      shift_end: member.shift_end ? String(member.shift_end).slice(0, 5) : '',
      status: member.status || 'On Duty',
    });
  };

  const saveStaff = async () => {
    if (!staffForm.user_id) {
      setGlobalError('Select a staff member first.');
      return;
    }
    try {
      setSaving(true);
      await api.updateStaff(staffForm.user_id, {
        department: staffForm.department || null,
        specialty: staffForm.specialty || null,
        shift_start: staffForm.shift_start || null,
        shift_end: staffForm.shift_end || null,
        status: staffForm.status || 'Off Duty',
      });
      await loadCoreData();
    } catch (err) {
      setGlobalError(err.message || 'Failed to update staff.');
    } finally {
      setSaving(false);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardView
            dashboard={dashboard}
            location={location}
            locationStatus={locationStatus}
            locationError={locationError}
            onRequestLocation={requestLocation}
          />
        );
      case 'patients':
        return (
          <PatientsView
            doctors={doctors}
            patients={patients}
            form={patientForm}
            setForm={setPatientForm}
            saving={saving}
            onSave={savePatient}
            onDelete={deletePatient}
            onEdit={editPatient}
            onCancelEdit={() => setPatientForm(initialPatientForm)}
          />
        );
      case 'appointments':
        return (
          <AppointmentsView
            doctors={doctors}
            patients={patients}
            appointments={appointments}
            form={appointmentForm}
            setForm={setAppointmentForm}
            saving={saving}
            onSave={saveAppointment}
            onDelete={deleteAppointment}
            onEdit={editAppointment}
            onCancelEdit={() => setAppointmentForm(initialAppointmentForm)}
          />
        );
      case 'staff':
        return (
          <StaffView
            staff={staff}
            form={staffForm}
            setForm={setStaffForm}
            onSave={saveStaff}
            onEdit={editStaff}
          />
        );
      case 'reports':
        return <ReportsView patients={patients} appointments={appointments} staff={staff} />;
      default:
        return <ReportsView patients={patients} appointments={appointments} staff={staff} />;
    }
  };

  if (!isLoggedIn) {
    return (
      <LoginView
        onLogin={() => setIsLoggedIn(true)}
        onRequestLocation={requestLocation}
        location={location}
        locationStatus={locationStatus}
        locationError={locationError}
      />
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-800 overflow-hidden">
      {sidebarOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden" onClick={() => setSidebarOpen(false)} />}

      <aside
        className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
      >
        <div className="h-16 flex items-center px-6 border-b border-slate-100">
          <img src={BRAND_LOGO_SRC} alt="MedicTrack logo" className="h-14 w-auto object-contain" />
        </div>

        <div className="py-6 flex flex-col justify-between h-[calc(100%-4rem)]">
          <nav className="space-y-1">
            <SidebarItem icon={LayoutDashboard} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => { setActiveTab('dashboard'); setSidebarOpen(false); }} />
            <SidebarItem icon={Users} label="Patients" active={activeTab === 'patients'} onClick={() => { setActiveTab('patients'); setSidebarOpen(false); }} />
            <SidebarItem icon={Calendar} label="Appointments" active={activeTab === 'appointments'} onClick={() => { setActiveTab('appointments'); setSidebarOpen(false); }} />
            <SidebarItem icon={Stethoscope} label="Staff" active={activeTab === 'staff'} onClick={() => { setActiveTab('staff'); setSidebarOpen(false); }} />
            <SidebarItem icon={FileText} label="Reports" active={activeTab === 'reports'} onClick={() => { setActiveTab('reports'); setSidebarOpen(false); }} />
          </nav>

          <div className="px-6">
            <button
              onClick={() => setIsLoggedIn(false)}
              className="flex items-center w-full px-4 py-2 text-sm font-medium text-slate-500 hover:text-rose-600 transition-colors"
            >
              <LogOut size={18} className="mr-3" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex justify-between items-center px-6 shadow-sm z-10">
          <button className="md:hidden text-slate-500 hover:text-slate-700" onClick={() => setSidebarOpen(true)}>
            <Menu size={24} />
          </button>

          <div className="hidden md:flex relative w-96">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
            <input type="text" placeholder="Search records..." className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
          </div>

          <div className="flex items-center space-x-4">
            <button className="relative p-2 text-slate-400 hover:bg-slate-50 rounded-full transition"><Bell size={20} /></button>
            <button className="p-2 text-slate-400 hover:bg-slate-50 rounded-full transition"><Settings size={20} /></button>
            <div className="flex items-center pl-2 border-l border-slate-200">
              <div className="h-8 w-8 rounded-full bg-teal-600 flex items-center justify-center text-white font-bold text-sm mr-2">DA</div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 bg-slate-50">
          {globalError && (
            <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 flex items-center gap-2">
              <AlertCircle size={16} /> {globalError}
            </div>
          )}
          <div className="max-w-7xl mx-auto">{renderContent()}</div>
        </main>
      </div>
    </div>
  );
}
