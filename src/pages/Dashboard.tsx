import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/auth/AuthProvider';
import { UserTreks } from '@/components/dashboard/UserTreks';
import { Button } from '@/components/ui/button';
import LoadingScreen from '@/components/LoadingScreen';
import { MapPin, CalendarDays, Plus } from 'lucide-react';

const Dashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      // We don't navigate automatically anymore, we show a message instead.
      // navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return <LoadingScreen message="Loading your dashboard..." />;
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-3xl font-bold mb-4">Access Denied</h1>
        <p className="text-muted-foreground mb-6">You must be signed in to view your dashboard.</p>
        <Button onClick={() => navigate('/auth')}>Sign In</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">My Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user.user_metadata?.full_name || 'Trekker'}
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate('/trek-events')}>
            <CalendarDays className="mr-2 h-4 w-4" />
            Browse Adventures
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div>
          <h2 className="text-2xl font-bold mb-4">My Adventures</h2>
          <UserTreks />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
