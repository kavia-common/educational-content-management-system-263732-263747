import React, { useEffect, useMemo, useState } from "react";
import "../../components/layout.css";
import { authoringService } from "../../services/authoringService";

/**
 * Simple authoring stub for Courses.
 * - Lists courses
 * - Create new course (title, description, instructor)
 * - Edit selected course
 * - Delete course
 *
 * Uses backend proxy endpoints with credentials:
 *  POST /api/courses
 *  PUT /api/courses/:id
 *  DELETE /api/courses/:id
 */
// PUBLIC_INTERFACE
export default function CoursesAuthoringPage() {
  const [items, setItems] = useState([]);
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({ id: "", title: "", description: "", instructor: "" });
  const [saving, setSaving] = useState(false);

  const isEditing = useMemo(() => !!form?.id, [form]);

  const load = async () => {
    setLoading(true);
    setErr(null);
    try {
      const data = await authoringService.listCourses();
      setItems(Array.isArray(data) ? data : data?.items || []);
    } catch (e) {
      setErr(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        await load();
      } catch (e) {
        if (mounted) setErr(e);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...(f || {}), [name]: value }));
  };

  const resetForm = () => setForm({ id: "", title: "", description: "", instructor: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    setErr(null);
    try {
      if (isEditing) {
        await authoringService.updateCourse(form.id, {
          title: form.title,
          description: form.description,
          instructor: form.instructor,
        });
      } else {
        await authoringService.createCourse({
          title: form.title,
          description: form.description,
          instructor: form.instructor,
        });
      }
      resetForm();
      await load();
    } catch (e) {
      setErr(e);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item) => {
    setForm({
      id: item.id,
      title: item.title || "",
      description: item.description || "",
      instructor: item.instructor || "",
    });
  };

  const handleDelete = async (id) => {
    if (!id || saving) return;
    setSaving(true);
    setErr(null);
    try {
      await authoringService.deleteCourse(id);
      if (form.id === id) resetForm();
      await load();
    } catch (e) {
      setErr(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="vstack" aria-live="polite">
      <h1 className="page-title">Authoring: Courses</h1>
      <p className="page-subtitle">Create, edit, and delete courses.</p>

      {err && <div className="card" style={{ borderColor: "var(--color-error)" }}>An error occurred. Please try again.</div>}
      {loading && <div className="card" role="status" aria-busy="true">Loading...</div>}

      <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div className="card">
          <strong>{isEditing ? "Edit Course" : "Create Course"}</strong>
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
                placeholder="Course title"
                style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid var(--color-border)" }}
              />
            </label>
            <label>
              <div className="page-subtitle" style={{ marginBottom: 4 }}>Description</div>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Short description"
                rows={4}
                style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid var(--color-border)" }}
              />
            </label>
            <label>
              <div className="page-subtitle" style={{ marginBottom: 4 }}>Instructor</div>
              <input
                name="instructor"
                type="text"
                value={form.instructor}
                onChange={handleChange}
                placeholder="Instructor name"
                style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid var(--color-border)" }}
              />
            </label>
            <div className="hstack" style={{ gap: 8, marginTop: 8 }}>
              <button className="btn btn-primary" type="submit" disabled={saving}>
                {saving ? "Saving..." : isEditing ? "Update Course" : "Create Course"}
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
          <strong>Existing Courses</strong>
          <div className="vstack" style={{ marginTop: 12 }}>
            {(items || []).map((c) => (
              <div key={c.id} className="hstack" style={{ justifyContent: "space-between", borderBottom: "1px solid var(--color-border)", padding: "8px 0" }}>
                <div>
                  <div><strong>{c.title || "Untitled course"}</strong></div>
                  <div className="page-subtitle" style={{ margin: 0 }}>
                    {c.description || "—"} {c.instructor ? `• ${c.instructor}` : ""}
                  </div>
                </div>
                <div className="hstack" style={{ gap: 8 }}>
                  <button className="btn btn-secondary" onClick={() => handleEdit(c)} disabled={saving}>
                    Edit
                  </button>
                  <button className="btn" style={{ background: "var(--color-error)", color: "white" }} onClick={() => handleDelete(c.id)} disabled={saving}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
            {(!Array.isArray(items) || items.length === 0) && !loading && !err && (
              <div className="page-subtitle">
                No courses yet. Use the form to create your first course.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
