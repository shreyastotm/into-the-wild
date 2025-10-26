import {
  addMonths,
  endOfMonth,
  endOfWeek,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "@/components/auth/AuthProvider";
import {
  MobileGrid,
  MobilePage,
  MobileSection,
} from "@/components/mobile/MobilePage";
import { EventCard } from "@/components/trek/EventCard";
import { NoTreksFound } from "@/components/trek/NoTreksFound";
import {
  TrekEvent as TrekEventListItem,
  TrekEventsList,
} from "@/components/trek/TrekEventsList";
import { FilterOptions, TrekFilters } from "@/components/trek/TrekFilters";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { supabase } from "@/integrations/supabase/client";
import { getUniqueParticipantCount } from "@/lib/utils";
import { EventType, TrekEventStatus } from "@/types/trek";

// This interface should match the shape of data AFTER aliasing in the select query
export interface FetchedTrekData {
  trek_id: number;
  name: string; // Original column name
  description: string | null;
  category: string | null;
  base_price: number; // Original column name
  start_datetime: string;
  max_participants: number;
  image_url?: string | null;
  location?: string | null;
  status?: TrekEventStatus | string | null;
  duration?: string | null;
  cancellation_policy?: string | null;
  event_creator_type?: string;
  transport_mode?: "cars" | "mini_van" | "bus" | null;
  event_type?: EventType;
}

export type DisplayTrekEvent = TrekEventListItem;

const TrekEvents = () => {
  const [events, setEvents] = useState<DisplayTrekEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Set page title
  React.useEffect(() => {
    document.title = "Events - Into the Wild";
  }, []);
  const [categories, setCategories] = useState<string[]>([]);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    search: "",
    category: "",
    priceRange: "",
    timeFrame: "",
    sortBy: "date-asc",
    eventType: "", // Add event type filter
  });
  const [participantCounts, setParticipantCounts] = useState<
    Record<number, number>
  >({});
  const [cachedParticipantCounts, setCachedParticipantCounts] = useState<
    Record<number, number>
  >({});
  const navigate = useNavigate();
  const { userProfile } = useAuth();

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("trek_events")
        .select("*")
        .not("category", "is", null) as any;

      if (error) throw error;

      if (data) {
        const uniqueCategories = Array.from(
          new Set(data.map((item) => item.category)),
        ).filter(Boolean);
        setCategories(uniqueCategories as string[]);
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch categories";
      console.error("Error fetching categories:", error);
    }
  };

  const fetchEvents = useCallback(async () => {
    const timeoutId = setTimeout(() => {
      console.error("Trek events query timed out");
      setLoading(false);
      toast({
        title: "Loading timed out",
        description: "Please check your connection and try again",
        variant: "destructive",
      });
    }, 10000); // 10 second timeout

    try {
      setLoading(true);

      // Get current filter values to avoid dependency issues
      const currentFilterOptions = filterOptions;

      // ✅ OPTIMIZED: Reduced field selection for better performance
      const selectString =
        "trek_id,name,description,category,difficulty,base_price,start_datetime,max_participants,image_url,image,location,status,duration,event_type";
      let query = supabase.from("trek_events").select(selectString);

      // Filter out only CANCELLED events - show Draft events for public viewing
      query = query.neq("status", TrekEventStatus.CANCELLED);

      // ✅ OPTIMIZED: Simplified search filter for better performance
      if (currentFilterOptions.search) {
        query = query.ilike("name", `%${currentFilterOptions.search}%`);
      }

      // Apply category filter (uses DB column 'category')
      if (currentFilterOptions.category) {
        query = query.eq("category", currentFilterOptions.category);
      }

      // Apply event type filter
      if (currentFilterOptions.eventType) {
        query = query.eq("event_type", currentFilterOptions.eventType);
      }

      // Apply price range filter (uses DB column 'base_price')
      if (currentFilterOptions.priceRange) {
        const [min, max] = currentFilterOptions.priceRange.split("-").map(Number);
        query = query.gte("base_price", min).lte("base_price", max);
      }

      // Apply time frame filter (uses DB column 'start_datetime')
      if (currentFilterOptions.timeFrame) {
        const now = new Date();
        switch (currentFilterOptions.timeFrame) {
          case "this-week":
            query = query
              .gte("start_datetime", startOfWeek(now).toISOString())
              .lte("start_datetime", endOfWeek(now).toISOString());
            break;
          case "this-month":
            query = query
              .gte("start_datetime", startOfMonth(now).toISOString())
              .lte("start_datetime", endOfMonth(now).toISOString());
            break;
          case "next-3-months":
            query = query
              .gte("start_datetime", now.toISOString())
              .lte("start_datetime", addMonths(now, 3).toISOString());
            break;
        }
      } else {
        // Default to only showing future treks (IMPORTANT FOR "Upcoming" page)
        query = query.gte("start_datetime", new Date().toISOString());
      }

      // Apply sorting (uses DB columns 'start_datetime', 'base_price', 'name')
      if (currentFilterOptions.sortBy) {
        const [field, direction] = currentFilterOptions.sortBy.split("-");
        switch (field) {
          case "date":
            query = query.order("start_datetime", {
              ascending: direction === "asc",
            });
            break;
          case "price":
            query = query.order("base_price", {
              ascending: direction === "asc",
            });
            break;
          case "name":
            query = query.order("name", { ascending: direction === "asc" });
            break;
        }
      } else {
        // Default sort by date ascending
        query = query.order("start_datetime", { ascending: true });
      }

      // ✅ OPTIMIZED: Limit results to improve performance
      query = query.limit(50);

      const { data, error } = await query;

      if (error) {
        console.error("Error executing query for treks:", error);
        throw error;
      }

      const fetchedData = (data as FetchedTrekData[]) || []; // data is now raw from DB

      // ✅ OPTIMIZED: Single query for all participant counts instead of multiple RPC calls
      const newParticipantCounts: Record<number, number> = {};
      if (fetchedData && fetchedData.length > 0) {
        const trekIds = fetchedData.map(trek => trek.trek_id);

        // Check cache first
        const cachedCounts: Record<number, number> = {};
        let needsFetch = false;

        trekIds.forEach(trekId => {
          if (cachedParticipantCounts[trekId] !== undefined) {
            cachedCounts[trekId] = cachedParticipantCounts[trekId];
          } else {
            needsFetch = true;
          }
        });

        // Only fetch if we don't have cached data
        if (needsFetch) {
          const { data: countsData, error: countsError } = await supabase
            .from("trek_registrations")
            .select("trek_event_id")
            .in("trek_event_id", trekIds);

          if (!countsError && countsData) {
            // Count registrations per trek
            const freshCounts: Record<number, number> = {};
            countsData.forEach(reg => {
              freshCounts[reg.trek_event_id] = (freshCounts[reg.trek_event_id] || 0) + 1;
            });

            // Merge cached and fresh data
            trekIds.forEach(trekId => {
              newParticipantCounts[trekId] = freshCounts[trekId] || 0;
            });

            // Update cache
            setCachedParticipantCounts(prev => ({ ...prev, ...freshCounts }));
          } else {
            // Fallback: set all to 0 if query fails
            trekIds.forEach(trekId => {
              newParticipantCounts[trekId] = 0;
            });
          }
        } else {
          // All data from cache
          trekIds.forEach(trekId => {
            newParticipantCounts[trekId] = cachedCounts[trekId];
        });
        }
      }
      setParticipantCounts(newParticipantCounts);

      const displayEvents: DisplayTrekEvent[] = fetchedData.map(
        (eventFromDb) => {
          const { name, base_price, ...restOfEvent } = eventFromDb;
          return {
            ...restOfEvent,
            trek_name: name, // Manual aliasing
            cost: base_price, // Manual aliasing
            participant_count: newParticipantCounts[eventFromDb.trek_id] ?? 0,
            // Handle image fallback: use image_url if available, otherwise use image
            image_url:
              eventFromDb.image_url || (eventFromDb as any).image || null,
            // Ensure all fields required by TrekEventListItem are present
            duration: eventFromDb.duration || null,
            location: eventFromDb.location || null,
            cancellation_policy: eventFromDb.cancellation_policy || null,
            event_creator_type: eventFromDb.event_creator_type || "",
            transport_mode: eventFromDb.transport_mode || null,
          };
        },
      );

      clearTimeout(timeoutId);
      setEvents(displayEvents);
    } catch (error: unknown) {
      clearTimeout(timeoutId);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to load events";
      toast({
        title: "Error fetching events",
        description: errorMessage,
        variant: "destructive",
      });
      console.error("Error fetching treks:", error);
      setEvents([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
    // Removed filterOptions dependency to prevent infinite loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // ✅ OPTIMIZED: Debounce filter changes to reduce query frequency
    const timeoutId = setTimeout(() => {
    fetchEvents();
    fetchCategories();
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    filterOptions.search,
    filterOptions.category,
    filterOptions.priceRange,
    filterOptions.timeFrame,
    filterOptions.sortBy,
    filterOptions.eventType,
  ]); // Depend on individual properties, not the object

  const handleFilterChange = (key: keyof FilterOptions, value: string) => {
    setFilterOptions((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilterOptions({
      search: "",
      category: "",
      priceRange: "",
      timeFrame: "",
      sortBy: "date-asc",
      eventType: "",
    });
  };

  return (
    <MobilePage>
      <MobileSection title="Upcoming Events">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mobile-gap mb-6">
          {userProfile?.user_type === "admin" && (
            <Button
              variant="default"
              onClick={() => navigate("/trek-events/create")}
              className="mobile-btn-primary w-full sm:w-auto"
            >
              + Create Event
            </Button>
          )}
        </div>

        <TrekFilters
          options={filterOptions}
          onFilterChange={handleFilterChange}
          onReset={resetFilters}
          categories={categories}
        />

        {loading ? (
          <MobileGrid>
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="mobile-skeleton h-64 rounded-2xl" />
            ))}
          </MobileGrid>
        ) : events.length > 0 ? (
          <>
            {/* Mobile: Event cards in grid */}
            {isMobile ? (
              <MobileGrid>
                {events.map((event) => (
                  <EventCard
                    key={event.trek_id}
                    trek={{
                      trek_id: event.trek_id,
                      name: event.trek_name,
                      description: event.description,
                      location: event.location || null,
                      start_datetime: event.start_datetime,
                      difficulty: event.difficulty,
                      duration: event.duration,
                      cost: event.cost,
                      max_participants: event.max_participants,
                      participant_count: event.participant_count,
                      image_url: event.image_url,
                      category: event.category,
                      event_type: event.event_type || null,
                    }}
                    onClick={() => navigate(`/trek-events/${event.trek_id}`)}
                    showProgress
                  />
                ))}
              </MobileGrid>
            ) : (
              /* Desktop: Grid layout */
              <TrekEventsList treks={events} />
            )}
          </>
        ) : (
          <NoTreksFound />
        )}
      </MobileSection>
    </MobilePage>
  );
};

export default TrekEvents;
