const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// ==================== TOKEN MANAGEMENT ====================

let authToken = null;

export function setToken(token) {
  authToken = token;
}

export function getToken() {
  return authToken;
}

export function clearToken() {
  authToken = null;
}

function authHeaders() {
  const headers = {};
  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }
  return headers;
}

const FIELD_LABEL = {
  email: "Email",
  password: "Password",
  name: "Nama",
  price: "Harga",
  quantity: "Jumlah",
  description: "Deskripsi",
};

function prettifyField(path = "") {
  if (!path) return "";
  return path
    .split(".")
    .map((segment) => FIELD_LABEL[segment] || segment)
    .join(".");
}

function normalizeMessage(message) {
  if (typeof message !== "string") {
    return "Input tidak valid";
  }

  if (message.includes("String should have at least")) {
    return "Panjang karakter belum memenuhi batas minimal.";
  }
  if (message.includes("String should have at most")) {
    return "Panjang karakter melebihi batas maksimal.";
  }
  if (message.includes("Input should be greater than")) {
    return "Nilai harus lebih besar dari batas minimal.";
  }
  if (message.includes("Field required")) {
    return "Field wajib diisi.";
  }

  return message;
}

function normalizeErrorDetail(detail) {
  if (typeof detail === "string") {
    return detail;
  }

  if (Array.isArray(detail)) {
    return detail
      .map((entry) => {
        if (typeof entry === "string") {
          return entry;
        }

        if (entry && typeof entry === "object") {
          const field = Array.isArray(entry.loc)
            ? entry.loc.filter((part) => part !== "body").join(".")
            : "";
          const msg = normalizeMessage(entry.msg || JSON.stringify(entry));
          const prettyField = prettifyField(field);
          return prettyField ? `${prettyField}: ${msg}` : msg;
        }

        return String(entry);
      })
      .join("; ");
  }

  if (detail && typeof detail === "object") {
    if (typeof detail.msg === "string") {
      return detail.msg;
    }
    return JSON.stringify(detail);
  }

  return null;
}

// Helper: handle response errors
async function handleResponse(response) {
  if (response.status === 401 && authToken) {
    clearToken();
    throw new Error("UNAUTHORIZED");
  }
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    const detail = normalizeErrorDetail(error.detail);
    if (detail) {
      throw new Error(detail);
    }

    if (response.status === 400) {
      throw new Error("Permintaan tidak valid. Periksa data yang dikirim.");
    }
    if (response.status === 403) {
      throw new Error("Akses ditolak. Akun tidak memiliki izin.");
    }
    if (response.status === 404) {
      throw new Error("Data tidak ditemukan.");
    }

    throw new Error(`Request gagal (${response.status})`);
  }
  // 204 No Content
  if (response.status === 204) return null;
  return response.json();
}

// ==================== AUTH API ====================

export async function register(userData) {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });
  return handleResponse(response);
}

export async function login(email, password) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await handleResponse(response);
  setToken(data.access_token);
  return data;
}

export async function getMe() {
  const response = await fetch(`${API_URL}/auth/me`, {
    headers: authHeaders(),
  });
  return handleResponse(response);
}

// ==================== ITEMS API ====================

export async function fetchItems(search = "", skip = 0, limit = 20) {
  const params = new URLSearchParams();
  if (search) params.append("search", search);
  params.append("skip", skip);
  params.append("limit", limit);

  const response = await fetch(`${API_URL}/items?${params}`, {
    headers: authHeaders(),
  });
  return handleResponse(response);
}

export async function createItem(itemData) {
  const response = await fetch(`${API_URL}/items`, {
    method: "POST",
    headers: {
      ...authHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(itemData),
  });
  return handleResponse(response);
}

export async function updateItem(id, itemData) {
  const response = await fetch(`${API_URL}/items/${id}`, {
    method: "PUT",
    headers: {
      ...authHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(itemData),
  });
  return handleResponse(response);
}

export async function deleteItem(id) {
  const response = await fetch(`${API_URL}/items/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  return handleResponse(response);
}

export async function checkHealth() {
  try {
    const response = await fetch(`${API_URL}/health`);
    const data = await response.json();
    return data.status === "healthy";
  } catch {
    return false;
  }
}
