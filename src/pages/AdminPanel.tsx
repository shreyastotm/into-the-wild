import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { startOfMonth, endOfMonth } from 'date-fns';

export default function AdminPanel() {
  const { userProfile } = useAuth();
  const [upcomingTreksCount, setUpcomingTreksCount] = useState<number | null>(null);
  const [pendingVerificationsCount, setPendingVerificationsCount] = useState<number | null>(null);
  const [totalUsersCount, setTotalUsersCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true);

        // Fetch upcoming treks count (this month)
        const now = new Date();
        const { count: treksCount, error: treksError } = await supabase
          .from('trek_events')
          .select('*', { count: 'exact', head: true })
          .gte('start_datetime', startOfMonth(now).toISOString())
          .lte('start_datetime', endOfMonth(now).toISOString())
          .not('status', 'in', '(DRAFT,CANCELLED)');

        if (treksError) {
          console.error('Error fetching upcoming treks count:', treksError);
        } else {
          setUpcomingTreksCount(treksCount || 0);
        }

        // Verification system not implemented yet
        setPendingVerificationsCount(0);

        // Fetch total users count
        const { count: usersCount, error: usersError } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true });

        if (usersError) {
          console.error('Error fetching total users count:', usersError);
        } else {
          setTotalUsersCount(usersCount || 0);
        }
      } catch (error) {
        console.error('Error fetching dashboard statistics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <h1 className="text-2xl sm:text-3xl font-bold">Admin Dashboard</h1>
      <p className="text-muted-foreground">
        Welcome, {userProfile?.full_name || 'Admin'}. From here you can manage all aspects of the platform.
      </p>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Treks</CardTitle>
            <CardDescription>
              {loading ? 'Loading...' : `${upcomingTreksCount ?? 0} treks starting this month`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Manage trek details, participants, and logistics.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Pending Verifications</CardTitle>
            <CardDescription>
              {loading ? 'Loading...' : `${pendingVerificationsCount ?? 0} users waiting for approval`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Review and approve new user identity documents.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Users</CardTitle>
            <CardDescription>
              {loading ? 'Loading...' : `${totalUsersCount ?? 0} registered members`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>View user statistics and manage user roles.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
