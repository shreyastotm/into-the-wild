
import { useState, useEffect } from 'react';
import { supabase, WithStringId, convertDbRecordToStringIds } from "@/integrations/supabase/client";
import { useAuth } from '@/components/auth/AuthProvider';
import { toast } from '@/components/ui/use-toast';
import { userIdToNumber } from '@/utils/dbTypeConversions';
import { useTrekEventDetails } from './useTrekEventDetails';

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

export function useTrekRegistration(trekId: string | undefined) {
  const { user } = useAuth();
  const { trekEvent, loading: trekLoading, setTrekEvent } = useTrekEventDetails(trekId);
  const [registering, setRegistering] = useState(false);
  const [userRegistration, setUserRegistration] = useState<Registration | null>(null);

  useEffect(() => {
    if (trekId && user) {
      checkUserRegistration(parseInt(trekId));
    }
  }, [trekId, user]);

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
    loading: trekLoading,
    registering,
    userRegistration,
    registerForTrek,
    cancelRegistration
  };
}
