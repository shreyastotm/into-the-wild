import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './auth/AuthProvider';

interface ProtectedRouteProps {
  isAdminRoute?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ isAdminRoute = false }) => {
  const { user, userProfile, loading } = useAuth();

  console.log('[PROTECTED_ROUTE]', {
    loading,
    hasUser: !!user,
    hasProfile: !!userProfile,
    userId: user?.id,
    profileType: userProfile?.user_type,
    isAdminRoute,
    shouldAllow: !loading && !!user && (!isAdminRoute || userProfile?.user_type === 'admin')
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log('[PROTECTED_ROUTE] No user, redirecting to auth');
    return <Navigate to="/auth" replace />;
  }

  if (isAdminRoute && userProfile?.user_type !== 'admin') {
    console.log('[PROTECTED_ROUTE] Admin route but not admin, redirecting to home');
    return <Navigate to="/" replace />;
  }

  console.log('[PROTECTED_ROUTE] Access granted');
  return <Outlet />;
}; 