/**
 * LaporIn ITK — API Service Layer
 * Semua komunikasi dengan backend FastAPI
 */

// Gunakan proxy Vite di development (BASE_URL kosong = same origin)
// Vite proxy (vite.config.js) yang akan forward ke localhost:8000
const BASE_URL = "";

// ============================================================
// TOKEN MANAGEMENT
// ============================================================

export const setToken = (token) => localStorage.setItem("laporin_token", token);
export const getToken = () => localStorage.getItem("laporin_token");
export const clearToken = () => {
  localStorage.removeItem("laporin_token");
  localStorage.removeItem("laporin_user");
};

export const setUser = (user) => localStorage.setItem("laporin_user", JSON.stringify(user));
export const getUser = () => {
  const u = localStorage.getItem("laporin_user");
  return u ? JSON.parse(u) : null;
};

// ============================================================
// HTTP HELPER
// ============================================================

async function request(method, path, body = null, requireAuth = true) {
  const headers = { "Content-Type": "application/json" };

  if (requireAuth) {
    const token = getToken();
    if (!token) throw new Error("UNAUTHORIZED");
    headers["Authorization"] = `Bearer ${token}`;
  }

  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(`${BASE_URL}${path}`, options);

  if (res.status === 401) throw new Error("UNAUTHORIZED");
  if (res.status === 403) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Akses ditolak");
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const detail = err.detail;
    if (Array.isArray(detail)) {
      throw new Error(detail.map((d) => d.msg).join(", "));
    }
    throw new Error(detail || `Error ${res.status}`);
  }

  if (res.status === 204) return null;
  return res.json();
}

// ============================================================
// SYSTEM
// ============================================================

export const checkHealth = async () => {
  try {
    const data = await request("GET", "/health", null, false);
    return data?.status === "healthy";
  } catch {
    return false;
  }
};

// ============================================================
// AUTH
// ============================================================

export const register = async ({ nama, email, password, no_hp }) => {
  const user = await request("POST", "/auth/register", { nama, email, password, no_hp }, false);
  return user;
};

export const login = async (email, password) => {
  const data = await request("POST", "/auth/login", { email, password }, false);
  setToken(data.access_token);
  setUser(data.user);
  return data;
};

export const getMe = async () => {
  return request("GET", "/auth/me");
};

// ============================================================
// CATEGORIES & UNITS
// ============================================================

export const fetchCategories = async () => {
  return request("GET", "/categories", null, false);
};

export const fetchUnits = async () => {
  return request("GET", "/units");
};

// ============================================================
// REPORTS (USER)
// ============================================================

export const fetchReports = async ({ skip = 0, limit = 20, status, kategori_id, search } = {}) => {
  const params = new URLSearchParams({ skip, limit });
  if (status) params.set("status", status);
  if (kategori_id) params.set("kategori_id", kategori_id);
  if (search) params.set("search", search);
  return request("GET", `/reports?${params}`);
};

export const getReport = async (id) => {
  return request("GET", `/reports/${id}`);
};

export const createReport = async (reportData) => {
  return request("POST", "/reports", reportData);
};

export const addTrackingLocation = async (reportId, locationData) => {
  return request("POST", `/reports/${reportId}/locations`, locationData);
};

// ============================================================
// COMMENTS
// ============================================================

export const fetchComments = async (reportId) => {
  return request("GET", `/reports/${reportId}/comments`);
};

export const createComment = async (reportId, pesan) => {
  return request("POST", `/reports/${reportId}/comments`, { pesan });
};

// ============================================================
// NOTIFICATIONS
// ============================================================

export const fetchNotifications = async (unreadOnly = false) => {
  const params = unreadOnly ? "?unread_only=true" : "";
  return request("GET", `/notifications${params}`);
};

export const markNotificationRead = async (id) => {
  return request("PATCH", `/notifications/${id}/read`);
};

// ============================================================
// FEEDBACK
// ============================================================

export const submitFeedback = async ({ report_id, rating, komentar }) => {
  return request("POST", "/feedback", { report_id, rating, komentar });
};

// ============================================================
// ADMIN
// ============================================================

export const fetchDashboardStats = async () => {
  return request("GET", "/admin/stats");
};

export const fetchAllReports = async ({ skip = 0, limit = 20, status, kategori_id, search } = {}) => {
  const params = new URLSearchParams({ skip, limit });
  if (status) params.set("status", status);
  if (kategori_id) params.set("kategori_id", kategori_id);
  if (search) params.set("search", search);
  return request("GET", `/admin/reports?${params}`);
};

export const updateReport = async (id, data) => {
  return request("PUT", `/admin/reports/${id}`, data);
};

export const assignReport = async (reportId, unitId) => {
  return request("POST", `/admin/reports/${reportId}/assign`, { unit_id: unitId });
};