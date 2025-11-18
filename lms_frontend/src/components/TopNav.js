import React from "react";
import { useAuth } from "../context/AuthContext";
import "./layout.css";

// PUBLIC_INTERFACE
export default function TopNav() {
  /** Top navigation bar with brand and user actions. */
  const { user, logout } = useAuth();

  return (
    <header className="topnav">
      <div className="brand">
        <span className="brand-dot" />
        <span className="brand-name">OceanLMS</span>
      </div>
      <div className="actions">
        {user ? (
          <>
            <div className="user-badge" title={user.email || user.name || "User"}>
              <span className="avatar">{(user.name || user.email || "U").slice(0, 1).toUpperCase()}</span>
              <span className="user-name">{user.name || user.email}</span>
            </div>
            <button className="btn btn-secondary" onClick={logout} aria-label="Log out">
              Logout
            </button>
          </>
        ) : (
          <a className="btn btn-primary" href="/login">Login</a>
        )}
      </div>
    </header>
  );
}
