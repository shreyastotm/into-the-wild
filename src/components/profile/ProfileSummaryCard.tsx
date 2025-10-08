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
    <Card className="p-4 bg-white rounded-lg shadow-sm border">
      <div className="flex items-center gap-4">
        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-lg font-bold text-gray-700">
          {userProfile?.full_name?.[0] || user?.email?.[0] || '?'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-lg font-semibold truncate">{userProfile?.full_name || user?.email}</div>
          <div className="text-sm text-gray-600 truncate">{user?.email}</div>
          <div className="flex flex-wrap gap-1 mt-1">
            {badges.map(badge => (
              <Badge key={badge.label} className={`${badge.color} text-xs`}>{badge.label}</Badge>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
