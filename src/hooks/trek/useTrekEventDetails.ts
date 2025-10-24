import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import {
  Event,
  EventType,
  CampingItinerary,
  ActivitySchedule,
  VolunteerRoles,
} from "@/types/trek";

interface TrekEvent {
  trek_id: number;
  trek_name: string;
  description: string | null;
  category: string | null;
  start_datetime: string;
  end_datetime: string;
  difficulty: string | null;
  status:
    | "planned"
    | "confirmed"
    | "ongoing"
    | "completed"
    | "cancelled"
    | "draft"
    | null;
  duration: string | null;
  cost: number;
  max_participants: number;
  participant_count: number | null;
  location: Record<string, unknown> | null;
  route_data: Record<string, unknown> | null;
  transport_mode: "cars" | "mini_van" | "bus" | "self_drive" | null;
  vendor_contacts: Record<string, unknown> | null;
  pickup_time_window: string | null;
  cancellation_policy: string | null;
  partner_id: string | null;
  image_url?: string | null;
  is_finalized?: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
  government_id_required?: boolean | null;
  // New fields for event types
  event_type: EventType;
  itinerary?: CampingItinerary | null;
  activity_schedule?: ActivitySchedule | null;
  volunteer_roles?: VolunteerRoles | null;
}

export function useTrekEventDetails(trek_id: string | undefined) {
  const [trekEvent, setTrekEvent] = useState<TrekEvent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (trek_id && !isNaN(parseInt(trek_id))) {
      fetchTrekEvent(parseInt(trek_id));
    } else if (trek_id) {
      console.error(
        "Invalid trek_id provided to useTrekEventDetails:",
        trek_id,
      );
      setTrekEvent(null);
      setLoading(false);
    }
  }, [trek_id]);

  async function fetchTrekEvent(trek_id: number) {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("trek_events")
        .select("*")
        .eq("trek_id", trek_id)
        .single() as any;

      if (error) {
        throw error;
      }

      if (data) {
        setTrekEvent({
          trek_id: data.trek_id,
          trek_name: data.name,
          description: data.description,
          category: data.category,
          start_datetime: data.start_datetime,
          end_datetime: data.end_datetime,
          difficulty: data.difficulty,
          status: data.status as TrekEvent["status"],
          duration: data.duration as string | null,
          cost: data.base_price,
          max_participants: data.max_participants,
          participant_count: null,
          location: data.location,
          route_data: data.route_data,
          transport_mode: data.transport_mode as TrekEvent["transport_mode"],
          vendor_contacts: data.vendor_contacts,
          pickup_time_window: data.pickup_time_window,
          cancellation_policy: data.cancellation_policy,
          partner_id: data.partner_id,
          image_url: data.image_url || data.image || null,
          is_finalized: data.is_finalized,
          created_at: data.created_at,
          updated_at: data.updated_at,
          government_id_required: data.government_id_required,
          // New event type fields
          event_type: (data.event_type as EventType) || EventType.TREK,
          itinerary: data.itinerary as CampingItinerary | null,
          activity_schedule: data.activity_schedule as ActivitySchedule | null,
          volunteer_roles: data.volunteer_roles as VolunteerRoles | null,
        });
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to load trek event details";
      toast({
        title: "Error fetching trek event",
        description: errorMessage,
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
    setTrekEvent,
  };
}

export type { TrekEvent };
