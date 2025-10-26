import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "@/components/auth/AuthProvider";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { handleSupabaseError, logError } from "@/lib/errorHandling";
import { rateLimiter } from "@/lib/security";
import {
  authValidationSchema,
  sanitizeFormData,
  validateForm,
} from "@/lib/validation";
import {
  AuthFormErrors,
  AuthMode,
  AuthResponse,
  PasswordResetFormData,
  SignInFormData,
  SignUpFormData,
} from "@/types/auth";

export const useAuthForm = () => {
  const navigate = useNavigate();
  const { startAuthenticating, stopAuthenticating } = useAuth();
  const [mode, setMode] = useState<AuthMode>("signin");
  const [loading, setLoading] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [errors, setErrors] = useState<AuthFormErrors>({});

  // Rate limiting check
  const checkRateLimit = useCallback((action: string): boolean => {
    const key = `auth_${action}_${Date.now()}`;
    const isAllowed = rateLimiter.isAllowed(key, {
      requests: 5,
      windowMs: 15 * 60 * 1000,
    }); // 5 attempts per 15 minutes

    if (!isAllowed) {
      setErrors({
        general: "Too many attempts. Please wait before trying again.",
      });
      return false;
    }
    return true;
  }, []);

  // Handle sign in
  const handleSignIn = useCallback(
    async (formData: SignInFormData): Promise<AuthResponse> => {
      if (!checkRateLimit("signin")) {
        return { success: false, error: "Rate limit exceeded" };
      }

      setLoading(true);
      setErrors({});

      // Start authentication process to prevent redirects
      startAuthenticating();

      try {
        // Validate input
        const validation = validateForm(formData, {
          email: authValidationSchema.email,
          password: { required: true, minLength: 1 }, // Less strict for signin
        });

        if (!validation.isValid) {
          setErrors(validation.errors);
          return { success: false, error: "Validation failed" };
        }

        // Sanitize input
        const sanitizedData = sanitizeFormData(formData) as SignInFormData;

        const { error } = await supabase.auth.signInWithPassword({
          email: sanitizedData.email,
          password: sanitizedData.password,
        });

        if (error) {
          const appError = handleSupabaseError(error);
          setErrors({ general: appError.userMessage });
          logError(appError, "signin");
          return { success: false, error: appError.userMessage };
        }

        toast({
          title: "Welcome back!",
          description: "You have been signed in successfully.",
        });

        navigate("/dashboard");
        return { success: true, message: "Signed in successfully" };
      } catch (error) {
        const errorMessage = "An unexpected error occurred during sign in";
        setErrors({ general: errorMessage });
        logError(error, "signin");
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
        // Stop authentication process
        stopAuthenticating();
      }
    },
    [navigate, checkRateLimit, startAuthenticating, stopAuthenticating],
  );

  // Handle sign up
  const handleSignUp = useCallback(
    async (formData: SignUpFormData): Promise<AuthResponse> => {
      if (!checkRateLimit("signup")) {
        return { success: false, error: "Rate limit exceeded" };
      }

      setLoading(true);
      setErrors({});

      try {
        // Validate input
        const validation = validateForm(formData, {
          email: authValidationSchema.email,
          password: authValidationSchema.password,
          fullName: authValidationSchema.fullName,
          phone: authValidationSchema.phone,
          ...(formData.userType === "micro_community" && {
            partnerId: authValidationSchema.partnerId,
          }),
        });

        if (!validation.isValid) {
          setErrors(validation.errors);
          return { success: false, error: "Validation failed" };
        }

        // Check indemnity acceptance
        if (!formData.indemnityAccepted) {
          setErrors({
            indemnityAccepted: "You must accept the terms and conditions",
          });
          return { success: false, error: "Terms not accepted" };
        }

        // Sanitize input
        const sanitizedData = sanitizeFormData(formData) as SignUpFormData;

        // Create auth user with metadata
        const { data: authData, error: authError } = await supabase.auth.signUp(
          {
            email: sanitizedData.email,
            password: sanitizedData.password,
            options: {
              data: {
                full_name: sanitizedData.fullName,
                name: sanitizedData.fullName,
                user_type: sanitizedData.userType,
                phone: sanitizedData.phone,
                subscription_type: sanitizedData.subscriptionType,
                partner_id: sanitizedData.partnerId,
                indemnity_accepted: sanitizedData.indemnityAccepted,
              },
            },
          },
        );

        if (authError) {
          const appError = handleSupabaseError(authError);
          setErrors({ general: appError.userMessage });
          logError(appError, "signup");
          return { success: false, error: appError.userMessage };
        }

        if (!authData.user) {
          setErrors({ general: "Failed to create user account" });
          return { success: false, error: "Account creation failed" };
        }

        // Profile is automatically created by the database trigger
        // Wait a moment for the trigger to complete
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Update the profile with additional fields that the trigger doesn't set
        // Only update fields that definitely exist in the database
        const updateData: Record<string, any> = {};

        if (sanitizedData.userType) {
          updateData.user_type = sanitizedData.userType;
        }

        if (sanitizedData.subscriptionType) {
          updateData.subscription_type = sanitizedData.subscriptionType;
        }

        if (sanitizedData.partnerId) {
          updateData.partner_id = sanitizedData.partnerId;
        }

        // Only update if we have fields to update
        if (Object.keys(updateData).length > 0) {
          const { error: profileError } = await supabase
            .from("users")
            .update(updateData)
            .eq("user_id", authData.user.id);

          if (profileError) {
            console.warn("Profile update error (non-critical):", profileError);
            // Don't fail signup if profile update fails
          }
        }

        toast({
          title: "Account Created Successfully!",
          description: "Please check your email to verify your account.",
        });

        navigate("/");
        return { success: true, message: "Account created successfully" };
      } catch (error) {
        const errorMessage = "An unexpected error occurred during sign up";
        setErrors({ general: errorMessage });
        logError(error, "signup");
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [navigate, checkRateLimit],
  );

  // Handle password reset
  const handlePasswordReset = useCallback(
    async (formData: PasswordResetFormData): Promise<AuthResponse> => {
      if (!checkRateLimit("reset")) {
        return { success: false, error: "Rate limit exceeded" };
      }

      setLoading(true);
      setErrors({});

      try {
        // Validate email
        const validation = validateForm(formData, {
          email: authValidationSchema.email,
        });

        if (!validation.isValid) {
          setErrors(validation.errors);
          return { success: false, error: "Invalid email" };
        }

        const { error } = await supabase.auth.resetPasswordForEmail(
          formData.email,
          {
            redirectTo: `${window.location.origin}/reset-password`,
          },
        );

        if (error) {
          const appError = handleSupabaseError(error);
          setErrors({ general: appError.userMessage });
          logError(appError, "password_reset");
          return { success: false, error: appError.userMessage };
        }

        toast({
          title: "Password Reset Email Sent",
          description: "Please check your email for the password reset link.",
        });

        setShowReset(false);
        return { success: true, message: "Password reset email sent" };
      } catch (error) {
        const errorMessage = "Failed to send password reset email";
        setErrors({ general: errorMessage });
        logError(error, "password_reset");
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [checkRateLimit],
  );

  // Handle Google OAuth
  const handleGoogleSignIn = useCallback(async (): Promise<AuthResponse> => {
    if (!checkRateLimit("google_signin")) {
      return { success: false, error: "Rate limit exceeded" };
    }

    setLoading(true);
    setErrors({});

    // Start authentication process for OAuth
    startAuthenticating();

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        const appError = handleSupabaseError(error);
        setErrors({ general: appError.userMessage });
        logError(appError, "google_signin");
        return { success: false, error: appError.userMessage };
      }

      return { success: true, message: "Redirecting to Google..." };
    } catch (error) {
      const errorMessage = "Google sign in failed";
      setErrors({ general: errorMessage });
      logError(error, "google_signin");
      // Stop authentication on error
      stopAuthenticating();
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
      // Don't stop authenticating here - OAuth flow will handle it via callback
    }
  }, [checkRateLimit, startAuthenticating, stopAuthenticating]);

  // Field-level validation
  const validateField = useCallback(
    (field: string, value: unknown): string | null => {
      const schema = authValidationSchema as Record<string, unknown>;
      if (!schema[field]) return null;

      const validation = validateForm(
        { [field]: value },
        { [field]: schema[field] },
      );
      return validation.errors[field] || null;
    },
    [],
  );

  // Clear specific error
  const clearError = useCallback((field: keyof AuthFormErrors) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  return {
    // State
    mode,
    loading,
    showReset,
    errors,

    // Actions
    setMode,
    setShowReset,
    handleSignIn,
    handleSignUp,
    handlePasswordReset,
    handleGoogleSignIn,
    validateField,
    clearError,
  };
};
