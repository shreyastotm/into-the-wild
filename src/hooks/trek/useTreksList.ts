import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from '@/components/ui/use-toast';

interface TrekEvent {
  trek_id: number;
  trek_name: string;
  description: string | null;
  category: string | null;
  start_datetime: string;
  duration: string | null;
  cost: number;
  max_participants: number;
  participant_count: number | null;
  location: any | null;
  route_data: any | null;
  transport_mode: 'cars' | 'mini_van' | 'bus' | null;
  vendor_contacts: any | null;
  pickup_time_window: string | null;
  cancellation_policy: string | null;
  event_creator_type: 'internal' | 'external' | null;
  partner_id: number | null;
  image_url?: string | null;
}

export function useTreksList() {
  const [treks, setTreks] = useState<TrekEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const pageSize = 9;

  async function fetchTreks(page = 1) {
    try {
      setLoading(true);
      const start = (page - 1) * pageSize;
      const end = start + pageSize - 1;
      
      const { data, error, count } = await supabase
        .from('trek_events')
        .select('*', { count: 'exact' })
        .order('start_datetime', { ascending: true })
        .range(start, end);
      
      if (error) throw new Error(error.message);
      
      setTreks(data as TrekEvent[]);
      setHasMore(count !== null && start + data.length < count);
    } catch (err: any) {
      setError(err);
      toast({
        title: "Error fetching treks",
        description: err.message || "Failed to load trek events",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  function nextPage() {
    if (hasMore) {
      setPage(p => p + 1);
    }
  }

  function prevPage() {
    if (page > 1) {
      setPage(p => p - 1);
    }
  }

  return {
    treks,
    loading,
    error,
    page,
    hasMore,
    fetchTreks,
    nextPage,
    prevPage
  };
}
