import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { authApi } from "../apiClient";
import { getSupabase, isSupabaseMode } from "../lib/supabaseClient";

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
   * Provides authentication state for either:
   * - Backend proxy cookie session (default)
   * - Direct Supabase client session (when FLAG_SUPABASE_MODE is true)
   *
   * In Supabase mode it:
   *  - calls supabase.auth.getSession() on load
   *  - subscribes to supabase.auth.onAuthStateChange
   *  - fetches profile from 'profiles' table to determine role
   */
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const supaMode = isSupabaseMode();

  const mapSupabaseUser = (u, profile) => {
    if (!u) return null;
    return {
      id: u.id,
      email: u.email,
      name: profile?.full_name || profile?.name || u.user_metadata?.name || u.email,
      role: profile?.role || "student",
      profile,
    };
  };

  const loadFromSupabase = useCallback(async () => {
    const supabase = getSupabase();
    const { data: sessionData, error: sessionErr } = await supabase.auth.getSession();
    if (sessionErr) {
      setUser(null);
      setInitializing(false);
      return;
    }
    const session = sessionData?.session || null;
    const authedUser = session?.user || null;
    if (!authedUser) {
      setUser(null);
      setInitializing(false);
      return;
    }
    // fetch profile
    let profile = null;
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", authedUser.id)
        .single();
      if (!error) profile = data;
    } catch (_) {
      // ignore, default student
    }
    setUser(mapSupabaseUser(authedUser, profile));
    setInitializing(false);
  }, []);

  const refresh = useCallback(async () => {
    /**
     * PUBLIC_INTERFACE
     * Refresh the authenticated user depending on mode.
     */
    if (supaMode) {
      await loadFromSupabase();
      return;
    }
    try {
      const me = await authApi.me();
      setUser(me?.user || me || null);
    } catch (_) {
      setUser(null);
    } finally {
      setInitializing(false);
    }
  }, [supaMode, loadFromSupabase]);

  useEffect(() => {
    let unsubscribe = null;
    (async () => {
      if (supaMode) {
        await loadFromSupabase();
        const supabase = getSupabase();
        const { data: sub } = supabase.auth.onAuthStateChange(async (_event, _session) => {
          // Always re-load profile on auth state change
          await loadFromSupabase();
        });
        unsubscribe = sub?.subscription?.unsubscribe;
      } else {
        await refresh();
      }
    })();
    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supaMode]);

  const login = useCallback(
    (provider = "email") => {
      // In proxy mode, redirect to backend login
      if (!supaMode) {
        const url = authApi.loginUrl(provider);
        window.location.assign(url);
        return;
      }
      // In Supabase mode, the page's form will call signIn methods; keep for compatibility.
      // No-op here to avoid accidental redirects.
    },
    [supaMode]
  );

  const logout = useCallback(async () => {
    /**
     * PUBLIC_INTERFACE
     * Logs out depending on mode and redirects to /login.
     */
    try {
      if (supaMode) {
        const supabase = getSupabase();
        await supabase.auth.signOut();
      } else {
        await authApi.logout();
      }
    } catch (_) {
      // ignore
    } finally {
      setUser(null);
      window.location.replace("/login");
    }
  }, [supaMode]);

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
