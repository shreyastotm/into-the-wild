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
    if (isFetchingProfileRef.current) {
      return;
    }

    isFetchingProfileRef.current = true;
    const isMobile = /Mobile|Android|iPhone|iPad/.test(navigator.userAgent);

    try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session?.user) {
      const { data: profile, error } = await supabase
        .from("users")
        .select("*")
        .eq("user_id", session.user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("[AUTH] Error fetching profile:", error, { isMobile });
        // Don't show toast during auth flow to avoid circular dependency
        setLoading(false); // Set loading to false on error
      } else {
        setUserProfile(profile);
        setLoading(false); // Set loading to false on success
      }
    } else {
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

    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
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
      // Only update user state if not currently authenticating (to prevent race conditions)
      if (!isAuthenticating) {
        setUser(session?.user ?? null);
        if (session?.user) {
          // Only fetch profile if not already fetching
          if (!isFetchingProfileRef.current) {
          fetchUserProfile();
          }
        } else {
          setUserProfile(null);
          setLoading(false); // Set loading to false when no user session
        }
      } else {
        // Still set the user state during authentication, but don't fetch profile yet
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
