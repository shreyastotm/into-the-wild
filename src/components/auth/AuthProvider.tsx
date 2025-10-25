import {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
  useCallback,
  useMemo,
  PropsWithChildren,
} from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { UserProfile } from "@/types/user";
import { useToast } from "@/components/ui/use-toast";

import React, { Component } from "react";

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  fetchUserProfile: () => Promise<void>;
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
  const [isFetchingProfile, setIsFetchingProfile] = useState(false);
  const { toast } = useToast();

  const fetchUserProfile = useCallback(async () => {
    if (isFetchingProfile) {
      console.log("[AUTH] fetchUserProfile already running, skipping");
      return;
    }

    console.log("[AUTH] fetchUserProfile called");
    setIsFetchingProfile(true);
    const isMobile = /Mobile|Android|iPhone|iPad/.test(navigator.userAgent);

    try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session?.user) {
      console.log(
        "[AUTH] fetchUserProfile - session exists, fetching profile for user:",
        session.user.id,
        { isMobile },
      );
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
        console.log(
          "[AUTH] Profile fetched successfully:",
          profile ? { id: profile.user_id, type: profile.user_type } : null,
          { isMobile },
        );
        setUserProfile(profile);
        setLoading(false); // Set loading to false on success
      }
    } else {
      console.log("[AUTH] fetchUserProfile - no session found", { isMobile });
      setLoading(false);
    }
    } catch (error) {
      console.error("[AUTH] Error in fetchUserProfile:", error);
      setLoading(false);
    } finally {
      setIsFetchingProfile(false);
    }
    // Removed toast dependency to prevent circular dependency
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFetchingProfile]);

  useEffect(() => {
    console.log('🔍 AuthProvider: useEffect triggered - START');
    setLoading(true);
    console.log("[AUTH] AuthProvider mounted, checking session...");

    // Check localStorage for session data (mobile browsers might clear it)
    const isMobile = /Mobile|Android|iPhone|iPad/.test(navigator.userAgent);
    console.log('🔍 AuthProvider: Is mobile?', isMobile);

    if (isMobile && typeof window !== "undefined") {
      try {
        const keys = Object.keys(localStorage).filter(
          (k) => k.includes("supabase") || k.includes("auth") || k.includes("itw-auth"),
        );
        console.log("[AUTH] localStorage keys on mobile:", keys);

        // If no auth keys found on mobile, try to restore from session
        if (keys.length === 0) {
          console.log(
            "[AUTH] No auth keys found on mobile, checking if we need to restore session",
          );
          // The session check below will handle this
        }
      } catch (e) {
        console.error("[AUTH] Error accessing localStorage:", e);
      }
    }

    // Check for incognito mode or force signout
    const urlParams = new URLSearchParams(window.location.search);
    const isIncognito = urlParams.get('incognito') === 'true' ||
                       urlParams.get('forceSignOut') === 'true' ||
                       window.location.hash.includes('forceSignOut');

    // In incognito mode, disable session persistence
    if (isIncognito && typeof window !== "undefined") {
      console.log("[AUTH] Incognito mode detected, clearing auth tokens");
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

    console.log('🔍 AuthProvider: About to call getSession()');
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        console.log("[AUTH] Session check result:", {
          hasSession: !!session,
          hasUser: !!session?.user,
          userId: session?.user?.id,
          expiresAt: session?.expires_at,
          isMobile,
        });

        setUser(session?.user ?? null);

        if (session?.user) {
          console.log("[AUTH] User found, fetching profile...");
          // Only fetch profile if not already fetching
          if (!isFetchingProfile) {
          fetchUserProfile();
          }
        } else {
          console.log("[AUTH] No user session found");
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
      console.log("[AUTH] Auth state change:", event, {
        hasSession: !!session,
        hasUser: !!session?.user,
        userId: session?.user?.id,
        isMobile,
      });

      setUser(session?.user ?? null);
      if (session?.user) {
        console.log(
          "[AUTH] Auth state change - fetching profile for user:",
          session.user.id,
        );
        // Only fetch profile if not already fetching
        if (!isFetchingProfile) {
        fetchUserProfile();
        }
      } else {
        console.log("[AUTH] Auth state change - no user session");
        setUserProfile(null);
        setLoading(false); // Set loading to false when no user session
      }
    });

    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchUserProfile, isFetchingProfile]); // fetchUserProfile is now stable with no dependencies

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

        console.log("[AUTH] Cleared auth tokens during sign out");
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
    };

    console.log("[AUTH] Auth context value updated:", {
      hasUser: !!user,
      hasProfile: !!userProfile,
      loading,
      userId: user?.id,
      profileType: userProfile?.user_type,
      isMobile,
    });

    return authValue;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, userProfile, loading, fetchUserProfile]); // Added fetchUserProfile back since it's now stable

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
