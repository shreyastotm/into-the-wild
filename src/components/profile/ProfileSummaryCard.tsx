import React from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function ProfileSummaryCard() {
  const { user, userProfile } = useAuth();

  // Dummy data for badges and stats, replace with real queries if available
  const badges = [
    { label: 'Trekker', color: 'bg-green-100 text-green-800' },
    { label: 'Expense Settler', color: 'bg-blue-100 text-blue-800' },
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
          <span className="mr-4">Upcoming Treks: <b>2</b></span>
          <span className="mr-4">Settled Expenses: <b>7</b></span>
          <span>Community Since: <b>2024</b></span>
        </div>
      </div>
    </Card>
  );
}
