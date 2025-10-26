import React, { useMemo } from "react";
import { Navigate, useLocation } from "react-router-dom";

import AuthForm from "@/components/auth/AuthForm";
import { useAuth } from "@/components/auth/AuthProvider";
import { ClearAuthSessions } from "@/components/auth/ClearAuthSessions";

export default function Auth() {
  const location = useLocation();
  const { user, loading, isAuthenticating, startAuthenticating, stopAuthenticating } = useAuth();

  // Check for OAuth callback parameters in URL
  const hasCallbackParams = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.has('access_token') || params.has('refresh_token') || params.has('token_type');
  }, [location.search]);

  // Redirect signed-in users away from auth page, but not during sign-in process
  if (user && !loading && !isAuthenticating && !hasCallbackParams) {
    return <Navigate to="/dashboard" replace />;
  }

  const params = useMemo(
    () => new URLSearchParams(location.search),
    [location.search],
  );
  const initialMode =
    params.get("mode") === "signup"
      ? "signup"
      : params.get("mode") === "signin"
        ? "signin"
        : undefined;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6">
        {/* Show clear sessions component if user is already logged in */}
        <ClearAuthSessions />
        <AuthForm
          initialMode={initialMode}
          onSignInStart={startAuthenticating}
          onSignInEnd={stopAuthenticating}
        />
      </div>
    </div>
  );
}
