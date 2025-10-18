import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/auth/AuthProvider';
import { ProfileForm } from '@/components/profile/ProfileForm';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileSummaryCard from '@/components/profile/ProfileSummaryCard';
import IdVerification from '@/components/profile/IdVerification';
import { MobilePage, MobileSection } from '@/components/mobile/MobilePage';

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
      <MobilePage>
        <div className="flex justify-center items-center py-10">
          <div className="mobile-body">Loading...</div>
        </div>
      </MobilePage>
    );
  }

  return (
    <MobilePage>
      <MobileSection>
        <ProfileHeader />
        <ProfileSummaryCard />
        {!userProfile?.verification_status || userProfile.verification_status !== 'VERIFIED' ? (
          <IdVerification />
        ) : null}
        <ProfileForm />
      </MobileSection>
    </MobilePage>
  );
}
