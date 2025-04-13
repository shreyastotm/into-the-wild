
import React, { useState, useEffect } from 'react';
import { TrekEventsList } from '@/components/trek/TrekEventsList';
import { TrekFilters, FilterOptions } from '@/components/trek/TrekFilters';
import { NoTreksFound } from '@/components/trek/NoTreksFound';
import { supabase } from '@/integrations/supabase/client';
import { addDays, addMonths, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { toast } from '@/components/ui/use-toast';
import { TrekCardSkeleton } from '@/components/trek/TrekCardSkeleton';

const TrekEvents = () => {
  const [treks, setTreks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    search: '',
    category: '',
    priceRange: '',
    timeFrame: '',
    sortBy: 'date-asc'
  });

  useEffect(() => {
    fetchTreks();
    fetchCategories();
  }, [filterOptions]);

  const fetchCategories = async () => {
    try {
      // Fetch unique categories from trek_events
      const { data, error } = await supabase
        .from('trek_events')
        .select('category')
        .not('category', 'is', null);
      
      if (error) throw error;
      
      if (data) {
        // Extract unique categories
        const uniqueCategories = Array.from(new Set(data.map(item => item.category))).filter(Boolean);
        setCategories(uniqueCategories as string[]);
      }
    } catch (error: any) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchTreks = async () => {
    try {
      setLoading(true);
      
      // Start with base query
      let query = supabase.from('trek_events').select('*');
      
      // Apply search filter
      if (filterOptions.search) {
        query = query.or(`trek_name.ilike.%${filterOptions.search}%,description.ilike.%${filterOptions.search}%`);
      }
      
      // Apply category filter
      if (filterOptions.category) {
        query = query.eq('category', filterOptions.category);
      }
      
      // Apply price range filter
      if (filterOptions.priceRange) {
        const [min, max] = filterOptions.priceRange.split('-').map(Number);
        query = query.gte('cost', min).lte('cost', max);
      }
      
      // Apply time frame filter
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
        // Default to only showing future treks
        query = query.gte('start_datetime', new Date().toISOString());
      }
      
      // Apply sorting
      if (filterOptions.sortBy) {
        const [field, direction] = filterOptions.sortBy.split('-');
        
        switch (field) {
          case 'date':
            query = query.order('start_datetime', { ascending: direction === 'asc' });
            break;
          case 'price':
            query = query.order('cost', { ascending: direction === 'asc' });
            break;
          case 'name':
            query = query.order('trek_name', { ascending: direction === 'asc' });
            break;
        }
      } else {
        // Default sort by date ascending
        query = query.order('start_datetime', { ascending: true });
      }
      
      // Execute the query
      const { data, error } = await query;
      
      if (error) throw error;
      
      setTreks(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching treks",
        description: error.message || "Failed to load trek events",
        variant: "destructive",
      });
      console.error("Error fetching treks:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof FilterOptions, value: string) => {
    setFilterOptions(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilterOptions({
      search: '',
      category: '',
      priceRange: '',
      timeFrame: '',
      sortBy: 'date-asc'
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <h1 className="text-3xl font-bold mb-4 md:mb-0">Trek Events</h1>
      </div>
      
      <TrekFilters 
        options={filterOptions}
        onFilterChange={handleFilterChange}
        onReset={resetFilters}
        categories={categories}
      />
      
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <TrekCardSkeleton key={index} />
          ))}
        </div>
      ) : treks.length > 0 ? (
        <TrekEventsList treks={treks} />
      ) : (
        <NoTreksFound onReset={resetFilters} />
      )}
    </div>
  );
};

export default TrekEvents;
