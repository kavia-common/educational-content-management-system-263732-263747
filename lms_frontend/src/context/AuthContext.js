import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "../supabaseClient";
import { getSupabaseEnvInfo } from "../lib/supabaseClient";

/**
 * AuthContext backed by Supabase Auth.
 *
 * Behavior:
 * - Initializes from supabase.auth.getSession()
 * - Subscribes to onAuthStateChange for live session updates
 * - Fetches public profile from 'profiles' table (id=auth.uid()) if available
 * - Creates a basic profile on first login if missing
 * - Provides login/signUp/email magic-link and OAuth-start helpers (client-side)
 *
 * UI/Routes:
 * - Use <ProtectedRoute> to guard pages
 * - Expose minimal Ocean Professional theme styling in auth pages
 */
const AuthContext = createContext(undefined);

// PUBLIC_INTERFACE
export function useAuth() {
  /** Access the current auth context (user, loading, login, logout). */
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}

async function ensureProfile(user) {
  // Fetch existing profile; if not exists, create a minimal profile row
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, role")
      .eq("id", user.id)
      .maybeSingle();
    if (error) {
      // swallow read errors to avoid blocking login
      return null;
    }
    if (data) return data;

    // Create default profile
    const defaultName =
      user.user_metadata?.full_name ||
      user.email?.split("@")[0] ||
      "User";
    const role = user.app_metadata?.role || "student";

    const { data: inserted, error: insertErr } = await supabase
      .from("profiles")
      .insert([{ id: user.id, full_name: defaultName, role }])
      .select("id, full_name, role")
      .maybeSingle();

    if (insertErr) {
      // eslint-disable-next-line no-console
      console.warn("[AuthContext] Failed to create profile", insertErr.message);
      return null;
    }
    return inserted || null;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn("[AuthContext] ensureProfile error", e?.message);
    return null;
  }
}

// PUBLIC_INTERFACE
export function AuthProvider({ children }) {
  /**
   * Provides Supabase-authenticated user context.
   * user shape: { id, email, name, role, profile, session }
   */
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  // Compose user object with profile
  const composeUser = useCallback(async (session) => {
    if (!session?.user) return null;
    // fetch or create profile on first login
    const profile = (await ensureProfile(session.user)) || undefined;
    return {
      id: session.user.id,
      email: session.user.email,
      name:
        profile?.full_name ||
        session.user.user_metadata?.full_name ||
        session.user.email?.split("@")[0] ||
        "User",
      role: profile?.role || session.user.app_metadata?.role || "student",
      profile,
      session,
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!mounted) return;
        if (session?.user) {
          const composed = await composeUser(session);
          if (mounted) setUser(composed);
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      } finally {
        if (mounted) setInitializing(false);
      }
    })();

    // Subscribe and ensure cleanup
    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session?.user) {
        setUser(null);
        return;
      }
      const composed = await composeUser(session);
      setUser(composed);
    });

    return () => {
      try {
        sub.subscription?.unsubscribe?.();
      } catch {
        // ignore
      }
      mounted = false;
    };
  }, [composeUser]);

  const refresh = useCallback(async () => {
    /** PUBLIC_INTERFACE: Refresh user and profile from current session. */
    const { data } = await supabase.auth.getSession();
    const session = data?.session || null;
    if (!session?.user) {
      setUser(null);
      return null;
    }
    const composed = await composeUser(session);
    setUser(composed);
    return composed;
  }, [composeUser]);

  const signInWithPassword = useCallback(async (email, password) => {
    /** PUBLIC_INTERFACE: Email/password sign in. */
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return true;
  }, []);

  const signUpWithPassword = useCallback(async (email, password) => {
    /** PUBLIC_INTERFACE: Email/password sign up with emailRedirectTo. */
    const siteUrl = process.env.REACT_APP_FRONTEND_URL || window.location.origin;
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${siteUrl}/signin`,
      },
    });
    if (error) throw error;
    return data;
  }, []);

  const sendMagicLink = useCallback(async (email) => {
    /** PUBLIC_INTERFACE: Email magic link login (signInWithOtp). */
    const siteUrl = process.env.REACT_APP_FRONTEND_URL || window.location.origin;
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${siteUrl}/signin`,
      },
    });
    if (error) throw error;
    return true;
  }, []);

  const signInWithOAuth = useCallback(async (provider) => {
    /** PUBLIC_INTERFACE: Begin OAuth flow; no secrets are hardcoded. */
    const siteUrl = process.env.REACT_APP_FRONTEND_URL || window.location.origin;
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${siteUrl}/oauth/callback`,
        skipBrowserRedirect: false,
      },
    });
    if (error) throw error;
    return true;
  }, []);

  const logout = useCallback(async () => {
    /** PUBLIC_INTERFACE: Sign out and clear session. */
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  // PUBLIC_INTERFACE
  const getEnvInfo = useCallback(() => {
    /**
     * Returns safe environment info for diagnostics (no secrets).
     * Only indicates whether key exists, and shows url.
     */
    return getSupabaseEnvInfo();
  }, []);

  const value = useMemo(
    () => ({
      user,
      initializing,
      refresh,
      // actions
      signInWithPassword,
      signUpWithPassword,
      signInWithOAuth,
      sendMagicLink,
      logout,
      isAuthenticated: !!user,
      getEnvInfo,
    }),
    [
      user,
      initializing,
      refresh,
      signInWithPassword,
      signUpWithPassword,
      signInWithOAuth,
      sendMagicLink,
      logout,
      getEnvInfo,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
