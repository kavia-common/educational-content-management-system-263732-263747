import { getSupabase, isSupabaseMode } from "../lib/supabaseClient";
import { DATA_SOURCE } from "../lib/dataMode";
import { learningPaths, courses as seedCourses } from "../data/seed";

/**
 * PUBLIC_INTERFACE
 * listPaths
 * Public list of learning paths.
 * In local mode, returns seed data with thumbnail mapped to thumbnail_url for UI compatibility.
 */
export async function listPaths() {
  if (DATA_SOURCE === "local") {
    return learningPaths.map((p) => ({
      ...p,
      thumbnail_url: p.thumbnail ?? p.thumbnail_url ?? null,
    }));
  }
  // When Supabase mode is disabled or misconfigured, return empty list to avoid Failed to fetch
  if (!isSupabaseMode()) return [];
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("learning_paths")
      .select("id, title, description, thumbnail_url, created_at")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (e) {
    // Defensive: surface empty dataset to UI instead of throwing network errors
    // eslint-disable-next-line no-console
    console.warn("listPaths fallback to empty due to error:", e?.message || e);
    return [];
  }
}

/**
 * PUBLIC_INTERFACE
 * getPathById
 * Fetch a learning path by id and include its courses.
 * In local mode, also injects the courses for the path.
 */
export async function getPathById(id) {
  if (DATA_SOURCE === "local") {
    const pid = typeof id === "string" ? parseInt(id, 10) : id;
    const path = learningPaths.find((p) => p.id === pid);
    if (!path) return null;
    const pathCourses = seedCourses
      .filter((c) => c.path_id === pid)
      .map((c) => ({
        ...c,
        thumbnail_url: c.thumbnail ?? c.thumbnail_url ?? null,
      }));
    return {
      id: path.id,
      title: path.title,
      description: path.description,
      thumbnail_url: path.thumbnail ?? path.thumbnail_url ?? null,
      courses: pathCourses,
    };
  }
  if (!isSupabaseMode()) return null;
  try {
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
