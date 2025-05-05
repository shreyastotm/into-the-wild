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
          // Try with 'trek_name' first
          const nameResult = await supabase
            .from('trek_events')
            .select('trek_id, name')
            .in('trek_id', trekEvents.map(t => t.trek_id));
            
          if (!nameResult.error && nameResult.data) {
            // Create a mapping of trek_id to trek_name
            const nameMap: Record<number, string> = {};
            
            nameResult.data.forEach(item => {
              if (item && typeof item === 'object' && 'trek_id' in item && 'name' in item) {
                nameMap[item.trek_id] = item.name;
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
                if (item && typeof item === 'object' && 'trek_id' in item && 'name' in item) {
                  nameMap[item.trek_id] = item.name;
                }
              }
              
              // Update the trek events with names
              trekEvents = trekEvents.map(trek => ({
                ...trek,
                trek_name: nameMap[trek.trek_id] || `Trek ${trek.trek_id}`
              }));
            }
          } catch (altNameErr) {
            console.log("Error fetching alternative name:", altNameErr);
            // Set default names as fallback
            trekEvents = trekEvents.map(trek => ({
              ...trek,
              trek_name: `Trek ${trek.trek_id}`
            }));
          }
        }
        
        // Try to fetch difficulty/category more safely
        let categoryMap = {};
        try {
          // Use a safer approach: Get all columns first, then only query those that exist
          // This avoids all 400 Bad Request errors
          const { data: columns } = await supabase
            .from('trek_events')
            .select('*')
            .eq('trek_id', trekEvents[0].trek_id)
            .limit(1);
            
          if (columns && columns.length > 0) {
            const firstItem = columns[0] as Record<string, any>;
            const hasCategory = 'category' in firstItem;
            const hasDifficulty = 'difficulty' in firstItem;
            const hasImageUrl = 'image_url' in firstItem;
            
            // Fetch image URLs if they exist
            let imageMap = {};
            if (hasImageUrl) {
              const imageResult = await supabase
                .from('trek_events')
                .select('trek_id, image_url')
                .in('trek_id', trekEvents.map(t => t.trek_id));
                
              if (!imageResult.error && imageResult.data) {
                for (const item of imageResult.data) {
                  if (item && typeof item === 'object' && 'trek_id' in item && 'image_url' in item) {
                    imageMap[item.trek_id] = item.image_url;
                  }
                }
              }
            }
            
            // Only query difficulty if it exists as a column
            if (hasDifficulty) {
              const difficultyResult = await supabase
                .from('trek_events')
                .select('trek_id, difficulty')
                .in('trek_id', trekEvents.map(t => t.trek_id));
                
                if (!difficultyResult.error && difficultyResult.data) {
                  // Create a mapping of trek_id to difficulty
                  for (const item of difficultyResult.data) {
                    if (item && typeof item === 'object' && 'trek_id' in item && 'difficulty' in item) {
                      categoryMap[item.trek_id] = item.difficulty;
                    }
                  }
                }
            } 
            // Only query category if it exists and difficulty doesn't
            else if (hasCategory) {
              const categoryResult = await supabase
                .from('trek_events')
                .select('trek_id, category')
                .in('trek_id', trekEvents.map(t => t.trek_id));
                
                if (!categoryResult.error && categoryResult.data) {
                  for (const item of categoryResult.data) {
                    if (item && typeof item === 'object' && 'trek_id' in item && 'category' in item) {
                      categoryMap[item.trek_id] = item.category;
                    }
                  }
                }
            } else {
              console.log("Neither 'difficulty' nor 'category' columns exist in trek_events table");
            }
            
            // Similarly, check cost fields to avoid 400 errors
            const hasCost = 'cost' in firstItem;
            const hasBasePrice = 'base_price' in firstItem;
            
            // Try to fetch cost/base_price with the same approach
            let costMap = {};
            
            // Only query cost if it exists as a column
            if (hasCost) {
              const costResult = await supabase
                .from('trek_events')
                .select('trek_id, cost')
                .in('trek_id', trekEvents.map(t => t.trek_id));
                
                if (!costResult.error && costResult.data) {
                  for (const item of costResult.data) {
                    if (item && typeof item === 'object' && 'trek_id' in item && 'cost' in item) {
                      costMap[item.trek_id] = item.cost;
                    }
                  }
                }
            } 
            // Only query base_price if it exists and cost doesn't
            else if (hasBasePrice) {
              const priceResult = await supabase
                .from('trek_events')
                .select('trek_id, base_price')
                .in('trek_id', trekEvents.map(t => t.trek_id));
                
                if (!priceResult.error && priceResult.data) {
                  for (const item of priceResult.data) {
                    if (item && typeof item === 'object' && 'trek_id' in item && 'base_price' in item) {
                      costMap[item.trek_id] = item.base_price;
                    }
                  }
                }
            } else {
              console.log("Neither 'cost' nor 'base_price' columns exist in trek_events table");
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
                image_url: imageMap[trek.trek_id] || null
            })) as Trek[];
            
            setTreks(mappedTreks);
          } else {
            console.log("No trek data found to determine schema");
            setTreks([]);
          }
        } catch (error) {
          console.error("Error processing trek data:", error);
          // Set simple trek objects as fallback
          const simpleTrips = trekEvents.map(trek => ({
            trek_id: trek.trek_id,
            trek_name: trek.trek_name || `Trek ${trek.trek_id}`,
            category: 'General',
            start_datetime: trek.start_datetime,
            cost: 0,
            max_participants: trek.max_participants || 0,
            description: trek.description,
            image_url: null
          })) as Trek[];
          setTreks(simpleTrips);
        }
        
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
