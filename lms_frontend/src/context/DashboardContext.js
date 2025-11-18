import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";

/**
 * DashboardContext tracks lightweight counters and last-updated timestamps
 * to allow dashboards to react to enroll/start/complete actions fired elsewhere
 * (e.g., from Course pages) without a full page reload. Components may subscribe
 * to the "version" or to the derived counters to trigger local refetches.
 */
const DashboardContext = createContext(undefined);

// PUBLIC_INTERFACE
export function useDashboard() {
  /** Access dashboard update bus to trigger or subscribe to refresh signals. */
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error("useDashboard must be used within <DashboardProvider>");
  return ctx;
}

// PUBLIC_INTERFACE
export function DashboardProvider({ children }) {
  /**
   * Provider holding counters for user-focused and admin-focused dashboards.
   * Exposes bumpers for enroll/start/complete which increment counters and
   * update a version number that consumers can include in effect deps to refetch.
   */
  const [version, setVersion] = useState(0);
  const [userCounters, setUserCounters] = useState({
    enrolled: 0,
    completed: 0,
    inProgress: 0,
  });
  const [adminCounters, setAdminCounters] = useState({
    completionsToday: 0,
  });

  const lastUpdatedRef = useRef({});

  const bump = useCallback((updates) => {
    // Merge and increment counters atomically and bump version
    setUserCounters((prev) => ({
      enrolled: prev.enrolled + (updates.enrolled || 0),
      completed: prev.completed + (updates.completed || 0),
      inProgress: prev.inProgress + (updates.inProgress || 0),
    }));
    setAdminCounters((prev) => ({
      completionsToday: prev.completionsToday + (updates.completionsToday || 0),
    }));
    // Track a timestamp
    lastUpdatedRef.current = { at: Date.now(), ...updates };
    setVersion((v) => v + 1);
  }, []);

  const markEnrolled = useCallback(() => bump({ enrolled: 1 }), [bump]);
  const markStarted = useCallback(() => bump({ inProgress: 1 }), [bump]);
  const markCompleted = useCallback(() => bump({ completed: 1, completionsToday: 1 }), [bump]);

  const value = useMemo(
    () => ({
      version,
      userCounters,
      adminCounters,
      lastUpdated: lastUpdatedRef.current,
      markEnrolled,
      markStarted,
      markCompleted,
    }),
    [version, userCounters, adminCounters, markEnrolled, markStarted, markCompleted]
  );

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
}
