import React, { useEffect, useState } from "react";
import { apiJson } from "../apiClient";
import "../components/layout.css";

// PUBLIC_INTERFACE
export default function GradesPage() {
  /** Display grades per course/assignment. */
  const [grades, setGrades] = useState([]);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await apiJson("/grades");
        if (mounted) setGrades(Array.isArray(data) ? data : (data?.items || []));
      } catch (e) {
        setErr(e);
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="vstack">
      <h1 className="page-title">Grades</h1>
      <p className="page-subtitle">Your performance overview</p>

      {err && <div className="card" style={{ borderColor: "var(--color-error)" }}>Failed to load grades.</div>}

      <div className="grid">
        {grades.map((g) => (
          <div key={g.id} className="card">
            <div className="hstack" style={{ justifyContent: "space-between" }}>
              <strong>{g.courseTitle || "Course"}</strong>
              <span style={{ color: "var(--color-primary)" }}>{g.overall || g.score || "—"}</span>
            </div>
            <p className="page-subtitle">Updated {g.updatedAt ? new Date(g.updatedAt).toLocaleString() : "—"}</p>
          </div>
        ))}
        {grades.length === 0 && !err && <div className="card">No grades to show.</div>}
      </div>
    </div>
  );
}
