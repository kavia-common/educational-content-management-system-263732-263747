import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * PUBLIC_INTERFACE
 * ProtectedRoute
 * Guards a route to require authentication.
 */
export function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  if (!isAuthenticated) {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?next=${next}`} replace />;
  }
  return children;
}

/**
 * PUBLIC_INTERFACE
 * RequireRole
 * Guards a route to require a specific role among the provided roles.
 */
export function RequireRole({ roles = [], children }) {
  const { user, profile } = useAuth();
  const currentRole = profile?.role || user?.role || "guest";
  if (roles.length > 0 && !roles.includes(currentRole)) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}
