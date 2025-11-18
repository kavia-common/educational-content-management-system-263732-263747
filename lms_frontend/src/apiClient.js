const BASE_URL =
  process.env.REACT_APP_BACKEND_URL ||
  process.env.REACT_APP_API_BASE ||
  "http://localhost:8080";

// Frontend must never initialize a Supabase client or expose anon/service keys.
// All authentication/data calls go through the backend proxy using cookies.
// In guest mode, we do not redirect on 401 and instead return empty data.
const FRONTEND_URL = process.env.REACT_APP_FRONTEND_URL || "http://localhost:3000";

function log(level, message, meta) {
  const configured = (process.env.REACT_APP_LOG_LEVEL || "info").toLowerCase();
  const order = ["debug", "info", "warn", "error"];
  if (order.indexOf(level) < order.indexOf(configured)) return;
  // Avoid logging sensitive data
  // eslint-disable-next-line no-console
  console[level](`[apiClient] ${message}`, meta || "");
}

// PUBLIC_INTERFACE
export function getBaseUrl() {
  /** Returns the configured backend base URL (for diagnostics). */
  return BASE_URL;
}

// PUBLIC_INTERFACE
export async function apiFetch(path, options = {}) {
  /**
   * Fetch wrapper that includes credentials for cookie-based auth.
   * In guest mode we do NOT redirect on 401; callers can handle gracefully.
   *
   * @param {string} path - endpoint path starting with /
   * @param {RequestInit} options - fetch options
   * @returns {Promise<Response>}
   */
  const url = `${BASE_URL}${path}`;
  const opts = {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  };

  try {
    const response = await fetch(url, opts);
    return response;
  } catch (e) {
    log("error", "Network error", { path, error: String(e) });
    throw e;
  }
}

// PUBLIC_INTERFACE
export async function apiJson(path, options = {}) {
  /** Convenience wrapper to parse JSON and throw on non-2xx responses. */
  const res = await apiFetch(path, options);
  const contentType = res.headers.get("content-type") || "";
  let data = null;
  if (contentType.includes("application/json")) {
    data = await res.json();
  } else {
    data = await res.text();
  }
  if (!res.ok) {
    const err = new Error("API error");
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export const authApi = {
  // PUBLIC_INTERFACE
  async me() {
    /**
     * Get current user from backend. In guest mode the backend may return 401.
     * We treat that as anonymous and return null.
     */
    try {
      return await apiJson("/auth/me", { method: "GET" });
    } catch (e) {
      if (e && e.status === 401) return null;
      throw e;
    }
  },
  // PUBLIC_INTERFACE
  loginUrl() {
    /** Guest mode: no login URL used. */
    return `${FRONTEND_URL}/`;
  },
  // PUBLIC_INTERFACE
  async logout() {
    /** Guest mode: no-op logout. */
    return Promise.resolve();
  },
};
