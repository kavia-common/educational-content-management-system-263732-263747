import { getSupabase } from "../lib/supabaseClient";

/**
 * PUBLIC_INTERFACE
 * listPaths
 * Public list of learning paths (Supabase only).
 */
export async function listPaths() {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("learning_paths")
      .select("id, title, description, thumbnail, created_at")
      .order("created_at", { ascending: false });
    if (error) throw error;
    // Map DB field 'thumbnail' to UI field 'thumbnail_url' for consistency
    return (data || []).map((p) => ({ ...p, thumbnail_url: p.thumbnail }));
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn("listPaths fallback to empty due to error:", e?.message || e);
    return [];
  }
}

/**
 * PUBLIC_INTERFACE
 * getPathById
 * Fetch a learning path by id and include its courses. Supabase-only.
 */
export async function getPathById(id) {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("learning_paths")
      .select("id, title, description, thumbnail")
      .eq("id", id)
      .single();
    if (error) throw error;

    const { data: courses, error: cErr } = await supabase
      .from("courses")
      .select("id, title, description, thumbnail, path_id, created_at")
      .eq("path_id", id)
      .order("created_at", { ascending: true });
    if (cErr) throw cErr;

    const mappedPath = data ? { ...data, thumbnail_url: data.thumbnail } : null;
    const mappedCourses = (courses || []).map((c) => ({ ...c, thumbnail_url: c.thumbnail }));
    return mappedPath ? { ...mappedPath, courses: mappedCourses } : null;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn("getPathById returning null due to error:", e?.message || e);
    return null;
  }
}

/**
 * PUBLIC_INTERFACE
 * upsertPath
 * Admin upsert for a learning path.
 */
export async function upsertPath(payload) {
  const supabase = getSupabase();
  const { data, error } = await supabase.from("learning_paths").upsert(payload).select().single();
  if (error) throw error;
  return data;
}

/**
 * PUBLIC_INTERFACE
 * deletePath
 * Admin delete a learning path by id.
 */
export async function deletePath(id) {
  const supabase = getSupabase();
  const { error } = await supabase.from("learning_paths").delete().eq("id", id);
  if (error) throw error;
  return true;
}
