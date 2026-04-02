import React, { useState } from 'react';
import {
  Activity,
  Users,
  Calendar,
  UserPlus,
  Search,
  Bell,
  Settings,
  LogOut,
  ChevronRight,
  Stethoscope,
  FileText,
  LayoutDashboard,
  Menu,
  MoreVertical,
  Clock,
  AlertCircle,
  Lock,
  Mail,
  ArrowRight,
  MapPin,
  LocateFixed,
  ExternalLink
} from 'lucide-react';

// --- Mock Data ---

const MOCK_STATS = [
  { label: 'Total Patients', value: '1,284', change: '+12%', icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
  { label: 'Appointments Today', value: '42', change: 'On Track', icon: Calendar, color: 'text-teal-600', bg: 'bg-teal-100' },
  { label: 'Active Staff', value: '38', change: 'Full Staff', icon: Stethoscope, color: 'text-indigo-600', bg: 'bg-indigo-100' },
  { label: 'Critical Cases', value: '7', change: '-2%', icon: Activity, color: 'text-rose-600', bg: 'bg-rose-100' },
];

const MOCK_PATIENTS = [
  { id: 'PT-001', name: 'Sarah Jenkins', age: 34, condition: 'Hypertension', status: 'Stable', lastVisit: '2023-10-24', doctor: 'Dr. Smith' },
  { id: 'PT-002', name: 'Michael Chen', age: 58, condition: 'Type 2 Diabetes', status: 'Attention', lastVisit: '2023-10-22', doctor: 'Dr. Rao' },
  { id: 'PT-003', name: 'Emily Davis', age: 22, condition: 'Routine Checkup', status: 'Discharged', lastVisit: '2023-10-25', doctor: 'Dr. Smith' },
  { id: 'PT-004', name: 'Robert Wilson', age: 45, condition: 'Post-Op Recovery', status: 'Critical', lastVisit: '2023-10-25', doctor: 'Dr. Alverez' },
  { id: 'PT-005', name: 'Anita Patel', age: 29, condition: 'Migraine', status: 'Stable', lastVisit: '2023-10-20', doctor: 'Dr. Rao' },
];

const MOCK_APPOINTMENTS = [
  { id: 1, time: '09:00 AM', patient: 'Sarah Jenkins', type: 'Follow-up', doctor: 'Dr. Smith', status: 'Completed' },
  { id: 2, time: '10:30 AM', patient: 'James Carter', type: 'Consultation', doctor: 'Dr. Alverez', status: 'In Progress' },
  { id: 3, time: '01:00 PM', patient: 'Linda May', type: 'Lab Review', doctor: 'Dr. Rao', status: 'Scheduled' },
  { id: 4, time: '02:15 PM', patient: 'Marcus Reid', type: 'Emergency', doctor: 'Dr. Smith', status: 'Scheduled' },
];

const MOCK_STAFF = [
  { id: 1, name: 'Dr. Ayesha Rao', role: 'Cardiologist', department: 'Cardiology', shift: '08:00 - 16:00', status: 'On Duty' },
  { id: 2, name: 'Dr. John Smith', role: 'General Practitioner', department: 'General Medicine', shift: '09:00 - 17:00', status: 'In Surgery' },
  { id: 3, name: 'Nurse Clara Wu', role: 'Senior Nurse', department: 'ER', shift: '07:00 - 19:00', status: 'On Duty' },
  { id: 4, name: 'Dr. Luis Alverez', role: 'Neurologist', department: 'Neurology', shift: '10:00 - 18:00', status: 'On Break' },
];

const BRAND_LOGO_SRC = '/branding/medt.png';

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
            {locationStatus === 'granted' ? 'Location shared and ready' : locationStatus === 'loading' ? 'Waiting for your location permission' : 'Request location to personalize nearby results'}
          </div>

          {locationError && (
            <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {locationError}
            </div>
          )}

          {hasLocation && (
            <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              Location captured. Google Maps is centered around your current position.
            </div>
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
          <div className="mt-3 text-xs text-slate-300 flex items-center justify-between gap-3">
            <span>{hasLocation ? `Centered near ${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}` : 'Showing a pharmacy search preview until location is shared'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Components ---

const SidebarItem = ({ icon: Icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center w-full px-6 py-3 text-sm font-medium transition-colors duration-200 
      ${active ? 'text-teal-600 bg-teal-50 border-r-4 border-teal-600' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
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
    'In Surgery': 'bg-purple-100 text-purple-700',
    'On Break': 'bg-orange-100 text-orange-700',
    Completed: 'bg-green-100 text-green-700',
    'In Progress': 'bg-blue-100 text-blue-700',
    Scheduled: 'bg-slate-100 text-slate-700',
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${styles[status] || 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  );
};

// --- Views ---

const LoginView = ({ onLogin, onRequestLocation, location, locationStatus, locationError }) => (
  <div className="min-h-screen flex bg-slate-50">
    {/* Left Side - Brand & Info */}
    <div className="hidden lg:flex lg:w-1/2 bg-teal-600 text-white flex-col justify-between p-12 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500 rounded-bl-full opacity-50"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-700 rounded-tr-full opacity-50"></div>

      <div className="relative z-10 max-w-xl">
        <div className="mb-8">
          <img
            src={BRAND_LOGO_SRC}
            alt="MedicTrack logo"
            className="h-24 w-auto object-contain"
          />
        </div>
        <h1 className="text-4xl font-bold leading-tight mb-4">
          Streamline Your Healthcare Operations
        </h1>
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

        <p className="text-sm text-teal-200">© 2024 MedicTrack Systems Inc.</p>
      </div>
    </div>

    {/* Right Side - Login Form */}
    <div className="w-full lg:w-1/2 flex flex-col justify-center items-stretch p-6 sm:p-8 lg:p-12">
      <div className="w-full max-w-md mx-auto space-y-6 lg:space-y-8">
        <div className="lg:hidden flex items-center justify-center mb-8">
          <img
            src={BRAND_LOGO_SRC}
            alt="MedicTrack logo"
            className="h-20 w-auto object-contain"
          />
        </div>

        <div className="text-center lg:text-left">
          <h2 className="text-3xl font-bold text-slate-900">Welcome back</h2>
          <p className="mt-2 text-slate-500">Please enter your details to sign in.</p>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); onLogin(); }} className="mt-8 space-y-6">
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="email"
                  defaultValue="admin@medictrack.com"
                  className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-slate-50 focus:bg-white transition-all outline-none"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="password"
                  defaultValue="password123"
                  className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-slate-50 focus:bg-white transition-all outline-none"
                  placeholder="Enter your password"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input type="checkbox" className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-slate-300 rounded" />
              <label className="ml-2 block text-sm text-slate-600">Remember me</label>
            </div>
            <div className="text-sm">
              <a href="#" className="font-medium text-teal-600 hover:text-teal-500">Forgot password?</a>
            </div>
          </div>

          <button
            type="submit"
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 shadow-lg shadow-teal-600/30 transition-all active:scale-[0.98]"
          >
            Sign in
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <p className="text-center text-sm text-slate-500">
          Don't have an account? <a href="#" className="font-bold text-teal-600 hover:text-teal-500">Contact Administration</a>
        </p>
      </div>
    </div>
  </div>
);

const DashboardView = ({ location, locationStatus, locationError, onRequestLocation }) => (
  <div className="space-y-6">
    {/* Welcome Header */}
    <div className="bg-gradient-to-r from-teal-800 to-teal-600 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full transform translate-x-1/2 -translate-y-1/2"></div>
      <div className="relative z-10">
        <h2 className="text-3xl font-bold mb-2">Welcome Back, Dr. Admin</h2>
        <p className="text-teal-100 mb-6 max-w-xl">You have 4 appointments scheduled for today and 7 critical patient cases requiring attention.</p>
        <div className="flex space-x-3">
          <button className="bg-white text-teal-800 px-4 py-2 rounded-lg text-sm font-bold hover:bg-teal-50 transition">View Schedule</button>
          <button className="bg-teal-700 text-white border border-teal-500 px-4 py-2 rounded-lg text-sm font-bold hover:bg-teal-600 transition">Review Cases</button>
        </div>
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
      {MOCK_STATS.map((stat, idx) => (
        <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 transition hover:shadow-md hover:-translate-y-1 duration-300">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">{stat.label}</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">{stat.value}</h3>
            </div>
            <div className={`p-2 rounded-lg ${stat.bg}`}>
              <stat.icon size={20} className={stat.color} />
            </div>
          </div>
          <p className="text-xs font-medium text-slate-400 mt-4">
            <span className={stat.change.includes('+') ? 'text-green-600' : stat.change.includes('-') ? 'text-rose-600' : 'text-slate-600'}>
              {stat.change}
            </span> vs last month
          </p>
        </div>
      ))}
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Recent Activity / Chart Placeholder */}
      <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-slate-800">Patient Admittance Analytics</h3>
          <select className="text-sm border-slate-200 rounded-md text-slate-500 bg-slate-50 p-1">
            <option>Last 7 Days</option>
            <option>Last Month</option>
          </select>
        </div>
        <div className="h-64 bg-slate-50 rounded-lg flex items-center justify-center border border-dashed border-slate-300 relative overflow-hidden group">
          <div className="text-center z-10">
            <Activity className="mx-auto text-slate-300 mb-2" size={48} />
            <p className="text-slate-400 text-sm">Real-time Visualization</p>
          </div>
          <svg className="absolute bottom-0 left-0 right-0 h-32 w-full text-teal-100 opacity-50" viewBox="0 0 100 40" preserveAspectRatio="none">
            <path d="M0 40 L0 30 Q10 10 20 25 T40 15 T60 30 T80 10 T100 20 L100 40 Z" fill="currentColor" />
          </svg>
        </div>
      </div>

      {/* Upcoming Schedule */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <h3 className="text-lg font-bold text-slate-800 mb-4">Upcoming Schedule</h3>
        <div className="space-y-4">
          {MOCK_APPOINTMENTS.slice(0, 3).map((appt) => (
            <div key={appt.id} className="flex items-start pb-4 border-b border-slate-50 last:border-0 last:pb-0">
              <div className="bg-teal-50 text-teal-700 p-2 rounded-lg mr-3 text-center min-w-[60px]">
                <span className="block text-xs font-bold">{appt.time}</span>
              </div>
              <div>
                <h4 className="font-semibold text-slate-800 text-sm">{appt.patient}</h4>
                <p className="text-xs text-slate-500">{appt.type} with {appt.doctor}</p>
              </div>
            </div>
          ))}
          <button className="w-full mt-2 py-2 text-sm text-teal-600 font-medium hover:bg-teal-50 rounded-lg transition border border-transparent hover:border-teal-100">
            View All Schedule
          </button>
        </div>
      </div>
    </div>
  </div>
);

const PatientsView = () => (
  <div className="bg-white rounded-xl shadow-sm border border-slate-100 flex flex-col h-full">
    <div className="p-6 border-b border-slate-100 flex justify-between items-center">
      <h2 className="text-lg font-bold text-slate-800">Patient Records</h2>
      <button className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center transition shadow-lg shadow-teal-600/20">
        <UserPlus size={16} className="mr-2" />
        Add Patient
      </button>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
          <tr>
            <th className="px-6 py-4">ID</th>
            <th className="px-6 py-4">Patient Name</th>
            <th className="px-6 py-4">Age</th>
            <th className="px-6 py-4">Condition</th>
            <th className="px-6 py-4">Assigned Dr.</th>
            <th className="px-6 py-4">Last Visit</th>
            <th className="px-6 py-4">Status</th>
            <th className="px-6 py-4">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {MOCK_PATIENTS.map((pt) => (
            <tr key={pt.id} className="hover:bg-slate-50 transition">
              <td className="px-6 py-4 text-sm font-medium text-slate-900">{pt.id}</td>
              <td className="px-6 py-4">
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-xs mr-3">
                    {pt.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <span className="text-sm text-slate-800 font-medium">{pt.name}</span>
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-slate-600">{pt.age}</td>
              <td className="px-6 py-4 text-sm text-slate-600">{pt.condition}</td>
              <td className="px-6 py-4 text-sm text-slate-600">{pt.doctor}</td>
              <td className="px-6 py-4 text-sm text-slate-600">{pt.lastVisit}</td>
              <td className="px-6 py-4"><Badge status={pt.status} /></td>
              <td className="px-6 py-4">
                <button className="text-slate-400 hover:text-teal-600 transition">
                  <MoreVertical size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const AppointmentsView = () => (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-bold text-slate-800">Appointment Management</h2>
      <div className="flex space-x-2">
        <button className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50">Today</button>
        <button className="bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-700 shadow-lg shadow-teal-600/20">+ New Appointment</button>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {MOCK_APPOINTMENTS.map((apt) => (
        <div key={apt.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col hover:border-teal-200 transition duration-200">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-md text-sm font-bold flex items-center">
              <Clock size={14} className="mr-1" /> {apt.time}
            </div>
            <Badge status={apt.status} />
          </div>
          <h3 className="text-lg font-bold text-slate-800">{apt.patient}</h3>
          <p className="text-slate-500 text-sm mb-4">{apt.type}</p>
          <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center text-sm text-slate-600">
              <Stethoscope size={16} className="mr-2 text-teal-600" />
              {apt.doctor}
            </div>
            <button className="text-teal-600 hover:text-teal-800 text-sm font-medium hover:underline">Details</button>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const StaffView = () => (
  <div className="bg-white rounded-xl shadow-sm border border-slate-100">
    <div className="p-6 border-b border-slate-100 flex justify-between items-center">
      <h2 className="text-lg font-bold text-slate-800">Medical Staff Directory</h2>
      <div className="relative">
        <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
        <input
          type="text"
          placeholder="Search staff..."
          className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-teal-500 w-64 bg-slate-50 focus:bg-white transition"
        />
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {MOCK_STAFF.map(staff => (
        <div key={staff.id} className="border border-slate-200 rounded-xl p-4 flex items-start space-x-4 hover:shadow-md transition bg-gradient-to-br from-white to-slate-50/50">
          <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-lg">
            {staff.name.split(' ')[1][0]}
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-slate-800">{staff.name}</h4>
            <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">{staff.role}</p>
            <p className="text-sm text-slate-600 mb-2">{staff.department}</p>
            <div className="flex items-center justify-between mt-3">
              <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded">{staff.shift}</span>
              <Badge status={staff.status} />
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// --- Main App ---

export default function MedicTrackApp() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [location, setLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState('idle');
  const [locationError, setLocationError] = useState('');

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
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
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

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <DashboardView location={location} locationStatus={locationStatus} locationError={locationError} onRequestLocation={requestLocation} />;
      case 'patients': return <PatientsView />;
      case 'staff': return <StaffView />;
      case 'appointments': return <AppointmentsView />;
      default: return <DashboardView />;
    }
  };

  if (!isLoggedIn) {
    return <LoginView onLogin={() => setIsLoggedIn(true)} onRequestLocation={requestLocation} location={location} locationStatus={locationStatus} locationError={locationError} />;
  }

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-800 overflow-hidden">

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-16 flex items-center px-6 border-b border-slate-100">
          <img
            src={BRAND_LOGO_SRC}
            alt="MedicTrack logo"
            className="h-14 w-auto object-contain"
          />
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
            <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl p-4 mb-6 border border-teal-100">
              <h4 className="text-teal-900 font-bold text-sm mb-1">Upgrade Plan</h4>
              <p className="text-teal-700 text-xs mb-3 opacity-80">Get access to AI Analytics.</p>
              <button className="w-full bg-teal-600 hover:bg-teal-700 text-white text-xs py-2 rounded-lg transition shadow-sm">Upgrade Now</button>
            </div>
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

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex justify-between items-center px-6 shadow-sm z-10">
          <button
            className="md:hidden text-slate-500 hover:text-slate-700"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={24} />
          </button>

          <div className="hidden md:flex relative w-96">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search patients, doctors, or records..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-teal-500 focus:bg-white transition"
            />
          </div>

          <div className="flex items-center space-x-4">
            <button className="relative p-2 text-slate-400 hover:bg-slate-50 rounded-full transition">
              <Bell size={20} />
              <span className="absolute top-2 right-2 h-2 w-2 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>
            <button className="p-2 text-slate-400 hover:bg-slate-50 rounded-full transition">
              <Settings size={20} />
            </button>
            <div className="flex items-center pl-2 border-l border-slate-200">
              <div className="h-8 w-8 rounded-full bg-teal-600 flex items-center justify-center text-white font-bold text-sm mr-2 shadow-sm ring-2 ring-teal-100">
                DA
              </div>
              <div className="hidden lg:block">
                <p className="text-sm font-bold text-slate-800">Dr. Admin</p>
                <p className="text-xs text-slate-500">Administrator</p>
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto p-6 bg-slate-50">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>

    </div>
  );
}
