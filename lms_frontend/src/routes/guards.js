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

  const path = location.pathname || "";
  const search = location.search || "";
  const isAuthRelatedPath = path.startsWith("/login") || path.startsWith("/oauth/callback");

  // Diagnostic tracing
  // eslint-disable-next-line no-console
  console.debug("[ProtectedRoute]", {
    path,
    search,
    isAuthenticated,
    initializing,
    isAuthRelatedPath,
  });

  // While auth state is initializing, avoid bouncing routes. Render children or a minimal placeholder.
  if (initializing) {
    return <div style={{ padding: 8, fontSize: 12 }}>Loading authentication…</div>;
  }

  if (!isAuthenticated) {
    if (isAuthRelatedPath) {
      // Already on an auth page; render children instead of redirecting to prevent recursion.
      // eslint-disable-next-line no-console
      console.debug("[ProtectedRoute] unauthenticated but on auth path, rendering children");
      return children;
    }
    const next = encodeURIComponent(path + search);
    // eslint-disable-next-line no-console
    console.debug("[ProtectedRoute] redirecting to /login with next:", next);
    return <Navigate to={`/login?next=${next}`} replace />;
  }

  // eslint-disable-next-line no-console
  console.debug("[ProtectedRoute] authenticated, rendering children");
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
  const location = useLocation();
  const path = location.pathname || "";

  // Diagnostic tracing
  // eslint-disable-next-line no-console
  console.debug("[RequireRole]", { roles, currentRole, initializing, path });

  // Do not redirect while initializing to avoid thrash
  if (initializing) {
    return <div style={{ padding: 8, fontSize: 12 }}>Loading role…</div>;
  }

  if (roles.length > 0 && !roles.includes(currentRole)) {
    // Avoid redirect loop if already navigating to dashboard redirector
    if (window.location.pathname !== "/dashboard") {
      // eslint-disable-next-line no-console
      console.debug("[RequireRole] role mismatch, redirecting to /dashboard from", path);
      return <Navigate to="/dashboard" replace />;
    }
    // eslint-disable-next-line no-console
    console.debug("[RequireRole] already on /dashboard, rendering children");
  }
  return children;
}
