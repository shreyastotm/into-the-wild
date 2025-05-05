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

interface TrekRegistration {
  trek_id: number;
  trek_name: string;
  start_datetime: string;
  payment_status: string;
  cost: number;
  category: string | null;
  location: any;
  participant_count: number | null;
  max_participants: number;
  isPast: boolean;
  image_url?: string | null;
}

export const UserTreks = () => {
  const [trekRegistrations, setTrekRegistrations] = useState<TrekRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchUserTrekRegistrations();
    }
  }, [user]);

  const fetchUserTrekRegistrations = async () => {
    try {
      setLoading(true);
      
      const userId = user?.id ? (typeof user.id === 'string' ? user.id : String(user.id)) : '';
      
      const { data, error } = await supabase
        .from('trek_registrations')
        .select('*')
        .eq('user_id', userId);
      if (error) throw error;
      if (data && data.length > 0) {
        // Fetch trek event details for all trek_ids
        const trekIds = data.map((reg: any) => reg.trek_id);
        const { data: trekEvents, error: trekEventsError } = await supabase
          .from('trek_events')
          .select('trek_id, name, start_datetime, base_price, category, location, max_participants, image_url')
          .in('trek_id', trekIds);
        if (trekEventsError) throw trekEventsError;
        const trekMap = (trekEvents || []).reduce((acc, trek) => {
          acc[trek.trek_id] = trek;
          return acc;
        }, {} as Record<number, any>);
        const now = new Date();
        const transformedData = data.map((reg: any) => {
          const trekData = trekMap[reg.trek_id];
          if (!trekData) {
            console.error('Missing trek event for registration:', reg);
          }
          const startDate = trekData ? new Date(trekData.start_datetime) : new Date('');
          return {
            ...reg,
            trek_name: trekData?.name || '(Event Missing)',
            start_datetime: trekData?.start_datetime || '',
            cost: trekData?.base_price ?? 0,
            category: trekData?.category ?? null,
            location: trekData?.location ?? null,
            max_participants: trekData?.max_participants ?? 0,
            isPast: trekData ? startDate < now : false,
            image_url: trekData?.image_url || null
          };
        });
        setTrekRegistrations(transformedData);
      } else {
        setTrekRegistrations([]);
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
  const upcomingTreks = trekRegistrations.filter(reg => !reg.isPast);
  const pastTreks = trekRegistrations.filter(reg => reg.isPast);

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

  if (trekRegistrations.length === 0) {
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
    let startDate: Date;
    try {
      startDate = toZonedTime(new Date(trek.start_datetime), 'Asia/Kolkata');
      if (isNaN(startDate.getTime())) throw new Error('Invalid date');
    } catch {
      // Debug: Log the problematic trek and its start_datetime
      console.error('Invalid trek start_datetime:', trek);
      // Fallback: show 'Invalid date' in UI instead of crashing
      return (
        <Card key={trek.trek_id} className="mb-4 hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">{trek.trek_name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-red-600">Invalid date value</div>
          </CardContent>
        </Card>
      );
    }
    
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
              <span>{trek.participant_count}/{trek.max_participants} participants</span>
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
