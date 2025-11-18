import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * PUBLIC_INTERFACE
 * ProtectedRoute: Guards children based on auth status and role.
 *
 * Props:
 * - children: ReactNode
 * - requireRole?: 'admin' | 'instructor' | 'student'
 */
export default function ProtectedRoute({ children, requireRole }) {
  const { isAuthenticated, user, initializing } = useAuth();
  const location = useLocation();

  if (initializing) {
    return <div style={{ padding: 24 }} className="card" role="status" aria-busy="true">Loading...</div>;
  }

  if (!isAuthenticated) {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/signin?next=${next}`} replace />;
  }

  if (requireRole && user?.role && user.role !== requireRole) {
    // Friendly unauthorized notice via state; consuming pages could read and toast it.
    return <Navigate to="/dashboard" replace state={{ unauthorized: true, required: requireRole }} />;
  }

  return children;
}
