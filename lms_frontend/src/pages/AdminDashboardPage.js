import React, { useEffect, useMemo, useState } from "react";
import "../components/layout.css";
import { useAuth } from "../context/AuthContext";
import StatsTiles from "../components/StatsTiles";
import MiniBar from "../components/charts/MiniBar";
import MiniPie from "../components/charts/MiniPie";
import { progressService } from "../services/progressService";
import { useDashboard } from "../context/DashboardContext";

// PUBLIC_INTERFACE
export default function AdminDashboardPage() {
  /**
   * Admin dashboard showing aggregate platform metrics.
   * Note: Route must be protected by admin check in App.js
   */
  const { user } = useAuth();
  const { version } = useDashboard();
  const [summary, setSummary] = useState(null);
  const [completions, setCompletions] = useState([]);
  const [distribution, setDistribution] = useState([]);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [s, c, d] = await Promise.all([
          progressService.getAdminSummary().catch(() => null),
          progressService.getCourseCompletions().catch(() => []),
          progressService.getProgressDistribution().catch(() => []),
        ]);
        if (!mounted) return;
        setSummary(s);
        setCompletions(Array.isArray(c) ? c : []);
        setDistribution(Array.isArray(d) ? d : []);
      } catch (e) {
        if (!mounted) return;
        setErr(e);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [version]);

  const tiles = useMemo(() => {
    return [
      { label: "Total Users", value: summary?.totalUsers ?? "—", accent: "primary" },
      { label: "Active Users", value: summary?.activeUsers ?? "—", accent: "secondary" },
      { label: "Total Courses", value: summary?.totalCourses ?? "—", accent: "primary" },
      { label: "Completions Today", value: summary?.completionsToday ?? "—", accent: "secondary" },
    ];
  }, [summary]);

  const barData = (completions || []).map((c) => ({
    label: (c.title || "").slice(0, 8),
    value: Number(c.completedCount) || 0,
  }));

  const pieData = (distribution || []).map((d) => ({
    name: d.name,
    value: Number(d.value) || 0,
  }));

  return (
    <div className="vstack">
      <h1 className="page-title">Admin Dashboard</h1>
      <p className="page-subtitle">
        Platform insights and activity overview{user?.name ? ` for ${user.name}` : ""}.
      </p>

      {err && (
        <div className="card" style={{ borderColor: "var(--color-error)" }}>
          Failed to load admin data. Please try again later.
        </div>
      )}

      <StatsTiles items={tiles} columns={4} />

      <div className="grid cols-3" style={{ marginTop: 12 }}>
        <div className="card" style={{ gridColumn: "span 2" }}>
          <div className="hstack" style={{ justifyContent: "space-between", marginBottom: 8 }}>
            <strong>Course Completions</strong>
            <span className="page-subtitle" style={{ margin: 0 }}>
              Top courses by completions
            </span>
          </div>
          {barData.length > 0 ? (
            <MiniBar data={barData} height={160} />
          ) : (
            <div className="page-subtitle">No completion data.</div>
          )}
        </div>
        <div className="card">
          <div className="hstack" style={{ justifyContent: "space-between", marginBottom: 8 }}>
            <strong>Progress Distribution</strong>
            <span className="page-subtitle" style={{ margin: 0 }}>
              Learner progress buckets
            </span>
          </div>
          {pieData.length > 0 ? (
            <div className="hstack" style={{ gap: 12 }}>
              <MiniPie data={pieData} size={160} />
              <div className="vstack" style={{ gap: 8 }}>
                {pieData.map((d, i) => (
                  <div key={i} className="hstack" style={{ alignItems: "center", gap: 8 }}>
                    <span
                      aria-hidden
                      style={{
                        display: "inline-block",
                        width: 12,
                        height: 12,
                        borderRadius: 2,
                        background:
                          ["var(--color-primary)", "var(--color-secondary)", "#10B981", "#8B5CF6", "#EF4444"][
                            i % 5
                          ],
                        boxShadow: "0 0 0 2px rgba(0,0,0,0.05)",
                      }}
                    />
                    <span className="page-subtitle" style={{ margin: 0 }}>
                      {d.name}: <strong style={{ color: "var(--color-text)" }}>{d.value}</strong>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="page-subtitle">No distribution data.</div>
          )}
        </div>
      </div>
    </div>
  );
}
