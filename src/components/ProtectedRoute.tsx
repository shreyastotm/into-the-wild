import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./auth/AuthProvider";

import React, { Component } from "react";

interface ProtectedRouteProps {
  isAdminRoute?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = (props) => {
  const { isAdminRoute = false } = props || {};
  const { user, userProfile, loading } = useAuth();

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
    return <Navigate to="/auth" replace />;
  }

  if (isAdminRoute && userProfile?.user_type !== "admin") {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
};
