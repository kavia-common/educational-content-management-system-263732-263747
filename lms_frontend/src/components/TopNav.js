import React from "react";
import { useAuth } from "../context/AuthContext";
import "./layout.css";
import { isSupabaseMode } from "../lib/supabaseClient";

// PUBLIC_INTERFACE
export default function TopNav() {
  /** Top navigation bar with brand and optional logout in Supabase mode. */
  const { user, logout, isAuthenticated } = useAuth();
  const supabaseEnabled = (() => { try { return isSupabaseMode(); } catch { return false; } })();

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
        {supabaseEnabled && isAuthenticated && (
          <button className="btn btn-secondary" onClick={logout} aria-label="Sign out" style={{ marginLeft: 8 }}>
            Sign out
          </button>
        )}
      </div>
    </header>
  );
}
