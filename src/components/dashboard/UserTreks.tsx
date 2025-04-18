import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { formatCurrency } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';
import { CalendarDays, MapPin, Clock, Users, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { Skeleton } from '@/components/ui/skeleton';
import { userIdToNumber } from '@/utils/dbTypeConversions';

interface TrekRegistration {
  trek_id: number;
  trek_name: string;
  start_datetime: string;
  payment_status: string;
  cost: number;
  category: string | null;
  location: any;
  current_participants: number;
  max_participants: number;
  isPast: boolean;
  image_url?: string | null;
}

export const UserTreks = () => {
  const [registrations, setRegistrations] = useState<TrekRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchUserRegistrations();
    }
  }, [user]);

  const fetchUserRegistrations = async () => {
    try {
      setLoading(true);
      
      const userId = user?.id ? userIdToNumber(user.id) : 0;
      
      const { data, error } = await supabase
        .from('registrations')
        .select(`
          trek_id,
          payment_status,
          trek_events(
            trek_name,
            start_datetime,
            cost,
            category,
            location,
            current_participants,
            max_participants,
            image_url
          )
        `)
        .eq('user_id', userId);
      
      if (error) throw error;
      
      if (data) {
        const now = new Date();
        
        // Transform the data to match our component's needs
        const transformedData: TrekRegistration[] = data.map(item => {
          const trekData = item.trek_events as any;
          const startDate = new Date(trekData.start_datetime);
          
          return {
            trek_id: Number(item.trek_id),
            trek_name: trekData.trek_name,
            start_datetime: trekData.start_datetime,
            payment_status: item.payment_status,
            cost: trekData.cost,
            category: trekData.category,
            location: trekData.location,
            current_participants: trekData.current_participants || 0,
            max_participants: trekData.max_participants,
            isPast: startDate < now,
            image_url: trekData.image_url || null
          };
        });
        
        setRegistrations(transformedData);
      }
    } catch (error: any) {
      toast({
        title: "Error loading your treks",
        description: error.message || "Failed to load trek registrations",
        variant: "destructive",
      });
      console.error("Error fetching user registrations:", error);
    } finally {
      setLoading(false);
    }
  };

  const goToTrekDetails = (trekId: number) => {
    navigate(`/trek-events/${trekId}`);
  };

  // Separate upcoming and past treks
  const upcomingTreks = registrations.filter(reg => !reg.isPast);
  const pastTreks = registrations.filter(reg => reg.isPast);

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, index) => (
          <Card key={index} className="w-full">
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (registrations.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <p className="mb-4 text-muted-foreground">You haven't registered for any treks yet</p>
          <Button onClick={() => navigate('/trek-events')}>
            Find Treks to Join
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    );
  }

  const renderTrekCard = (trek: TrekRegistration) => {
    const startDate = toZonedTime(new Date(trek.start_datetime), 'Asia/Kolkata');
    
    return (
      <Card key={trek.trek_id} className="mb-4 hover:shadow-md transition-shadow">
        {/* Trek Image Display */}
        {trek.image_url && (
          <img
            src={trek.image_url}
            alt={trek.trek_name}
            className="w-full h-40 object-cover border-b border-gray-200 rounded-t"
          />
        )}
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg">{trek.trek_name}</CardTitle>
            {trek.payment_status === 'Confirmed' && (
              <div className="flex items-center text-green-600 text-sm">
                <CheckCircle2 className="h-4 w-4 mr-1" />
                Confirmed
              </div>
            )}
            {trek.payment_status === 'Pending' && (
              <div className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">
                Payment Pending
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-center">
              <CalendarDays className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{format(startDate, 'EEE, MMM d, yyyy')}</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{format(startDate, 'h:mm a')} IST</span>
            </div>
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{trek.current_participants}/{trek.max_participants} participants</span>
            </div>
            {trek.location && (
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{trek.location.name || "Location details available"}</span>
              </div>
            )}
          </div>
          <div className="mt-4 flex justify-between items-center">
            <div className="font-bold">{formatCurrency(trek.cost)}</div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => goToTrekDetails(trek.trek_id)}
              className="ml-auto"
            >
              View Details
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <Tabs defaultValue="upcoming" className="w-full">
      <TabsList className="mb-4">
        <TabsTrigger value="upcoming">
          Upcoming Treks ({upcomingTreks.length})
        </TabsTrigger>
        <TabsTrigger value="past">
          Past Treks ({pastTreks.length})
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="upcoming">
        {upcomingTreks.length > 0 ? (
          <div>
            {upcomingTreks.map(renderTrekCard)}
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-muted-foreground mb-4">You have no upcoming treks</p>
            <Button onClick={() => navigate('/trek-events')}>
              Find Treks to Join
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}
      </TabsContent>
      
      <TabsContent value="past">
        {pastTreks.length > 0 ? (
          <div>
            {pastTreks.map(renderTrekCard)}
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-muted-foreground">You have no past treks</p>
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
};
