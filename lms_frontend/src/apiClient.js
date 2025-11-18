const BASE_URL =
  process.env.REACT_APP_BACKEND_URL ||
  process.env.REACT_APP_API_BASE ||
  "http://localhost:8080";

// Frontend must never initialize a Supabase client or expose anon/service keys.
// All authentication/data calls go through the backend proxy using cookies.
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
export async function apiFetch(path, options = {}) {
  /**
   * Fetch wrapper that includes credentials for cookie-based auth and
   * handles 401 responses by redirecting to /login.
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

  let response;
  try {
    response = await fetch(url, opts);
  } catch (e) {
    log("error", "Network error", { path, error: String(e) });
    throw e;
  }

  if (response.status === 401) {
    log("warn", "Unauthorized - redirecting to login", { path });
    // Redirect to login page, preserving intended destination
    const destination = encodeURIComponent(window.location.pathname + window.location.search);
    window.location.assign(`/login?next=${destination}`);
    return response;
  }

  return response;
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
    /** Get current user from cookie-based backend session. */
    return apiJson("/auth/me", { method: "GET" });
  },
  // PUBLIC_INTERFACE
  loginUrl(provider = "email") {
    /**
     * Build backend login endpoint URL that triggers OAuth/email provider flow.
     * The backend should handle redirect back to REACT_APP_FRONTEND_URL/oauth/callback
     */
    const callback = `${FRONTEND_URL}/oauth/callback`;
    const qs = new URLSearchParams({ provider, redirect_to: callback });
    return `${BASE_URL}/auth/login?${qs.toString()}`;
  },
  // PUBLIC_INTERFACE
  async logout() {
    /** Log out by clearing backend cookie session. */
    return apiFetch("/auth/logout", { method: "POST" });
  },
};
