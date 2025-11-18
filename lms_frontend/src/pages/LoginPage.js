import React, { useMemo } from "react";
import "../components/layout.css";

// PUBLIC_INTERFACE
export default function LoginPage() {
  /**
   * Legacy route: If a user lands here by old links (/login), redirect to next or /dashboard.
   * Active sign-in lives at /signin and supports ?next redirect.
   */
  const next = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("next") || "/dashboard";
  }, []);

  React.useEffect(() => {
    window.location.replace(next);
  }, [next]);

  return (
    <div style={{ padding: 24 }}>
      <div className="card">Authentication is disabled. Redirecting...</div>
    </div>
  );
}
