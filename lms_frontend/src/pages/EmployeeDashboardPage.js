import React, { useEffect, useMemo, useState } from "react";
import "../components/layout.css";
import { useAuth } from "../context/AuthContext";
import ProgressBar from "../components/ProgressBar";
import StatsTiles from "../components/StatsTiles";
import { progressService } from "../services/progressService";
import { useDashboard } from "../context/DashboardContext";

// PUBLIC_INTERFACE
export default function EmployeeDashboardPage() {
  /** Displays learner dashboard with course progress and summary tiles. */
  const { user } = useAuth();
  const { version } = useDashboard();
  const [progress, setProgress] = useState([]);
  const [summary, setSummary] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [p, s] = await Promise.all([
          progressService.getUserProgress().catch(() => []),
          progressService.getUserSummary().catch(() => null),
        ]);
        if (!mounted) return;
        setProgress(Array.isArray(p) ? p : (p?.items || []));
        setSummary(s);
      } catch (e) {
        if (!mounted) return;
        setErr(e);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [version]);

  const greetingName = user?.name || user?.email || "Learner";
  const tiles = useMemo(() => {
    return [
      { label: "Enrolled", value: summary?.enrolledCount ?? "—", accent: "primary" },
      { label: "Completed", value: summary?.completedCount ?? "—", accent: "secondary" },
      { label: "In Progress", value: summary?.inProgressCount ?? "—", accent: "primary" },
    ];
  }, [summary]);

  return (
    <div className="vstack">
      <h1 className="page-title">Welcome back, {greetingName}</h1>
      <p className="page-subtitle">Track your learning progress and continue where you left off.</p>

      {err && (
        <div className="card" style={{ borderColor: "var(--color-error)" }}>
          Failed to load your dashboard. Please try again later.
        </div>
      )}

      <StatsTiles items={tiles} columns={3} />

      <div className="vstack" style={{ marginTop: 12 }}>
        <h3 className="page-title" style={{ fontSize: 18, marginBottom: 0 }}>
          Your Courses
        </h3>
        <p className="page-subtitle" style={{ marginTop: 4 }}>Continue learning from your enrolled courses</p>

        <div className="grid">
          {progress.map((c) => (
            <div key={c.id || `${c.courseId}-${c.sequence}`} className="card">
              <div className="hstack" style={{ justifyContent: "space-between", marginBottom: 8 }}>
                <strong>{c.title || "Untitled course"}</strong>
                <span style={{ color: "var(--color-muted)" }}>
                  {typeof c.timeSpentSeconds === "number"
                    ? `${Math.round(c.timeSpentSeconds / 60)} min`
                    : "—"}
                </span>
              </div>
              <ProgressBar value={c.progressPercent ?? 0} label={`Progress for ${c.title || "course"}`} />
              <div className="hstack" style={{ justifyContent: "space-between", marginTop: 8 }}>
                <span className="page-subtitle" style={{ margin: 0 }}>
                  Progress
                </span>
                <strong style={{ color: "var(--color-primary)" }}>
                  {Math.round(c.progressPercent ?? 0)}%
                </strong>
              </div>
            </div>
          ))}
          {progress.length === 0 && !err && <div className="card">No course progress to show yet.</div>}
        </div>
      </div>
    </div>
  );
}
