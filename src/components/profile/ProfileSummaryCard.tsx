import React from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function ProfileSummaryCard() {
  const { user, userProfile } = useAuth();

  // Simple static badges - no dynamic data for now
  const badges = [
    { label: 'Trekker', color: 'bg-green-100 text-green-800' },
    { label: 'Community Member', color: 'bg-purple-100 text-purple-800' },
  ];

  return (
    <Card className="mb-6 p-6 flex flex-col md:flex-row items-center gap-6">
      <div className="flex-shrink-0 w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-3xl font-bold text-gray-700">
        {userProfile?.full_name?.[0] || user?.email?.[0] || '?'}
      </div>
      <div className="flex-1">
        <div className="text-xl font-bold mb-1">{userProfile?.full_name || user?.email}</div>
        <div className="text-gray-600 mb-2">{user?.email}</div>
        <div className="flex flex-wrap gap-2 mb-2">
          {badges.map(badge => (
            <Badge key={badge.label} className={badge.color}>{badge.label}</Badge>
          ))}
        </div>
        <div className="text-sm text-gray-500">
          <span className="mr-4">Member since: <b>{userProfile?.created_at ? new Date(userProfile.created_at).getFullYear() : 'N/A'}</b></span>
        </div>
      </div>
    </Card>
  );
}
