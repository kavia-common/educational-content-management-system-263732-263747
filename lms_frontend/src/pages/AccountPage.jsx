import React from "react";
import "../components/layout.css";
import { useAuth } from "../context/AuthContext";

/**
 * PUBLIC_INTERFACE
 * AccountPage: Shows basic account info, role, and allows sign out.
 */
export default function AccountPage() {
  const { user, logout, refresh } = useAuth();

  const handleSignOut = async () => {
    await logout();
    window.location.replace("/signin");
  };

  return (
    <div className="vstack" style={{ padding: 24 }}>
      <h1 className="page-title">Your Account</h1>
      <p className="page-subtitle">Manage your profile and session</p>

      <div className="card">
        <div className="vstack" style={{ gap: 8 }}>
          <div>
            <strong>Name</strong>
            <div className="page-subtitle" style={{ marginTop: 4 }}>{user?.name || "—"}</div>
          </div>
          <div>
            <strong>Email</strong>
            <div className="page-subtitle" style={{ marginTop: 4 }}>{user?.email || "—"}</div>
          </div>
          <div>
            <strong>Role</strong>
            <div className="page-subtitle" style={{ marginTop: 4 }}>{user?.role || "—"}</div>
          </div>
          <div className="hstack" style={{ gap: 8, marginTop: 8 }}>
            <button className="btn btn-primary" onClick={() => refresh()}>Refresh</button>
            <button className="btn" style={{ background: "var(--color-error)", color: "white" }} onClick={handleSignOut}>Sign Out</button>
          </div>
        </div>
      </div>
    </div>
  );
}
