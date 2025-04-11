
import { useState, useEffect } from 'react';
import { supabase, WithStringId } from "@/integrations/supabase/client";
import { useAuth } from '@/components/auth/AuthProvider';
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
  current_participants: number | null;
  location: any | null;
  route_data: any | null;
  transport_mode: 'cars' | 'mini_van' | 'bus' | null;
  vendor_contacts: any | null;
  pickup_time_window: string | null;
  cancellation_policy: string | null;
  event_creator_type: 'internal' | 'external' | null;
  partner_id: number | null;
}

interface DbRegistration {
  registration_id: number;
  trek_id: number;
  user_id: string; // Changed to string to match the UUID format
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
        setTrekEvent(data as TrekEvent);
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

  async function checkUserRegistration(trekId: number) {
    if (!user) return;
    
    try {
      // Using string for user_id and explicitly casting trekId to number
      const { data, error } = await supabase
        .from('registrations')
        .select('*')
        .eq('trek_id', trekId)
        .eq('user_id', user.id) // user.id is a string UUID
        .maybeSingle();
      
      if (error) {
        throw error;
      }
      
      if (data) {
        // Ensure we're working with a string user_id
        const registration = {
          ...data,
          user_id: data.user_id.toString()
        } as Registration;
        setUserRegistration(registration);
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

      // Using type assertion to handle the string/number type mismatch
      const { error: registrationError } = await supabase
        .from('registrations')
        .insert({
          trek_id: trekEvent.trek_id,
          user_id: user.id, // This is already a string UUID
          payment_status: 'Pending'
        } as any); // Using 'any' to bypass type checking for now
      
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
