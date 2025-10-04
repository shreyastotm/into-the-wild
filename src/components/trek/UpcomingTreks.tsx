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
import { useCallback } from 'react';

interface Trek {
  trek_id: number;
  name: string;
  category: string | null;
  difficulty: string | null;
  start_datetime: string;
  base_price: number;
  max_participants: number;
  // participant_count is fetched separately
  description: string | null;
  image_url: string | null;
}

// Combined interface for Trek with participant count
interface TrekWithCount extends Trek {
  participant_count: number;
}

// Define type for raw fetched data
interface FetchedTrekData {
  trek_id: number;
  name: string | null;
  category: string | null;
  difficulty: string | null;
  start_datetime: string | null;
  base_price: number | null;
  max_participants: number | null;
  description: string | null;
  image_url: string | null;
}

export const UpcomingTreks: React.FC<{ limit?: number }> = ({ limit = 3 }) => {
  const [treks, setTreks] = useState<Trek[]>([]);
  const [loading, setLoading] = useState(true);
  const [participantCounts, setParticipantCounts] = useState<Record<number, number>>({});
  const navigate = useNavigate();

  const fetchUpcomingTreks = useCallback(async () => {
    try {
      setLoading(true);
      const now = new Date().toISOString();

      // Simplified query using current schema names
      const { data, error } = await supabase
        .from('trek_events')
        .select('trek_id, name, category, difficulty, start_datetime, base_price, max_participants, description, image_url') 
        .gt('start_datetime', now)
        .order('start_datetime', { ascending: true })
        .limit(limit);

      if (error) {
        throw error;
      }

      // Cast fetched data to the explicit type
      const fetchedData = (data as FetchedTrekData[]) || [];

      // Map fetched data to Trek interface with defaults and resolve image URLs
      const mappedTreks: Trek[] = await Promise.all(
        fetchedData.map(async (trek) => {
          let imageUrl = null;
          if (trek.image_url) {
            const { data: urlData } = await supabase.storage.from('trek_assets').getPublicUrl(trek.image_url);
            imageUrl = urlData.publicUrl;
          }
          return {
            trek_id: trek.trek_id,
            name: trek.name ?? 'Unnamed Trek',
            category: trek.category ?? null,
            difficulty: trek.difficulty ?? null,
            start_datetime: trek.start_datetime ?? new Date().toISOString(),
            base_price: trek.base_price ?? 0,
            max_participants: trek.max_participants ?? 0,
            description: trek.description ?? null,
            image_url: imageUrl,
          };
        })
      );

      setTreks(mappedTreks);
      setParticipantCounts({}); 

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to load upcoming treks";
      toast({
        title: "Error fetching treks",
        description: errorMessage,
        variant: "destructive",
      });
      console.error("Error fetching upcoming treks:", error);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  const fetchAllParticipantCounts = useCallback(async () => {
    const counts: Record<number, number> = {};
    try {
      await Promise.all(
        treks.map(async (trek) => {
          // Original structure - assuming trek is valid here
          try {
            // Get an accurate count by just counting all non-cancelled registrations
            // Removed head: true to potentially avoid 500 errors, fetch minimal column instead.
            const { count, error } = await supabase
              .from('trek_registrations')
              .select('registration_id', { count: 'exact' }) // Select minimal column, keep count
              .eq('trek_id', trek.trek_id)
              .not('payment_status', 'eq', 'Cancelled');
            
            if (error) {
              console.error(`Error fetching count for trek ${trek.trek_id}:`, error);
              counts[trek.trek_id] = 0; // Default to 0 on error
            } else {
              // Use the count directly if available
              counts[trek.trek_id] = count || 0;
            }
          } catch (err) {
            console.error(`Error processing count for trek ${trek.trek_id}:`, err);
            counts[trek.trek_id] = 0;
          }
        })
      );
      setParticipantCounts(counts);
    } catch (err) {
      console.error("Error in Promise.all for participant counts:", err);
      // Set all counts to 0 on error
      const zeroCounts = treks.reduce((acc, trek) => {
        acc[trek.trek_id] = 0;
        return acc;
      }, {} as Record<number, number>);
      setParticipantCounts(zeroCounts);
    }
  }, [treks]);

  useEffect(() => {
    fetchUpcomingTreks();
  }, [limit, fetchUpcomingTreks]);

  // Fetch counts only after treks are loaded
  useEffect(() => {
    if (treks.length > 0) {
      fetchAllParticipantCounts();
    }
  }, [treks, fetchAllParticipantCounts]);

  const toIndianTime = (utcDateString: string) => {
    try {
       const date = new Date(utcDateString);
       if (isNaN(date.getTime())) throw new Error('Invalid date string');
       return toZonedTime(date, 'Asia/Kolkata');
    } catch (e) {
      console.error("Error converting date to Indian time:", utcDateString, e);
      return new Date(); // Return current date as fallback
    }
  };

  const getCategoryColor = (category: string | null): string => {
    if (!category) return 'bg-gray-100 text-gray-800';

    const colorMap: Record<string, string> = {
      'Beginner': 'bg-green-100 text-green-800',
      'Intermediate': 'bg-blue-100 text-blue-800',
      'Advanced': 'bg-red-100 text-red-800',
      'Family': 'bg-purple-100 text-purple-800',
      'Weekend': 'bg-amber-100 text-amber-800',
      'Overnight': 'bg-indigo-100 text-indigo-800',
      'Day Trek': 'bg-sky-100 text-sky-800',
      // Add other categories from your app if needed
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
      'Beginner': 'from-green-200 to-green-300',
      'Intermediate': 'from-blue-200 to-blue-300',
      'Advanced': 'from-red-200 to-red-300',
      'Family': 'from-purple-200 to-purple-300',
      'Weekend': 'from-amber-200 to-amber-300',
      'Overnight': 'from-indigo-200 to-indigo-300',
      'Day Trek': 'from-sky-200 to-sky-300',
      // Add other categories
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
    // Default navigation icon for all categories
    return <Navigation className="h-12 w-12 opacity-40 text-gray-600" />;
  };

  const treksWithCounts: TrekWithCount[] = treks.map(trek => ({
    ...trek,
    participant_count: participantCounts[trek.trek_id] ?? 0 // Default to 0 if count not yet fetched
  }));

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {[...Array(limit)].map((_, index) => (
          <TrekCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (treks.length === 0) {
    return <div className="py-8 text-center text-muted-foreground">No upcoming treks found matching your criteria.</div>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {treksWithCounts.map((trek) => {
         const indianTime = toIndianTime(trek.start_datetime);
         return (
           <div
             key={trek.trek_id}
             className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow group"
             onClick={() => navigate(`/trek-events/${trek.trek_id}`)}
           >
             <div className="h-48 bg-gray-200 relative overflow-hidden">
                {/* Image or Gradient Background */}
                {trek.image_url ? (
                 <img 
                    src={trek.image_url} 
                    alt={trek.name} 
                    className="absolute inset-0 object-cover w-full h-full transition-transform duration-300 group-hover:scale-105" 
                 />
                ) : (
                  <div className={`absolute inset-0 flex items-center justify-center bg-gradient-to-br ${getCategoryGradient(trek.category)}`}>
                    <div className="flex flex-col items-center text-center px-4">
                      {getCategoryIcon(trek.category)}
                      <span className="mt-2 text-lg font-medium text-gray-700 opacity-80">
                        {trek.category || "Trek"}
                      </span>
                    </div>
                  </div>
                )}
             </div>
             <div className="p-4">
               <h3 className="font-semibold text-lg mb-2 line-clamp-1 group-hover:text-primary transition-colors">{trek.name}</h3>
               {trek.category && (
                 <Badge variant="outline" className={`${getCategoryColor(trek.category)} border-0 mb-2`}>
                   {trek.category}
                 </Badge>
               )}
               <div className="space-y-2 text-sm text-gray-600">
                 <div className="flex items-center">
                   <Calendar className="h-4 w-4 mr-2 flex-shrink-0 text-muted-foreground" />
                   <span>{format(indianTime, 'E, d MMM yyyy, h:mm a')}</span>
                 </div>
                 <div className="flex items-center">
                   <Users className="h-4 w-4 mr-2 flex-shrink-0 text-muted-foreground" />
                   <span>{trek.participant_count}/{trek.max_participants} participants</span>
                 </div>
                 {trek.description && (
                   <p className="line-clamp-2 text-xs mt-2 text-muted-foreground">{trek.description}</p>
                 )}
               </div>
               <div className="mt-4 flex justify-between items-center border-t pt-3">
                 <span className="font-bold text-lg">{formatCurrency(trek.base_price)}</span>
                 {/* Optionally show location icon or name if available */}
                 {/* <MapPin className="h-4 w-4 text-gray-400" /> */}
               </div>
             </div>
           </div>
         );
      })}
    </div>
  );
};

// Define TrekCardSkeleton here as it was part of the provided code
const TrekCardSkeleton = () => (
  <div className="bg-white rounded-lg shadow-md overflow-hidden">
    <Skeleton className="h-48 w-full" />
    <div className="p-4 space-y-3">
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-1/4 mb-2" /> {/* Adjusted for badge */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" /> {/* Slightly varied width */}
      </div>
      <div className="flex justify-between items-center pt-3 border-t mt-3">
        <Skeleton className="h-6 w-1/4" />
        {/* Icon could be added here in the future */}
      </div>
    </div>
  </div>
);
