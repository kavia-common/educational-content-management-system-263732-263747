import { getSupabase, isSupabaseMode } from "../lib/supabaseClient";

/**
 * PUBLIC_INTERFACE
 * listCourses
 * List all courses available.
 */
export async function listCourses() {
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
 * getCourseById
 * Fetch a single course and its lessons separately for RLS compatibility.
 */
export async function getCourseById(id) {
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
