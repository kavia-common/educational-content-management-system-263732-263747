import React, { useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import "../components/layout.css";

// PUBLIC_INTERFACE
export default function LoginPage() {
  /**
   * Login page that triggers backend login flows.
   * Default provider is "email" as placeholder.
   */
  const { login } = useAuth();
  const next = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("next") || "/dashboard";
  }, []);

  const handleLogin = (provider = "email") => {
    // Optionally include next in query string; backend can handle state
    login(provider);
  };

  return (
    <div style={{ display: "grid", placeItems: "center", minHeight: "100vh", background: "var(--color-bg)", padding: 24 }}>
      <div className="card" style={{ maxWidth: 420, width: "100%" }}>
        <h1 className="page-title">Welcome to OceanLMS</h1>
        <p className="page-subtitle">Sign in to continue</p>
        <div className="vstack" style={{ marginTop: 8 }}>
          <button className="btn btn-primary" onClick={() => handleLogin("email")}>Continue with Email</button>
          <button className="btn btn-secondary" onClick={() => handleLogin("google")}>Continue with Google</button>
        </div>
        <p className="page-subtitle" style={{ marginTop: 12 }}>After login, you will be redirected to: {next}</p>
      </div>
    </div>
  );
}
