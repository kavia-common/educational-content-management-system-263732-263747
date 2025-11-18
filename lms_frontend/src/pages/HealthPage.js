import React, { useMemo } from "react";
import "../components/layout.css";
import { useFeatureFlags } from "../context/FeatureFlagsContext";

/**
 * PUBLIC_INTERFACE
 * Health/status page for diagnostics.
 * Shows:
 * - status: OK
 * - app version: from package.json if available
 * - environment: REACT_APP_NODE_ENV
 * - enabled flags: list of feature flags enabled
 *
 * This page displays no secrets and performs no network calls.
 */
export default function HealthPage() {
  const { flags, experimentsEnabled } = useFeatureFlags();

  // Safely read version from build-time injected env if available via CRA
  // CRA doesn't expose package.json directly; instead, rely on process.env for version fallback.
  // Some pipelines inject REACT_APP_VERSION; otherwise show unknown.
  const version = process.env.REACT_APP_VERSION || process.env.npm_package_version || "unknown";
  const env = process.env.REACT_APP_NODE_ENV || process.env.NODE_ENV || "development";

  const enabledFlags = useMemo(() => {
    const out = [];
    Object.keys(flags || {}).forEach((k) => {
      if (flags[k]) out.push(k);
    });
    return out;
  }, [flags]);

  return (
    <div className="vstack" style={{ padding: 24 }}>
      <h1 className="page-title">Health</h1>
      <p className="page-subtitle">Application diagnostics (no secrets)</p>

      <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div className="card">
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
            <span>{env}</span>
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
      </div>
    </div>
  );
}
