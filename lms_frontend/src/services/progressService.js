import { apiJson, getBaseUrl } from "../apiClient";
import { getSupabase, isSupabaseMode } from "../lib/supabaseClient";

/** Normalize and enrich errors for helpful diagnostics */
function normalizeError(e, context) {
  const err = e instanceof Error ? e : new Error(String(e));
  const msg = err.message || "";
  if (msg.includes("relation") && msg.includes("does not exist")) {
    err.hint =
      "Missing analytics tables. Ensure 'user_course_progress', 'enrollments', 'profiles', and 'courses' exist and are accessible.";
  }
  if (msg.includes("permission denied") || msg.includes("RLS")) {
    err.hint = "RLS may be blocking. Verify policies.";
  }
  err.context = context || {};
  return err;
}

function hasBackend() {
  return Boolean(process.env.REACT_APP_BACKEND_URL);
}

/**
 * Wrapper service for progress and admin dashboard endpoints.
 * Uses Supabase if configured; otherwise uses backend API only when REACT_APP_BACKEND_URL is set.
 */
export const progressService = {
  // PUBLIC_INTERFACE
  async getUserProgress() {
    /** Returns array: [{ id, courseId, title, sequence, progressPercent, timeSpentSeconds }] */
    if (isSupabaseMode()) {
      try {
        const supabase = getSupabase();
        const { data: sessionData } = await supabase.auth.getUser();
        const uid = sessionData?.user?.id;
        if (!uid) return [];
        const [{ data: progress }, { data: courses }] = await Promise.all([
          supabase
            .from("user_course_progress")
            .select("course_id, progress_percent, status, time_spent_seconds")
            .eq("user_id", uid),
          supabase.from("courses").select("id,title"),
        ]);
        const titleMap = new Map((courses || []).map((c) => [c.id, c.title]));
        return (progress || []).map((p) => ({
          id: p.course_id,
          courseId: p.course_id,
          title: titleMap.get(p.course_id) || "Course",
          sequence: 0,
          progressPercent: p.progress_percent ?? 0,
          timeSpentSeconds: p.time_spent_seconds ?? null,
        }));
      } catch (e) {
        throw normalizeError(e, { op: "progress.getUserProgress", mode: "supabase" });
      }
    }
    if (hasBackend()) {
      return apiJson("/api/me/progress", { method: "GET" });
    }
    const err = new Error(
      "No data source configured. Enable Supabase env vars or set REACT_APP_BACKEND_URL to use the backend proxy."
    );
    err.status = 500;
    err.context = { baseUrl: getBaseUrl() };
    throw err;
  },

  // PUBLIC_INTERFACE
  async getUserSummary() {
    /** Returns object: { enrolledCount, completedCount, inProgressCount } */
    if (isSupabaseMode()) {
      try {
        const supabase = getSupabase();
        const { data: sessionData } = await supabase.auth.getUser();
        const uid = sessionData?.user?.id;
        if (!uid) return { enrolledCount: 0, completedCount: 0, inProgressCount: 0 };
        const { data, error } = await supabase.from("enrollments").select("status").eq("user_id", uid);
        if (error) throw error;
        const summary = { enrolledCount: 0, completedCount: 0, inProgressCount: 0 };
        (data || []).forEach((e) => {
          if (e.status === "completed") summary.completedCount += 1;
          else if (e.status === "in_progress") summary.inProgressCount += 1;
          else summary.enrolledCount += 1;
        });
        return summary;
      } catch (e) {
        throw normalizeError(e, { op: "progress.getUserSummary", mode: "supabase" });
      }
    }
    if (hasBackend()) {
      return apiJson("/api/me/summary", { method: "GET" });
    }
    const err = new Error(
      "No data source configured. Enable Supabase env vars or set REACT_APP_BACKEND_URL to use the backend proxy."
    );
    err.status = 500;
    err.context = { baseUrl: getBaseUrl() };
    throw err;
  },

  // PUBLIC_INTERFACE
  async getAdminSummary() {
    /** Returns KPI object: { totalUsers, activeUsers, totalCourses, completionsToday } */
    if (isSupabaseMode()) {
      try {
        const supabase = getSupabase();
        const [users, courses, completions] = await Promise.all([
          supabase.from("profiles").select("id", { count: "exact", head: true }),
          supabase.from("courses").select("id", { count: "exact", head: true }),
          supabase
            .from("enrollments")
            .select("status, created_at", { count: "exact", head: false })
            .gte("created_at", new Date(new Date().toDateString()).toISOString())
            .eq("status", "completed"),
        ]);
        return {
          totalUsers: users?.count ?? null,
          activeUsers: null,
          totalCourses: courses?.count ?? null,
          completionsToday: Array.isArray(completions?.data) ? completions.data.length : 0,
        };
      } catch (e) {
        throw normalizeError(e, { op: "progress.getAdminSummary", mode: "supabase" });
      }
    }
    if (hasBackend()) {
      return apiJson("/api/admin/summary", { method: "GET" });
    }
    const err = new Error(
      "No data source configured. Enable Supabase env vars or set REACT_APP_BACKEND_URL to use the backend proxy."
    );
    err.status = 500;
    err.context = { baseUrl: getBaseUrl() };
    throw err;
  },

  // PUBLIC_INTERFACE
  async getCourseCompletions() {
    /** Returns array: [{ title, completedCount }] */
    if (isSupabaseMode()) {
      try {
        const supabase = getSupabase();
        const [{ data: courses }, { data: enrolls }] = await Promise.all([
          supabase.from("courses").select("id,title"),
          supabase.from("enrollments").select("course_id,status").eq("status", "completed"),
        ]);
        const map = new Map();
        (enrolls || []).forEach((e) => {
          map.set(e.course_id, (map.get(e.course_id) || 0) + 1);
        });
        return (courses || []).map((c) => ({
          title: c.title || "Course",
          completedCount: map.get(c.id) || 0,
        }));
      } catch (e) {
        throw normalizeError(e, { op: "progress.getCourseCompletions", mode: "supabase" });
      }
    }
    if (hasBackend()) {
      return apiJson("/api/admin/course-completions", { method: "GET" });
    }
    const err = new Error(
      "No data source configured. Enable Supabase env vars or set REACT_APP_BACKEND_URL to use the backend proxy."
    );
    err.status = 500;
    err.context = { baseUrl: getBaseUrl() };
    throw err;
  },

  // PUBLIC_INTERFACE
  async getProgressDistribution() {
    /** Returns array: [{ name: '0-25'|'25-50'|'50-75'|'75-100', value: number }] */
    if (isSupabaseMode()) {
      try {
        const supabase = getSupabase();
        const { data, error } = await supabase.from("user_course_progress").select("progress_percent");
        if (error) throw error;
        const buckets = { "0-25": 0, "25-50": 0, "50-75": 0, "75-100": 0 };
        (data || []).forEach((r) => {
          const p = Number(r.progress_percent) || 0;
          if (p < 25) buckets["0-25"] += 1;
          else if (p < 50) buckets["25-50"] += 1;
          else if (p < 75) buckets["50-75"] += 1;
          else buckets["75-100"] += 1;
        });
        return Object.keys(buckets).map((k) => ({ name: k, value: buckets[k] }));
      } catch (e) {
        throw normalizeError(e, { op: "progress.getProgressDistribution", mode: "supabase" });
      }
    }
    if (hasBackend()) {
      return apiJson("/api/admin/progress-distribution", { method: "GET" });
    }
    const err = new Error(
      "No data source configured. Enable Supabase env vars or set REACT_APP_BACKEND_URL to use the backend proxy."
    );
    err.status = 500;
    err.context = { baseUrl: getBaseUrl() };
    throw err;
  },
};
