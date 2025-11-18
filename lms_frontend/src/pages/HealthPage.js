import React, { useMemo, useState } from "react";
import "../components/layout.css";
import { useFeatureFlags } from "../context/FeatureFlagsContext";
import { isSupabaseMode } from "../lib/supabaseClient";
import { seedLessons } from "../seeds/lessonsSeed";

/**
 * PUBLIC_INTERFACE
 * Health/status page for diagnostics.
 * Shows:
 * - status: OK
 * - app version: from package.json if available
 * - environment: REACT_APP_NODE_ENV
 * - enabled flags: list of feature flags enabled
 * - Optional: admin-only seed button (FLAG_ALLOW_SEED=true) to populate course lessons in Supabase mode
 *
 * This page displays no secrets and performs no sensitive logging.
 */
export default function HealthPage() {
  const { flags, experimentsEnabled, isEnabled } = useFeatureFlags();
  const [seedMsg, setSeedMsg] = useState("");
  const [seeding, setSeeding] = useState(false);

  // Avoid showing URLs, keys or any sensitive envs. Only expose safe, generic info.
  const version = process.env.REACT_APP_VERSION || process.env.npm_package_version || "unknown";
  const env = (process.env.REACT_APP_NODE_ENV || process.env.NODE_ENV || "development")
    .toString()
    .replace(/[^a-zA-Z0-9-_]/g, ""); // sanitize printable

  const enabledFlags = useMemo(() => {
    const out = [];
    Object.keys(flags || {}).forEach((k) => {
      if (flags[k]) out.push(k);
    });
    return out;
  }, [flags]);

  const canSeed = (isEnabled("FLAG_ALLOW_SEED") || flags.FLAG_ALLOW_SEED === true) && isSupabaseMode();

  const handleSeed = async () => {
    if (!canSeed || seeding) return;
    setSeeding(true);
    setSeedMsg("");
    try {
      const result = await seedLessons();
      setSeedMsg(`Seed successful: upserted ${result.total} lessons.`);
    } catch (e) {
      // Show concise message without sensitive details
      const msg = e?.message || "Seed failed";
      setSeedMsg(`Seed failed: ${msg}`);
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="vstack" style={{ padding: 24 }}>
      <h1 className="page-title">Health</h1>
      <p className="page-subtitle">Application diagnostics (no secrets)</p>

      <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div className="card" role="status" aria-live="polite">
          <div className="hstack" style={{ justifyContent: "space-between" }}>
            <strong>Status</strong>
            <span style={{ color: "var(--color-primary)" }}>OK</span>
          </div>
        </div>
        <div className="card">
          <div className="hstack" style={{ justifyContent: "space-between" }}>
            <strong>Version</strong>
            <span style={{ color: "var(--color-secondary)" }}>{version}</span>
          </div>
        </div>
        <div className="card">
          <div className="hstack" style={{ justifyContent: "space-between" }}>
            <strong>Environment</strong>
            <span aria-label="Current environment">{env}</span>
          </div>
        </div>
        <div className="card">
          <strong>Feature Flags</strong>
          <ul style={{ marginTop: 8 }}>
            {enabledFlags.length > 0 ? (
              enabledFlags.map((f) => <li key={f}><code>{f}</code></li>)
            ) : (
              <li><em>None enabled</em></li>
            )}
          </ul>
          <div className="page-subtitle" style={{ marginTop: 8 }}>
            Experiments: <strong style={{ color: experimentsEnabled ? "var(--color-primary)" : "var(--color-muted)" }}>
              {experimentsEnabled ? "enabled" : "disabled"}
            </strong>
          </div>
        </div>

        {canSeed && (
          <div className="card">
            <div className="hstack" style={{ justifyContent: "space-between", marginBottom: 8 }}>
              <strong>Seed Utilities</strong>
              <span className="page-subtitle" style={{ margin: 0 }}>Admin-only action</span>
            </div>
            <div className="hstack" style={{ gap: 8 }}>
              <button
                className="btn btn-primary"
                onClick={handleSeed}
                disabled={seeding}
                aria-label="Seed course lessons into Supabase"
              >
                {seeding ? "Seeding..." : "Seed Course Lessons"}
              </button>
            </div>
            {seedMsg && (
              <div className="page-subtitle" style={{ marginTop: 8 }}>
                {seedMsg}
              </div>
            )}
            {!isSupabaseMode() && (
              <div className="page-subtitle" style={{ marginTop: 8, color: "var(--color-error)" }}>
                Supabase mode disabled. Enable FLAG_SUPABASE_MODE to use seed utilities.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
