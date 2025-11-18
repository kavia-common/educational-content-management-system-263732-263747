import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * PUBLIC_INTERFACE
 * DashboardPage
 * Redirects to appropriate dashboard based on role.
 */
export default function DashboardPage() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  useEffect(() => {
    const role = profile?.role || 'learner';
    navigate(role === 'admin' ? '/admin/dashboard' : '/employee/dashboard', { replace: true });
  }, [navigate, profile]);
  return null;
}
