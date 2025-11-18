import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * PUBLIC_INTERFACE
 * DashboardPage
 * Redirects to appropriate dashboard based on role.
 * Waits for auth initialization to complete to avoid navigation thrash.
 */
export default function DashboardPage() {
  const navigate = useNavigate();
  const { profile, initializing } = useAuth();
  const navigatedRef = useRef(false);

  useEffect(() => {
    // Diagnostic tracing
    // eslint-disable-next-line no-console
    console.debug("[DashboardPage] effect", {
      initializing,
      role: profile?.role,
      currentPath: window.location.pathname
    });

    if (initializing || navigatedRef.current) return;

    const role = profile?.role || 'learner';
    const target = role === 'admin' ? '/admin/dashboard' : '/employee/dashboard';

    if (window.location.pathname !== target) {
      navigatedRef.current = true;
      // eslint-disable-next-line no-console
      console.debug("[DashboardPage] navigating to", target);
      navigate(target, { replace: true });
    } else {
      // eslint-disable-next-line no-console
      console.debug("[DashboardPage] already on target", target);
    }
  }, [navigate, profile, initializing]);

  // Render minimal content for visibility during diagnostics
  return (
    <div style={{ padding: 16, fontSize: 12 }}>
      Resolving dashboard… {initializing ? "(initializing)" : `(role=${profile?.role || 'learner'})`}
    </div>
  );
}
