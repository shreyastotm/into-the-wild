
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/auth/AuthProvider';
import { UserTreks } from '@/components/dashboard/UserTreks';
import { ExpenseSummary } from '@/components/dashboard/ExpenseSummary';
import { ExpenseChart } from '@/components/dashboard/ExpenseChart';
import { Button } from '@/components/ui/button';
import { MapPin, CalendarDays, Plus } from 'lucide-react';

const Dashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-8"></div>
        <div className="h-32 bg-gray-200 rounded animate-pulse mb-8"></div>
        <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in the useEffect
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
            Browse Treks
          </Button>
        </div>
      </div>

      <div className="mb-8">
        <ExpenseSummary />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div>
          <ExpenseChart />
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-4">My Treks</h2>
          <UserTreks />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
