import { apiJson } from "../apiClient";

/**
 * Service for Learning Paths endpoints.
 * All requests include credentials via apiClient.
 */
export const pathsService = {
  // PUBLIC_INTERFACE
  async list() {
    /** Fetches array of learning paths from GET /api/learning-paths */
    return apiJson("/api/learning-paths", { method: "GET" });
  },

  // PUBLIC_INTERFACE
  async get(id) {
    /** Fetch single learning path details from GET /api/learning-paths/:id */
    if (!id) {
      const err = new Error("Path id required");
      err.status = 400;
      throw err;
    }
    return apiJson(`/api/learning-paths/${encodeURIComponent(id)}`, { method: "GET" });
  },

  // PUBLIC_INTERFACE
  async getCourses(id) {
    /** Fetch courses for a learning path from GET /api/learning-paths/:id/courses */
    if (!id) {
      const err = new Error("Path id required");
      err.status = 400;
      throw err;
    }
    return apiJson(`/api/learning-paths/${encodeURIComponent(id)}/courses`, { method: "GET" });
  },
};
