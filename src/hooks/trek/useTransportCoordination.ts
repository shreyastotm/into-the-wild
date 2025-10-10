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
  const [availableDrivers, setAvailableDrivers] = useState<Array<{
    user_id: string;
    full_name: string;
    vehicle_type?: string;
    vehicle_name?: string;
    registration_number?: string;
    seats_available?: number;
  }>>([]);

  const fetchTransportData = useCallback(async () => {
    if (!trekId) return;
    
    setLoading(true);
    try {
      const numericTrekId = parseInt(trekId, 10);
      
      // --- Fetch Drivers (Two-Step Approach) ---
      const { data: rawDriversData, error: rawDriversError } = await supabase
        .from('trek_drivers')
        .select('*') // Select all driver fields including vehicle_info
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

          // Handle vehicle details - prefer individual columns, fallback to vehicle_info JSON
          let vehicleDetails = {
            vehicle_type: driver.vehicle_type || '',
            vehicle_name: driver.vehicle_name || '',
            registration_number: driver.registration_number || '',
            seats_available: driver.seats_available || 0
          };

          // If vehicle_info exists (could be JSONB or TEXT), try to parse it
          if (driver.vehicle_info) {
            try {
              let vehicleInfo;
              if (typeof driver.vehicle_info === 'object') {
                vehicleInfo = driver.vehicle_info as Record<string, unknown>;
              } else if (typeof driver.vehicle_info === 'string') {
                // Handle case where vehicle_info is stored as TEXT
                vehicleInfo = JSON.parse(driver.vehicle_info);
              }

              if (vehicleInfo && typeof vehicleInfo === 'object') {
                vehicleDetails = {
                  vehicle_type: vehicleInfo.vehicle_type || vehicleInfo.vehicle_type || driver.vehicle_type || '',
                  vehicle_name: vehicleInfo.vehicle_name || vehicleInfo.vehicle_name || driver.vehicle_name || '',
                  registration_number: vehicleInfo.registration_number || vehicleInfo.registration_number || driver.registration_number || '',
                  seats_available: vehicleInfo.seats_available || vehicleInfo.seats_available || driver.seats_available || 0
                };
              }
            } catch (error) {
              // If parsing fails, use individual columns
              console.warn('Failed to parse vehicle_info, using individual columns:', error);
            }
          }

          return {
            user_id: driver.user_id,
            full_name: userDetail?.name || null,
            avatar_url: userDetail?.avatar_url || null,
            vehicle_details: vehicleDetails,
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

  const fetchAvailableDrivers = useCallback(async () => {
    if (!trekId) return;

    try {
      const numericTrekId = parseInt(trekId, 10);

      // Get all registrations for this trek
      const { data: registrations, error: regError } = await supabase
        .from('trek_registrations')
        .select('user_id')
        .eq('trek_id', numericTrekId)
        .not('payment_status', 'eq', 'Cancelled');

      if (regError) throw regError;

      if (registrations && registrations.length > 0) {
        const userIds = registrations.map(r => r.user_id);

        // Get user profiles with vehicle info
        const { data: users, error: userError } = await supabase
          .from('users')
          .select('user_id, name, has_car, car_seating_capacity, vehicle_number, transport_volunteer_opt_in')
          .in('user_id', userIds)
          .eq('has_car', true)
          .eq('transport_volunteer_opt_in', true);

        if (userError) throw userError;

        const drivers = (users || []).map(user => ({
          user_id: user.user_id,
          full_name: user.name || 'Unknown',
          vehicle_type: user.car_seating_capacity <= 5 ? 'Car (5 Seater)' :
                       user.car_seating_capacity <= 8 ? 'SUV/MUV (6-8 seater)' : 'Mini-van (Tempo, Force ..)',
          vehicle_name: user.vehicle_number || 'Personal Vehicle',
          registration_number: user.vehicle_number || '',
          seats_available: user.car_seating_capacity || 0
        }));

        setAvailableDrivers(drivers);
      }
    } catch (error) {
      console.error('Error fetching available drivers:', error);
    }
  }, [trekId]);

  useEffect(() => {
    if (trekId) {
      fetchTransportData();
      fetchAvailableDrivers();
    }
  }, [trekId, fetchTransportData, fetchAvailableDrivers]);

  const processLocationsData = (locationsData: Array<Record<string, unknown>>): PickupLocation[] => {
    return locationsData.map(location => ({
      id: location.id.toString(),
      name: location.name,
      address: location.address,
      coordinates: {
        latitude: location.latitude || 0,
        longitude: location.longitude || 0
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

  // --- Admin: CRUD for Pickup Locations ---
  const createPickupLocation = async (location: { name: string; address: string; latitude?: number; longitude?: number; }) => {
    if (!trekId) return false;
    try {
      const numericTrekId = parseInt(trekId, 10);
      const { error } = await supabase
        .from('trek_pickup_locations')
        .insert({
          trek_id: numericTrekId,
          name: location.name,
          address: location.address,
          latitude: location.latitude ?? null,
          longitude: location.longitude ?? null,
          time: new Date().toISOString(), // Include the time column that exists in DB
        } as Record<string, unknown>);
      if (error) {
        console.error('Database error details:', error);
        throw new Error(`Failed to create pickup location: ${error.message}. Please check if the database schema is properly updated.`);
      }
      await fetchTransportData();
      toast({ title: 'Pickup location added', variant: 'default' });
      return true;
    } catch (error) {
      console.error('Error creating pickup location:', error);
      toast({ title: 'Failed to add location', variant: 'destructive' });
      return false;
    }
  };

  const updatePickupLocation = async (id: string, update: { name?: string; address?: string; latitude?: number; longitude?: number; }) => {
    try {
      const numericId = parseInt(id, 10);
      const { error } = await supabase
        .from('trek_pickup_locations')
        .update({
          name: update.name,
          address: update.address,
          latitude: update.latitude,
          longitude: update.longitude,
          time: new Date().toISOString(), // Update the time column that exists in DB
        } as Record<string, unknown>)
        .eq('id', numericId);
      if (error) throw error;
      await fetchTransportData();
      toast({ title: 'Pickup location updated', variant: 'default' });
      return true;
    } catch (error) {
      console.error('Error updating pickup location:', error);
      toast({ title: 'Failed to update location', variant: 'destructive' });
      return false;
    }
  };

  const deletePickupLocation = async (id: string) => {
    try {
      const numericId = parseInt(id, 10);
      const { error } = await supabase
        .from('trek_pickup_locations')
        .delete()
        .eq('id', numericId);
      if (error) throw error;
      await fetchTransportData();
      toast({ title: 'Pickup location removed', variant: 'default' });
      return true;
    } catch (error) {
      console.error('Error deleting pickup location:', error);
      toast({ title: 'Failed to delete location', variant: 'destructive' });
      return false;
    }
  };

  // --- Admin: Manage Drivers ---
  const upsertDriver = async (driver: { user_id: string; vehicle_type?: string; vehicle_name?: string; registration_number?: string; seats_available?: number; }) => {
    if (!trekId) return false;
    try {
      const numericTrekId = parseInt(trekId, 10);

      // Prepare vehicle info - handle both JSONB and TEXT storage
      const vehicleInfoObj = {
        vehicle_type: driver.vehicle_type || '',
        vehicle_name: driver.vehicle_name || '',
        registration_number: driver.registration_number || '',
        seats_available: driver.seats_available || 0
      };

      // Try to send as JSON, but fallback to individual columns if needed
      const insertData = {
        trek_id: numericTrekId,
        user_id: driver.user_id,
        vehicle_type: driver.vehicle_type ?? null,
        vehicle_name: driver.vehicle_name ?? null,
        registration_number: driver.registration_number ?? null,
        seats_available: driver.seats_available ?? 0,
      };

      // Only add vehicle_info if we can determine it's JSONB type
      // For now, let the database handle the conversion
      try {
        // Try sending as JSON string first (for TEXT columns)
        insertData.vehicle_info = JSON.stringify(vehicleInfoObj);
      } catch (error) {
        console.warn('Failed to stringify vehicle_info, sending as object');
        insertData.vehicle_info = vehicleInfoObj;
      }

      const { error } = await supabase
        .from('trek_drivers')
        .upsert(insertData as Record<string, unknown>);
      if (error) {
        console.error('Database error details:', error);
        throw new Error(`Failed to save driver: ${error.message}. Please check if the database schema is properly updated.`);
      }
      await fetchTransportData();
      toast({ title: 'Driver saved', variant: 'default' });
      return true;
    } catch (error) {
      console.error('Error upserting driver:', error);
      toast({ title: 'Failed to save driver', variant: 'destructive' });
      return false;
    }
  };

  const removeDriver = async (driverUserId: string) => {
    if (!trekId) return false;
    try {
      const numericTrekId = parseInt(trekId, 10);
      const { error } = await supabase
        .from('trek_drivers')
        .delete()
        .eq('trek_id', numericTrekId)
        .eq('user_id', driverUserId);
      if (error) throw error;
      await fetchTransportData();
      toast({ title: 'Driver removed', variant: 'default' });
      return true;
    } catch (error) {
      console.error('Error removing driver:', error);
      toast({ title: 'Failed to remove driver', variant: 'destructive' });
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
    availableDrivers,
    assignDriverToParticipant,
    updatePickupStatus,
    setParticipantPickupLocation,
    refreshData: fetchTransportData,
    // Admin helpers
    createPickupLocation,
    updatePickupLocation,
    deletePickupLocation,
    upsertDriver,
    removeDriver
  };
} 