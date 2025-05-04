import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from '@/components/ui/use-toast';

interface TrekEvent {
  trek_id: number;
  trek_name: string;
  description: string | null;
  category: string | null;
  start_datetime: string;
  end_datetime: string;
  difficulty: string | null;
  status: 'planned' | 'confirmed' | 'ongoing' | 'completed' | 'cancelled' | null;
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
  partner_id: string | null;
  image_url?: string | null;
  is_finalized?: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export function useTrekEventDetails(trek_id: string | undefined) {
  const [trekEvent, setTrekEvent] = useState<TrekEvent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (trek_id) {
      fetchTrekEvent(parseInt(trek_id));
    }
  }, [trek_id]);

  async function fetchTrekEvent(trek_id: number) {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('trek_events')
        .select('*')
        .eq('trek_id', trek_id)
        .single();
      
      if (error) {
        throw error;
      }
      
      if (data) {
        setTrekEvent({
          ...data as TrekEvent,
          image_url: data.image_url || null
        });
      }
    } catch (error: any) {
      toast({
        title: "Error fetching trek event",
        description: error.message || "Failed to load trek event details",
        variant: "destructive",
      });
      console.error("Error fetching trek event:", error);
    } finally {
      setLoading(false);
    }
  }

  // Helper function to generate a URL for images in Supabase Storage
  // async function getImageUrl(path: string): Promise<string | null> {
  //   try {
  //     const { data, error } = await supabase.storage
  //       .from('trek-images')
  //       .getPublicUrl(path);
      
  //     if (error) throw error;
  //     return data.publicUrl;
  //   } catch (error) {
  //     console.error('Error getting image URL:', error);
  //     return null;
  //   }
  // }

  return {
    trekEvent,
    loading,
    setTrekEvent
  };
}

export type { TrekEvent };
