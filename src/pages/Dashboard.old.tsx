import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/auth/AuthProvider";
import { UserTreks } from "@/components/dashboard/UserTreks";
import { Button } from "@/components/ui/button";
import LoadingScreen from "@/components/LoadingScreen";
import { MapPin, CalendarDays, Plus } from "lucide-react";

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
      <div className="py-6 sm:py-8 text-center">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4">Access Denied</h1>
        <p className="text-muted-foreground mb-6">
          You must be signed in to view your dashboard.
        </p>
        <Button onClick={() => navigate("/auth")} className="w-full sm:w-auto">
          Sign In
        </Button>
      </div>
    );
  }

  return (
    <div className="py-6 sm:py-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 sm:mb-8 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">My Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user.user_metadata?.full_name || "Trekker"}
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => navigate("/trek-events")}
            className="w-full sm:w-auto"
          >
            <CalendarDays className="mr-2 h-4 w-4" />
            Browse Treks
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold mb-4">My Treks</h2>
          <UserTreks />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
