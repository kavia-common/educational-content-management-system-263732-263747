import React, { useEffect, useState } from "react";
import { isSupabaseMode, getSupabase } from "../lib/supabaseClient";

// PUBLIC_INTERFACE
export default function OAuthCallbackPage() {
  /**
   * Handles Supabase PKCE redirect parsing.
   * If Supabase mode is disabled, just redirect to intended route or /dashboard.
   */
  const [message, setMessage] = useState("Finalizing sign-in...");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const next = params.get("next") || "/dashboard";

    const proceed = async () => {
      const enabled = (() => { try { return isSupabaseMode(); } catch { return false; } })();
      if (!enabled) {
        window.location.replace(next);
        return;
      }
      try {
        // Supabase JS automatically detects session in URL when initialized with detectSessionInUrl: true.
        // We nudge initialization by accessing client.
        void getSupabase();
      } catch (_) {
        // ignore
      } finally {
        setTimeout(() => window.location.replace(next), 300);
      }
    };

    proceed();
  }, []);

  return <div style={{ padding: 24 }}>{message}</div>;
}
