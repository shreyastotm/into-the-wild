import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "@/components/auth/AuthProvider";
import {
  ProfileCompletionFunnel,
  ProfileCompletionWidget,
} from "@/components/interactions/ProfileCompletionFunnel";
import { MobilePage, MobileSection } from "@/components/mobile/MobilePage";
import { OrigamiHamburger } from "@/components/navigation/OrigamiHamburger";
import IdVerification from "@/components/profile/IdVerification";
import { ProfileForm } from "@/components/profile/ProfileForm";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileSummaryCard from "@/components/profile/ProfileSummaryCard";
import { useProfileCompletion } from "@/hooks/useProfileCompletion";
import { cn } from "@/lib/utils";

export default function Profile() {
  const { user, userProfile, loading } = useAuth();
  const navigate = useNavigate();

  // Get profile completion data
  const profileCompletion = user ? useProfileCompletion(user.id) : null;
  const { overallPercentage = 0, isComplete = false } = profileCompletion || {};

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="glass-profile-theme min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-900/20 via-orange-900/15 to-coral-900/10">
        <div className="flex justify-center items-center py-10">
          <div className="text-white/80">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "glass-profile-theme min-h-screen relative overflow-hidden",
        "bg-gradient-to-br from-amber-900/20 via-orange-900/15 to-coral-900/10",
        "scrollbar-nature",
      )}
    >
      <OrigamiHamburger />
      <MobilePage>
        <MobileSection className="relative z-10">
          <ProfileHeader />
          <ProfileSummaryCard />

          {/* Profile Completion Funnel - Show at top if not complete */}
          {user && (
            <div className="mb-6">
              {isComplete ? (
                <ProfileCompletionWidget
                  userId={user.id}
                  variant="compact"
                  className={cn(
                    "bg-white/8 dark:bg-gray-900/8",
                    "backdrop-blur-xl backdrop-saturate-150",
                    "border border-amber-400/30 dark:border-amber-400/20",
                    "rounded-3xl",
                    "ring-0 ring-amber-400/0",
                    "hover:ring-2 hover:ring-amber-400/40 hover:ring-offset-2 hover:ring-offset-amber-100/20",
                    "shadow-lg shadow-black/5 hover:shadow-2xl hover:shadow-amber-500/20",
                    "transition-all duration-500 ease-out",
                    "p-4",
                  )}
                />
              ) : (
                <ProfileCompletionFunnel
                  userId={user.id}
                  className={cn(
                    "bg-white/8 dark:bg-gray-900/8",
                    "backdrop-blur-xl backdrop-saturate-150",
                    "border border-amber-400/30 dark:border-amber-400/20",
                    "rounded-3xl",
                    "ring-0 ring-amber-400/0",
                    "hover:ring-2 hover:ring-amber-400/40 hover:ring-offset-2 hover:ring-offset-amber-100/20",
                    "shadow-lg shadow-black/5 hover:shadow-2xl hover:shadow-amber-500/20",
                    "transition-all duration-500 ease-out",
                    "p-4",
                  )}
                />
              )}
            </div>
          )}

          {!userProfile?.verification_status ||
          userProfile.verification_status !== "VERIFIED" ? (
            <IdVerification />
          ) : null}
          <ProfileForm />
        </MobileSection>
      </MobilePage>
    </div>
  );
}
