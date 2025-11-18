import React, { useEffect } from "react";
import { useAuth } from "../context/AuthContext";

// PUBLIC_INTERFACE
export default function OAuthCallbackPage() {
  /**
   * Resolve session after OAuth redirect and navigate to intended page.
   * If provider returned an error_description, surface it briefly then redirect to /signin.
   */
  const { refresh } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const next = params.get("next") || "/dashboard";
    const errDesc = params.get("error_description");
    (async () => {
      try {
        if (errDesc) {
          // eslint-disable-next-line no-console
          console.error("[OAuthCallback] Provider error:", errDesc);
          window.alert("OAuth error: " + errDesc);
          window.location.replace("/signin");
          return;
        }
        await refresh();
        window.location.replace(next);
      } catch (_) {
        window.location.replace("/signin");
      }
    })();
  }, [refresh]);

  return <div style={{ padding: 24 }} className="card">Completing sign-in...</div>;
}
