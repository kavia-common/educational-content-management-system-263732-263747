import React, { useEffect, useMemo, useState } from "react";
import "../components/layout.css";
import { useFeatureFlags } from "../context/FeatureFlagsContext";
import { getSupabaseEnvInfo, isSupabaseMode, getSupabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";
import { seedLessons } from "../seeds/lessonsSeed";

/**
 * PUBLIC_INTERFACE
 * Health/status page for diagnostics.
 * Shows safe diagnostics without secrets:
 * - App status/version/environment
 * - Feature flags
 * - Environment presence (Supabase URL present, anon key present, FRONTEND_URL)
 * - Current auth status (authenticated/not, user id/email)
 * - Mode (Supabase vs Proxy)
 * - Basic Supabase connectivity check (auth.getSession)
 *
 * This page displays no secrets and performs no sensitive logging.
 */
export default function HealthPage() {
  const { flags, experimentsEnabled, isEnabled } = useFeatureFlags();
  const { user, isAuthenticated } = useAuth();
  const [seedMsg, setSeedMsg] = useState("");
  const [seeding, setSeeding] = useState(false);

  // Env and version info (sanitized)
  const version =
    process.env.REACT_APP_VERSION ||
    process.env.npm_package_version ||
    "unknown";
  const env = (process.env.REACT_APP_NODE_ENV ||
    process.env.NODE_ENV ||
    "development")
    .toString()
    .replace(/[^a-zA-Z0-9-_]/g, "");

  // Safe env presence using adapter
  const envInfo = useMemo(() => getSupabaseEnvInfo?.() || {}, []);

  const enabledFlags = useMemo(() => {
    const out = [];
    Object.keys(flags || {}).forEach((k) => {
      if (flags[k]) out.push(k);
    });
    return out;
  }, [flags]);

  const canSeed =
    (isEnabled("FLAG_ALLOW_SEED") || flags.FLAG_ALLOW_SEED === true) &&
    isSupabaseMode();

  // Supabase connectivity probe - no secrets printed
  const [sbCheck, setSbCheck] = useState({
    status: "pending",
    message: "Checking Supabase connectivity...",
  });
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const supabase = getSupabase?.();
        if (!supabase) {
          if (mounted) {
            setSbCheck({
              status: "error",
              message: "Supabase client unavailable",
            });
          }
          return;
        }
        const { data, error } = await supabase.auth.getSession();
        if (!mounted) return;
        if (error) {
          setSbCheck({
            status: "error",
            message: "auth.getSession failed",
          });
        } else {
          const hasSession = Boolean(data?.session?.user?.id);
          setSbCheck({
            status: "ok",
            message: hasSession ? "Connected (session active)" : "Connected (no active session)",
          });
        }
      } catch {
        if (mounted) {
          setSbCheck({
            status: "error",
            message: "Connectivity check threw an error",
          });
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const handleSeed = async () => {
    if (!canSeed || seeding) return;
    setSeeding(true);
    setSeedMsg("");
    try {
      const result = await seedLessons();
      setSeedMsg(`Seed successful: upserted ${result.total} lessons.`);
    } catch (e) {
      const msg = e?.message || "Seed failed";
      setSeedMsg(`Seed failed: ${msg}`);
    } finally {
      setSeeding(false);
    }
  };

  const chip = (text, tone = "neutral") => {
    const toneMap = {
      neutral: { bg: "#EEF2FF", color: "#1E3A8A", border: "rgba(30,58,138,0.25)" }, // indigo
      ok: { bg: "#ECFDF5", color: "#065F46", border: "rgba(5, 150, 105, .25)" },    // green
      warn: { bg: "#FFFBEB", color: "#92400E", border: "rgba(245, 158, 11, .35)" }, // amber
      error: { bg: "#FEF2F2", color: "#991B1B", border: "rgba(239, 68, 68, .35)" }, // red
    };
    const s = toneMap[tone] || toneMap.neutral;
    return (
      <span
        style={{
          display: "inline-block",
          padding: "6px 10px",
          borderRadius: 999,
          background: s.bg,
          color: s.color,
          border: `1px solid ${s.border}`,
          fontWeight: 600,
          fontSize: 12,
        }}
      >
        {text}
      </span>
    );
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
          <div className="page-subtitle" style={{ marginTop: 8 }}>
            Mode:{" "}
            {chip(isSupabaseMode() ? "Supabase" : "Proxy/No-Supabase", isSupabaseMode() ? "ok" : "warn")}
          </div>
        </div>

        <div className="card">
          <strong>Feature Flags</strong>
          <ul style={{ marginTop: 8 }}>
            {enabledFlags.length > 0 ? (
              enabledFlags.map((f) => (
                <li key={f}>
                  <code>{f}</code>
                </li>
              ))
            ) : (
              <li>
                <em>None enabled</em>
              </li>
            )}
          </ul>
          <div className="page-subtitle" style={{ marginTop: 8 }}>
            Experiments:{" "}
            <strong
              style={{
                color: experimentsEnabled
                  ? "var(--color-primary)"
                  : "var(--color-muted)",
              }}
            >
              {experimentsEnabled ? "enabled" : "disabled"}
            </strong>
          </div>
        </div>

        <div className="card">
          <strong>Environment Presence</strong>
          <div
            style={{
              display: "grid",
              gap: 8,
              marginTop: 8,
              fontFamily: "monospace",
              fontSize: 12,
              wordBreak: "break-all",
            }}
          >
            <div>
              Supabase URL:{" "}
              {envInfo.supabaseUrl ? chip("present", "ok") : chip("missing", "error")}
            </div>
            <div>
              Supabase Key Present:{" "}
              {envInfo.supabaseKeyPresent ? chip("true", "ok") : chip("false", "error")}
            </div>
            <div>
              Supabase Key (masked):{" "}
              {envInfo.supabaseKeyMasked ? (
                <span>{envInfo.supabaseKeyMasked}</span>
              ) : (
                <span>(none)</span>
              )}
            </div>
            <div>Frontend URL: {envInfo.frontendUrl || "(not set)"}</div>
          </div>
        </div>

        <div className="card">
          <strong>Authentication</strong>
          <div className="vstack" style={{ gap: 6, marginTop: 8 }}>
            <div>
              Status:{" "}
              {chip(isAuthenticated ? "authenticated" : "not authenticated", isAuthenticated ? "ok" : "warn")}
            </div>
            {isAuthenticated && (
              <>
                <div>User ID: {user?.id}</div>
                <div>Email: {user?.email}</div>
              </>
            )}
          </div>
        </div>

        <div className="card">
          <strong>Supabase Connectivity</strong>
          <div className="hstack" style={{ gap: 8, alignItems: "center", marginTop: 8 }}>
            {chip(
              sbCheck.status === "ok"
                ? "OK"
                : sbCheck.status === "pending"
                ? "Checking"
                : "Error",
              sbCheck.status === "ok" ? "ok" : sbCheck.status === "pending" ? "neutral" : "error"
            )}
            <span className="page-subtitle" style={{ margin: 0 }}>{sbCheck.message}</span>
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
              <div
                className="page-subtitle"
                style={{ marginTop: 8, color: "var(--color-error)" }}
              >
                Supabase mode disabled. Enable FLAG_SUPABASE_MODE to use seed utilities.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
