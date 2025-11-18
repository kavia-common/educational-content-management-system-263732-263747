import { apiJson } from "../apiClient";

/**
 * Wrapper service for progress and admin dashboard endpoints.
 * Uses cookie-based auth via apiClient (with credentials).
 */
export const progressService = {
  // PUBLIC_INTERFACE
  async getUserProgress() {
    /** Fetches array: [{ id, courseId, title, sequence, progressPercent, timeSpentSeconds }] */
    return apiJson("/api/me/progress", { method: "GET" });
  },
  // PUBLIC_INTERFACE
  async getUserSummary() {
    /** Fetches object: { enrolledCount, completedCount, inProgressCount } */
    return apiJson("/api/me/summary", { method: "GET" });
  },
  // PUBLIC_INTERFACE
  async getAdminSummary() {
    /** Fetches KPI object: { totalUsers, activeUsers, totalCourses, completionsToday } */
    return apiJson("/api/admin/summary", { method: "GET" });
  },
  // PUBLIC_INTERFACE
  async getCourseCompletions() {
    /** Fetches array: [{ title, completedCount }] */
    return apiJson("/api/admin/course-completions", { method: "GET" });
  },
  // PUBLIC_INTERFACE
  async getProgressDistribution() {
    /** Fetches array: [{ name: '0-25'|'25-50'|'50-75'|'75-100', value: number }] */
    return apiJson("/api/admin/progress-distribution", { method: "GET" });
  },
};
