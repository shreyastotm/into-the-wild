import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useUserVerificationStatus() {
  const [status, setStatus] = useState<{
    isVerified: boolean;
    isIndemnityAccepted: boolean;
    userType: string | null;
    loading: boolean;
  }>({ isVerified: false, isIndemnityAccepted: false, userType: null, loading: true });

  useEffect(() => {
    async function fetchUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return setStatus(s => ({ ...s, loading: false }));

      const { data, error } = await supabase
        .from('users')
        .select('user_type, is_verified, indemnity_accepted')
        .eq('user_id', user.id)
        .single();

      if (!error && data && ['admin', 'micro_community', 'trekker'].includes(data.user_type)) {
        setStatus({
          isVerified: !!data.is_verified,
          isIndemnityAccepted: !!data.indemnity_accepted,
          userType: data.user_type,
          loading: false,
        });
      } else {
        setStatus(s => ({ ...s, loading: false }));
      }
    }
    fetchUser();
  }, []);

  return status;
}
