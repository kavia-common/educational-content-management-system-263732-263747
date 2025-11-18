import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { authApi } from "../apiClient";

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
   * Provides authentication state based on backend cookie session.
   * On mount, it queries GET /auth/me to resolve the current user.
   */
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const me = await authApi.me();
      setUser(me?.user || me || null);
    } catch (_) {
      setUser(null);
    } finally {
      setInitializing(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = useCallback((provider = "email") => {
    // Redirect browser to backend login URL (will handle OAuth/email)
    const url = authApi.loginUrl(provider);
    window.location.assign(url);
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
      window.location.assign("/login");
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      initializing,
      refresh,
      login,
      logout,
      isAuthenticated: !!user,
    }),
    [user, initializing, refresh, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// PUBLIC_INTERFACE
export function PrivateRoute({ children }) {
  /**
   * Guards protected routes: shows nothing until initialized,
   * redirects to /login if unauthenticated, otherwise renders children.
   */
  const { initializing, isAuthenticated } = useAuth();

  if (initializing) {
    return <div style={{ padding: 24 }}>Loading...</div>;
  }
  if (!isAuthenticated) {
    const next = encodeURIComponent(window.location.pathname + window.location.search);
    window.location.assign(`/login?next=${next}`);
    return null;
  }
  return children;
}
