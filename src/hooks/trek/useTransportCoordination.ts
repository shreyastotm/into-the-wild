import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { toast } from '@/components/ui/use-toast';
import { useCallback } from 'react';

export interface Driver {
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  vehicle_details: VehicleDetails | null;
  assigned_participants: Participant[];
  pickup_status: Record<string, PickupStatus>;
}

export interface Participant {
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  pickup_location: PickupLocation | null;
  is_driver: boolean;
}

export interface VehicleDetails {
  vehicle_type: string;
  vehicle_name: string;
  registration_number: string;
  seats_available: number;
}

export interface PickupLocation {
  id: string;
  name: string;
  address: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

export type PickupStatus = 'pending' | 'confirmed' | 'picked_up' | 'cancelled';

export function useTransportCoordination(trekId: string | undefined) {
  const { user } = useAuth();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [pickupLocations, setPickupLocations] = useState<PickupLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [userIsDriver, setUserIsDriver] = useState(false);
  const [userIsParticipant, setUserIsParticipant] = useState(false);
  const [userAssignedDriver, setUserAssignedDriver] = useState<Driver | null>(null);
  const [userPickupLocation, setUserPickupLocation] = useState<PickupLocation | null>(null);

  const fetchTransportData = useCallback(async () => {
    if (!trekId) return;
    
    setLoading(true);
    try {
      const numericTrekId = parseInt(trekId, 10);
      
      // --- Fetch Drivers (Two-Step Approach) ---
      const { data: rawDriversData, error: rawDriversError } = await supabase
        .from('trek_drivers')
        .select('*') // Select all driver fields
        .eq('trek_id', numericTrekId);
      if (rawDriversError) throw rawDriversError;

      let driversWithNames: Driver[] = [];
      if (rawDriversData && rawDriversData.length > 0) {
        const driverUserIds = [...new Set(rawDriversData.map(d => d.user_id).filter(Boolean))];
        let driverUserDetails: { user_id: string; name: string | null; avatar_url: string | null; }[] = [];
        if (driverUserIds.length > 0) {
          const { data: driverUsersData, error: driverUsersError } = await supabase
            .from('users') // Query public.users
            .select('user_id, name, avatar_url') // Include avatar
            .in('user_id', driverUserIds);
          if (driverUsersError) console.error('Error fetching driver user details:', driverUsersError);
          else driverUserDetails = driverUsersData || [];
        }
        driversWithNames = rawDriversData.map((driver: Record<string, unknown>) => {
          const userDetail = driverUserDetails.find(u => u.user_id === driver.user_id);
          return {
            user_id: driver.user_id,
            full_name: userDetail?.name || null,
            avatar_url: userDetail?.avatar_url || null,
            vehicle_details: { // Reconstruct vehicle details
                vehicle_type: driver.vehicle_type,
                vehicle_name: driver.vehicle_name,
                registration_number: driver.registration_number,
                seats_available: driver.seats_available
            },
            assigned_participants: [], // Will be populated later
            pickup_status: {} // Will be populated later
          };
        });
      }
      
      // --- Fetch Participants (Two-Step Approach) ---
      const { data: rawParticipantsData, error: rawParticipantsError } = await supabase
        .from('trek_registrations')
        .select('user_id, pickup_location_id, is_driver') // Select necessary fields
        .eq('trek_id', numericTrekId)
        .not('payment_status', 'eq', 'Cancelled');
      if (rawParticipantsError) throw rawParticipantsError;
      
      let participantsWithDetails: Participant[] = [];
      const participantIdMap: Record<string, unknown> = {}; // Temp map to hold raw participant data
      if (rawParticipantsData && rawParticipantsData.length > 0) {
          const participantUserIds = [...new Set(rawParticipantsData.map(p => p.user_id).filter(Boolean))];
          let participantUserDetails: { user_id: string; name: string | null; avatar_url: string | null; }[] = [];
          if (participantUserIds.length > 0) {
              // Fetch user details
              const { data: participantUsersData, error: participantUsersError } = await supabase
                  .from('users') 
                  .select('user_id, name, avatar_url')
                  .in('user_id', participantUserIds);
              if (participantUsersError) console.error('Error fetching participant user details:', participantUsersError);
              else participantUserDetails = participantUsersData || [];
          }
          // Map raw data and user details, keep location_id for now
          participantsWithDetails = rawParticipantsData.map((p: Record<string, unknown>) => {
              const userDetail = participantUserDetails.find(u => u.user_id === p.user_id);
              participantIdMap[p.user_id] = p.pickup_location_id; // Store pickup_location_id temporarily
              return {
                  user_id: p.user_id,
                  full_name: userDetail?.name || null,
                  avatar_url: userDetail?.avatar_url || null,
                  pickup_location: null, // Initialize as null, will be filled below
                  is_driver: p.is_driver || false
              };
          });
      }

      // --- Fetch Pickup Locations (Still OK) ---
      const { data: locationsData, error: locationsError } = await supabase
        .from('trek_pickup_locations')
        .select('*')
        .eq('trek_id', numericTrekId);
      if (locationsError) throw locationsError;
      const processedLocations = processLocationsData(locationsData || []);
      setPickupLocations(processedLocations);

      // --- Link Locations to Participants ---
      participantsWithDetails.forEach(p => {
          const locationId = participantIdMap[p.user_id]; // Get the stored location ID
          if (locationId) { 
              const loc = processedLocations.find(l => l.id == locationId); // Use == for potential type coercion or ensure types match
              p.pickup_location = loc || null; // Assign the found Location object
          }
      });
      setParticipants(participantsWithDetails); // Set final participants state

      // --- Fetch Assignments (Raw) ---
      const { data: rawAssignmentsData, error: assignmentsError } = await supabase
        .from('trek_driver_assignments')
        .select('driver_id, participant_id, status')
        .eq('trek_id', numericTrekId);
      if (assignmentsError) throw assignmentsError;

      // --- Process Assignments Manually ---
      driversWithNames.forEach(driver => {
          driver.assigned_participants = []; // Reset
          driver.pickup_status = {}; // Keep this state name for now, but populate using 'status'
          if (rawAssignmentsData) {
              rawAssignmentsData.forEach(assignment => {
                  if (assignment.driver_id === driver.user_id) {
                      const participant = participantsWithDetails.find(p => p.user_id === assignment.participant_id);
                      if (participant) {
                          driver.assigned_participants.push(participant);
                          // Populate using the correct column name 'status'
                          // Use 'as any' temporarily to bypass TS type error
                          driver.pickup_status[participant.user_id] = ((assignment as Record<string, unknown>).status as PickupStatus) || 'pending'; 
                      }
                  }
              });
          }
      });
      setDrivers(driversWithNames); // Set final drivers state with assignments

      // Set user-specific states (using the newly populated states)
      if (user) {
        const isDriver = driversWithNames.some(driver => driver.user_id === user.id);
        const isParticipant = participantsWithDetails.some(p => p.user_id === user.id);
        const assignedDriver = driversWithNames.find(driver => 
          driver.assigned_participants.some(p => p.user_id === user.id)
        ) || null;
        const userLocation = participantsWithDetails.find(p => p.user_id === user.id)?.pickup_location || null;

        setUserIsDriver(isDriver);
        setUserIsParticipant(isParticipant);
        setUserAssignedDriver(assignedDriver);
        setUserPickupLocation(userLocation);
      }

    } catch (error) {
      console.error('Error fetching transport data (full process):', error);
      toast({
        title: "Couldn't load transport data",
        description: "There was an error loading the transport coordination data.",
        variant: "destructive"
      });
       // Clear states on error
       setDrivers([]);
       setParticipants([]);
       setPickupLocations([]);
       setUserIsDriver(false);
       setUserIsParticipant(false);
       setUserAssignedDriver(null);
       setUserPickupLocation(null);
    } finally {
      setLoading(false);
    }
  }, [trekId, user]);

  useEffect(() => {
    if (trekId) {
      fetchTransportData();
    }
  }, [trekId, fetchTransportData]);

  const processLocationsData = (locationsData: Array<Record<string, unknown>>): PickupLocation[] => {
    return locationsData.map(location => ({
      id: location.id.toString(),
      name: location.name,
      address: location.address,
      coordinates: {
        latitude: location.latitude,
        longitude: location.longitude
      }
    }));
  };

  const assignDriverToParticipant = async (driverId: string, participantId: string) => {
    if (!trekId) return false;

    try {
      const numericTrekId = parseInt(trekId, 10);
      
      const { error } = await supabase
        .from('trek_driver_assignments')
        .upsert({
          trek_id: numericTrekId,
          driver_id: driverId,
          participant_id: participantId,
          status: 'pending'
        } as Record<string, unknown>);

      if (error) throw error;

      toast({
        title: "Driver assigned",
        description: "The driver has been assigned to the participant.",
        variant: "default"
      });

      await fetchTransportData();
      return true;
    } catch (error) {
      console.error('Error assigning driver:', error);
      toast({
        title: "Assignment failed",
        description: "There was an error assigning the driver.",
        variant: "destructive"
      });
      return false;
    }
  };

  const updatePickupStatus = async (driverId: string, participantId: string, statusValue: PickupStatus) => {
    if (!trekId) return false;

    try {
      const numericTrekId = parseInt(trekId, 10);
      
      const { error } = await supabase
        .from('trek_driver_assignments')
        .update({ status: statusValue } as Record<string, unknown>)
        .eq('trek_id', numericTrekId)
        .eq('driver_id', driverId)
        .eq('participant_id', participantId);

      if (error) throw error;

      toast({
        title: "Status updated",
        description: `Pickup status updated to ${statusValue}.`,
        variant: "default"
      });

      await fetchTransportData();
      return true;
    } catch (error) {
      console.error('Error updating pickup status:', error);
      toast({
        title: "Status update failed",
        description: "There was an error updating the pickup status.",
        variant: "destructive"
      });
      return false;
    }
  };

  const setParticipantPickupLocation = async (participantId: string, locationId: string) => {
    if (!trekId) return false;

    try {
      const numericTrekId = parseInt(trekId, 10);
      const numericLocationId = parseInt(locationId, 10);
      
      const { error } = await supabase
        .from('trek_registrations')
        .update({ pickup_location_id: numericLocationId })
        .eq('trek_id', numericTrekId)
        .eq('user_id', participantId);

      if (error) throw error;

      toast({
        title: "Pickup location set",
        description: "Your pickup location has been updated.",
        variant: "default"
      });

      await fetchTransportData();
      return true;
    } catch (error) {
      console.error('Error setting pickup location:', error);
      toast({
        title: "Location update failed",
        description: "There was an error updating your pickup location.",
        variant: "destructive"
      });
      return false;
    }
  };

  return {
    drivers,
    participants,
    pickupLocations,
    loading,
    userIsDriver,
    userIsParticipant,
    userAssignedDriver,
    userPickupLocation,
    assignDriverToParticipant,
    updatePickupStatus,
    setParticipantPickupLocation,
    refreshData: fetchTransportData
  };
} 