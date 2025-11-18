import { apiFetch, apiJson } from "../apiClient";
import { getSupabase, isSupabaseMode } from "../lib/supabaseClient";

/**
 * Service for Course endpoints.
 * In Supabase mode, uses direct table access with RLS.
 *
 * Schema assumptions (documented in README):
 * - courses(id, title, description, instructor, video_url, embed_url, path_id, ... )
 * - enrollments(user_id, course_id, status 'enrolled'|'in_progress'|'completed', created_at)
 * - user_course_progress(user_id, course_id, progress_percent, status, updated_at)
 */
export const coursesService = {
  // PUBLIC_INTERFACE
  async list() {
    /** List courses available to the current user. */
    if (isSupabaseMode()) {
      const supabase = getSupabase();
      const { data: sessionData } = await supabase.auth.getUser();
      const uid = sessionData?.user?.id;
      // Left join enrollments/progress to compute enrolled flag and progressPercent
      const { data: courses, error } = await supabase.from("courses").select("*");
      if (error) throw error;
      if (!uid) return courses || [];
      // Fetch user's enrollment/progress
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
    }
    try {
      return await apiJson("/api/courses", { method: "GET" });
    } catch (e) {
      return apiJson("/courses", { method: "GET" });
    }
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
        supabase.from("user_course_progress").select("progress_percent,status").eq("user_id", uid).eq("course_id", id).maybeSingle(),
      ]);
      return {
        ...course,
        enrolled: !!enroll,
        status: prog?.status || enroll?.status || null,
        progressPercent: prog?.progress_percent ?? 0,
      };
    }
    try {
      return await apiJson(`/api/courses/${encodeURIComponent(id)}`, { method: "GET" });
    } catch (e) {
      if (e?.status === 404) throw e;
      return apiJson(`/courses/${encodeURIComponent(id)}`, { method: "GET" });
    }
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
      const supabase = getSupabase();
      const { data: sessionData } = await supabase.auth.getUser();
      const uid = sessionData?.user?.id;
      if (!uid) {
        const err = new Error("Not authenticated");
        err.status = 401;
        throw err;
      }
      // Upsert enrollment
      const { error } = await supabase.from("enrollments").upsert(
        { user_id: uid, course_id: id, status: "enrolled" },
        { onConflict: "user_id,course_id" }
      );
      if (error) throw error;
      return null;
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
      const supabase = getSupabase();
      const { data: sessionData } = await supabase.auth.getUser();
      const uid = sessionData?.user?.id;
      if (!uid) {
        const err = new Error("Not authenticated");
        err.status = 401;
        throw err;
      }
      // Ensure enrollment exists
      await supabase.from("enrollments").upsert({ user_id: uid, course_id: id, status: "in_progress" }, { onConflict: "user_id,course_id" });
      // Upsert progress
      const { error } = await supabase
        .from("user_course_progress")
        .upsert(
          { user_id: uid, course_id: id, status: "in_progress", progress_percent: 5 },
          { onConflict: "user_id,course_id" }
        );
      if (error) throw error;
      return null;
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
      const supabase = getSupabase();
      const { data: sessionData } = await supabase.auth.getUser();
      const uid = sessionData?.user?.id;
      if (!uid) {
        const err = new Error("Not authenticated");
        err.status = 401;
        throw err;
      }
      // Update enrollment status
      await supabase.from("enrollments").upsert({ user_id: uid, course_id: id, status: "completed" }, { onConflict: "user_id,course_id" });
      // Update progress
      const { error } = await supabase
        .from("user_course_progress")
        .upsert(
          { user_id: uid, course_id: id, status: "completed", progress_percent: 100 },
          { onConflict: "user_id,course_id" }
        );
      if (error) throw error;
      return null;
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
