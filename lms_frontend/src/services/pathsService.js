import { getSupabase, isSupabaseMode } from "../lib/supabaseClient";
import { apiJson } from "../apiClient";

/**
 * PUBLIC_INTERFACE
 * listPaths
 * Public list of learning paths.
 */
export async function listPaths() {
  if (isSupabaseMode()) {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("learning_paths")
      .select("id, title, description, thumbnail_url, created_at")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data || [];
  }
  return apiJson("/api/learning-paths", { method: "GET" });
}

/**
 * PUBLIC_INTERFACE
 * getPathById
 * Fetch a learning path by id and include its courses.
 */
export async function getPathById(id) {
  if (isSupabaseMode()) {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("learning_paths")
      .select("id, title, description, thumbnail_url")
      .eq("id", id)
      .single();
    if (error) throw error;

    const { data: courses, error: cErr } = await supabase
      .from("courses")
      .select("id, title, description, thumbnail_url, path_id, created_at")
      .eq("path_id", id)
      .order("created_at", { ascending: true });
    if (cErr) throw cErr;

    return { ...data, courses: courses || [] };
  }
  const [p, c] = await Promise.all([
    apiJson(`/api/learning-paths/${encodeURIComponent(id)}`, { method: "GET" }),
    apiJson(`/api/learning-paths/${encodeURIComponent(id)}/courses`, { method: "GET" }),
  ]);
  return { ...(p || {}), courses: Array.isArray(c) ? c : c?.items || [] };
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
