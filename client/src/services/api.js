import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const MUTATING_METHODS = new Set(["post", "put", "patch", "delete"]);

let inMemoryCsrfToken = null;
let csrfPromise = null;

export function setCsrfToken(token) {
  inMemoryCsrfToken = token || null;
}

export function clearCsrfToken() {
  inMemoryCsrfToken = null;
}

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

async function ensureCsrfToken() {
  if (inMemoryCsrfToken) {
    return inMemoryCsrfToken;
  }

  if (!csrfPromise) {
    csrfPromise = api
      .get("/auth/csrf-token")
      .then((response) => {
        const token = response.data?.csrfToken || null;
        inMemoryCsrfToken = token;
        return token;
      })
      .finally(() => {
        csrfPromise = null;
      });
  }

  return csrfPromise;
}

api.interceptors.request.use(async (config) => {
  const method = (config.method || "get").toLowerCase();
  const url = config.url || "";

  if (MUTATING_METHODS.has(method) && !url.includes("/auth/csrf-token")) {
    const token = await ensureCsrfToken();
    if (token) {
      config.headers["X-CSRF-Token"] = token;
    }
  }

  return config;
});

api.interceptors.response.use(
  (response) => {
    if (response.data?.csrfToken) {
      setCsrfToken(response.data.csrfToken);
    }
    return response;
  },
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      "An unexpected error occurred";
    const fieldErrors = error.response?.data?.errors || null;

    return Promise.reject({
      status: error.response?.status || 0,
      message,
      errors: fieldErrors,
      original: error,
    });
  }
);

export const authApi = {
  register: (payload) => api.post("/auth/register", payload),
  login: (payload) => api.post("/auth/login", payload),
  getMe: () => api.get("/auth/me"),
  logout: () => api.post("/auth/logout"),
};

export default api;

