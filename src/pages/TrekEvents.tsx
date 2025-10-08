import React, { useState, useEffect, useCallback } from 'react';
import { TrekEventsList, TrekEvent as TrekEventListItem } from '@/components/trek/TrekEventsList';
import { TrekFilters, FilterOptions } from '@/components/trek/TrekFilters';
import { NoTreksFound } from '@/components/trek/NoTreksFound';
import { supabase } from '@/integrations/supabase/client';
import { addMonths, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/auth/AuthProvider';
import { getUniqueParticipantCount } from '@/lib/utils';
import { TrekEventStatus, EventType } from '@/types/trek';

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
  transport_mode?: 'cars' | 'mini_van' | 'bus' | null;
  event_type?: EventType;
}

export type DisplayTrekEvent = TrekEventListItem;

const TrekEvents = () => {
  const [events, setEvents] = useState<DisplayTrekEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // Set page title
  React.useEffect(() => {
    document.title = 'Events - Into the Wild';
  }, []);
  const [categories, setCategories] = useState<string[]>([]);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    search: '',
    category: '',
    priceRange: '',
    timeFrame: '',
    sortBy: 'date-asc',
    eventType: '' // Add event type filter
  });
  const [participantCounts, setParticipantCounts] = useState<Record<number, number>>({});
  const navigate = useNavigate();
  const { userProfile } = useAuth();

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('trek_events')
        .select('category')
        .not('category', 'is', null);
      
      if (error) throw error;
      
      if (data) {
        const uniqueCategories = Array.from(new Set(data.map(item => item.category))).filter(Boolean);
        setCategories(uniqueCategories as string[]);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch categories";
      console.error("Error fetching categories:", error);
    }
  };

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      
      // Select with aliasing: 'name' as 'trek_name', 'base_price' as 'cost' - include event_type
      const selectString = 'trek_id,name,description,category,base_price,start_datetime,max_participants,image_url,image,location,status,duration,cancellation_policy,event_creator_type,transport_mode,event_type';
      let query = supabase.from('trek_events').select(selectString);

      // Filter out only CANCELLED events - show Draft events for public viewing
      query = query.neq('status', TrekEventStatus.CANCELLED);

      // Apply search filter (uses DB column 'name')
      if (filterOptions.search) {
        query = query.or(`name.ilike.%${filterOptions.search}%,description.ilike.%${filterOptions.search}%`);
      }
      
      // Apply category filter (uses DB column 'category')
      if (filterOptions.category) {
        query = query.eq('category', filterOptions.category);
      }

      // Apply event type filter
      if (filterOptions.eventType) {
        query = query.eq('event_type', filterOptions.eventType);
      }
      
      // Apply price range filter (uses DB column 'base_price')
      if (filterOptions.priceRange) {
        const [min, max] = filterOptions.priceRange.split('-').map(Number);
        query = query.gte('base_price', min).lte('base_price', max);
      }
      
      // Apply time frame filter (uses DB column 'start_datetime')
      if (filterOptions.timeFrame) {
        const now = new Date();
        switch (filterOptions.timeFrame) {
          case 'this-week':
            query = query.gte('start_datetime', startOfWeek(now).toISOString())
                        .lte('start_datetime', endOfWeek(now).toISOString());
            break;
          case 'this-month':
            query = query.gte('start_datetime', startOfMonth(now).toISOString())
                        .lte('start_datetime', endOfMonth(now).toISOString());
            break;
          case 'next-3-months':
            query = query.gte('start_datetime', now.toISOString())
                        .lte('start_datetime', addMonths(now, 3).toISOString());
            break;
        }
      } else {
        // Default to only showing future treks (IMPORTANT FOR "Upcoming" page)
        query = query.gte('start_datetime', new Date().toISOString());
      }
      
      // Apply sorting (uses DB columns 'start_datetime', 'base_price', 'name')
      if (filterOptions.sortBy) {
        const [field, direction] = filterOptions.sortBy.split('-');
        switch (field) {
          case 'date':
            query = query.order('start_datetime', { ascending: direction === 'asc' });
            break;
          case 'price':
            query = query.order('base_price', { ascending: direction === 'asc' });
            break;
          case 'name':
            query = query.order('name', { ascending: direction === 'asc' });
            break;
        }
      } else {
        // Default sort by date ascending
        query = query.order('start_datetime', { ascending: true });
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error("Error executing query for treks:", error);
        throw error;
      }
      
      const fetchedData = (data as FetchedTrekData[]) || []; // data is now raw from DB
      
      const newParticipantCounts: Record<number, number> = {};
      if (fetchedData && fetchedData.length > 0) {
        const countsArray = await Promise.all(
          fetchedData.map(async (trek) => {
            // Call the RPC function to get participant count
            const { data: countData, error: countError } = await supabase
              .rpc('get_trek_participant_count', { p_trek_id: trek.trek_id });
            
            if (countError) {
              console.error(`Error fetching participant count for trek ${trek.trek_id} via RPC:`, countError);
              return { trek_id: trek.trek_id, count: 0 };
            }
            return { trek_id: trek.trek_id, count: countData ?? 0 };
          })
        );
        countsArray.forEach(item => {
          newParticipantCounts[item.trek_id] = item.count;
        });
      }
      setParticipantCounts(newParticipantCounts); 


      const displayEvents: DisplayTrekEvent[] = fetchedData.map(eventFromDb => {
        const { name, base_price, ...restOfEvent } = eventFromDb;
        return {
          ...restOfEvent,
          trek_name: name, // Manual aliasing
          cost: base_price, // Manual aliasing
          participant_count: newParticipantCounts[eventFromDb.trek_id] ?? 0,
          // Ensure all fields required by TrekEventListItem are present
          duration: eventFromDb.duration || null, 
          location: eventFromDb.location || null,
          cancellation_policy: eventFromDb.cancellation_policy || null,
          event_creator_type: eventFromDb.event_creator_type || '',
          transport_mode: eventFromDb.transport_mode || null, 
        };
      });
      
      setEvents(displayEvents);

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to load events";
      toast({
        title: "Error fetching events",
        description: errorMessage,
        variant: "destructive",
      });
      console.error("Error fetching treks:", error);
    } finally {
      setLoading(false);
    }
  }, [filterOptions]);

  useEffect(() => {
    fetchEvents();
    fetchCategories();
  }, [filterOptions, fetchEvents]);

  const handleFilterChange = (key: keyof FilterOptions, value: string) => {
    setFilterOptions(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilterOptions({
      search: '',
      category: '',
      priceRange: '',
      timeFrame: '',
      sortBy: 'date-asc',
      eventType: ''
    });
  };

  return (
    <div className="py-6 sm:py-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold">Upcoming Events</h1>
        {userProfile?.user_type === 'admin' && (
          <Button
            variant="default"
            onClick={() => navigate('/trek-events/create')}
            className="shadow w-full sm:w-auto"
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
      
      {!loading && events.length > 0 ? (
        <TrekEventsList treks={events} />
      ) : !loading && events.length === 0 ? (
        <NoTreksFound />
      ) : null}
    </div>
  );
};

export default TrekEvents;
