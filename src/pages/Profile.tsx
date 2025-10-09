import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/auth/AuthProvider';
import { ProfileForm } from '@/components/profile/ProfileForm';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileSummaryCard from '@/components/profile/ProfileSummaryCard';
import IdVerification from '@/components/profile/IdVerification';

export default function Profile() {
  const { user, userProfile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-0 sm:px-4 py-8 space-y-6">
      <ProfileHeader />
      <ProfileSummaryCard />
      {!userProfile?.verification_status || userProfile.verification_status !== 'VERIFIED' ? (
        <IdVerification />
      ) : null}
      <ProfileForm />
    </div>
  );
}
