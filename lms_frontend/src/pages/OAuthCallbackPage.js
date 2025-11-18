import React, { useEffect } from "react";
import { useAuth } from "../context/AuthContext";

// PUBLIC_INTERFACE
export default function OAuthCallbackPage() {
  /**
   * Handles the redirect back from auth provider.
   * Assumes backend has set session cookie.
   */
  const { refresh } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const next = params.get("next") || "/dashboard";
    (async () => {
      try {
        await refresh();
      } finally {
        window.location.replace(next);
      }
    })();
  }, [refresh]);

  return <div style={{ padding: 24 }}>Completing sign-in...</div>;
}
