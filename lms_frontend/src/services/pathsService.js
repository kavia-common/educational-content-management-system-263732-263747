import { apiJson, getBaseUrl } from "../apiClient";
import { getSupabase, isSupabaseMode } from "../lib/supabaseClient";

/** Normalize and enrich errors for helpful diagnostics */
function normalizeError(e, context) {
  const err = e instanceof Error ? e : new Error(String(e));
  const msg = err.message || "";
  // Supabase code hints
  if (msg.includes("relation") && msg.includes("does not exist")) {
    err.hint =
      "Missing table or schema in Supabase. Ensure tables like 'learning_paths' and 'courses' exist and RLS policies allow read.";
  }
  if (msg.includes("permission denied") || msg.includes("RLS")) {
    err.hint =
      "Supabase RLS may be blocking this query. Check Row Level Security policies for the current user.";
  }
  err.context = context || {};
  return err;
}

function hasBackend() {
  return Boolean(process.env.REACT_APP_BACKEND_URL);
}

/**
 * Service for Learning Paths endpoints.
 * Switches between Supabase client and backend proxy based on environment.
 * - In Supabase mode, uses the browser Supabase client directly.
 * - Otherwise, only uses backend if REACT_APP_BACKEND_URL is set.
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
          .select("*")
          .order("created_at", { ascending: false });
        if (error) throw error;
        return data || [];
      } catch (e) {
        throw normalizeError(e, { op: "paths.list", mode: "supabase" });
      }
    }
    if (hasBackend()) {
      return apiJson("/api/learning-paths", { method: "GET" });
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
    /** Fetch single learning path details */
    if (!id) {
      const err = new Error("Path id required");
      err.status = 400;
      throw err;
    }
    if (isSupabaseMode()) {
      try {
        const supabase = getSupabase();
        const { data, error } = await supabase.from("learning_paths").select("*").eq("id", id).single();
        if (error) throw error;
        return data;
      } catch (e) {
        throw normalizeError(e, { op: "paths.get", id, mode: "supabase" });
      }
    }
    if (hasBackend()) {
      return apiJson(`/api/learning-paths/${encodeURIComponent(id)}`, { method: "GET" });
    }
    const err = new Error(
      "No data source configured. Enable Supabase env vars or set REACT_APP_BACKEND_URL to use the backend proxy."
    );
    err.status = 500;
    err.context = { id };
    throw err;
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
      try {
        const supabase = getSupabase();
        // Assuming schema where courses has path_id FK.
        const { data, error } = await supabase.from("courses").select("*").eq("path_id", id);
        if (error) throw error;
        return data || [];
      } catch (e) {
        throw normalizeError(e, { op: "paths.getCourses", id, mode: "supabase" });
      }
    }
    if (hasBackend()) {
      return apiJson(`/api/learning-paths/${encodeURIComponent(id)}/courses`, { method: "GET" });
    }
    const err = new Error(
      "No data source configured. Enable Supabase env vars or set REACT_APP_BACKEND_URL to use the backend proxy."
    );
    err.status = 500;
    err.context = { id };
    throw err;
  },
};
