import React, { useMemo } from "react";
import "../components/layout.css";

// PUBLIC_INTERFACE
export default function LoginPage() {
  /**
   * Auth is disabled. If a user lands here by old links, redirect to dashboard.
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
