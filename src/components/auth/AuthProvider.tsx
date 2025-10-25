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

export const AuthProvider: React.FC<
  PropsWithChildren<Record<string, never>>
> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchUserProfile = useCallback(async () => {
    console.log("[AUTH] fetchUserProfile called");
    const isMobile = /Mobile|Android|iPhone|iPad/.test(navigator.userAgent);
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
        toast({
          title: "Error",
          description: "Could not fetch user profile.",
          variant: "destructive",
        });
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
    }
  }, [toast]);

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
          (k) => k.includes("supabase") || k.includes("auth"),
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
          fetchUserProfile();
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
        fetchUserProfile();
      } else {
        console.log("[AUTH] Auth state change - no user session");
        setUserProfile(null);
        setLoading(false); // Set loading to false when no user session
      }
    });

    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toast]); // Removed fetchUserProfile from dependencies to prevent infinite loop

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setUserProfile(null);
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
  }, [user, userProfile, loading]); // Removed fetchUserProfile from dependencies to prevent infinite loop

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
