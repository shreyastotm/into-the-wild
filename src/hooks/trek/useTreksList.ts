import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from '@/components/ui/use-toast';
import { EventType } from '@/types/trek';

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
  location: Record<string, unknown> | null;
  route_data: Record<string, unknown> | null;
  transport_mode: 'cars' | 'mini_van' | 'bus' | null;
  vendor_contacts: Record<string, unknown> | null;
  pickup_time_window: string | null;
  cancellation_policy: string | null;
  event_creator_type: 'internal' | 'external' | null;
  partner_id: number | null;
  image_url?: string | null;
  event_type: EventType;
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
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error("Failed to load trek events");
      setError(error);
      toast({
        title: "Error fetching treks",
        description: error.message,
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
