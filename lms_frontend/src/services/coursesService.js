import { apiFetch, apiJson } from "../apiClient";

/**
 * Service for Course endpoints.
 */
export const coursesService = {
  // PUBLIC_INTERFACE
  async get(id) {
    /** Fetch course details including playback info from GET /api/courses/:id or /courses/:id */
    if (!id) {
      const err = new Error("Course id required");
      err.status = 400;
      throw err;
    }
    // Prefer /api/courses route per proxy contract, fallback to /courses if backend maps it
    try {
      return await apiJson(`/api/courses/${encodeURIComponent(id)}`, { method: "GET" });
    } catch (e) {
      if (e?.status === 404) throw e;
      // Fallback
      return apiJson(`/courses/${encodeURIComponent(id)}`, { method: "GET" });
    }
  },

  // PUBLIC_INTERFACE
  async start(id) {
    /** Signal starting a course. POST /api/courses/:id/start */
    if (!id) {
      const err = new Error("Course id required");
      err.status = 400;
      throw err;
    }
    // Use apiFetch to accept 204 or 200 responses
    const res = await apiFetch(`/api/courses/${encodeURIComponent(id)}/start`, { method: "POST" });
    if (!res.ok) {
      const data = (res.headers.get("content-type") || "").includes("application/json")
        ? await res.json()
        : await res.text();
      const err = new Error("Failed to start course");
      err.status = res.status;
      err.data = data;
      throw err;
    }
    return res.status === 204 ? null : res.json().catch(() => null);
  },

  // PUBLIC_INTERFACE
  async complete(id) {
    /** Mark course completed. POST /api/courses/:id/complete */
    if (!id) {
      const err = new Error("Course id required");
      err.status = 400;
      throw err;
    }
    const res = await apiFetch(`/api/courses/${encodeURIComponent(id)}/complete`, { method: "POST" });
    if (!res.ok) {
      const data = (res.headers.get("content-type") || "").includes("application/json")
        ? await res.json()
        : await res.text();
      const err = new Error("Failed to complete course");
      err.status = res.status;
      err.data = data;
      throw err;
    }
    return res.status === 204 ? null : res.json().catch(() => null);
  },
};
