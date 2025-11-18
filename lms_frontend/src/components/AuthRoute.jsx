import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";
import { useAuth } from "../context/AuthContext";

/**
 * PUBLIC_INTERFACE
 * AuthRoute - Route guard that supports both guest mode and Supabase auth.
 *
 * Behavior:
 * - If AuthContext reports isAuthenticated=true (guest mode) and strict auth is not required, allow access.
 * - If REACT_APP_REQUIRE_SUPABASE_AUTH === 'true', enforce Supabase session check:
 *    - Show a minimal loading state while checking
 *    - Redirect to /signin when no session is present
 * - If Supabase envs are missing and strict mode is not requested, skip check (guest mode).
 *
 * Security notes:
 * - Do not use a service-role key in the browser. REACT_APP_SUPABASE_KEY must be the anon public key.
 */
export default function AuthRoute({ children }) {
  const { isAuthenticated } = useAuth?.() || { isAuthenticated: false };

  // Stable derived flags
  const requireSupabaseAuth = useMemo(
    () => (process.env.REACT_APP_REQUIRE_SUPABASE_AUTH || "").toLowerCase() === "true",
    []
  );
  const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
  const supabaseKey = process.env.REACT_APP_SUPABASE_KEY;
  const supabaseConfigured = !!(supabaseUrl && supabaseKey);

  // Local state for strict auth flow
  const [loading, setLoading] = useState(requireSupabaseAuth && supabaseConfigured);
  const [authed, setAuthed] = useState(false);

  // Only perform Supabase check if strict auth is requested and envs are present
  useEffect(() => {
    let mounted = true;

    if (requireSupabaseAuth && supabaseConfigured) {
      setLoading(true);
      const supabase = createClient(supabaseUrl, supabaseKey);
      (async () => {
        try {
          const { data, error } = await supabase.auth.getSession();
          if (!mounted) return;
          if (error) {
            setAuthed(false);
          } else {
            setAuthed(!!data?.session);
          }
        } catch {
          if (!mounted) return;
          setAuthed(false);
        } finally {
          if (mounted) setLoading(false);
        }
      })();
    } else {
      // No strict auth required or not configured; ensure not loading
      setLoading(false);
    }

    return () => {
      mounted = false;
    };
  }, [requireSupabaseAuth, supabaseConfigured, supabaseUrl, supabaseKey]);

  // Render decisions
  // 1) Strict auth requested but not configured: redirect to /signin
  if (requireSupabaseAuth && !supabaseConfigured) {
    return <Navigate to="/signin" replace />;
  }

  // 2) Guest mode allowed and authenticated via AuthContext (guest true): allow right away
  if (!requireSupabaseAuth && isAuthenticated) {
    return children;
  }

  // 3) If strict auth flow is in progress
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-500/10 to-gray-50 text-[var(--color-muted)]">
        Checking session...
      </div>
    );
  }

  // 4) After strict check finished: gate by authed
  if (requireSupabaseAuth && !authed) {
    return <Navigate to="/signin" replace />;
  }

  // 5) Default allow
  return children;
}
