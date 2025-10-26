import { Session, User } from "@supabase/supabase-js";
import React, {
  Component,
  createContext,
  PropsWithChildren,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
 useState } from "react";

import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { UserProfile } from "@/types/user";

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  fetchUserProfile: () => Promise<void>;
  isAuthenticating: boolean;
  startAuthenticating: () => void;
  stopAuthenticating: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = (props) => {
  const { children } = props || {};
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const isFetchingProfileRef = useRef(false);
  const { toast } = useToast();

  const fetchUserProfile = useCallback(async () => {
    console.log("[AUTH] fetchUserProfile called");

    if (isFetchingProfileRef.current) {
      console.log("[AUTH] Profile fetch already in progress, skipping");
      return;
    }

    isFetchingProfileRef.current = true;
    const isMobile = /Mobile|Android|iPhone|iPad/.test(navigator.userAgent);

    try {
      console.log("[AUTH] Checking session for profile fetch");
      const {
        data: { session },
      } = await supabase.auth.getSession();

      console.log("[AUTH] Session in fetchUserProfile:", {
        hasSession: !!session,
        userId: session?.user?.id,
        userEmail: session?.user?.email
      });

      if (session?.user) {
        console.log("[AUTH] Fetching profile for user:", session.user.id);
        const { data: profile, error } = await supabase
          .from("users")
          .select("*")
          .eq("user_id", session.user.id)
          .single();

        console.log("[AUTH] Profile fetch result:", { profile, error });

        if (error && error.code !== "PGRST116") {
          console.error("[AUTH] Error fetching profile:", error, { isMobile });
          // Don't show toast during auth flow to avoid circular dependency
          setLoading(false); // Set loading to false on error
        } else {
          if (profile) {
            console.log("[AUTH] Profile fetched successfully:", profile.email);
            setUserProfile(profile);
          } else {
            console.log("[AUTH] No profile found for user");
          }
          setLoading(false); // Set loading to false on success
        }
      } else {
        console.log("[AUTH] No session found in fetchUserProfile");
        setLoading(false);
      }
    } catch (error) {
      console.error("[AUTH] Error in fetchUserProfile:", error);
      setLoading(false);
    } finally {
      isFetchingProfileRef.current = false;
    }
    // Removed toast dependency to prevent circular dependency

  }, []); // ✅ EMPTY DEPENDENCIES - NO RE-CREATION!

  // Add a flag to prevent automatic redirects during sign-in
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const startAuthenticating = useCallback(() => {
    setIsAuthenticating(true);
  }, []);

  const stopAuthenticating = useCallback(() => {
    setIsAuthenticating(false);
  }, []);

  // Handle OAuth callback - detect both hash and query string formats
  useEffect(() => {
    console.log('[AUTH] AuthProvider mounted');
    console.log('[AUTH] Current URL:', window.location.href);
    console.log('[AUTH] URL search params:', window.location.search);
    console.log('[AUTH] URL hash params:', window.location.hash);

    const handleAuthCallback = async () => {
      try {
        // Check for OAuth code in query string (new Google OAuth format)
        const urlParams = new URLSearchParams(window.location.search);
        const authCode = urlParams.get('code');
        const errorParam = urlParams.get('error');
        const errorDescription = urlParams.get('error_description');

        // Check for tokens in hash (legacy format)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');

        console.log('[AUTH] OAuth callback detection:');
        console.log('[AUTH] - Code from query:', authCode);
        console.log('[AUTH] - Access token from hash:', accessToken);
        console.log('[AUTH] - Error from query:', errorParam);

        // Handle OAuth errors
        if (errorParam) {
          console.error('[AUTH] OAuth error received:', errorParam, errorDescription);
          // Clear the error parameters from URL
          const cleanUrl = new URL(window.location.href);
          cleanUrl.searchParams.delete('error');
          cleanUrl.searchParams.delete('error_description');
          window.history.replaceState({}, document.title, cleanUrl.pathname);
          return;
        }

        // Handle new OAuth format (code in query string)
        if (authCode) {
          console.log('[AUTH] Processing OAuth code:', authCode);

          // Supabase should automatically handle the code exchange when detectSessionInUrl is true
          // But let's also try to manually trigger session refresh
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          console.log('[AUTH] Session after OAuth code:', session);
          console.log('[AUTH] Session error:', sessionError);

          if (sessionError) {
            console.error('[AUTH] Session error after OAuth:', sessionError);
          } else if (session) {
            console.log('[AUTH] OAuth successful - session established');
            console.log('[AUTH] User ID:', session.user.id);
            console.log('[AUTH] User email:', session.user.email);
          } else {
            console.log('[AUTH] No session found after OAuth - trying to exchange code manually');

            // Try to exchange the code manually
            const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(authCode);
            if (exchangeError) {
              console.error('[AUTH] Code exchange failed:', exchangeError);
            } else {
              console.log('[AUTH] Code exchange successful');
            }
          }

          // Clear the code from URL for security
          const cleanUrl = new URL(window.location.href);
          cleanUrl.searchParams.delete('code');
          window.history.replaceState({}, document.title, cleanUrl.pathname);
          return;
        }

        // Handle legacy format (tokens in hash)
        if (accessToken && refreshToken) {
          console.log('[AUTH] Legacy OAuth format detected - setting session manually');

          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            console.error('[AUTH] Manual session setup failed:', error);
          } else {
            console.log('[AUTH] Manual session setup successful');
          }

          // Clear the URL hash to prevent issues
          window.history.replaceState({}, document.title, window.location.pathname);
          return;
        }

        console.log('[AUTH] No OAuth parameters found in URL');

      } catch (error) {
        console.error('[AUTH] OAuth callback error:', error);
      }
    };

    handleAuthCallback();
  }, []);

  useEffect(() => {
    setLoading(true);

    // Check for incognito mode or force signout first
    const urlParams = new URLSearchParams(window.location.search);
    const isIncognito = urlParams.get('incognito') === 'true' ||
                       urlParams.get('forceSignOut') === 'true' ||
                       window.location.hash.includes('forceSignOut');

    // Check localStorage for session data (mobile browsers might clear it)
    const isMobile = /Mobile|Android|iPhone|iPad/.test(navigator.userAgent);

    if (isMobile && typeof window !== "undefined") {
      try {
        const keys = Object.keys(localStorage).filter(
          (k) => k.includes("supabase") || k.includes("auth") || k.includes("itw-auth"),
        );

        // If no auth keys found on mobile, try to restore from session
        // The session check below will handle this
      } catch (e) {
        console.error("[AUTH] Error accessing localStorage:", e);
      }
    }

    // In incognito mode, disable session persistence
    if (isIncognito && typeof window !== "undefined") {
      try {
        // Clear all Supabase auth tokens
        localStorage.removeItem("itw-auth-token");
        localStorage.removeItem("supabase.auth.token");
        sessionStorage.removeItem("supabase.auth.token");

        // Also check for any other auth-related keys
        const authKeys = Object.keys(localStorage).filter(
          (k) => k.includes("supabase") || k.includes("auth") || k.includes("itw-auth")
        );
        authKeys.forEach(key => {
          localStorage.removeItem(key);
          sessionStorage.removeItem(key);
        });

        console.log("[AUTH] Cleared auth tokens for incognito mode");
      } catch (e) {
        console.error("[AUTH] Error clearing auth tokens:", e);
      }
    }

    console.log("[AUTH] Checking session on mount, isAuthenticating:", isAuthenticating);
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        console.log("[AUTH] getSession response:", { hasSession: !!session, userId: session?.user?.id });
        // Only set user if not currently authenticating (to prevent race conditions)
        if (!isAuthenticating) {
          setUser(session?.user ?? null);

          if (session?.user) {
            // Only fetch profile if not already fetching
            if (!isFetchingProfileRef.current) {
            fetchUserProfile();
            }
          } else {
            setLoading(false);
          }
        } else {
          // Still set the user state during authentication, but don't fetch profile yet
          setUser(session?.user ?? null);
          setLoading(false);
        }
      })
      .catch((error) => {
        console.error("[AUTH] Error getting session:", error);
        setLoading(false);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("[AUTH] onAuthStateChange event:", event);
      console.log("[AUTH] Session data:", {
        hasSession: !!session,
        userId: session?.user?.id,
        userEmail: session?.user?.email,
        provider: session?.user?.app_metadata?.provider,
        expiresAt: session?.expires_at
      });

      // Only update user state if not currently authenticating (to prevent race conditions)
      if (!isAuthenticating) {
        setUser(session?.user ?? null);
        if (session?.user) {
          console.log("[AUTH] User authenticated, fetching profile");
          // Only fetch profile if not already fetching
          if (!isFetchingProfileRef.current) {
          fetchUserProfile();
          }
        } else {
          console.log("[AUTH] No user session, clearing profile");
          setUserProfile(null);
          setLoading(false); // Set loading to false when no user session
        }
      } else {
        // Still set the user state during authentication, but don't fetch profile yet
        console.log("[AUTH] Authentication in progress, updating user state");
        setUser(session?.user ?? null);
      }
    });

    return () => subscription.unsubscribe();
     
  }, [fetchUserProfile, isAuthenticating]); // ✅ Include isAuthenticating in dependencies

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setUserProfile(null);

    // Clear auth tokens to ensure complete sign out
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("itw-auth-token");
        localStorage.removeItem("supabase.auth.token");
        sessionStorage.removeItem("supabase.auth.token");

        const authKeys = Object.keys(localStorage).filter(
          (k) => k.includes("supabase") || k.includes("auth") || k.includes("itw-auth")
        );
        authKeys.forEach(key => {
          localStorage.removeItem(key);
          sessionStorage.removeItem(key);
        });

      } catch (e) {
        console.error("[AUTH] Error clearing auth tokens during sign out:", e);
      }
    }
  };

  const value = useMemo(() => {
    const isMobile = /Mobile|Android|iPhone|iPad/.test(navigator.userAgent);
    const authValue = {
      user,
      userProfile,
      loading,
      signOut,
      fetchUserProfile,
      isAuthenticating,
      startAuthenticating,
      stopAuthenticating,
    };

    return authValue;
     
  }, [user, userProfile, loading, fetchUserProfile, isAuthenticating, startAuthenticating, stopAuthenticating]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
