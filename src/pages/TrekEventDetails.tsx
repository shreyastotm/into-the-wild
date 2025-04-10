
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from '@/components/auth/AuthProvider';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

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

interface Registration {
  registration_id: number;
  trek_id: number;
  user_id: string;
  booking_datetime: string;
  payment_status: 'Pending' | 'Paid' | 'Cancelled';
}

export default function TrekEventDetails() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [trekEvent, setTrekEvent] = useState<TrekEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [userRegistration, setUserRegistration] = useState<Registration | null>(null);

  useEffect(() => {
    if (id) {
      fetchTrekEvent(parseInt(id));
      if (user) {
        checkUserRegistration(parseInt(id));
      }
    }
  }, [id, user]);

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
        setTrekEvent(data);
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
      const { data, error } = await supabase
        .from('registrations')
        .select('*')
        .eq('trek_id', trekId)
        .eq('user_id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned" which is expected if not registered
        throw error;
      }
      
      if (data) {
        setUserRegistration(data);
      }
    } catch (error: any) {
      console.error("Error checking registration:", error);
    }
  }

  async function handleRegister() {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to register for this trek",
        variant: "default",
      });
      navigate('/auth');
      return;
    }

    if (!trekEvent) return;

    try {
      setRegistering(true);
      
      // First check if the trek is full
      if (trekEvent.current_participants && trekEvent.current_participants >= trekEvent.max_participants) {
        toast({
          title: "Registration failed",
          description: "This trek is already full",
          variant: "destructive",
        });
        return;
      }

      // Create a registration
      const { error: registrationError } = await supabase
        .from('registrations')
        .insert({
          trek_id: trekEvent.trek_id,
          user_id: user.id,
          payment_status: 'Pending'
        });
      
      if (registrationError) {
        throw registrationError;
      }

      // Update current participants count
      const newParticipantCount = (trekEvent.current_participants || 0) + 1;
      const { error: updateError } = await supabase
        .from('trek_events')
        .update({ current_participants: newParticipantCount })
        .eq('trek_id', trekEvent.trek_id);
      
      if (updateError) {
        throw updateError;
      }

      // Update local state
      setTrekEvent({
        ...trekEvent,
        current_participants: newParticipantCount
      });
      
      // Fetch the created registration
      await checkUserRegistration(trekEvent.trek_id);
      
      toast({
        title: "Registration successful",
        description: "You have been registered for this trek. Please complete payment to confirm your spot.",
        variant: "default",
      });
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.message || "Failed to register for this trek",
        variant: "destructive",
      });
      console.error("Registration error:", error);
    } finally {
      setRegistering(false);
    }
  }

  async function handleCancelRegistration() {
    if (!user || !userRegistration || !trekEvent) return;

    try {
      setRegistering(true);
      
      // Update registration to cancelled
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

      // Update current participants count
      const newParticipantCount = Math.max((trekEvent.current_participants || 0) - 1, 0);
      const { error: updateTrekError } = await supabase
        .from('trek_events')
        .update({ current_participants: newParticipantCount })
        .eq('trek_id', trekEvent.trek_id);
      
      if (updateTrekError) {
        throw updateTrekError;
      }

      // Update local state
      setTrekEvent({
        ...trekEvent,
        current_participants: newParticipantCount
      });
      
      // Update registration status
      setUserRegistration({
        ...userRegistration,
        payment_status: 'Cancelled'
      });
      
      toast({
        title: "Registration cancelled",
        description: "Your registration has been cancelled",
        variant: "default",
      });
    } catch (error: any) {
      toast({
        title: "Cancellation failed",
        description: error.message || "Failed to cancel registration",
        variant: "destructive",
      });
      console.error("Cancellation error:", error);
    } finally {
      setRegistering(false);
    }
  }

  if (loading) {
    return <div className="container mx-auto px-4 py-8 text-center">Loading trek details...</div>;
  }

  if (!trekEvent) {
    return <div className="container mx-auto px-4 py-8 text-center">Trek event not found</div>;
  }

  const isFull = (trekEvent.current_participants || 0) >= trekEvent.max_participants;
  const isRegistered = userRegistration !== null;
  const isCancelled = userRegistration?.payment_status === 'Cancelled';

  return (
    <div className="container mx-auto px-4 py-8">
      <Button 
        variant="outline" 
        className="mb-4"
        onClick={() => navigate('/trek-events')}
      >
        ← Back to Trek Events
      </Button>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">{trekEvent.trek_name}</CardTitle>
              <CardDescription>
                {trekEvent.category && (
                  <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm mr-2">
                    {trekEvent.category}
                  </span>
                )}
                <span className="text-gray-500">
                  {new Date(trekEvent.start_datetime).toLocaleDateString()} at {new Date(trekEvent.start_datetime).toLocaleTimeString()}
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <p>{trekEvent.description}</p>
                
                <Separator className="my-4" />
                
                <h3 className="text-xl font-semibold">Trek Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium">Duration</h4>
                    <p>{trekEvent.duration || 'Not specified'}</p>
                  </div>
                  <div>
                    <h4 className="font-medium">Transport Mode</h4>
                    <p>{trekEvent.transport_mode || 'Not specified'}</p>
                  </div>
                  <div>
                    <h4 className="font-medium">Max Participants</h4>
                    <p>{trekEvent.max_participants}</p>
                  </div>
                  <div>
                    <h4 className="font-medium">Current Registrations</h4>
                    <p>{trekEvent.current_participants || 0} participants</p>
                  </div>
                </div>
                
                {trekEvent.pickup_time_window && (
                  <>
                    <h3 className="text-xl font-semibold mt-4">Pickup Details</h3>
                    <p>{trekEvent.pickup_time_window}</p>
                  </>
                )}
                
                {trekEvent.cancellation_policy && (
                  <>
                    <h3 className="text-xl font-semibold mt-4">Cancellation Policy</h3>
                    <p>{trekEvent.cancellation_policy}</p>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Registration</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold mb-4">₹{trekEvent.cost}</p>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-1">
                  <span className="font-medium">Available:</span> {trekEvent.max_participants - (trekEvent.current_participants || 0)} spots left
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full" 
                    style={{ width: `${((trekEvent.current_participants || 0) / trekEvent.max_participants) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              {isRegistered && !isCancelled ? (
                <>
                  <div className="bg-green-50 border border-green-200 rounded-md p-3 mb-4">
                    <p className="text-green-800">
                      You're registered for this trek!
                    </p>
                    <p className="text-sm text-green-600">
                      Payment Status: <span className="font-medium">{userRegistration?.payment_status}</span>
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={handleCancelRegistration}
                    disabled={registering}
                  >
                    {registering ? 'Processing...' : 'Cancel Registration'}
                  </Button>
                </>
              ) : isCancelled ? (
                <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
                  <p className="text-gray-800">
                    Your registration was cancelled
                  </p>
                </div>
              ) : (
                <Button 
                  className="w-full"
                  onClick={handleRegister}
                  disabled={isFull || registering || !user}
                >
                  {registering ? 'Processing...' : isFull ? 'Trek Full' : 'Register Now'}
                </Button>
              )}
              
              {!user && (
                <p className="text-sm text-gray-500 mt-2 text-center">
                  Please log in to register for this trek
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
