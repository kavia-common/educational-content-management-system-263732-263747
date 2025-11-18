import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * PUBLIC_INTERFACE
 * ProtectedRoute
 * Guards a route to require authentication.
 * Adds defensive checks to avoid redirect loops (e.g., when already on /login or /oauth/callback).
 */
export function ProtectedRoute({ children }) {
  const { isAuthenticated, initializing } = useAuth();
  const location = useLocation();

  // While auth state is initializing, avoid bouncing routes.
  if (initializing) {
    return null;
  }

  // Prevent redirect from auth pages to themselves to avoid loops
  const path = location.pathname || "";
  const isAuthRelatedPath = path.startsWith("/login") || path.startsWith("/oauth/callback");

  if (!isAuthenticated) {
    if (isAuthRelatedPath) {
      // Already on an auth page; render children instead of redirecting to prevent recursion.
      return children;
    }
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
  const { user, profile, initializing } = useAuth();
  const currentRole = profile?.role || user?.role || "guest";

  // Do not redirect while initializing to avoid thrash
  if (initializing) {
    return null;
  }

  if (roles.length > 0 && !roles.includes(currentRole)) {
    // Avoid redirect loop if already navigating to dashboard redirector
    if (window.location.pathname !== "/dashboard") {
      return <Navigate to="/dashboard" replace />;
    }
  }
  return children;
}
