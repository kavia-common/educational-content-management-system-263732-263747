import React from "react";
import { useAuth } from "../context/AuthContext";
import "./layout.css";

// PUBLIC_INTERFACE
export default function TopNav() {
  /** Top navigation bar with brand and user actions. */
  const { user, logout } = useAuth();

  return (
    <header className="topnav" role="banner">
      <div className="brand" aria-label="OceanLMS Home">
        <span className="brand-dot" aria-hidden="true" />
        <a href="/dashboard" className="brand-name" aria-label="Go to dashboard">
          OceanLMS
        </a>
      </div>
      <div className="actions" role="navigation" aria-label="User actions">
        {user ? (
          <>
            <div className="user-badge" title={user.email || user.name || "User"} aria-label={`Signed in as ${user.name || user.email}`}>
              <span className="avatar" aria-hidden="true">{(user.name || user.email || "U").slice(0, 1).toUpperCase()}</span>
              <span className="user-name">{user.name || user.email}</span>
            </div>
            <button className="btn btn-secondary" onClick={logout} aria-label="Log out">
              Logout
            </button>
          </>
        ) : (
          <a className="btn btn-primary" href="/login" aria-label="Go to login">Login</a>
        )}
      </div>
    </header>
  );
}
