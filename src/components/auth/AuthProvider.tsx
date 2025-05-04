import { createContext, useState, useEffect, useContext, ReactNode, useCallback, useMemo, PropsWithChildren } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export interface UserProfile {
  user_id: string;
  full_name?: string | null;
  email?: string | null;
  phone_number?: string | null;
  date_of_birth?: string | null;
  address?: string | null;
  interests?: string | null;
  trekking_experience?: string | null;
  health_data?: string | null;
  image_url?: string | null;
  avatar_url?: string | null;
  user_type?: string | null;
  partner_id?: string | null;
  verification_status?: string | null;
  verification_docs?: string | null;
  points?: number | null;
  badges?: string[] | null;
  legacy_int_id?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  has_car?: boolean | null;
  car_seating_capacity?: number | null;
  vehicle_number?: string | null;
  pet_details?: string | null;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  refreshUserProfile: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<PropsWithChildren<{}>> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log("Auth event:", event);
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

  const fetchUserProfile = useCallback(async (userId: string) => {
    console.log("Fetching user profile for ID:", userId);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error("Error fetching user profile:", error);
        setUserProfile(null);
      } else {
        console.log("User profile data:", data);
        setUserProfile(data as UserProfile);
      }
    } catch (err) {
      console.error("Exception fetching profile:", err);
      setUserProfile(null);
    }
  }, []);

  const refreshUserProfile = useCallback(async () => {
    if (user) {
      await fetchUserProfile(user.id);
    }
  }, [user, fetchUserProfile]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setUserProfile(null);
  };

  const value = useMemo(() => ({
    user,
    userProfile,
    loading,
    setUserProfile,
    refreshUserProfile,
    signOut,
  }), [user, userProfile, loading, refreshUserProfile, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
