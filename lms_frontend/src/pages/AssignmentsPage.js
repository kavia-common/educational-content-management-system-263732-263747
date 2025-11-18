import React, { useEffect, useState } from "react";
import { apiJson } from "../apiClient";
import "../components/layout.css";

// PUBLIC_INTERFACE
export default function AssignmentsPage() {
  /** Shows assignments across courses. */
  const [items, setItems] = useState([]);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await apiJson("/assignments");
        if (mounted) setItems(Array.isArray(data) ? data : (data?.items || []));
      } catch (e) {
        setErr(e);
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="vstack">
      <h1 className="page-title">Assignments</h1>
      <p className="page-subtitle">Track upcoming and past assignments</p>

      {err && <div className="card" style={{ borderColor: "var(--color-error)" }}>Failed to load assignments.</div>}

      <div className="grid">
        {items.map((a) => (
          <div key={a.id} className="card">
            <div className="hstack" style={{ justifyContent: "space-between" }}>
              <strong>{a.title || "Untitled assignment"}</strong>
              <span style={{ color: "var(--color-muted)" }}>{a.dueDate ? new Date(a.dueDate).toLocaleDateString() : "—"}</span>
            </div>
            <p className="page-subtitle">{a.courseTitle || "Course"}</p>
            <div className="hstack">
              <button className="btn btn-primary">View</button>
            </div>
          </div>
        ))}
        {items.length === 0 && !err && <div className="card">No assignments found.</div>}
      </div>
    </div>
  );
}
