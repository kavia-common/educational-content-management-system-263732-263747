import React from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * PUBLIC_INTERFACE
 * ProtectedRoute
 * TEMPORARY: Do not redirect to /login; render children with a read-only banner if unauthenticated.
 * TODO: Restore redirect to /login when auth loop issue is fixed.
 */
export function ProtectedRoute({ children }) {
  const { isAuthenticated, initializing } = useAuth();
  const location = useLocation();

  const path = location.pathname || "";
  const search = location.search || "";

  // While auth state is initializing, avoid bouncing routes. Render children or a minimal placeholder.
  if (initializing) {
    return <div style={{ padding: 8, fontSize: 12 }}>Loading authentication…</div>;
  }

  if (!isAuthenticated) {
    // TEMP: Bypass redirect. Show a subtle message and allow viewing.
    return (
      <div>
        <div style={{
          padding: 8,
          background: "#FFFBEB",
          borderBottom: "1px solid #FDE68A",
          color: "#92400E",
          fontSize: 12
        }}>
          Read-only preview: You are not signed in. Some actions may be disabled. {/* TODO: remove banner when auth is restored */}
        </div>
        {children}
      </div>
    );
  }
  return children;
}

/**
 * PUBLIC_INTERFACE
 * RequireRole
 * TEMPORARY: If role requirement is not met, render an access-limited message instead of redirecting.
 * TODO: Restore redirect behavior when auth loop issue is fixed.
 */
export function RequireRole({ roles = [], children }) {
  const { user, profile, initializing } = useAuth();
  const currentRole = profile?.role || user?.role || "guest";
  const location = useLocation();
  const path = location.pathname || "";

  // Do not block while initializing
  if (initializing) {
    return <div style={{ padding: 8, fontSize: 12 }}>Loading role…</div>;
  }

  if (roles.length > 0 && !roles.includes(currentRole)) {
    return (
      <div style={{ padding: 16 }}>
        <div style={{
          padding: 12,
          border: "1px solid #E5E7EB",
          borderRadius: 8,
          background: "#F9FAFB",
          color: "#374151",
          fontSize: 14
        }}>
          Access limited: This area requires one of the following roles: {roles.join(", ")}. {/* TODO: restore redirect to /dashboard */}
        </div>
      </div>
    );
  }
  return children;
}
