import React, { useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { AvatarPicker } from './AvatarPicker';
import { CheckCircle, Sparkles } from 'lucide-react';

export default function ProfileSummaryCard() {
  const { user, userProfile } = useAuth();
  const [avatarPickerOpen, setAvatarPickerOpen] = useState(false);

  // Determine verification status
  const isVerified = userProfile?.verification_status === 'VERIFIED';

  // Dynamic badges based on user data
  const badges = [
    ...(userProfile?.user_type ? [{
      label: userProfile.user_type.charAt(0).toUpperCase() + userProfile.user_type.slice(1),
      variant: userProfile.user_type === 'admin' ? 'admin' as const : 'default' as const
    }] : []),
    ...(isVerified ? [{
      label: 'Verified',
      variant: 'verified' as const,
      icon: CheckCircle
    }] : []),
    { label: 'Community Member', variant: 'community' as const },
  ];

  return (
    <>
      <Card className="mb-6 p-6 flex flex-col md:flex-row items-center gap-6">
        <div className="flex-shrink-0 relative">
          <Avatar className="w-24 h-24">
            <AvatarImage src={userProfile?.avatar_url || undefined} alt={userProfile?.full_name || user?.email || ''} />
            <AvatarFallback className="text-2xl font-bold">
              {userProfile?.full_name?.[0] || user?.email?.[0] || '?'}
            </AvatarFallback>
          </Avatar>

          {/* Avatar picker trigger */}
          <div className="absolute -bottom-2 -right-2">
            <AvatarPicker
              open={avatarPickerOpen}
              onOpenChange={setAvatarPickerOpen}
              trigger={
                <Button
                  size="sm"
                  className="h-8 w-8 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
                  title="Set your wild avatar"
                >
                  <Sparkles className="h-4 w-4" />
                </Button>
              }
            />
          </div>
        </div>

        <div className="flex-1">
          <div className="text-xl font-bold mb-1">{userProfile?.full_name || user?.email}</div>
          <div className="text-muted-foreground mb-2">{user?.email}</div>
          <div className="flex flex-wrap gap-2 mb-2">
            {badges.map(badge => (
              <Badge
                key={badge.label}
                variant={badge.variant}
                className="flex items-center gap-1"
              >
                {badge.icon && <badge.icon className="h-3 w-3" />}
                {badge.label}
              </Badge>
            ))}
          </div>
          <div className="text-sm text-muted-foreground">
            <span className="mr-4">Member since: <b>{userProfile?.created_at ? new Date(userProfile.created_at).getFullYear() : 'N/A'}</b></span>
            {!isVerified && (
              <span className="text-warning">• ID verification pending</span>
            )}
          </div>
        </div>
      </Card>
    </>
  );
}
