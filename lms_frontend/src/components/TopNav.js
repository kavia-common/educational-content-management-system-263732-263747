import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./layout.css";

/**
 * PUBLIC_INTERFACE
 * TopNav
 * Displays brand, primary links, and auth actions.
 * TEMP: Hide Sign In while auth is disabled; show Logout only when authenticated.
 * TODO: Restore Sign In when login route is re-enabled.
 */
export default function TopNav() {
  const { user, profile, logout, isAuthenticated } = useAuth();
  return (
    <header className="topnav">
      <div className="left">
        <Link to="/" className="brand">LMS</Link>
        <nav className="ml-4">
          <Link to="/paths" className="side-link">Paths</Link>
          <Link to="/courses" className="side-link">Courses</Link>
        </nav>
      </div>
      <div className="right">
        {isAuthenticated ? (
          <div className="flex items-center gap-3">
            {profile?.role === 'admin' ? (
              <Link to="/admin/dashboard" className="side-link">Admin</Link>
            ) : (
              <Link to="/employee/dashboard" className="side-link">Dashboard</Link>
            )}
            <span className="text-sm text-gray-600">{profile?.full_name || user?.email}</span>
            <button onClick={logout} className="btn">Logout</button>
          </div>
        ) : (
          // TEMP: Hide login while disabled
          <span className="text-sm text-gray-500" style={{ opacity: 0.7 }}>Preview mode</span>
        )}
      </div>
    </header>
  );
}
