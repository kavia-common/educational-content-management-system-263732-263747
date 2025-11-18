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
      try {
        const supabase = getSupabase();
        const { data, error } = await supabase
          .from("learning_paths")
          .select("id,title,description,image_url,created_at")
          .order("created_at", { ascending: false });
        if (error) throw error;
        return data || [];
      } catch (e) {
        // Include hint about table/columns and RLS
        const err = new Error(
          `Failed to load learning_paths from Supabase: ${e?.message || e}. ` +
            `Verify the table/columns exist and RLS allows SELECT for your auth context.`
        );
        err.cause = e;
        err.code = e?.code || "SUPABASE_QUERY_FAILED";
        throw err;
      }
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
      const { data, error } = await supabase
        .from("learning_paths")
        .select("id,title,description,image_url,created_at")
        .eq("id", id)
        .single();
      if (error) {
        const err = new Error(`Failed to load learning_path ${id}: ${error.message}`);
        err.code = error.code || "SUPABASE_QUERY_FAILED";
        throw err;
      }
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
      // Assuming courses has path_id foreign key.
      const { data, error } = await supabase
        .from("courses")
        .select("id,title,description,instructor,path_id,created_at,thumbnail_url")
        .eq("path_id", id);
      if (error) {
        const err = new Error(`Failed to load courses for path ${id}: ${error.message}`);
        err.code = error.code || "SUPABASE_QUERY_FAILED";
        throw err;
      }
      return data || [];
    }
    return apiJson(`/api/learning-paths/${encodeURIComponent(id)}/courses`, { method: "GET" });
  },
};
