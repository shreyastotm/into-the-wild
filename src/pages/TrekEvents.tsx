import React, { useEffect, useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from '@/components/auth/AuthProvider';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { TrekFilters, FilterOptions } from '@/components/trek/TrekFilters';
import { TrekCardsLoadingGrid } from '@/components/trek/TrekCardSkeleton';

// Define type for Trek Events
interface TrekEvent {
  trek_id: number;
  trek_name: string;
  description: string | null;
  category: string | null;
  start_datetime: string;
  duration: string | null;
  cost: number;
  max_participants: number;
  current_participants: number | null;
  location: any | null; // Using any for geography type
  transport_mode: 'cars' | 'mini_van' | 'bus' | null;
  cancellation_policy: string | null;
}

export default function TrekEvents() {
  const { user } = useAuth();
  const [trekEvents, setTrekEvents] = useState<TrekEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<TrekEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    search: '',
    category: '',
    priceRange: '',
    sortBy: 'date-asc',
    timeFrame: '',
  });

  useEffect(() => {
    fetchTrekEvents();
  }, []);

  useEffect(() => {
    filterEvents();
  }, [trekEvents, filterOptions]);

  async function fetchTrekEvents() {
    try {
      setLoading(true);
      
      // Fetch all trek events
      const { data, error } = await supabase
        .from('trek_events')
        .select('*')
        .order('start_datetime', { ascending: true });
      
      if (error) {
        throw error;
      }
      
      if (data) {
        // Use type assertion to ensure compatibility
        const events = data as TrekEvent[];
        setTrekEvents(events);
        setFilteredEvents(events);
        
        // Extract unique categories
        const uniqueCategories = Array.from(
          new Set(events.map(trek => trek.category).filter(Boolean) as string[])
        ).sort();
        setCategories(uniqueCategories);
      }
    } catch (error: any) {
      toast({
        title: "Error fetching trek events",
        description: error.message || "Failed to load trek events",
        variant: "destructive",
      });
      console.error("Error fetching trek events:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleFilterChange = (key: keyof FilterOptions, value: string) => {
    setFilterOptions(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const resetFilters = () => {
    setFilterOptions({
      search: '',
      category: '',
      priceRange: '',
      sortBy: 'date-asc',
      timeFrame: '',
    });
  };

  const filterEvents = () => {
    let filtered = [...trekEvents];
    
    // Filter by search text
    if (filterOptions.search) {
      const searchLower = filterOptions.search.toLowerCase();
      filtered = filtered.filter(trek => 
        trek.trek_name.toLowerCase().includes(searchLower) ||
        (trek.description && trek.description.toLowerCase().includes(searchLower))
      );
    }
    
    // Filter by category
    if (filterOptions.category) {
      filtered = filtered.filter(trek => trek.category === filterOptions.category);
    }
    
    // Filter by price range
    if (filterOptions.priceRange) {
      const [min, max] = filterOptions.priceRange.split('-').map(Number);
      filtered = filtered.filter(trek => trek.cost >= min && trek.cost <= max);
    }
    
    // Filter by time frame
    if (filterOptions.timeFrame) {
      const now = new Date();
      const startOfToday = new Date(now);
      startOfToday.setHours(0, 0, 0, 0);
      
      if (filterOptions.timeFrame === 'this-week') {
        const endOfWeek = new Date(now);
        endOfWeek.setDate(now.getDate() + (7 - now.getDay()));
        endOfWeek.setHours(23, 59, 59, 999);
        
        filtered = filtered.filter(trek => {
          const trekDate = new Date(trek.start_datetime);
          return trekDate >= startOfToday && trekDate <= endOfWeek;
        });
      } else if (filterOptions.timeFrame === 'this-month') {
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        
        filtered = filtered.filter(trek => {
          const trekDate = new Date(trek.start_datetime);
          return trekDate >= startOfToday && trekDate <= endOfMonth;
        });
      } else if (filterOptions.timeFrame === 'next-3-months') {
        const threeMonthsFromNow = new Date(now);
        threeMonthsFromNow.setMonth(now.getMonth() + 3);
        threeMonthsFromNow.setHours(23, 59, 59, 999);
        
        filtered = filtered.filter(trek => {
          const trekDate = new Date(trek.start_datetime);
          return trekDate >= startOfToday && trekDate <= threeMonthsFromNow;
        });
      }
    }
    
    // Apply sorting
    if (filterOptions.sortBy) {
      const [field, direction] = filterOptions.sortBy.split('-');
      const isAsc = direction === 'asc';
      
      filtered.sort((a, b) => {
        if (field === 'date') {
          const dateA = new Date(a.start_datetime).getTime();
          const dateB = new Date(b.start_datetime).getTime();
          return isAsc ? dateA - dateB : dateB - dateA;
        } else if (field === 'price') {
          return isAsc ? a.cost - b.cost : b.cost - a.cost;
        } else if (field === 'name') {
          return isAsc 
            ? a.trek_name.localeCompare(b.trek_name)
            : b.trek_name.localeCompare(a.trek_name);
        }
        return 0;
      });
    }
    
    setFilteredEvents(filtered);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Trek Events</h1>
        {user && (
          <Link to="/trek-events/create">
            <Button>Create New Event</Button>
          </Link>
        )}
      </div>

      <TrekFilters 
        options={filterOptions}
        onFilterChange={handleFilterChange}
        onReset={resetFilters}
        categories={categories}
      />

      {loading ? (
        <TrekCardsLoadingGrid />
      ) : filteredEvents.length === 0 ? (
        <div className="text-center py-10">
          {filterOptions.search || filterOptions.category || filterOptions.priceRange || filterOptions.timeFrame ? (
            <>
              <p className="text-lg text-gray-600 mb-4">No treks match your filters</p>
              <Button variant="outline" onClick={resetFilters}>Clear Filters</Button>
            </>
          ) : (
            <p className="text-lg text-gray-600">No trek events available</p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((trek) => (
            <Link to={`/trek-events/${trek.trek_id}`} key={trek.trek_id}>
              <div className="border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                <div className="p-4">
                  <div className="flex justify-between mb-2">
                    <h2 className="text-xl font-semibold">{trek.trek_name}</h2>
                    {trek.category && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        {trek.category}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-700 mb-3">{trek.description?.substring(0, 150)}{trek.description && trek.description.length > 150 ? '...' : ''}</p>
                  <div className="flex justify-between text-sm text-gray-600">
                    <div>
                      <p>
                        <span className="font-medium">Date:</span>{" "}
                        {new Date(trek.start_datetime).toLocaleDateString()}
                      </p>
                      <p>
                        <span className="font-medium">Duration:</span> {trek.duration || "Not specified"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">₹{trek.cost}</p>
                      <p>
                        {trek.current_participants || 0}/{trek.max_participants} participants
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
