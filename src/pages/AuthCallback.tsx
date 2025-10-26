import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/client";

export default function AuthCallback() {
  const navigate = useNavigate();
  const { fetchUserProfile, stopAuthenticating } = useAuth();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Wait a moment for Supabase to process the OAuth callback
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Get the current session
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error("Auth callback error:", error);
          navigate(`/auth?error=${  encodeURIComponent(error.message)}`);
          return;
        }

        if (session?.user) {
          console.log("OAuth callback successful, user:", session.user.email);
          // Fetch user profile after successful auth
          await fetchUserProfile();
          // Stop authentication process
          stopAuthenticating();
          navigate("/dashboard");
        } else {
          // Check URL parameters for OAuth errors
          const urlParams = new URLSearchParams(window.location.search);
          const errorParam = urlParams.get("error");
          const errorDescription = urlParams.get("error_description");

          if (errorParam) {
            console.error("OAuth error:", errorParam, errorDescription);
            // Stop authentication on error
            stopAuthenticating();
            navigate(
              `/auth?error=${ 
                encodeURIComponent(errorDescription || errorParam)}`,
            );
            return;
          }

          // If no session and no error, redirect to auth
          console.log("No session found, redirecting to auth");
          stopAuthenticating();
          navigate("/auth");
        }
      } catch (error) {
        console.error("Auth callback error:", error);
        stopAuthenticating();
        navigate("/auth?error=Authentication failed");
      }
    };

    handleAuthCallback();
  }, [navigate, fetchUserProfile]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
        <p className="text-gray-600">Completing sign in...</p>
        <p className="text-sm text-gray-500 mt-2">
          Auth callback route is working
        </p>
      </div>
    </div>
  );
}
