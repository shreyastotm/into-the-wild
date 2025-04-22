import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  userProfile: any | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  userProfile: null,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log("Auth event:", event);
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        if (currentSession?.user?.email === 'shreyasmadhan82@gmail.com') {
          // Automatically promote this user to admin if not already
          (async () => {
            const { data: userRecord, error } = await supabase
              .from('users')
              .select('user_type, verification_status')
              .eq('email', 'shreyasmadhan82@gmail.com')
              .maybeSingle();
            if (!error && userRecord && userRecord.user_type !== 'admin') {
              await supabase
                .from('users')
                .update({ user_type: 'admin', verification_status: 'verified' })
                .eq('email', 'shreyasmadhan82@gmail.com');
            }
          })();
        }
        // Ensure shreyasmadhan@gmail.com is always a pending micro-community
        if (currentSession?.user?.email === 'shreyasmadhan@gmail.com') {
          (async () => {
            const { data: userRecord, error } = await supabase
              .from('users')
              .select('user_type, verification_status')
              .eq('email', 'shreyasmadhan@gmail.com')
              .maybeSingle();
            if (!error && userRecord && userRecord.user_type !== 'micro_community') {
              await supabase
                .from('users')
                .update({ user_type: 'micro_community', verification_status: userRecord.verification_status || 'pending' })
                .eq('email', 'shreyasmadhan@gmail.com');
            }
            if (!error && userRecord && !userRecord.verification_status) {
              await supabase
                .from('users')
                .update({ verification_status: 'pending' })
                .eq('email', 'shreyasmadhan@gmail.com');
            }
          })();
        }
        // Use setTimeout to avoid potential deadlocks
        if (currentSession?.user) {
          setTimeout(() => {
            fetchUserProfile(currentSession.user.id);
          }, 0);
        } else {
          setUserProfile(null);
        }
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (currentSession?.user) {
        fetchUserProfile(currentSession.user.id);
      }
      
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function fetchUserProfile(userId: string) {
    try {
      console.log("Fetching user profile for ID:", userId);
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user profile:', error);
        return;
      }

      console.log("User profile data:", data);
      setUserProfile(data);
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
    }
  }

  async function signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('[DEBUG] Supabase signOut error:', error);
        alert('Sign out failed: ' + error.message);
      }
    } catch (err) {
      console.error('[DEBUG] signOut exception:', err);
      alert('Sign out failed: ' + (err.message || err));
    }
  }

  return (
    <AuthContext.Provider value={{ session, user, userProfile, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
