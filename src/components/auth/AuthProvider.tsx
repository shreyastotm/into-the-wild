import { createContext, useState, useEffect, useContext, ReactNode, useCallback, useMemo, PropsWithChildren } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { UserProfile } from '@/types/user';
import { useToast } from '@/components/ui/use-toast';

// Debug function to log auth state
const logAuthState = (label: string, user: User | null, userProfile: UserProfile | null, loading: boolean) => {
  if (typeof window !== 'undefined') {
    console.log(`[AUTH DEBUG ${label}]`, {
      user: user ? { id: user.id, email: user.email } : null,
      userProfile: userProfile ? { id: userProfile.user_id, type: userProfile.user_type } : null,
      loading,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      isMobile: /Mobile|Android|iPhone|iPad/.test(navigator.userAgent)
    });
  }
};

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  fetchUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<PropsWithChildren<Record<string, never>>> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchUserProfile = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      logAuthState('FETCHING_PROFILE', session.user, null, false);
      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error("Error fetching profile:", error);
        toast({ title: "Error", description: "Could not fetch user profile.", variant: "destructive" });
      } else {
        logAuthState('PROFILE_FETCHED', session.user, profile, false);
        setUserProfile(profile);
      }
    } else {
      logAuthState('FETCH_PROFILE_NO_SESSION', null, null, false);
    }
  }, [toast]);

  useEffect(() => {
    setLoading(true);
    logAuthState('AUTH_PROVIDER_MOUNT', null, null, true);

    // Check localStorage for existing session
    if (typeof window !== 'undefined') {
      try {
        const storedSession = window.localStorage.getItem('itw-auth-token');
        console.log('[AUTH DEBUG] localStorage session:', storedSession ? 'EXISTS' : 'MISSING');
      } catch (e) {
        console.error('[AUTH DEBUG] localStorage access error:', e);
      }
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      logAuthState('SESSION_CHECK', session?.user ?? null, null, false);

      if (session?.user) {
        fetchUserProfile();
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        logAuthState(`AUTH_STATE_CHANGE_${event.toUpperCase()}`, session?.user ?? null, null, false);
        setUser(session?.user ?? null);
        if (session?.user) {
            fetchUserProfile();
        } else {
            setUserProfile(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [fetchUserProfile, toast]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setUserProfile(null);
  };
  
  const value = useMemo(() => {
    logAuthState('AUTH_CONTEXT_VALUE', user, userProfile, loading);
    return {
      user,
      userProfile,
      loading,
      signOut,
      fetchUserProfile,
    };
  }, [user, userProfile, loading, fetchUserProfile]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
