import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './auth/AuthProvider';

interface ProtectedRouteProps {
  isAdminRoute?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ isAdminRoute = false }) => {
  const { user, userProfile, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>; // Or a spinner component
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (isAdminRoute && userProfile?.user_type !== 'admin') {
    return <Navigate to="/" replace />; // Or a dedicated "Access Denied" page
  }

  return <Outlet />;
}; 