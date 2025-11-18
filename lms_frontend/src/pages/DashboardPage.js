import React, { useEffect, useState } from "react";
import { apiJson } from "../apiClient";
import "../components/layout.css";

// PUBLIC_INTERFACE
export default function DashboardPage() {
  /** Displays a summary dashboard for the user. */
  const [summary, setSummary] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await apiJson("/dashboard/summary");
        if (mounted) setSummary(data);
      } catch (e) {
        setErr(e);
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="vstack">
      <h1 className="page-title">Dashboard</h1>
      <p className="page-subtitle">Overview of your learning activity</p>

      {err && <div className="card" style={{ borderColor: "var(--color-error)" }}>Failed to load summary.</div>}

      <div className="grid cols-3">
        <div className="card">
          <div className="hstack" style={{ justifyContent: "space-between" }}>
            <strong>Active Courses</strong>
            <span style={{ color: "var(--color-primary)" }}>{summary?.activeCourses ?? "—"}</span>
          </div>
        </div>
        <div className="card">
          <div className="hstack" style={{ justifyContent: "space-between" }}>
            <strong>Assignments Due</strong>
            <span style={{ color: "var(--color-secondary)" }}>{summary?.assignmentsDue ?? "—"}</span>
          </div>
        </div>
        <div className="card">
          <div className="hstack" style={{ justifyContent: "space-between" }}>
            <strong>Avg. Grade</strong>
            <span style={{ color: "var(--color-primary)" }}>{summary?.avgGrade ?? "—"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
