import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getSupabase, getCurrentSession, isSupabaseMode, signOut } from "../lib/supabaseClient";

/**
 * AuthContext supports two modes:
 * - Supabase Mode (FLAG_SUPABASE_MODE=true): Uses Supabase PKCE auth and profiles table for role.
 * - Guest Mode (default): Provides a guest user for demos (can be set to admin or guest below).
 */
const AuthContext = createContext(undefined);

// PUBLIC_INTERFACE
export function useAuth() {
  /** Access the current auth context (user, loading, login, logout). */
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}

// Helper to parse feature flags quickly without re-importing context
function getFlags() {
  const raw = process.env.REACT_APP_FEATURE_FLAGS || "";
  if (!raw) return {};
  try {
    const obj = JSON.parse(raw);
    if (obj && typeof obj === "object") return obj;
  } catch (_) {}
  const out = {};
  String(raw)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .forEach((k) => {
      out[k] = true;
    });
  return out;
}

// PUBLIC_INTERFACE
export function AuthProvider({ children }) {
  /**
   * Provides:
   * - Supabase-backed auth when enabled
   * - Guest fallback for demos
   */
  const defaultGuest = useMemo(
    () => ({
      id: "guest",
      email: "guest@example.com",
      name: "Guest",
      role: "admin", // change to "guest" to restrict author/admin UI
      profile: { full_name: "Guest User", role: "admin" },
    }),
    []
  );

  const [user, setUser] = useState(defaultGuest);
  const [initializing, setInitializing] = useState(true);
  const [flags] = useState(getFlags());

  const loadSupabaseProfile = useCallback(async (uid, email) => {
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase.from("profiles").select("*").eq("id", uid).maybeSingle();
      if (error) throw error;
      const full_name = data?.full_name || email?.split("@")[0] || "User";
      const role = data?.role || "employee";
      return { id: uid, email, name: full_name, role, profile: { full_name, role } };
    } catch (e) {
      // fallback minimal profile
      return { id: uid, email, name: email || "User", role: "employee", profile: { full_name: "User", role: "employee" } };
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    async function init() {
      if (!isSupabaseMode()) {
        setUser(defaultGuest);
        setInitializing(false);
        return;
      }
      try {
        const sessionData = await getCurrentSession();
        if (!mounted) return;
        if (!sessionData?.session?.user) {
          // not signed in
          setUser(null);
          setInitializing(false);
          // Subscribe for future sign-in events
          const supabase = getSupabase();
          supabase.auth.onAuthStateChange(async (event, session) => {
            if (!mounted) return;
            if (session?.user) {
              const profile = await loadSupabaseProfile(session.user.id, session.user.email);
              setUser(profile);
            } else {
              setUser(null);
            }
          });
          return;
        }
        // build profile
        const profile = await loadSupabaseProfile(sessionData.session.user.id, sessionData.session.user.email);
        if (!mounted) return;
        setUser(profile);
      } catch (_) {
        // keep user null in Supabase mode to force login
        if (mounted) setUser(null);
      } finally {
        if (mounted) setInitializing(false);
      }

      // Subscribe to auth changes
      const supabase = getSupabase();
      supabase.auth.onAuthStateChange(async (_event, session) => {
        if (!mounted) return;
        if (session?.user) {
          const profile = await loadSupabaseProfile(session.user.id, session.user.email);
          setUser(profile);
        } else {
          setUser(null);
        }
      });
    }

    init();

    return () => {
      mounted = false;
    };
  }, [defaultGuest, loadSupabaseProfile]);

  const refresh = useCallback(async () => {
    /** PUBLIC_INTERFACE: Refresh current session/profile. */
    if (!isSupabaseMode()) {
      setUser(defaultGuest);
      return;
    }
    const sessionData = await getCurrentSession();
    if (sessionData?.session?.user) {
      const profile = await (async () => {
        const supabase = getSupabase();
        const { data, error } = await supabase.from("profiles").select("*").eq("id", sessionData.session.user.id).maybeSingle();
        if (!error && data) {
          const full_name = data?.full_name || sessionData.session.user.email?.split("@")[0] || "User";
          const role = data?.role || "employee";
          return { id: sessionData.session.user.id, email: sessionData.session.user.email, name: full_name, role, profile: { full_name, role } };
        }
        return { id: sessionData.session.user.id, email: sessionData.session.user.email, name: "User", role: "employee", profile: { full_name: "User", role: "employee" } };
      })();
      setUser(profile);
    } else {
      setUser(null);
    }
  }, [defaultGuest]);

  const login = useCallback(() => {
    /** PUBLIC_INTERFACE: Begin login via redirect to Supabase hosted provider page if applicable; otherwise noop in guest mode. */
    if (!isSupabaseMode()) {
      // guest mode: no-op
      return;
    }
    const supabase = getSupabase();
    // Default: open a sign-in page or let the LoginPage handle initiating email auth.
    // Here we do nothing; UI should navigate to /login where a form will start magic link or provider flow.
    return supabase;
  }, []);

  const logout = useCallback(async () => {
    /** PUBLIC_INTERFACE: Logout in Supabase mode or reset to guest. */
    if (isSupabaseMode()) {
      try {
        await signOut();
      } catch (_) {}
      setUser(null);
      return;
    }
    setUser(defaultGuest);
  }, [defaultGuest]);

  const value = useMemo(
    () => ({
      user,
      initializing,
      refresh,
      login,
      logout,
      isAuthenticated: isSupabaseMode() ? !!user : true,
      flags,
    }),
    [user, initializing, refresh, login, logout, flags]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
