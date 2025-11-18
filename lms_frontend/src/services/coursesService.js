import { apiFetch, apiJson, getBaseUrl } from "../apiClient";
import { getSupabase, isSupabaseMode } from "../lib/supabaseClient";

/** Normalize and enrich errors for helpful diagnostics */
function normalizeError(e, context) {
  const err = e instanceof Error ? e : new Error(String(e));
  const msg = err.message || "";
  if (msg.includes("relation") && msg.includes("does not exist")) {
    err.hint =
      "Missing table(s). Ensure 'courses', 'enrollments', and 'user_course_progress' exist in Supabase and RLS policies are configured.";
  }
  if (msg.includes("permission denied") || msg.includes("RLS")) {
    err.hint = "RLS may be blocking. Verify policies permit the current user to read/write.";
  }
  err.context = context || {};
  return err;
}

function hasBackend() {
  return Boolean(process.env.REACT_APP_BACKEND_URL);
}

/**
 * Service for Course endpoints.
 * Prefers Supabase in Supabase mode. Falls back to backend only if REACT_APP_BACKEND_URL is set.
 */
export const coursesService = {
  // PUBLIC_INTERFACE
  async list() {
    /** List courses available to the current user. */
    if (isSupabaseMode()) {
      try {
        const supabase = getSupabase();
        const { data: sessionData } = await supabase.auth.getUser();
        const uid = sessionData?.user?.id;
        const { data: courses, error } = await supabase.from("courses").select("*");
        if (error) throw error;
        if (!uid) return courses || [];
        const [{ data: enrolls }, { data: progress }] = await Promise.all([
          supabase.from("enrollments").select("course_id,status").eq("user_id", uid),
          supabase.from("user_course_progress").select("course_id,progress_percent,status").eq("user_id", uid),
        ]);
        const enrollMap = new Map((enrolls || []).map((e) => [e.course_id, e]));
        const progMap = new Map((progress || []).map((p) => [p.course_id, p]));
        return (courses || []).map((c) => {
          const e = enrollMap.get(c.id);
          const p = progMap.get(c.id);
          return {
            ...c,
            enrolled: !!e,
            status: p?.status || e?.status || null,
            progressPercent: p?.progress_percent ?? 0,
          };
        });
      } catch (e) {
        throw normalizeError(e, { op: "courses.list", mode: "supabase" });
      }
    }
    if (hasBackend()) {
      return apiJson("/api/courses", { method: "GET" });
    }
    const err = new Error(
      "No data source configured. Enable Supabase env vars or set REACT_APP_BACKEND_URL to use the backend proxy."
    );
    err.status = 500;
    err.context = { baseUrl: getBaseUrl() };
    throw err;
  },

  // PUBLIC_INTERFACE
  async get(id) {
    /** Fetch course details including playback info */
    if (!id) {
      const err = new Error("Course id required");
      err.status = 400;
      throw err;
    }
    if (isSupabaseMode()) {
      try {
        const supabase = getSupabase();
        const [{ data: course, error }, { data: sessionData }] = await Promise.all([
          supabase.from("courses").select("*").eq("id", id).single(),
          supabase.auth.getUser(),
        ]);
        if (error) throw error;
        const uid = sessionData?.user?.id;
        if (!uid) return course;
        const [{ data: enroll }, { data: prog }] = await Promise.all([
          supabase.from("enrollments").select("status").eq("user_id", uid).eq("course_id", id).maybeSingle(),
          supabase
            .from("user_course_progress")
            .select("progress_percent,status")
            .eq("user_id", uid)
            .eq("course_id", id)
            .maybeSingle(),
        ]);
        return {
          ...course,
          enrolled: !!enroll,
          status: prog?.status || enroll?.status || null,
          progressPercent: prog?.progress_percent ?? 0,
        };
      } catch (e) {
        throw normalizeError(e, { op: "courses.get", id, mode: "supabase" });
      }
    }
    if (hasBackend()) {
      return apiJson(`/api/courses/${encodeURIComponent(id)}`, { method: "GET" });
    }
    const err = new Error(
      "No data source configured. Enable Supabase env vars or set REACT_APP_BACKEND_URL to use the backend proxy."
    );
    err.status = 500;
    err.context = { id, baseUrl: getBaseUrl() };
    throw err;
  },

  // PUBLIC_INTERFACE
  async enroll(id) {
    /** Enroll current user into course */
    if (!id) {
      const err = new Error("Course id required");
      err.status = 400;
      throw err;
    }
    if (isSupabaseMode()) {
      try {
        const supabase = getSupabase();
        const { data: sessionData } = await supabase.auth.getUser();
        const uid = sessionData?.user?.id;
        if (!uid) {
          const err = new Error("Not authenticated");
          err.status = 401;
          throw err;
        }
        const { error } = await supabase
          .from("enrollments")
          .upsert({ user_id: uid, course_id: id, status: "enrolled" }, { onConflict: "user_id,course_id" });
        if (error) throw error;
        return null;
      } catch (e) {
        throw normalizeError(e, { op: "courses.enroll", id, mode: "supabase" });
      }
    }
    if (!hasBackend()) {
      const err = new Error("Backend not configured. Set REACT_APP_BACKEND_URL to enable enroll via API.");
      err.status = 500;
      throw err;
    }
    const res = await apiFetch(`/api/courses/${encodeURIComponent(id)}/enroll`, { method: "POST" });
    if (!res.ok) {
      const data = (res.headers.get("content-type") || "").includes("application/json")
        ? await res.json()
        : await res.text();
      const err = new Error("Failed to enroll");
      err.status = res.status;
      err.data = data;
      throw err;
    }
    return res.status === 204 ? null : res.json().catch(() => null);
  },

  // PUBLIC_INTERFACE
  async start(id) {
    /** Mark course as started for current user */
    if (!id) {
      const err = new Error("Course id required");
      err.status = 400;
      throw err;
    }
    if (isSupabaseMode()) {
      try {
        const supabase = getSupabase();
        const { data: sessionData } = await supabase.auth.getUser();
        const uid = sessionData?.user?.id;
        if (!uid) {
          const err = new Error("Not authenticated");
          err.status = 401;
          throw err;
        }
        await supabase
          .from("enrollments")
          .upsert({ user_id: uid, course_id: id, status: "in_progress" }, { onConflict: "user_id,course_id" });
        const { error } = await supabase
          .from("user_course_progress")
          .upsert(
            { user_id: uid, course_id: id, status: "in_progress", progress_percent: 5 },
            { onConflict: "user_id,course_id" }
          );
        if (error) throw error;
        return null;
      } catch (e) {
        throw normalizeError(e, { op: "courses.start", id, mode: "supabase" });
      }
    }
    if (!hasBackend()) {
      const err = new Error("Backend not configured. Set REACT_APP_BACKEND_URL to enable start via API.");
      err.status = 500;
      throw err;
    }
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
    /** Mark course completed for current user */
    if (!id) {
      const err = new Error("Course id required");
      err.status = 400;
      throw err;
    }
    if (isSupabaseMode()) {
      try {
        const supabase = getSupabase();
        const { data: sessionData } = await supabase.auth.getUser();
        const uid = sessionData?.user?.id;
        if (!uid) {
          const err = new Error("Not authenticated");
          err.status = 401;
          throw err;
        }
        await supabase
          .from("enrollments")
          .upsert({ user_id: uid, course_id: id, status: "completed" }, { onConflict: "user_id,course_id" });
        const { error } = await supabase
          .from("user_course_progress")
          .upsert(
            { user_id: uid, course_id: id, status: "completed", progress_percent: 100 },
            { onConflict: "user_id,course_id" }
          );
        if (error) throw error;
        return null;
      } catch (e) {
        throw normalizeError(e, { op: "courses.complete", id, mode: "supabase" });
      }
    }
    if (!hasBackend()) {
      const err = new Error("Backend not configured. Set REACT_APP_BACKEND_URL to enable complete via API.");
      err.status = 500;
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
