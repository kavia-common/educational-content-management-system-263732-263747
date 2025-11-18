import { getSupabase, isSupabaseMode } from "../lib/supabaseClient";
import { DATA_SOURCE } from "../lib/dataMode";
import { courses as seedCourses } from "../data/seed";

/**
 * PUBLIC_INTERFACE
 * listCourses
 * List all courses available.
 * In local mode, returns seed courses with thumbnail mapped to thumbnail_url.
 */
export async function listCourses() {
  if (DATA_SOURCE === "local") {
    return seedCourses.map((c) => ({
      ...c,
      thumbnail_url: c.thumbnail ?? c.thumbnail_url ?? null,
    }));
  }
  if (!isSupabaseMode()) return [];
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("courses")
      .select("id, title, description, thumbnail_url, path_id, created_at")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn("listCourses fallback to empty due to error:", e?.message || e);
    return [];
  }
}

/**
 * PUBLIC_INTERFACE
 * listCoursesByPath
 * List all courses for a given learning path id.
 * In local mode, filters seed courses by path_id.
 */
export async function listCoursesByPath(pathId) {
  if (DATA_SOURCE === "local") {
    const pid = typeof pathId === "string" ? parseInt(pathId, 10) : pathId;
    return seedCourses
      .filter((c) => c.path_id === pid)
      .map((c) => ({
        ...c,
        thumbnail_url: c.thumbnail ?? c.thumbnail_url ?? null,
      }));
  }
  if (!isSupabaseMode()) return [];
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("courses")
      .select("id, title, description, thumbnail_url, path_id, created_at")
      .eq("path_id", pathId)
      .order("created_at", { ascending: true });
    if (error) throw error;
    return data || [];
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn("listCoursesByPath fallback to empty due to error:", e?.message || e);
    return [];
  }
}

/**
 * PUBLIC_INTERFACE
 * getCourseById
 * Fetch a single course (Supabase also fetches lessons in pages).
 * In local mode, returns course without lessons; pages will fetch lessons via lessonsService.
 */
export async function getCourseById(id) {
  if (DATA_SOURCE === "local") {
    const cid = typeof id === "string" ? parseInt(id, 10) : id;
    const course = seedCourses.find((c) => c.id === cid);
    if (!course) return null;
    return {
      ...course,
      thumbnail_url: course.thumbnail ?? course.thumbnail_url ?? null,
    };
  }
  if (!isSupabaseMode()) return null;
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("courses")
      .select("id, title, description, thumbnail_url, path_id, instructor, video_url, embed_url")
      .eq("id", id)
      .single();
    if (error) throw error;

    const { data: lessons, error: lErr } = await supabase
      .from("lessons")
      .select("id, title, description, video_url, course_id, position, thumbnail_url")
      .eq("course_id", id)
      .order("position", { ascending: true });

    if (lErr) throw lErr;

    return { ...data, lessons: lessons || [], modules: lessons || [] };
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn("getCourseById returning null due to error:", e?.message || e);
    return null;
  }
}

/**
 * PUBLIC_INTERFACE
 * upsertCourse
 * Admin upsert course.
 */
export async function upsertCourse(payload) {
  const supabase = getSupabase();
  const { data, error } = await supabase.from("courses").upsert(payload).select().single();
  if (error) throw error;
  return data;
}

/**
 * PUBLIC_INTERFACE
 * deleteCourse
 * Admin delete course by id.
 */
export async function deleteCourse(id) {
  const supabase = getSupabase();
  const { error } = await supabase.from("courses").delete().eq("id", id);
  if (error) throw error;
  return true;
}

/**
 * PUBLIC_INTERFACE
 * enroll
 * Enroll current user in course.
 */
export async function enroll(id) {
  if (DATA_SOURCE === "local") return true; // no-op in local mode
  if (!isSupabaseMode()) return false;
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
  return true;
}

/**
 * PUBLIC_INTERFACE
 * start
 * Mark course started for current user.
 */
export async function start(id) {
  if (DATA_SOURCE === "local") return true; // no-op in local mode
  if (!isSupabaseMode()) return false;
  const supabase = getSupabase();
  const { data: sessionData } = await supabase.auth.getUser();
  const uid = sessionData?.user?.id;
  if (!uid) {
    const err = new Error("Not authenticated");
    err.status = 401;
    throw err;
  }
  await supabase.from("enrollments").upsert({ user_id: uid, course_id: id, status: "in_progress" }, { onConflict: "user_id,course_id" });
  const { error } = await supabase
    .from("user_course_progress")
    .upsert({ user_id: uid, course_id: id, status: "in_progress", progress_percent: 5 }, { onConflict: "user_id,course_id" });
  if (error) throw error;
  return true;
}

/**
 * PUBLIC_INTERFACE
 * complete
 * Mark course completed for current user.
 */
export async function complete(id) {
  if (DATA_SOURCE === "local") return true; // no-op in local mode
  if (!isSupabaseMode()) return false;
  const supabase = getSupabase();
  const { data: sessionData } = await supabase.auth.getUser();
  const uid = sessionData?.user?.id;
  if (!uid) {
    const err = new Error("Not authenticated");
    err.status = 401;
    throw err;
  }
  await supabase.from("enrollments").upsert({ user_id: uid, course_id: id, status: "completed" }, { onConflict: "user_id,course_id" });
  const { error } = await supabase
    .from("user_course_progress")
    .upsert({ user_id: uid, course_id: id, status: "completed", progress_percent: 100 }, { onConflict: "user_id,course_id" });
  if (error) throw error;
  return true;
}
