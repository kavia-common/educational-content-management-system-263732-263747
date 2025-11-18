import React, { createContext, useContext, useMemo } from "react";

/**
 * Feature flags and experiments context for the frontend.
 * It parses:
 * - REACT_APP_FEATURE_FLAGS: can be a JSON object string (e.g., {"charts":true,"newDashboard":false})
 *   or a comma-separated list (e.g., "charts,newDashboard") which implies boolean true for listed keys.
 * - REACT_APP_EXPERIMENTS_ENABLED: "true"/"false" to enable global experiments.
 *
 * No secrets are read or logged; only public, non-sensitive flags are exposed to components.
 */
const FeatureFlagsContext = createContext(undefined);

// PUBLIC_INTERFACE
export function useFeatureFlags() {
  /** Access feature flags and experiments settings. */
  const ctx = useContext(FeatureFlagsContext);
  if (!ctx) throw new Error("useFeatureFlags must be used within <FeatureFlagsProvider>");
  return ctx;
}

// PUBLIC_INTERFACE
export function FeatureFlagsProvider({ children }) {
  /**
   * Parse environment variables for feature flags once at startup and expose:
   * - flags: plain object { [flagName]: boolean }
   * - experimentsEnabled: boolean
   */
  const flags = useMemo(() => {
    const raw = process.env.REACT_APP_FEATURE_FLAGS || "";
    if (!raw) return {};
    // Try JSON first
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        // Normalize to booleans
        const out = {};
        Object.keys(parsed).forEach((k) => {
          out[k] = !!parsed[k];
        });
        return out;
      }
    } catch (_) {
      // Not JSON; fall back to comma-separated
    }
    // Comma-separated list implies true for each
    const list = String(raw)
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const out = {};
    list.forEach((k) => {
      out[k] = true;
    });
    return out;
  }, []);

  const experimentsEnabled = useMemo(() => {
    return String(process.env.REACT_APP_EXPERIMENTS_ENABLED || "").toLowerCase() === "true";
  }, []);

  const value = useMemo(
    () => ({
      flags,
      experimentsEnabled,
      // PUBLIC_INTERFACE
      isEnabled(name) {
        /** Check if a given flag is enabled (boolean). */
        return !!flags[name];
      },
    }),
    [flags, experimentsEnabled]
  );

  return <FeatureFlagsContext.Provider value={value}>{children}</FeatureFlagsContext.Provider>;
}
