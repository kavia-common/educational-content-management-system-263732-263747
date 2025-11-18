import React from "react";
import { useAuth } from "../context/AuthContext";
import "./layout.css";

// PUBLIC_INTERFACE
export default function TopNav() {
  /** Top navigation bar with brand and auth actions. */
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    window.location.replace("/signin");
  };

  return (
    <header className="topnav" role="banner">
      <div className="brand" aria-label="OceanLMS Home">
        <span className="brand-dot" aria-hidden="true" />
        <a href="/dashboard" className="brand-name" aria-label="Go to dashboard">
          OceanLMS
        </a>
      </div>
      <div className="actions" role="navigation" aria-label="User">
        <div className="user-badge" title={user?.email || user?.name || "Guest"} aria-label={`User: ${user?.name || "Guest"}`}>
          <span className="avatar" aria-hidden="true">{(user?.name || "G").slice(0, 1).toUpperCase()}</span>
          <span className="user-name">{user?.name || "Guest"}</span>
        </div>
        {isAuthenticated ? (
          <>
            <a className="btn btn-secondary" href="/account">Account</a>
            <button className="btn" style={{ background: "var(--color-error)", color: "white" }} onClick={handleLogout}>
              Sign Out
            </button>
          </>
        ) : (
          <>
            <a className="btn btn-primary" href="/signin">Sign In</a>
            <a className="btn btn-secondary" href="/signup">Sign Up</a>
          </>
        )}
      </div>
    </header>
  );
}
