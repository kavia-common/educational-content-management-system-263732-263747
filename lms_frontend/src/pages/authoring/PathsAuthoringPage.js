import React, { useEffect, useMemo, useState } from "react";
import "../../components/layout.css";
import { authoringService } from "../../services/authoringService";

/**
 * Simple authoring stub for Learning Paths.
 * - Lists paths
 * - Create new path (title, description)
 * - Edit selected path
 * - Delete path
 *
 * Uses backend proxy endpoints with credentials:
 *  POST /api/learning-paths
 *  PUT /api/learning-paths/:id
 *  DELETE /api/learning-paths/:id
 */
// PUBLIC_INTERFACE
export default function PathsAuthoringPage() {
  const [items, setItems] = useState([]);
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({ id: "", title: "", description: "" });
  const [saving, setSaving] = useState(false);

  const isEditing = useMemo(() => !!form?.id, [form]);

  const load = async () => {
    setLoading(true);
    try {
      const data = await authoringService.listPaths();
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

  const resetForm = () => setForm({ id: "", title: "", description: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    try {
      if (isEditing) {
        await authoringService.updatePath(form.id, {
          title: form.title,
          description: form.description,
        });
      } else {
        await authoringService.createPath({
          title: form.title,
          description: form.description,
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
    });
  };

  const handleDelete = async (id) => {
    if (!id || saving) return;
    setSaving(true);
    try {
      await authoringService.deletePath(id);
      if (form.id === id) resetForm();
      await load();
    } catch (e) {
      setErr(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="vstack">
      <h1 className="page-title">Authoring: Learning Paths</h1>
      <p className="page-subtitle">Create, edit, and delete learning paths.</p>

      {err && <div className="card" style={{ borderColor: "var(--color-error)" }}>An error occurred. Please try again.</div>}
      {loading && <div className="card">Loading...</div>}

      <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div className="card">
          <strong>{isEditing ? "Edit Path" : "Create Path"}</strong>
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
                placeholder="Path title"
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
            <div className="hstack" style={{ gap: 8, marginTop: 8 }}>
              <button className="btn btn-primary" type="submit" disabled={saving}>
                {saving ? "Saving..." : isEditing ? "Update Path" : "Create Path"}
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
          <strong>Existing Paths</strong>
          <div className="vstack" style={{ marginTop: 12 }}>
            {(items || []).map((p) => (
              <div key={p.id} className="hstack" style={{ justifyContent: "space-between", borderBottom: "1px solid var(--color-border)", padding: "8px 0" }}>
                <div>
                  <div><strong>{p.title || "Untitled path"}</strong></div>
                  <div className="page-subtitle" style={{ margin: 0 }}>{p.description || "—"}</div>
                </div>
                <div className="hstack" style={{ gap: 8 }}>
                  <button className="btn btn-secondary" onClick={() => handleEdit(p)} disabled={saving}>
                    Edit
                  </button>
                  <button className="btn" style={{ background: "var(--color-error)", color: "white" }} onClick={() => handleDelete(p.id)} disabled={saving}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
            {(!Array.isArray(items) || items.length === 0) && <div className="page-subtitle">No paths yet.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
