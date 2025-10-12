import { createContext, useState, useEffect, useContext, ReactNode, useCallback, useMemo, PropsWithChildren } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { UserProfile } from '@/types/user';
import { useToast } from '@/components/ui/use-toast';


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
    console.log('[AUTH] fetchUserProfile called');
    const { data: { session } } = await supabase.auth.getSession();

    if (session?.user) {
      console.log('[AUTH] fetchUserProfile - session exists, fetching profile for user:', session.user.id);
      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error("[AUTH] Error fetching profile:", error);
        toast({ title: "Error", description: "Could not fetch user profile.", variant: "destructive" });
      } else {
        console.log('[AUTH] Profile fetched successfully:', profile ? { id: profile.user_id, type: profile.user_type } : null);
        setUserProfile(profile);
      }
    } else {
      console.log('[AUTH] fetchUserProfile - no session found');
    }
  }, [toast]);

  useEffect(() => {
    setLoading(true);
    console.log('[AUTH] AuthProvider mounted, checking session...');

    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('[AUTH] Session check result:', {
        hasSession: !!session,
        hasUser: !!session?.user,
        userId: session?.user?.id,
        expiresAt: session?.expires_at
      });

      setUser(session?.user ?? null);

      if (session?.user) {
        console.log('[AUTH] User found, fetching profile...');
        fetchUserProfile();
      } else {
        console.log('[AUTH] No user session found');
        setLoading(false);
      }
    }).catch(error => {
      console.error('[AUTH] Error getting session:', error);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('[AUTH] Auth state change:', event, {
          hasSession: !!session,
          hasUser: !!session?.user,
          userId: session?.user?.id
        });

        setUser(session?.user ?? null);
        if (session?.user) {
            console.log('[AUTH] Auth state change - fetching profile for user:', session.user.id);
            fetchUserProfile();
        } else {
            console.log('[AUTH] Auth state change - no user session');
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
    const authValue = {
      user,
      userProfile,
      loading,
      signOut,
      fetchUserProfile,
    };

    console.log('[AUTH] Auth context value updated:', {
      hasUser: !!user,
      hasProfile: !!userProfile,
      loading,
      userId: user?.id,
      profileType: userProfile?.user_type
    });

    return authValue;
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
