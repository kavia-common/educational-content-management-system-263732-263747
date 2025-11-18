import { apiFetch, apiJson } from "../apiClient";

/**
 * Authoring service for instructors/admins.
 * Uses backend proxy endpoints with credentials: include via apiClient.
 * Endpoints:
 *  - Learning Paths: POST/PUT/DELETE /api/learning-paths, /api/learning-paths/:id
 *  - Courses: POST/PUT/DELETE /api/courses, /api/courses/:id
 */
export const authoringService = {
  // PUBLIC_INTERFACE
  async listPaths() {
    /** List all learning paths (authoring view may include drafts). */
    return apiJson("/api/learning-paths", { method: "GET" });
  },

  // PUBLIC_INTERFACE
  async createPath(payload) {
    /** Create a learning path via POST /api/learning-paths */
    const res = await apiFetch("/api/learning-paths", {
      method: "POST",
      body: JSON.stringify(payload || {}),
    });
    const ct = res.headers.get("content-type") || "";
    const data = ct.includes("application/json") ? await res.json() : await res.text();
    if (!res.ok) {
      const err = new Error("Failed to create learning path");
      err.status = res.status;
      err.data = data;
      throw err;
    }
    return data;
  },

  // PUBLIC_INTERFACE
  async updatePath(id, payload) {
    /** Update a learning path via PUT /api/learning-paths/:id */
    if (!id) {
      const err = new Error("Path id required");
      err.status = 400;
      throw err;
    }
    const res = await apiFetch(`/api/learning-paths/${encodeURIComponent(id)}`, {
      method: "PUT",
      body: JSON.stringify(payload || {}),
    });
    const ct = res.headers.get("content-type") || "";
    const data = ct.includes("application/json") ? await res.json() : await res.text();
    if (!res.ok) {
      const err = new Error("Failed to update learning path");
      err.status = res.status;
      err.data = data;
      throw err;
    }
    return data;
  },

  // PUBLIC_INTERFACE
  async deletePath(id) {
    /** Delete a learning path via DELETE /api/learning-paths/:id */
    if (!id) {
      const err = new Error("Path id required");
      err.status = 400;
      throw err;
    }
    const res = await apiFetch(`/api/learning-paths/${encodeURIComponent(id)}`, { method: "DELETE" });
    if (!res.ok) {
      const ct = res.headers.get("content-type") || "";
      const data = ct.includes("application/json") ? await res.json() : await res.text();
      const err = new Error("Failed to delete learning path");
      err.status = res.status;
      err.data = data;
      throw err;
    }
    return res.status === 204 ? null : res.json().catch(() => null);
  },

  // PUBLIC_INTERFACE
  async listCourses() {
    /** List all courses (authoring view may include drafts). */
    return apiJson("/api/courses", { method: "GET" });
  },

  // PUBLIC_INTERFACE
  async createCourse(payload) {
    /** Create a course via POST /api/courses */
    const res = await apiFetch("/api/courses", {
      method: "POST",
      body: JSON.stringify(payload || {}),
    });
    const ct = res.headers.get("content-type") || "";
    const data = ct.includes("application/json") ? await res.json() : await res.text();
    if (!res.ok) {
      const err = new Error("Failed to create course");
      err.status = res.status;
      err.data = data;
      throw err;
    }
    return data;
  },

  // PUBLIC_INTERFACE
  async updateCourse(id, payload) {
    /** Update a course via PUT /api/courses/:id */
    if (!id) {
      const err = new Error("Course id required");
      err.status = 400;
      throw err;
    }
    const res = await apiFetch(`/api/courses/${encodeURIComponent(id)}`, {
      method: "PUT",
      body: JSON.stringify(payload || {}),
    });
    const ct = res.headers.get("content-type") || "";
    const data = ct.includes("application/json") ? await res.json() : await res.text();
    if (!res.ok) {
      const err = new Error("Failed to update course");
      err.status = res.status;
      err.data = data;
      throw err;
    }
    return data;
  },

  // PUBLIC_INTERFACE
  async deleteCourse(id) {
    /** Delete a course via DELETE /api/courses/:id */
    if (!id) {
      const err = new Error("Course id required");
      err.status = 400;
      throw err;
    }
    const res = await apiFetch(`/api/courses/${encodeURIComponent(id)}`, { method: "DELETE" });
    if (!res.ok) {
      const ct = res.headers.get("content-type") || "";
      const data = ct.includes("application/json") ? await res.json() : await res.text();
      const err = new Error("Failed to delete course");
      err.status = res.status;
      err.data = data;
      throw err;
    }
    return res.status === 204 ? null : res.json().catch(() => null);
  },
};
