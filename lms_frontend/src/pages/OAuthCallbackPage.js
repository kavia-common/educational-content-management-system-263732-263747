import React, { useEffect } from "react";

// PUBLIC_INTERFACE
export default function OAuthCallbackPage() {
  /**
   * Auth is disabled; simply redirect to intended route or dashboard.
   */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const next = params.get("next") || "/dashboard";
    window.location.replace(next);
  }, []);

  return <div style={{ padding: 24 }}>Redirecting...</div>;
}
