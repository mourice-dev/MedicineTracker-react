async function request(path, options = {}) {
  const response = await fetch(path, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || `Request failed: ${response.status}`);
  }
  return data;
}

export const api = {
  login: (payload) => request("/api/auth/login", { method: "POST", body: JSON.stringify(payload) }),
  register: (payload) => request("/api/auth/register", { method: "POST", body: JSON.stringify(payload) }),
  dashboard: () => request("/api/dashboard"),
  doctors: () => request("/api/doctors"),
  patients: (query = "") => request(`/api/patients${query ? `?${query}` : ""}`),
  addPatient: (payload) => request("/api/patients", { method: "POST", body: JSON.stringify(payload) }),
  updatePatient: (id, payload) => request(`/api/patients/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  deletePatient: (id) => request(`/api/patients/${id}`, { method: "DELETE" }),
  appointments: (query = "") => request(`/api/appointments${query ? `?${query}` : ""}`),
  addAppointment: (payload) => request("/api/appointments", { method: "POST", body: JSON.stringify(payload) }),
  updateAppointment: (id, payload) => request(`/api/appointments/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  deleteAppointment: (id) => request(`/api/appointments/${id}`, { method: "DELETE" }),
  staff: (query = "") => request(`/api/staff${query ? `?${query}` : ""}`),
  updateStaff: (userId, payload) => request(`/api/staff/${userId}`, { method: "PUT", body: JSON.stringify(payload) }),
  medicineCities: () => request("/api/medicine/cities"),
  medicinePharmacies: (city = "") => request(`/api/medicine/pharmacies${city ? `?city=${encodeURIComponent(city)}` : ""}`),
  nearestMedicine: ({ medicine, city, lat, lng, limit = 10 }) => {
    const params = new URLSearchParams();
    params.set("medicine", medicine);
    if (city) params.set("city", city);
    if (lat !== undefined && lat !== null) params.set("lat", String(lat));
    if (lng !== undefined && lng !== null) params.set("lng", String(lng));
    params.set("limit", String(limit));
    return request(`/api/medicine/search?${params.toString()}`);
  },
};
