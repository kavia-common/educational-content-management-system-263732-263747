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
  const { next, error } = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return {
      next: params.get("next") || "/dashboard",
      error: params.get("error"),
    };
  }, []);

  const handleLogin = (provider = "email") => {
    // Backend maintains state/PKCE; we simply kick off provider flow
    login(provider);
  };

  return (
    <div style={{ display: "grid", placeItems: "center", minHeight: "100vh", background: "var(--color-bg)", padding: 24 }}>
      <div className="card" style={{ maxWidth: 420, width: "100%" }}>
        <h1 className="page-title">Welcome to OceanLMS</h1>
        <p className="page-subtitle">Sign in to continue</p>

        {error && (
          <div className="card" style={{ borderColor: "var(--color-error)", marginBottom: 12 }}>
            Authentication error. Please try again.
          </div>
        )}

        <div className="vstack" style={{ marginTop: 8 }}>
          <button className="btn btn-primary" onClick={() => handleLogin("email")} aria-label="Continue with email sign-in">Continue with Email</button>
          <button className="btn btn-secondary" onClick={() => handleLogin("google")} aria-label="Continue with Google sign-in">Continue with Google</button>
        </div>
        <p className="page-subtitle" style={{ marginTop: 12 }}>After login, you will be redirected to: {next}</p>
      </div>
    </div>
  );
}
