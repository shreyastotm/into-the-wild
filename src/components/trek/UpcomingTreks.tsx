import { format, formatRelative } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { Calendar, MapPin, Navigation, Users } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency, getUniqueParticipantCount } from "@/lib/utils";
import { formatIndianDate } from "@/utils/indianStandards";

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
  status?: string | null;
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
  status: string | null;
}

export const UpcomingTreks: React.FC<{ limit?: number }> = ({ limit = 3 }) => {
  const [treks, setTreks] = useState<Trek[]>([]);
  const [loading, setLoading] = useState(true);
  const [participantCounts, setParticipantCounts] = useState<
    Record<number, number>
  >({});
  const navigate = useNavigate();

  const fetchUpcomingTreks = useCallback(async () => {
    try {
      setLoading(true);
      const now = new Date().toISOString();

      // Simplified query using current schema names - filter out cancelled treks
      const { data, error } = (await supabase
        .from("trek_events")
        .select(
          "trek_id, name, category, difficulty, start_datetime, base_price, max_participants, description, image_url, status",
        )
        .gt("start_datetime", now)
        .neq("status", "Cancelled")
        .order("start_datetime", { ascending: true })
        .limit(limit)) as any;

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
            try {
              const { data: urlData } = (await supabase.storage
                .from("trek_assets")
                .getPublicUrl(trek.image_url)) as any;
              imageUrl = urlData.publicUrl;
            } catch (error) {
              console.error("Error getting image URL:", error);
              imageUrl = null;
            }
          }
          return {
            trek_id: trek.trek_id,
            name: trek.name ?? "Unnamed Trek",
            category: trek.category ?? null,
            difficulty: trek.difficulty ?? null,
            start_datetime: trek.start_datetime ?? new Date().toISOString(),
            base_price: trek.base_price ?? 0,
            max_participants: trek.max_participants ?? 0,
            description: trek.description ?? null,
            image_url: imageUrl,
            status: trek.status ?? null,
          };
        }),
      );

      setTreks(mappedTreks);
      setParticipantCounts({});
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to load upcoming treks";
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
            const { count, error } = (await supabase
              .from("trek_registrations")
              .select("registration_id", { count: "exact" }) // Select minimal column, keep count
              .eq("trek_id", trek.trek_id)
              .not("payment_status", "eq", "Cancelled")) as any;

            if (error) {
              console.error(
                `Error fetching count for trek ${trek.trek_id}:`,
                error,
              );
              counts[trek.trek_id] = 0; // Default to 0 on error
            } else {
              // Use the count directly if available
              counts[trek.trek_id] = count || 0;
            }
          } catch (err) {
            console.error(
              `Error processing count for trek ${trek.trek_id}:`,
              err,
            );
            counts[trek.trek_id] = 0;
          }
        }),
      );
      setParticipantCounts(counts);
    } catch (err) {
      console.error("Error in Promise.all for participant counts:", err);
      // Set all counts to 0 on error
      const zeroCounts = treks.reduce(
        (acc, trek) => {
          acc[trek.trek_id] = 0;
          return acc;
        },
        {} as Record<number, number>,
      );
      setParticipantCounts(zeroCounts);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Remove treks dependency to prevent infinite loop

  useEffect(() => {
    fetchUpcomingTreks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [limit]); // Remove fetchUpcomingTreks dependency to prevent infinite loop

  // Fetch counts only after treks are loaded
  useEffect(() => {
    if (treks.length > 0) {
      fetchAllParticipantCounts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [treks.length]); // Depend on treks.length instead of treks array and function

  const toIndianTime = (utcDateString: string) => {
    try {
      const date = new Date(utcDateString);
      if (isNaN(date.getTime())) throw new Error("Invalid date string");
      return toZonedTime(date, "Asia/Kolkata");
    } catch (e) {
      console.error("Error converting date to Indian time:", utcDateString, e);
      return new Date(); // Return current date as fallback
    }
  };

  const getCategoryColor = (category: string | null): string => {
    if (!category) return "bg-green-100 text-green-800";

    const colorMap: Record<string, string> = {
      Beginner: "bg-green-100 text-green-800",
      Intermediate: "bg-orange-100 text-orange-800",
      Advanced: "bg-red-100 text-red-800",
      Family: "bg-green-100 text-green-800",
      Weekend: "bg-orange-100 text-orange-800",
      Overnight: "bg-green-100 text-green-800",
      "Day Trek": "bg-orange-100 text-orange-800",
    };

    return colorMap[category] || "bg-green-100 text-green-800";
  };

  const getCategoryGradient = (category: string | null): string => {
    if (!category) return "from-green-200 to-green-300";

    const gradientMap: Record<string, string> = {
      Beginner: "from-green-200 to-green-300",
      Intermediate: "from-orange-200 to-orange-300",
      Advanced: "from-red-200 to-red-300",
      Family: "from-green-200 to-green-300",
      Weekend: "from-orange-200 to-orange-300",
      Overnight: "from-green-200 to-green-300",
      "Day Trek": "from-orange-200 to-orange-300",
    };

    return gradientMap[category] || "from-green-200 to-green-300";
  };

  const getCategoryIcon = (category: string | null) => {
    // Default navigation icon for all categories
    return <Navigation className="h-12 w-12 opacity-40 text-gray-600" />;
  };

  const treksWithCounts: TrekWithCount[] = treks.map((trek) => ({
    ...trek,
    participant_count: participantCounts[trek.trek_id] ?? 0, // Default to 0 if count not yet fetched
  }));

  if (loading) {
    return null;
  }

  if (treks.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        No upcoming treks found matching your criteria.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 items-center">
      {treksWithCounts.map((trek) => {
        const indianTime = toIndianTime(trek.start_datetime);
        return (
          <div
            key={trek.trek_id}
            className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow group"
            onClick={() => navigate(`/glass-event-details/${trek.trek_id}`)}
          >
            <div className="h-56 bg-gray-200 relative overflow-hidden rounded-t-xl">
              {/* Image or Gradient Background */}
              {trek.image_url ? (
                <img
                  src={trek.image_url}
                  alt={trek.name}
                  className="absolute inset-0 object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                  onError={(e) => {
                    console.error("Image failed to load:", trek.image_url);
                    e.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                <div
                  className={`absolute inset-0 flex items-center justify-center bg-gradient-to-br ${getCategoryGradient(trek.category)}`}
                >
                  <div className="flex flex-col items-center text-center px-4">
                    <Navigation className="h-12 w-12 opacity-40 text-gray-600" />
                    <span className="mt-2 text-lg font-medium text-gray-700 opacity-80">
                      {trek.category || "Trek"}
                    </span>
                  </div>
                </div>
              )}

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

              {/* Category Badge */}
              {trek.category && (
                <div className="absolute bottom-4 left-4">
                  <span
                    className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full border ${getCategoryColor(trek.category)}`}
                  >
                    {trek.category}
                  </span>
                </div>
              )}
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                {trek.name}
              </h3>

              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {trek.description ||
                  "Join us for an amazing trekking experience!"}
              </p>

              {/* Meta Info */}
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {formatIndianDate(indianTime)}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {trek.participant_count}/{trek.max_participants}
                </span>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-primary">
                  {trek.base_price === 0 ? (
                    <Badge variant="secondary" className="text-xl">
                      Free
                    </Badge>
                  ) : (
                    formatCurrency(trek.base_price, "INR")
                  )}
                </div>
                <Button variant="primary" size="sm" className="w-full">
                  View Details
                </Button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
