import { apiJson } from "../apiClient";
import { getSupabase, isSupabaseMode } from "../lib/supabaseClient";

/**
 * Service for Learning Paths endpoints.
 * Switches between Supabase client and backend proxy based on feature flag.
 */
export const pathsService = {
  // PUBLIC_INTERFACE
  async list() {
    /** Fetches array of learning paths */
    if (isSupabaseMode()) {
      const supabase = getSupabase();
      const { data, error } = await supabase.from("learning_paths").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    }
    return apiJson("/api/learning-paths", { method: "GET" });
  },

  // PUBLIC_INTERFACE
  async get(id) {
    /** Fetch single learning path details */
    if (!id) {
      const err = new Error("Path id required");
      err.status = 400;
      throw err;
    }
    if (isSupabaseMode()) {
      const supabase = getSupabase();
      const { data, error } = await supabase.from("learning_paths").select("*").eq("id", id).single();
      if (error) throw error;
      return data;
    }
    return apiJson(`/api/learning-paths/${encodeURIComponent(id)}`, { method: "GET" });
  },

  // PUBLIC_INTERFACE
  async getCourses(id) {
    /** Fetch courses for a learning path */
    if (!id) {
      const err = new Error("Path id required");
      err.status = 400;
      throw err;
    }
    if (isSupabaseMode()) {
      const supabase = getSupabase();
      // Assuming a join table learning_path_courses(path_id, course_id) or courses table has path_id column.
      // Prefer simple schema: courses has path_id foreign key.
      const { data, error } = await supabase.from("courses").select("*").eq("path_id", id);
      if (error) throw error;
      return data || [];
    }
    return apiJson(`/api/learning-paths/${encodeURIComponent(id)}/courses`, { method: "GET" });
  },
};
