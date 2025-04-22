import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { MapPin, Calendar, Users, Navigation } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { getUniqueParticipantCount, formatCurrency } from '@/lib/utils';
import { format, formatRelative } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

interface Trek {
  trek_id: number;
  trek_name: string;
  category: string | null;
  start_datetime: string;
  cost: number;
  max_participants: number;
  participant_count: number | null;
  description: string | null;
  image_url: string | null;
}

export const UpcomingTreks: React.FC<{ limit?: number }> = ({ limit = 3 }) => {
  const [treks, setTreks] = useState<Trek[]>([]);
  const [loading, setLoading] = useState(true);
  const [participantCounts, setParticipantCounts] = useState<Record<number, number>>({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchUpcomingTreks();
  }, [limit]);

  useEffect(() => {
    if (treks.length > 0) {
      fetchAllParticipantCounts();
    }
  }, [treks]);

  const fetchUpcomingTreks = async () => {
    try {
      setLoading(true);
      const now = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('trek_events')
        .select('trek_id, trek_name, category, start_datetime, cost, max_participants, description, image_url')
        .gt('start_datetime', now)
        .order('start_datetime', { ascending: true })
        .limit(limit);
      
      if (error) {
        throw error;
      }
      
      if (data) {
        setTreks(data);
      }
    } catch (error: any) {
      toast({
        title: "Error fetching treks",
        description: error.message || "Failed to load upcoming treks",
        variant: "destructive",
      });
      console.error("Error fetching upcoming treks:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllParticipantCounts = async () => {
    const counts: Record<number, number> = {};
    await Promise.all(
      treks.map(async (trek) => {
        const { data, error } = await supabase
          .from('trek_registrations')
          .select('user_id, payment_status')
          .eq('trek_id', trek.trek_id)
          .not('payment_status', 'eq', 'Cancelled');
        if (!error && data) {
          counts[trek.trek_id] = getUniqueParticipantCount(data);
        } else {
          counts[trek.trek_id] = 0;
        }
      })
    );
    setParticipantCounts(counts);
  };

  const toIndianTime = (utcDateString: string) => {
    const date = new Date(utcDateString);
    return toZonedTime(date, 'Asia/Kolkata');
  };

  const getCategoryColor = (category: string | null): string => {
    if (!category) return 'bg-gray-100 text-gray-800';
    
    const colorMap: Record<string, string> = {
      'Mountain': 'bg-amber-100 text-amber-800',
      'Hiking': 'bg-green-100 text-green-800',
      'Camping': 'bg-blue-100 text-blue-800',
      'Wildlife': 'bg-emerald-100 text-emerald-800',
      'Beach': 'bg-cyan-100 text-cyan-800',
      'Adventure': 'bg-red-100 text-red-800',
      'Cultural': 'bg-purple-100 text-purple-800'
    };
    
    return colorMap[category] || 'bg-gray-100 text-gray-800';
  };

  const getCategoryGradient = (category: string | null): string => {
    if (!category) return 'from-gray-200 to-gray-300';
    
    const gradientMap: Record<string, string> = {
      'Mountain': 'from-amber-200 to-amber-300',
      'Hiking': 'from-green-200 to-green-300',
      'Camping': 'from-blue-200 to-blue-300',
      'Wildlife': 'from-emerald-200 to-emerald-300',
      'Beach': 'from-cyan-200 to-cyan-300',
      'Adventure': 'from-red-200 to-red-300',
      'Cultural': 'from-purple-200 to-purple-300'
    };
    
    return gradientMap[category] || 'from-gray-200 to-gray-300';
  };

  const getCategoryIcon = (category: string | null) => {
    if (!category) return <Navigation className="h-12 w-12 opacity-40" />;
    
    return <Navigation className="h-12 w-12 opacity-40" />;
  };

  const treksWithCounts = treks.map(trek => ({
    ...trek,
    participant_count: participantCounts[trek.trek_id] ?? 0
  }));

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(limit)].map((_, index) => (
          <TrekCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (treks.length === 0) {
    return <div className="py-4 text-center">No upcoming treks found</div>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {treksWithCounts.map((trek) => (
        <div 
          key={trek.trek_id} 
          className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => navigate(`/trek-events/${trek.trek_id}`)}
        >
          <div className="h-48 bg-gray-200 relative">
            {trek.image_url && (
              <img src={trek.image_url} alt={trek.trek_name} className="absolute inset-0 object-cover w-full h-full" />
            )}
            <div className={`absolute inset-0 flex items-center justify-center bg-gradient-to-b ${getCategoryGradient(trek.category)}`}>
              <div className="flex flex-col items-center text-center px-4">
                {getCategoryIcon(trek.category)}
                <span className="mt-2 text-lg font-medium text-gray-700">
                  {trek.category || "Trek"}
                </span>
              </div>
            </div>
          </div>
          <div className="p-4">
            <h3 className="font-semibold text-lg mb-2 line-clamp-1">{trek.trek_name}</h3>
            {trek.category && (
              <Badge variant="outline" className={`${getCategoryColor(trek.category)} border-0 mb-2`}>
                {trek.category}
              </Badge>
            )}
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                <span>{format(toIndianTime(trek.start_datetime), 'E, d MMM yyyy, h:mm a')}</span>
              </div>
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-2 flex-shrink-0" />
                <span>{trek.participant_count}/{trek.max_participants} participants</span>
              </div>
              {trek.description && (
                <p className="line-clamp-2 text-xs mt-2">{trek.description}</p>
              )}
            </div>
            <div className="mt-3 flex justify-between items-center">
              <span className="font-bold text-lg">{formatCurrency(trek.cost)}</span>
              <MapPin className="h-4 w-4 text-gray-400" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const TrekCardSkeleton = () => (
  <div className="bg-white rounded-lg shadow-md overflow-hidden">
    <Skeleton className="h-48 w-full" />
    <div className="p-4 space-y-3">
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-1/4" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
      </div>
      <div className="flex justify-between items-center pt-2">
        <Skeleton className="h-6 w-1/4" />
        <Skeleton className="h-4 w-4 rounded-full" />
      </div>
    </div>
  </div>
);
