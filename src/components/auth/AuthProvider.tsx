import {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
  useCallback,
  useMemo,
  useRef,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // ✅ EMPTY DEPENDENCIES - NO RE-CREATION!

  useEffect(() => {
    setLoading(true);

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

    // Check for incognito mode or force signout
    const urlParams = new URLSearchParams(window.location.search);
    const isIncognito = urlParams.get('incognito') === 'true' ||
                       urlParams.get('forceSignOut') === 'true' ||
                       window.location.hash.includes('forceSignOut');

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

      } catch (e) {
        console.error("[AUTH] Error clearing auth tokens:", e);
      }
    }

    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        setUser(session?.user ?? null);

        if (session?.user) {
          // Only fetch profile if not already fetching
          if (!isFetchingProfileRef.current) {
          fetchUserProfile();
          }
        } else {
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
    });

    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchUserProfile]); // ✅ REMOVE isFetchingProfile from dependencies

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
    };

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
