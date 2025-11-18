import React, { useEffect } from "react";
import { useAuth } from "../context/AuthContext";

// PUBLIC_INTERFACE
export default function OAuthCallbackPage() {
  /**
   * Resolve session after OAuth redirect and navigate to intended page.
   */
  const { refresh } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const next = params.get("next") || "/dashboard";
    (async () => {
      try {
        await refresh();
      } catch (_) {
        // ignore
      } finally {
        window.location.replace(next);
      }
    })();
  }, [refresh]);

  return <div style={{ padding: 24 }} className="card">Completing sign-in...</div>;
}
