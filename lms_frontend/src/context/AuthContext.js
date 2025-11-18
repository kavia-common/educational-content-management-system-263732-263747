import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

/**
 * AuthContext in guest/anonymous mode.
 * - isAuthenticated is always true
 * - user defaults to a guest profile with admin role for full access, configurable below
 * - No calls to supabase.auth or backend auth endpoints are made
 */
const AuthContext = createContext(undefined);

// PUBLIC_INTERFACE
export function useAuth() {
  /** Access the current auth context (user, loading, login, logout). */
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}

// PUBLIC_INTERFACE
export function AuthProvider({ children }) {
  /**
   * Provides a default guest user so the app works without sign-in.
   * Change role to "guest" to restrict author/admin UI if desired.
   */
  const defaultGuest = useMemo(
    () => ({
      id: "guest",
      email: "guest@example.com",
      name: "Guest",
      // Use "admin" for full-access demo or "guest" to restrict UI affordances
      role: "admin",
      profile: { full_name: "Guest User", role: "admin" },
    }),
    []
  );

  const [user, setUser] = useState(defaultGuest);
  const [initializing, setInitializing] = useState(false);

  useEffect(() => {
    // Immediately ready in guest mode
    setInitializing(false);
  }, []);

  const refresh = useCallback(async () => {
    /** PUBLIC_INTERFACE: No-op refresh in guest mode. */
    setUser(defaultGuest);
    setInitializing(false);
  }, [defaultGuest]);

  const login = useCallback(() => {
    /** PUBLIC_INTERFACE: No-op login in guest mode. */
    // Intentionally empty
  }, []);

  const logout = useCallback(async () => {
    /** PUBLIC_INTERFACE: No-op logout in guest mode; keep user as guest. */
    setUser(defaultGuest);
  }, [defaultGuest]);

  const value = useMemo(
    () => ({
      user,
      initializing,
      refresh,
      login,
      logout,
      isAuthenticated: true,
    }),
    [user, initializing, refresh, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
