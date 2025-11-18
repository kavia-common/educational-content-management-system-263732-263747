import React, { useEffect, useRef, useState } from "react";
import { isSupabaseMode, getSupabase } from "../lib/supabaseClient";

// PUBLIC_INTERFACE
export default function OAuthCallbackPage() {
  /**
   * Handles Supabase PKCE redirect parsing.
   * If Supabase mode is disabled, just redirect to intended route or /dashboard.
   */
  const [message, setMessage] = useState("Finalizing sign-in...");
  const ranRef = useRef(false);

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;

    const params = new URLSearchParams(window.location.search);
    const next = params.get("next") || "/dashboard";

    // Diagnostic tracing
    // eslint-disable-next-line no-console
    console.debug("[OAuthCallbackPage] starting, next:", next, "currentPath:", window.location.pathname);

    const proceed = async () => {
      const enabled = (() => { try { return isSupabaseMode(); } catch { return false; } })();
      if (!enabled) {
        // eslint-disable-next-line no-console
        console.debug("[OAuthCallbackPage] supabase disabled, replacing to", next);
        window.location.replace(next);
        return;
      }
      try {
        // Supabase JS automatically detects session in URL when initialized with detectSessionInUrl: true.
        // We nudge initialization by accessing client.
        void getSupabase();
        setMessage("Completing authentication…");
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn("[OAuthCallbackPage] error initializing supabase", e);
      } finally {
        // Use replace to avoid back button returning to callback and re-triggering flow
        setTimeout(() => {
          // eslint-disable-next-line no-console
          console.debug("[OAuthCallbackPage] replacing to", next);
          window.location.replace(next);
        }, 300);
      }
    };

    proceed();
  }, []);

  // TEMP: This page is effectively a no-op during auth-disabled preview.
  // TODO: When restoring auth, ensure Supabase URL fragment parsing is verified here.
  return <div style={{ padding: 24 }}>{message}</div>;
}
