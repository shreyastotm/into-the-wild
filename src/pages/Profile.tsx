import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/auth/AuthProvider';
import { ProfileForm } from '@/components/profile/ProfileForm';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileSummaryCard from '@/components/profile/ProfileSummaryCard';
import IdVerification from '@/components/profile/IdVerification';

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
      <div className="flex justify-center items-center py-10">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-4 space-y-4">
      {/* Compact Header Row */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <ProfileHeader />
        </div>
        <div className="flex-1">
          <ProfileSummaryCard />
        </div>
      </div>
      
      {/* ID Verification - Compact */}
      <div className="lg:max-w-2xl">
        <IdVerification />
      </div>
      
      {/* Profile Form - Full Width */}
      <ProfileForm />
    </div>
  );
}
