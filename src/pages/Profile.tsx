
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { useAuth } from '@/components/auth/AuthProvider';
import ProfileForm from '@/components/profile/ProfileForm';
import ProfileHeader from '@/components/profile/ProfileHeader';

export default function Profile() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center py-10">
          <div className="text-lg">Loading...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <ProfileHeader />
        <div className="bg-white rounded-lg shadow p-6">
          <ProfileForm />
        </div>
      </div>
    </Layout>
  );
}
