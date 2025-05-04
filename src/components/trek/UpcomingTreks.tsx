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
  // participant_count is fetched separately
  description: string | null;
  image_url: string | null;
}

// Combined interface for Trek with participant count
interface TrekWithCount extends Trek {
  participant_count: number;
}


export const UpcomingTreks: React.FC<{ limit?: number }> = ({ limit = 3 }) => {
  const [treks, setTreks] = useState<Trek[]>([]);
  const [loading, setLoading] = useState(true);
  const [participantCounts, setParticipantCounts] = useState<Record<number, number>>({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchUpcomingTreks();
  }, [limit]);

  // Fetch counts only after treks are loaded
  useEffect(() => {
    if (treks.length > 0) {
      fetchAllParticipantCounts();
    }
  }, [treks]);

  const fetchUpcomingTreks = async () => {
    try {
      setLoading(true);
      const now = new Date().toISOString();

      // Try both naming conventions, but with fallback field selections
      let queryResult;
      try {
        // First attempt - query only required fields to minimize chances of errors
        queryResult = await supabase
          .from('trek_events')
          .select('trek_id, start_datetime, max_participants, description')
          .gt('start_datetime', now)
          .order('start_datetime', { ascending: true })
          .limit(limit);
          
        // Check for successful execution
        if (queryResult.error) {
          throw queryResult.error;
        }
      } catch (err) {
        console.log("First query failed, trying alternative column names");
        throw err;
      }

      if (queryResult.data) {
        // Now make additional queries to get optional fields one by one
        let trekEvents = queryResult.data;
        
        // Try to fetch trek_name/name
        try {
          const nameResult = await supabase
            .from('trek_events')
            .select('trek_id, trek_name')
            .in('trek_id', trekEvents.map(t => t.trek_id));
            
          if (!nameResult.error && nameResult.data) {
            // Create a mapping of trek_id to trek_name
            const nameMap: Record<number, string> = {};
            
            // Use explicit type to help TypeScript understand the structure
            const safeData = nameResult.data as Array<{trek_id?: number, trek_name?: string}>;
            safeData.forEach(item => {
              if (item?.trek_id !== undefined && item?.trek_name !== undefined) {
                nameMap[item.trek_id] = item.trek_name;
              }
            });
            
            // Update the trek events with names
            trekEvents = trekEvents.map(trek => ({
              ...trek,
              trek_name: nameMap[trek.trek_id] || `Trek ${trek.trek_id}`
            }));
          }
        } catch (nameErr) {
          console.log("Error fetching trek_name:", nameErr);
          // Try with 'name' instead
          try {
            const altNameResult = await supabase
              .from('trek_events')
              .select('trek_id, name')
              .in('trek_id', trekEvents.map(t => t.trek_id));
              
            if (!altNameResult.error && altNameResult.data) {
              // Create a mapping of trek_id to name
              const nameMap = {};
              for (const item of altNameResult.data) {
                nameMap[item.trek_id] = item.name;
              }
              
              // Update the trek events with names
              trekEvents = trekEvents.map(trek => ({
                ...trek,
                trek_name: nameMap[trek.trek_id] || `Trek ${trek.trek_id}`
              }));
            }
          } catch (altNameErr) {
            console.log("Error fetching alternative name:", altNameErr);
          }
        }
        
        // Try to fetch difficulty/category
        let categoryMap = {};
        try {
          const difficultyResult = await supabase
            .from('trek_events')
            .select('trek_id, difficulty')
            .in('trek_id', trekEvents.map(t => t.trek_id));
            
          if (!difficultyResult.error && difficultyResult.data) {
            // Create a mapping of trek_id to difficulty
            for (const item of difficultyResult.data) {
              categoryMap[item.trek_id] = item.difficulty;
            }
          }
        } catch (diffErr) {
          console.log("Error fetching difficulty:", diffErr);
          // Try with 'category' instead
          try {
            const categoryResult = await supabase
              .from('trek_events')
              .select('trek_id, category')
              .in('trek_id', trekEvents.map(t => t.trek_id));
              
            if (!categoryResult.error && categoryResult.data) {
              // Type the data array explicitly
              const safeData = categoryResult.data as Array<{trek_id?: number, category?: string}>;
              safeData.forEach(item => {
                if (item?.trek_id !== undefined && item?.category !== undefined) {
                  categoryMap[item.trek_id] = item.category;
                }
              });
            }
          } catch (catErr) {
            console.log("Error fetching category:", catErr);
          }
        }
        
        // Try to fetch cost/base_price
        let costMap = {};
        try {
          const costResult = await supabase
            .from('trek_events')
            .select('trek_id, cost')
            .in('trek_id', trekEvents.map(t => t.trek_id));
            
          if (!costResult.error && costResult.data) {
            // Type the data array explicitly
            const safeData = costResult.data as Array<{trek_id?: number, cost?: number}>;
            safeData.forEach(item => {
              if (item?.trek_id !== undefined && item?.cost !== undefined) {
                costMap[item.trek_id] = item.cost;
              }
            });
          }
        } catch (costErr) {
          console.log("Error fetching cost:", costErr);
          // Try with 'base_price' instead
          try {
            const priceResult = await supabase
              .from('trek_events')
              .select('trek_id, base_price')
              .in('trek_id', trekEvents.map(t => t.trek_id));
              
            if (!priceResult.error && priceResult.data) {
              // Create a mapping of trek_id to base_price
              for (const item of priceResult.data) {
                costMap[item.trek_id] = item.base_price;
              }
            }
          } catch (priceErr) {
            console.log("Error fetching base_price:", priceErr);
          }
        }
        
        // Create final trek objects combining all the data
        const mappedTreks = trekEvents.map(trek => ({
            trek_id: trek.trek_id,
            trek_name: trek.trek_name || `Trek ${trek.trek_id}`,
            category: categoryMap[trek.trek_id] || 'General',
            start_datetime: trek.start_datetime,
            cost: costMap[trek.trek_id] || 0,
            max_participants: trek.max_participants || 0,
            description: trek.description,
            image_url: null
        })) as Trek[];
        
        setTreks(mappedTreks);
        setParticipantCounts({});
      } else {
        setTreks([]);
        setParticipantCounts({});
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
    try {
      await Promise.all(
        treks.map(async (trek) => {
          const { data, error } = await supabase
            .from('trek_registrations')
            .select('user_id, payment_status', { count: 'exact', head: true }) // Use count for efficiency
            .eq('trek_id', trek.trek_id)
            .not('payment_status', 'eq', 'Cancelled');
          
          // Supabase count might be null if query fails or has no rows
          // Need to check for error explicitly
          if (error) {
             console.error(`Error fetching count for trek ${trek.trek_id}:`, error);
             counts[trek.trek_id] = 0; // Default to 0 on error
          } else {
             // If no error, use the count. It will be 0 if no registrations found.
             const { count } = await supabase
                .from('trek_registrations')
                .select('user_id', { count: 'exact' })
                .eq('trek_id', trek.trek_id)
                .not('payment_status', 'eq', 'Cancelled')
                .then(res => ({ count: res.count ?? 0 })); // Fetch actual count safely
             counts[trek.trek_id] = count;
          }
        })
      );
      setParticipantCounts(counts);
    } catch (err) {
      console.error("Error in Promise.all for participant counts:", err);
      // Optionally set counts to 0 or handle the error state
    }
  };

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
    // Simple placeholder, can be expanded with specific icons per category
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
                    alt={trek.trek_name} 
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
               <h3 className="font-semibold text-lg mb-2 line-clamp-1 group-hover:text-primary transition-colors">{trek.trek_name}</h3>
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
                 <span className="font-bold text-lg">{formatCurrency(trek.cost)}</span>
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
        {/* <Skeleton className="h-4 w-4 rounded-full" /> Placeholder for potential icon */}
      </div>
    </div>
  </div>
);
