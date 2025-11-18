import React, { useEffect } from "react";
import { useAuth } from "../context/AuthContext";

// PUBLIC_INTERFACE
export default function OAuthCallbackPage() {
  /**
   * Resolve session after OAuth redirect and navigate to intended page.
   * If provider returned an error_description, surface it briefly then redirect to /signin.
   * Uses localStorage 'oauth_next' if provider drops query parameters.
   */
  const { refresh } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const qsNext = params.get("next");
    const errDesc = params.get("error_description");
    const storedNext = (() => {
      try {
        return localStorage.getItem("oauth_next");
      } catch {
        return null;
      }
    })();
    const next = qsNext || storedNext || "/dashboard";

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
        try {
          localStorage.removeItem("oauth_next");
        } catch {
          // ignore
        }
        window.location.replace(next);
      } catch (_) {
        window.location.replace("/signin");
      }
    })();
  }, [refresh]);

  return <div style={{ padding: 24 }} className="card">Completing sign-in...</div>;
}
