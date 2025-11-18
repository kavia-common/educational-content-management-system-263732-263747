import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";

/**
 * PUBLIC_INTERFACE
 * AuthRoute - Protects children by ensuring an authenticated Supabase session exists.
 * - On mount, calls supabase.auth.getSession()
 * - Shows a minimal loading state while checking
 * - Redirects to /signin when no session is present
 *
 * Note: This wrapper is used in the simple LMS variant (App.jsx).
 * Do not use a service-role key in the browser. REACT_APP_SUPABASE_KEY must be the anon public key.
 */
export default function AuthRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    let mounted = true;

    const url = process.env.REACT_APP_SUPABASE_URL;
    const key = process.env.REACT_APP_SUPABASE_KEY;
    const supabase = createClient(url, key);

    (async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (!mounted) return;
        if (error) {
          setAuthed(false);
        } else {
          setAuthed(!!data?.session);
        }
      } catch (_) {
        if (!mounted) return;
        setAuthed(false);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-500/10 to-gray-50 text-[var(--color-muted)]">
        Checking session...
      </div>
    );
  }

  if (!authed) {
    return <Navigate to="/signin" replace />;
  }

  return children;
}
