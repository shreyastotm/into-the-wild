import React from "react";
import AuthForm from "@/components/auth/AuthForm";
import { useMemo } from "react";
import { useLocation, Navigate } from "react-router-dom";
import { useAuth } from "@/components/auth/AuthProvider";

export default function Auth() {
  const location = useLocation();
  const { user } = useAuth();

  // Redirect signed-in users away from auth page
  if (user) {
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
      <div className="w-full max-w-md">
        <AuthForm initialMode={initialMode} />
      </div>
    </div>
  );
}
