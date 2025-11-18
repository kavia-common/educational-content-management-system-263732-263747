import React, { useEffect } from "react";
import { useAuth } from "../context/AuthContext";

// PUBLIC_INTERFACE
export default function OAuthCallbackPage() {
  /**
   * Handles the redirect back from auth provider.
   * Assumes backend has set session cookie.
   * Reads optional error query param to show fallback route.
   */
  const { refresh } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const next = params.get("next") || "/dashboard";
    const error = params.get("error");
    (async () => {
      try {
        await refresh();
        // On success, proceed to intended route
        window.location.replace(next);
      } catch (_) {
        // If refresh fails, bounce to login with error and next preserved
        const dest = encodeURIComponent(next);
        const errCode = encodeURIComponent(error || "auth_failed");
        window.location.replace(`/login?error=${errCode}&next=${dest}`);
      }
    })();
  }, [refresh]);

  return <div style={{ padding: 24 }}>Completing sign-in...</div>;
}
