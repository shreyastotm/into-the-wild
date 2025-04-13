import { useState, useEffect } from 'react';
import { supabase, WithStringId, convertDbRecordToStringIds } from "@/integrations/supabase/client";
import { useAuth } from '@/components/auth/AuthProvider';
import { toast } from '@/components/ui/use-toast';
import { userIdToNumber } from '@/utils/dbTypeConversions';

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

interface DbRegistration {
  registration_id: number;
  trek_id: number;
  user_id: number;
  booking_datetime: string;
  payment_status: 'Pending' | 'Paid' | 'Cancelled';
  cancellation_datetime?: string | null;
  penalty_applied?: number | null;
  created_at?: string | null;
}

type Registration = WithStringId<DbRegistration>;

export function useTrekEvent(trekId: string | undefined) {
  const { user } = useAuth();
  const [trekEvent, setTrekEvent] = useState<TrekEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [userRegistration, setUserRegistration] = useState<Registration | null>(null);

  useEffect(() => {
    if (trekId) {
      fetchTrekEvent(parseInt(trekId));
      if (user) {
        checkUserRegistration(parseInt(trekId));
      }
    }
  }, [trekId, user]);

  async function fetchTrekEvent(trekId: number) {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('trek_events')
        .select('*')
        .eq('trek_id', trekId)
        .single();
      
      if (error) {
        throw error;
      }
      
      if (data) {
        // If we have images in the future, we can fetch from storage
        // const imageUrl = data.image_path 
        //   ? await getImageUrl(data.image_path) 
        //   : null;
        
        setTrekEvent({
          ...data as TrekEvent,
          // image_url: imageUrl
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

  async function checkUserRegistration(trekId: number) {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('registrations')
        .select('*')
        .eq('trek_id', trekId)
        .eq('user_id', userIdToNumber(user.id))
        .maybeSingle();
      
      if (error) {
        throw error;
      }
      
      if (data) {
        setUserRegistration(convertDbRecordToStringIds(data as DbRegistration));
      }
    } catch (error: any) {
      console.error("Error checking registration:", error);
    }
  }

  async function registerForTrek() {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to register for this trek",
        variant: "default",
      });
      return false;
    }

    if (!trekEvent) return false;

    try {
      setRegistering(true);
      
      if (trekEvent.current_participants && trekEvent.current_participants >= trekEvent.max_participants) {
        toast({
          title: "Registration failed",
          description: "This trek is already full",
          variant: "destructive",
        });
        return false;
      }

      const { error: registrationError } = await supabase
        .from('registrations')
        .insert({
          trek_id: trekEvent.trek_id,
          user_id: userIdToNumber(user.id),
          payment_status: 'Pending',
          booking_datetime: new Date().toISOString()
        });
      
      if (registrationError) {
        throw registrationError;
      }

      const newParticipantCount = (trekEvent.current_participants || 0) + 1;
      const { error: updateError } = await supabase
        .from('trek_events')
        .update({ current_participants: newParticipantCount })
        .eq('trek_id', trekEvent.trek_id);
      
      if (updateError) {
        throw updateError;
      }

      setTrekEvent({
        ...trekEvent,
        current_participants: newParticipantCount
      });
      
      await checkUserRegistration(trekEvent.trek_id);
      
      toast({
        title: "Registration successful",
        description: "You have been registered for this trek. Please complete payment to confirm your spot.",
        variant: "default",
      });
      
      return true;
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.message || "Failed to register for this trek",
        variant: "destructive",
      });
      console.error("Registration error:", error);
      return false;
    } finally {
      setRegistering(false);
    }
  }

  async function cancelRegistration() {
    if (!user || !userRegistration || !trekEvent) return false;

    try {
      setRegistering(true);
      
      const { error: updateRegError } = await supabase
        .from('registrations')
        .update({ 
          payment_status: 'Cancelled',
          cancellation_datetime: new Date().toISOString()
        })
        .eq('registration_id', userRegistration.registration_id);
      
      if (updateRegError) {
        throw updateRegError;
      }

      const newParticipantCount = Math.max((trekEvent.current_participants || 0) - 1, 0);
      const { error: updateTrekError } = await supabase
        .from('trek_events')
        .update({ current_participants: newParticipantCount })
        .eq('trek_id', trekEvent.trek_id);
      
      if (updateTrekError) {
        throw updateTrekError;
      }

      setTrekEvent({
        ...trekEvent,
        current_participants: newParticipantCount
      });
      
      setUserRegistration({
        ...userRegistration,
        payment_status: 'Cancelled'
      });
      
      toast({
        title: "Registration cancelled",
        description: "Your registration has been cancelled",
        variant: "default",
      });
      
      return true;
    } catch (error: any) {
      toast({
        title: "Cancellation failed",
        description: error.message || "Failed to cancel registration",
        variant: "destructive",
      });
      console.error("Cancellation error:", error);
      return false;
    } finally {
      setRegistering(false);
    }
  }

  return {
    trekEvent,
    loading,
    registering,
    userRegistration,
    registerForTrek,
    cancelRegistration
  };
}

// Future enhancement: Add a hook for fetching treks with pagination
export function useTreks() {
  const [treks, setTreks] = useState<TrekEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const pageSize = 9;

  // This is a placeholder for future implementation
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
