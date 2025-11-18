import { apiFetch, apiJson, getBaseUrl } from "../apiClient";
import { getSupabase, isSupabaseMode } from "../lib/supabaseClient";

/** Normalize and enrich errors for helpful diagnostics */
function normalizeError(e, context) {
  const err = e instanceof Error ? e : new Error(String(e));
  const msg = err.message || "";
  if (msg.includes("relation") && msg.includes("does not exist")) {
    err.hint =
      "Missing authoring tables. Ensure 'learning_paths' and 'courses' exist in Supabase and the current user has write access.";
  }
  if (msg.includes("permission denied") || msg.includes("RLS")) {
    err.hint = "RLS may be blocking writes. Verify policies for insert/update/delete.";
  }
  err.context = context || {};
  return err;
}

function hasBackend() {
  return Boolean(process.env.REACT_APP_BACKEND_URL);
}

/**
 * Authoring service for instructors/admins.
 * Uses Supabase in Supabase mode; otherwise uses backend proxy only when configured.
 * Endpoints:
 *  - Learning Paths: POST/PUT/DELETE /api/learning-paths, /api/learning-paths/:id
 *  - Courses: POST/PUT/DELETE /api/courses, /api/courses/:id
 */
export const authoringService = {
  // PUBLIC_INTERFACE
  async listPaths() {
    /** List all learning paths (authoring view may include drafts). */
    if (isSupabaseMode()) {
      try {
        const sb = getSupabase();
        const { data, error } = await sb.from("learning_paths").select("*").order("created_at", { ascending: false });
        if (error) throw error;
        return data || [];
      } catch (e) {
        throw normalizeError(e, { op: "authoring.listPaths", mode: "supabase" });
      }
    }
    if (hasBackend()) {
      return apiJson("/api/learning-paths", { method: "GET" });
    }
    const err = new Error("Backend not configured. Set REACT_APP_BACKEND_URL or enable Supabase env vars.");
    err.status = 500;
    err.context = { baseUrl: getBaseUrl() };
    throw err;
  },

  // PUBLIC_INTERFACE
  async createPath(payload) {
    /** Create a learning path */
    if (isSupabaseMode()) {
      try {
        const sb = getSupabase();
        const { data, error } = await sb.from("learning_paths").insert(payload || {}).select().single();
        if (error) throw error;
        return data;
      } catch (e) {
        throw normalizeError(e, { op: "authoring.createPath", payload, mode: "supabase" });
      }
    }
    if (!hasBackend()) {
      const err = new Error("Backend not configured. Set REACT_APP_BACKEND_URL or enable Supabase env vars.");
      err.status = 500;
      throw err;
    }
    const res = await apiFetch("/api/learning-paths", {
      method: "POST",
      body: JSON.stringify(payload || {}),
    });
    const ct = res.headers.get("content-type") || "";
    const data = ct.includes("application/json") ? await res.json() : await res.text();
    if (!res.ok) {
      const err = new Error("Failed to create learning path");
      err.status = res.status;
      err.data = data;
      throw err;
    }
    return data;
  },

  // PUBLIC_INTERFACE
  async updatePath(id, payload) {
    /** Update a learning path */
    if (!id) {
      const err = new Error("Path id required");
      err.status = 400;
      throw err;
    }
    if (isSupabaseMode()) {
      try {
        const sb = getSupabase();
        const { data, error } = await sb.from("learning_paths").update(payload || {}).eq("id", id).select().single();
        if (error) throw error;
        return data;
      } catch (e) {
        throw normalizeError(e, { op: "authoring.updatePath", id, mode: "supabase" });
      }
    }
    if (!hasBackend()) {
      const err = new Error("Backend not configured. Set REACT_APP_BACKEND_URL or enable Supabase env vars.");
      err.status = 500;
      throw err;
    }
    const res = await apiFetch(`/api/learning-paths/${encodeURIComponent(id)}`, {
      method: "PUT",
      body: JSON.stringify(payload || {}),
    });
    const ct = res.headers.get("content-type") || "";
    const data = ct.includes("application/json") ? await res.json() : await res.text();
    if (!res.ok) {
      const err = new Error("Failed to update learning path");
      err.status = res.status;
      err.data = data;
      throw err;
    }
    return data;
  },

  // PUBLIC_INTERFACE
  async deletePath(id) {
    /** Delete a learning path */
    if (!id) {
      const err = new Error("Path id required");
      err.status = 400;
      throw err;
    }
    if (isSupabaseMode()) {
      try {
        const sb = getSupabase();
        const { error } = await sb.from("learning_paths").delete().eq("id", id);
        if (error) throw error;
        return null;
      } catch (e) {
        throw normalizeError(e, { op: "authoring.deletePath", id, mode: "supabase" });
      }
    }
    if (!hasBackend()) {
      const err = new Error("Backend not configured. Set REACT_APP_BACKEND_URL or enable Supabase env vars.");
      err.status = 500;
      throw err;
    }
    const res = await apiFetch(`/api/learning-paths/${encodeURIComponent(id)}`, { method: "DELETE" });
    if (!res.ok) {
      const ct = res.headers.get("content-type") || "";
      const data = ct.includes("application/json") ? await res.json() : await res.text();
      const err = new Error("Failed to delete learning path");
      err.status = res.status;
      err.data = data;
      throw err;
    }
    return res.status === 204 ? null : res.json().catch(() => null);
  },

  // PUBLIC_INTERFACE
  async listCourses() {
    /** List all courses (authoring view may include drafts). */
    if (isSupabaseMode()) {
      try {
        const sb = getSupabase();
        const { data, error } = await sb.from("courses").select("*").order("created_at", { ascending: false });
        if (error) throw error;
        return data || [];
      } catch (e) {
        throw normalizeError(e, { op: "authoring.listCourses", mode: "supabase" });
      }
    }
    if (hasBackend()) {
      return apiJson("/api/courses", { method: "GET" });
    }
    const err = new Error("Backend not configured. Set REACT_APP_BACKEND_URL or enable Supabase env vars.");
    err.status = 500;
    err.context = { baseUrl: getBaseUrl() };
    throw err;
  },

  // PUBLIC_INTERFACE
  async createCourse(payload) {
    /** Create a course */
    if (isSupabaseMode()) {
      try {
        const sb = getSupabase();
        const { data, error } = await sb.from("courses").insert(payload || {}).select().single();
        if (error) throw error;
        return data;
      } catch (e) {
        throw normalizeError(e, { op: "authoring.createCourse", payload, mode: "supabase" });
      }
    }
    if (!hasBackend()) {
      const err = new Error("Backend not configured. Set REACT_APP_BACKEND_URL or enable Supabase env vars.");
      err.status = 500;
      throw err;
    }
    const res = await apiFetch("/api/courses", {
      method: "POST",
      body: JSON.stringify(payload || {}),
    });
    const ct = res.headers.get("content-type") || "";
    const data = ct.includes("application/json") ? await res.json() : await res.text();
    if (!res.ok) {
      const err = new Error("Failed to create course");
      err.status = res.status;
      err.data = data;
      throw err;
    }
    return data;
  },

  // PUBLIC_INTERFACE
  async updateCourse(id, payload) {
    /** Update a course */
    if (!id) {
      const err = new Error("Course id required");
      err.status = 400;
      throw err;
    }
    if (isSupabaseMode()) {
      try {
        const sb = getSupabase();
        const { data, error } = await sb.from("courses").update(payload || {}).eq("id", id).select().single();
        if (error) throw error;
        return data;
      } catch (e) {
        throw normalizeError(e, { op: "authoring.updateCourse", id, mode: "supabase" });
      }
    }
    if (!hasBackend()) {
      const err = new Error("Backend not configured. Set REACT_APP_BACKEND_URL or enable Supabase env vars.");
      err.status = 500;
      throw err;
    }
    const res = await apiFetch(`/api/courses/${encodeURIComponent(id)}`, {
      method: "PUT",
      body: JSON.stringify(payload || {}),
    });
    const ct = res.headers.get("content-type") || "";
    const data = ct.includes("application/json") ? await res.json() : await res.text();
    if (!res.ok) {
      const err = new Error("Failed to update course");
      err.status = res.status;
      err.data = data;
      throw err;
    }
    return data;
  },

  // PUBLIC_INTERFACE
  async deleteCourse(id) {
    /** Delete a course */
    if (!id) {
      const err = new Error("Course id required");
      err.status = 400;
      throw err;
    }
    if (isSupabaseMode()) {
      try {
        const sb = getSupabase();
        const { error } = await sb.from("courses").delete().eq("id", id);
        if (error) throw error;
        return null;
      } catch (e) {
        throw normalizeError(e, { op: "authoring.deleteCourse", id, mode: "supabase" });
      }
    }
    if (!hasBackend()) {
      const err = new Error("Backend not configured. Set REACT_APP_BACKEND_URL or enable Supabase env vars.");
      err.status = 500;
      throw err;
    }
    const res = await apiFetch(`/api/courses/${encodeURIComponent(id)}`, { method: "DELETE" });
    if (!res.ok) {
      const ct = res.headers.get("content-type") || "";
      const data = ct.includes("application/json") ? await res.json() : await res.text();
      const err = new Error("Failed to delete course");
      err.status = res.status;
      err.data = data;
      throw err;
    }
    return res.status === 204 ? null : res.json().catch(() => null);
  },
};
