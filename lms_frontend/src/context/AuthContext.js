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
   * Maintains three states: initializing, authenticated, unauthenticated.
   */
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  const refresh = useCallback(async () => {
    /**
     * PUBLIC_INTERFACE
     * Refresh the authenticated user by calling GET /auth/me.
     * On 200, sets user; on 401 or error, clears user.
     */
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
    // Hydrate current user on first mount
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback((provider = "email") => {
    // Redirect browser to backend login URL (will handle OAuth/email)
    const url = authApi.loginUrl(provider);
    window.location.assign(url);
  }, []);

  const logout = useCallback(async () => {
    /**
     * PUBLIC_INTERFACE
     * Logs out the user via POST /auth/logout and redirects to /login.
     */
    try {
      await authApi.logout();
    } catch (_) {
      // ignore network errors; proceed to clear client state
    } finally {
      setUser(null);
      // Use replace to avoid back navigation into an authed route
      window.location.replace("/login");
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
   * Guards protected routes: shows a loading state until initialized,
   * redirects to /login if unauthenticated, otherwise renders children.
   */
  const { initializing, isAuthenticated } = useAuth();

  if (initializing) {
    return <div style={{ padding: 24 }}>Loading...</div>;
  }
  if (!isAuthenticated) {
    const next = encodeURIComponent(window.location.pathname + window.location.search);
    window.location.replace(`/login?next=${next}`);
    return null;
  }
  return children;
}
