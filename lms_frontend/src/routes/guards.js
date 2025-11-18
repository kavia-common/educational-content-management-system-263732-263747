import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * ProtectedRoute
 * Redirects to /login if no authenticated user/session.
 * In current app, AuthContext may operate in guest mode; when Supabase mode is enabled
 * and user is not authenticated, it should redirect to /login preserving `next`.
 */
// PUBLIC_INTERFACE
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
 * RequireRole
 * Restricts access to users whose profile.role is in the allowed list.
 */
// PUBLIC_INTERFACE
export function RequireRole({ roles = [], children }) {
  const { user } = useAuth();
  const role = user?.role || user?.profile?.role || "guest";
  if (roles.length > 0 && !roles.includes(role)) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}
