import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
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

  // Memoize mode once per mount to avoid changing value identity thrash
  const supabaseEnabled = useMemo(() => {
    try {
      return isSupabaseMode();
    } catch {
      return false;
    }
  }, []);

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

  // Keep a single subscription instance across renders
  const subRef = useRef(null);

  useEffect(() => {
    let mounted = true;

    async function init() {
      // Diagnostic tracing
      // eslint-disable-next-line no-console
      console.debug("[AuthProvider.init] start", { supabaseEnabled });

      if (!supabaseEnabled) {
        setUser(defaultGuest);
        setInitializing(false);
        // eslint-disable-next-line no-console
        console.debug("[AuthProvider.init] guest mode");
        return;
      }
      try {
        const sessionData = await getCurrentSession();
        if (!mounted) return;
        if (!sessionData?.session?.user) {
          // not signed in
          setUser(null);
          // eslint-disable-next-line no-console
          console.debug("[AuthProvider.init] no session -> user=null");
        } else {
          // build profile
          const profile = await loadSupabaseProfile(sessionData.session.user.id, sessionData.session.user.email);
          if (!mounted) return;
          setUser(profile);
          // eslint-disable-next-line no-console
          console.debug("[AuthProvider.init] profile loaded", { role: profile?.role });
        }
      } catch (e) {
        if (mounted) setUser(null);
        // eslint-disable-next-line no-console
        console.warn("[AuthProvider.init] error", e);
      } finally {
        if (mounted) setInitializing(false);
      }

      // Subscribe to auth changes once
      if (!subRef.current) {
        try {
          const supabase = getSupabase();
          const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (!mounted) return;
            // eslint-disable-next-line no-console
            console.debug("[AuthProvider.authChange]", { event, hasSession: !!session });
            if (session?.user) {
              const profile = await loadSupabaseProfile(session.user.id, session.user.email);
              setUser(profile);
            } else {
              setUser(null);
            }
          });
          subRef.current = listener?.subscription || null;
        } catch (e) {
          // eslint-disable-next-line no-console
          console.warn("[AuthProvider] failed to subscribe auth changes", e);
        }
      }
    }

    init();

    return () => {
      mounted = false;
      if (subRef.current) {
        try {
          subRef.current.unsubscribe();
        } catch {
          // ignore
        } finally {
          subRef.current = null;
        }
      }
    };
  }, [defaultGuest, loadSupabaseProfile, supabaseEnabled]);

  const refresh = useCallback(async () => {
    /** PUBLIC_INTERFACE: Refresh current session/profile. */
    if (!supabaseEnabled) {
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
  }, [defaultGuest, supabaseEnabled]);

  const login = useCallback(() => {
    /** PUBLIC_INTERFACE: Begin login via redirect to Supabase hosted provider page if applicable; otherwise noop in guest mode. */
    if (!supabaseEnabled) {
      // guest mode: no-op
      return;
    }
    const supabase = getSupabase();
    return supabase;
  }, [supabaseEnabled]);

  const logout = useCallback(async () => {
    /** PUBLIC_INTERFACE: Logout in Supabase mode or reset to guest. */
    if (supabaseEnabled) {
      try {
        await signOut();
      } catch (_) {}
      setUser(null);
      return;
    }
    setUser(defaultGuest);
  }, [defaultGuest, supabaseEnabled]);

  const value = useMemo(() => {
    const v = {
      user,
      // expose a derived profile-like shape for convenience in guards/pages
      profile: user?.profile || null,
      initializing,
      refresh,
      login,
      logout,
      isAuthenticated: supabaseEnabled ? !!user : true,
      flags,
    };
    // Diagnostic tracing for value stability and state
    // eslint-disable-next-line no-console
    console.debug("[AuthProvider.value]", {
      initializing,
      isAuthenticated: v.isAuthenticated,
      role: v.profile?.role,
      guestMode: !supabaseEnabled,
    });
    return v;
  }, [user, initializing, refresh, login, logout, flags, supabaseEnabled]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
