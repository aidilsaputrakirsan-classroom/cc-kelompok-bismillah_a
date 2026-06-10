/**
 * LaporIn ITK — API Service Layer
 * Semua komunikasi dengan backend FastAPI via API Gateway
 *
 * Arsitektur Microservices:
 *   Frontend → Gateway (Nginx :80) → auth-service (:8001) / report-service (:8002)
 *
 * Error Handling:
 *   - 502/503/504 / network error → dispatch event ke ServiceStatusContext
 *   - Auth error (503 on /auth/*) → dispatch auth-error event untuk banner global
 */

// Gateway URL — satu pintu masuk untuk semua microservice
// Development : http://localhost  (Nginx gateway port 80)
// Production  : https://laporin-gateway.up.railway.app
const BASE_URL = import.meta.env.VITE_API_URL || "";

// ============================================================
// EVENT HELPERS — notifikasi ke ServiceStatusContext
// ============================================================

function _emitServiceError(path) {
  const type = path.startsWith("/auth") ? "auth" : "service";
  window.dispatchEvent(new CustomEvent("laporin:service-error", { detail: { type } }));
}

function _emitServiceRecovered() {
  window.dispatchEvent(new CustomEvent("laporin:service-recovered"));
}

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
    if (!token) {
      clearToken();
      window.location.href = "/login";
      throw new Error("Sesi tidak ditemukan. Silakan login kembali.");
    }
    headers["Authorization"] = `Bearer ${token}`;
  }

  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);

  // --- Network error: gateway tidak bisa dihubungi sama sekali ---
  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, options);
  } catch {
    // TypeError: Failed to fetch — terjadi saat Docker/gateway belum jalan
    _emitServiceError(path);
    throw new Error(
      "Layanan sementara tidak tersedia. " +
      "Tidak dapat terhubung ke server. Silakan coba beberapa saat lagi."
    );
  }

  // --- Gateway error: microservice di belakang Nginx sedang bermasalah ---
  if (res.status === 502) {
    _emitServiceError(path);
    throw new Error(
      "Layanan sementara tidak tersedia (502 Bad Gateway). " +
      "Salah satu layanan backend sedang restart, silakan coba lagi nanti."
    );
  }
  if (res.status === 503) {
    _emitServiceError(path);
    throw new Error(
      "Layanan sementara tidak tersedia (503 Service Unavailable). " +
      "Server sedang dalam pemeliharaan. Silakan coba beberapa saat lagi."
    );
  }
  if (res.status === 504) {
    _emitServiceError(path);
    throw new Error(
      "Layanan sementara tidak tersedia (504 Gateway Timeout). " +
      "Server terlalu lama merespons. Silakan coba beberapa saat lagi."
    );
  }

  if (res.status === 401) {
    if (path !== "/auth/login") {
      clearToken();
      window.location.href = "/login";
      throw new Error("Sesi Anda telah berakhir, silakan login kembali.");
    } else {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "Email atau password salah");
    }
  }
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
  _emitServiceRecovered();
  return res.json();
}


// ============================================================
// SYSTEM — Health Checks
// ============================================================

export const checkHealth = async () => {
  try {
    const data = await request("GET", "/health", null, false);
    return data?.status === "healthy";
  } catch {
    return false;
  }
};

/**
 * Cek apakah auth service sedang aktif.
 * @returns {{ ok: boolean, status: string|null }}
 */
export const checkAuthHealth = async () => {
  try {
    const res = await fetch(`${BASE_URL}/auth/health`);
    if (!res.ok) return { ok: false, status: res.status };
    const data = await res.json();
    const ok = data?.status === "healthy" || data?.status === "ok";
    return { ok, status: data?.status ?? null };
  } catch {
    return { ok: false, status: null };
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

export const fetchMapReports = async ({ status, kategori_id } = {}) => {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (kategori_id) params.set("kategori_id", kategori_id);
  const qs = params.toString();
  return request("GET", `/reports/map${qs ? `?${qs}` : ""}`);
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

// ============================================================
// REPORTS (USER CRUD — Edit & Delete)
// ============================================================

export const updateReportByUser = async (id, data) => {
  return request("PUT", `/reports/${id}`, data);
};

export const deleteReport = async (id) => {
  return request("DELETE", `/reports/${id}`);
};

// ============================================================
// DAFTAR KEHILANGAN (Publik untuk semua User)
// ============================================================

/**
 * Ambil semua laporan Kehilangan dari semua user.
 * Mendukung pagination dan pencarian berdasarkan nama/deskripsi/lokasi barang.
 */
export const fetchLostReports = async ({ skip = 0, limit = 20, search } = {}) => {
  const params = new URLSearchParams({ skip, limit });
  if (search) params.set("search", search);
  return request("GET", `/reports/kehilangan?${params}`);
};