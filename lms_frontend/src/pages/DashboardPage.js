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
    if (initializing || navigatedRef.current) return;
    const role = profile?.role || 'learner';
    const target = role === 'admin' ? '/admin/dashboard' : '/employee/dashboard';
    if (window.location.pathname !== target) {
      navigatedRef.current = true;
      navigate(target, { replace: true });
    }
  }, [navigate, profile, initializing]);

  return null;
}
