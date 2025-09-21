import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useAuth } from '@/components/auth/AuthProvider';

export default function AdminPanel() {
  const { userProfile } = useAuth();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      <p className="text-muted-foreground">
        Welcome, {userProfile?.full_name || 'Admin'}. From here you can manage all aspects of the platform.
      </p>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Treks</CardTitle>
            <CardDescription>3 treks starting this month</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Manage trek details, participants, and logistics.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Pending Verifications</CardTitle>
            <CardDescription>5 users waiting for approval</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Review and approve new user identity documents.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Users</CardTitle>
            <CardDescription>152 active members</CardDescription>
          </CardHeader>
          <CardContent>
            <p>View user statistics and manage user roles.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
