import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';

export default function AuthCallback() {
  const navigate = useNavigate();
  const { fetchUserProfile } = useAuth();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Handle OAuth callback by getting session from URL hash
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          navigate('/auth?error=' + encodeURIComponent(error.message));
          return;
        }

        if (data.session?.user) {
          // Fetch user profile after successful auth
          await fetchUserProfile();
          navigate('/dashboard');
        } else {
          // If no session, try to get it from the URL hash
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          const accessToken = hashParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token');
          
          if (accessToken && refreshToken) {
            // Set the session manually
            const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken
            });
            
            if (sessionError) {
              console.error('Session error:', sessionError);
              navigate('/auth?error=' + encodeURIComponent(sessionError.message));
              return;
            }
            
            if (sessionData.session?.user) {
              await fetchUserProfile();
              navigate('/dashboard');
            } else {
              navigate('/auth');
            }
          } else {
            navigate('/auth');
          }
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        navigate('/auth?error=Authentication failed');
      }
    };

    handleAuthCallback();
  }, [navigate, fetchUserProfile]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Completing sign in...</p>
      </div>
    </div>
  );
}
