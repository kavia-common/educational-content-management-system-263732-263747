import React, { useEffect, useMemo, useState } from "react";
import "../../components/layout.css";
import { authoringService } from "../../services/authoringService";
import { getSupabase, isSupabaseMode } from "../../lib/supabaseClient";

/**
 * PUBLIC_INTERFACE
 * Simple authoring for Lessons with video_url field.
 * - Lists lessons for a selected course
 * - Create, update, delete lessons
 *
 * In proxy mode, relies on backend endpoints (not implemented here).
 * In Supabase mode, uses direct table operations with RLS (admin/instructor only).
 */
export default function LessonsAuthoringPage() {
  const [courses, setCourses] = useState([]);
  const [courseId, setCourseId] = useState("");
  const [lessons, setLessons] = useState([]);
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({ id: "", title: "", duration: "", sequence: "", video_url: "", thumbnail: "" });
  const [saving, setSaving] = useState(false);

  const isEditing = useMemo(() => !!form?.id, [form]);

  const loadCourses = async () => {
    setErr(null);
    try {
      const items = await authoringService.listCourses();
      setCourses(Array.isArray(items) ? items : items?.items || []);
      if (!courseId && Array.isArray(items) && items.length > 0) {
        setCourseId(items[0].id);
      }
    } catch (e) {
      setErr(e);
    }
  };

  const loadLessons = async (cid) => {
    setLoading(true);
    setErr(null);
    try {
      if (isSupabaseMode()) {
        const supabase = getSupabase();
        const { data, error } = await supabase.from("lessons").select("*").eq("course_id", cid).order("sequence", { ascending: true });
        if (error) throw error;
        setLessons(data || []);
      } else {
        // proxy endpoint placeholder (optional)
        setLessons([]);
      }
    } catch (e) {
      setErr(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      await loadCourses();
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (courseId) loadLessons(courseId);
  }, [courseId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...(f || {}), [name]: value }));
  };
  const resetForm = () => setForm({ id: "", title: "", duration: "", sequence: "", video_url: "", thumbnail: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!courseId) {
      setErr(new Error("Select a course first"));
      return;
    }
    setSaving(true);
    setErr(null);
    try {
      if (isSupabaseMode()) {
        const supabase = getSupabase();
        const payload = {
          course_id: courseId,
          title: form.title,
          duration: form.duration ? Number(form.duration) : null,
          sequence: form.sequence ? Number(form.sequence) : 1,
          video_url: form.video_url || null,
          thumbnail: form.thumbnail || null,
        };
        if (isEditing) {
          const { error } = await supabase.from("lessons").update(payload).eq("id", form.id);
          if (error) throw error;
        } else {
          const { error } = await supabase.from("lessons").insert(payload);
          if (error) throw error;
        }
        resetForm();
        await loadLessons(courseId);
      } else {
        // proxy mode not implemented for lessons; show graceful message
        setErr(new Error("Lessons authoring not available without Supabase mode."));
      }
    } catch (e2) {
      setErr(e2);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item) => {
    setForm({
      id: item.id,
      title: item.title || "",
      duration: item.duration || "",
      sequence: item.sequence || "",
      video_url: item.video_url || "",
      thumbnail: item.thumbnail || "",
    });
  };

  const handleDelete = async (id) => {
    if (!id) return;
    setSaving(true);
    setErr(null);
    try {
      if (isSupabaseMode()) {
        const supabase = getSupabase();
        const { error } = await supabase.from("lessons").delete().eq("id", id);
        if (error) throw error;
        if (form.id === id) resetForm();
        await loadLessons(courseId);
      } else {
        setErr(new Error("Lessons authoring not available without Supabase mode."));
      }
    } catch (e) {
      setErr(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="vstack" aria-live="polite">
      <h1 className="page-title">Authoring: Lessons</h1>
      <p className="page-subtitle">Create, edit, and delete lessons for your courses.</p>

      <div className="card" style={{ marginBottom: 12 }}>
        <label>
          <div className="page-subtitle" style={{ marginBottom: 4 }}>Course</div>
          <select
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
            style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid var(--color-border)" }}
          >
            {(courses || []).map((c) => (
              <option key={c.id} value={c.id}>{c.title || c.id}</option>
            ))}
          </select>
        </label>
      </div>

      {err && <div className="card" style={{ borderColor: "var(--color-error)" }}>An error occurred: {String(err.message || err)}</div>}

      <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div className="card">
          <strong>{isEditing ? "Edit Lesson" : "Create Lesson"}</strong>
          <form onSubmit={handleSubmit} className="vstack" style={{ marginTop: 12 }}>
            {isEditing && (
              <div className="page-subtitle" style={{ margin: 0 }}>
                Editing ID: <code>{form.id}</code>
              </div>
            )}
            <label>
              <div className="page-subtitle" style={{ marginBottom: 4 }}>Title</div>
              <input
                name="title"
                type="text"
                value={form.title}
                onChange={handleChange}
                required
                placeholder="Lesson title"
                style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid var(--color-border)" }}
              />
            </label>
            <label>
              <div className="page-subtitle" style={{ marginBottom: 4 }}>Sequence</div>
              <input
                name="sequence"
                type="number"
                value={form.sequence}
                onChange={handleChange}
                placeholder="Sequence order"
                style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid var(--color-border)" }}
              />
            </label>
            <label>
              <div className="page-subtitle" style={{ marginBottom: 4 }}>Duration (minutes)</div>
              <input
                name="duration"
                type="number"
                value={form.duration}
                onChange={handleChange}
                placeholder="Duration"
                style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid var(--color-border)" }}
              />
            </label>
            <label>
              <div className="page-subtitle" style={{ marginBottom: 4 }}>Video URL</div>
              <input
                name="video_url"
                type="url"
                value={form.video_url}
                onChange={handleChange}
                placeholder="https://..."
                style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid var(--color-border)" }}
              />
            </label>
            <label>
              <div className="page-subtitle" style={{ marginBottom: 4 }}>Thumbnail URL</div>
              <input
                name="thumbnail"
                type="url"
                value={form.thumbnail}
                onChange={handleChange}
                placeholder="https://..."
                style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid var(--color-border)" }}
              />
            </label>
            <div className="hstack" style={{ gap: 8, marginTop: 8 }}>
              <button className="btn btn-primary" type="submit" disabled={saving}>
                {saving ? "Saving..." : isEditing ? "Update Lesson" : "Create Lesson"}
              </button>
              {isEditing && (
                <button className="btn btn-secondary" type="button" onClick={resetForm} disabled={saving}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="card">
          <strong>Existing Lessons</strong>
          {loading && <div className="page-subtitle" role="status" aria-busy="true">Loading...</div>}
          <div className="vstack" style={{ marginTop: 12 }}>
            {(lessons || []).map((l) => (
              <div key={l.id} className="hstack" style={{ justifyContent: "space-between", borderBottom: "1px solid var(--color-border)", padding: "8px 0" }}>
                <div>
                  <div><strong>{l.title || "Untitled lesson"}</strong></div>
                  <div className="page-subtitle" style={{ margin: 0 }}>
                    Seq {l.sequence ?? "—"} • {typeof l.duration === "number" ? `${l.duration} min` : "—"} {l.video_url ? "• video" : ""}
                  </div>
                </div>
                <div className="hstack" style={{ gap: 8 }}>
                  <button className="btn btn-secondary" onClick={() => handleEdit(l)} disabled={saving}>
                    Edit
                  </button>
                  <button className="btn" style={{ background: "var(--color-error)", color: "white" }} onClick={() => handleDelete(l.id)} disabled={saving}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
            {(!Array.isArray(lessons) || lessons.length === 0) && !loading && !err && (
              <div className="page-subtitle">
                No lessons yet. Use the form to create your first lesson.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
