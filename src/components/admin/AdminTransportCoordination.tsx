import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/use-toast';
import { Car, Plus, MapPin, Trash2, Edit, RefreshCw, Users } from 'lucide-react';
import { fetchTrekRegistrationUserIds, fetchUsersByIds } from '@/lib/supabaseHelpers';

interface Driver {
  driver_id: number;
  trek_id: number;
  user_id: string;
  vehicle_info: string;
  seating_capacity: number;
  user_name?: string;
}

interface Pickup {
  id: number;
  trek_id: number;
  name: string;
  address: string;
  latitude?: number | null;
  longitude?: number | null;
}

interface Assignment {
  assignment_id: number;
  trek_id: number;
  driver_id: string;
  participant_id: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  pickup_location_id: number;
  participant_name?: string;
  driver_name?: string;
  pickup_name?: string;
}

export function AdminTransportCoordination() {
  const { trekId } = useParams<{ trekId: string }>();
  const numericTrekId = trekId ? parseInt(trekId, 10) : undefined;

  const [loading, setLoading] = useState(true);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [locations, setLocations] = useState<Pickup[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [participants, setParticipants] = useState<{id: string, name: string}[]>([]);
  
  const [addDriverOpen, setAddDriverOpen] = useState(false);
  const [addLocationOpen, setAddLocationOpen] = useState(false);
  const [addAssignmentOpen, setAddAssignmentOpen] = useState(false);
  
  const [newDriver, setNewDriver] = useState<{
    user_id: string;
    vehicle_info: string;
    seating_capacity: number;
  }>({
    user_id: '',
    vehicle_info: '',
    seating_capacity: 4
  });
  
  const [newLocation, setNewLocation] = useState<{
    name: string;
    address: string;
    latitude?: number | string;
    longitude?: number | string;
  }>({
    name: '',
    address: '',
    latitude: '',
    longitude: '',
  });
  
  const [newAssignment, setNewAssignment] = useState<{
    driver_id: string;
    participant_id: string;
    pickup_location_id: number;
    status: 'pending' | 'confirmed' | 'cancelled';
  }>({
    driver_id: '',
    participant_id: '',
    pickup_location_id: 0,
    status: 'pending'
  });

  useEffect(() => {
    if (numericTrekId) {
      fetchTransportData();
      fetchParticipants();
    }
  }, [numericTrekId]);

  const fetchTransportData = async () => {
    if (!numericTrekId) return;
    
    setLoading(true);
    try {
      // --- Fetch Drivers (Two-Step Approach - Already implemented) ---
      const { data: rawDriversData, error: rawDriversError } = await supabase
        .from('trek_drivers')
        .select('*') 
        .eq('trek_id', numericTrekId);
      if (rawDriversError) throw rawDriversError;

      let driversWithNames: Driver[] = [];
      if (rawDriversData && rawDriversData.length > 0) {
        const driverUserIds = [...new Set(rawDriversData.map(d => d.user_id).filter(Boolean))];
        let driverUserDetails: { user_id: string; name: string }[] = [];
        if (driverUserIds.length > 0) {
          const { data: driverUsersData, error: driverUsersError } = await supabase
            .from('users').select('user_id, name').in('user_id', driverUserIds);
          if (driverUsersError) console.error('Error fetching driver user details:', driverUsersError);
          else driverUserDetails = (driverUsersData as { user_id: string; name: string }[]) || [];
        }
        driversWithNames = rawDriversData.map((driver: any) => {
          const userDetail = driverUserDetails.find(u => u.user_id === driver.user_id);
          return { ...driver, user_name: userDetail?.name || 'Unknown Driver' };
        });
      }
      setDrivers(driversWithNames); // Set drivers state early
      
      // --- Fetch Pickup Locations (Seems OK, keep as is) ---
      const { data: locationsData, error: locationsError } = await supabase
        .from('trek_pickup_locations')
        .select('*')
        .eq('trek_id', numericTrekId);
      if (locationsError) throw locationsError;
      setLocations((locationsData as Pickup[]) || []); // Use updated Pickup type
      
      // --- Fetch Assignments (Two-Step Approach) ---
      // Step 1: Fetch raw assignments
      const { data: rawAssignmentsData, error: rawAssignmentsError } = await supabase
        .from('trek_driver_assignments')
        .select('*') // Fetch all assignment fields
        .eq('trek_id', numericTrekId);
        
      if (rawAssignmentsError) {
        console.error('Error fetching raw assignments data:', rawAssignmentsError);
        throw rawAssignmentsError;
      }
      
      // Step 2: Combine with already fetched driver, participant, and location details
      // Note: This assumes fetchParticipants has successfully run and populated the 'participants' state
      let populatedAssignments: Assignment[] = [];
      if (rawAssignmentsData && rawAssignmentsData.length > 0) {
          populatedAssignments = rawAssignmentsData.map((assignment: any) => {
            const driverInfo = driversWithNames.find(d => d.driver_id === assignment.driver_id);
            const participantInfo = participants.find(p => p.id === assignment.participant_id); // Uses participants state
            const locationInfo = ((locationsData as Pickup[]) || []).find(l => l.id === assignment.pickup_location_id); // Use l.id
            
            return {
              ...assignment,
              participant_name: participantInfo?.name || 'Unknown Participant',
              driver_name: driverInfo?.user_name || 'Unknown Driver',
              pickup_name: locationInfo?.name || 'Unknown Location'
            };
        });
      }
      
      setAssignments(populatedAssignments);

    } catch (error) {
      console.error('Error fetching transport data (potentially during assignments):', error);
      toast({
        title: 'Error',
        description: 'Failed to load some transport coordination data',
        variant: 'destructive'
      });
      // Clear potentially partial data on error
      setDrivers([]);
      setLocations([]);
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchParticipants = async () => {
    if (!numericTrekId) return;
    
    try {
      // Use our helper functions instead of direct Supabase queries
      const userIds = await fetchTrekRegistrationUserIds(numericTrekId);
      
      if (userIds.length === 0) {
        setParticipants([]);
        return;
      }

      // Fetch user details using the helper
      const usersData = await fetchUsersByIds(userIds);
      
      // Format for the participants state
      const participantsList = usersData.map(user => ({
        id: user.user_id,
        // Use name or full_name, whichever is available
        name: user.name || user.full_name || 'Unknown Participant'
      }));
      
      setParticipants(participantsList);
    } catch (error) {
      console.error('Error fetching participants:', error);
      toast({ title: 'Error', description: 'Could not load participants list', variant: 'destructive' });
      setParticipants([]); // Ensure participants list is cleared on error
    }
  };
  
  const handleAddDriver = async () => {
    if (!numericTrekId || !newDriver.user_id) {
      toast({ title: 'Missing Info', description: 'Please select a user.', variant: 'destructive' });
      return;
    }
    
    try {
      const { error } = await supabase
        .from('trek_drivers')
        .insert({
          trek_id: numericTrekId,
          user_id: newDriver.user_id,
          vehicle_info: newDriver.vehicle_info,
          seating_capacity: newDriver.seating_capacity
        })
        .select();
        
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Driver added successfully',
        variant: 'default'
      });
      
      setAddDriverOpen(false);
      setNewDriver({
        user_id: '',
        vehicle_info: '',
        seating_capacity: 4
      });
      
      fetchTransportData();
    } catch (error) {
      console.error('Error adding driver:', error);
      toast({
        title: 'Error',
        description: 'Failed to add driver',
        variant: 'destructive'
      });
    }
  };
  
  const handleAddLocation = async () => {
    if (!numericTrekId || !newLocation.name || !newLocation.address) {
       toast({ title: 'Missing Info', description: 'Name and Address are required.', variant: 'destructive' });
       return;
    }
    
    try {
      // Prepare data for insert, converting lat/lon if provided
      const locationToInsert: any = {
        trek_id: numericTrekId,
        name: newLocation.name,
        address: newLocation.address,
      };
      if (newLocation.latitude !== '' && newLocation.latitude !== undefined && newLocation.latitude !== null) {
        locationToInsert.latitude = parseFloat(String(newLocation.latitude));
      }
      if (newLocation.longitude !== '' && newLocation.longitude !== undefined && newLocation.longitude !== null) {
        locationToInsert.longitude = parseFloat(String(newLocation.longitude));
      }

      const { error } = await supabase.from('trek_pickup_locations').insert(locationToInsert);
       if (error) throw error;
       toast({ title: 'Success', description: 'Pickup location added.'});
       // Reset state according to new structure
       setNewLocation({ name: '', address: '', latitude: '', longitude: '' });
       setAddLocationOpen(false);
       fetchTransportData(); // Refresh data
    } catch (error: any) {
      console.error("Error adding location:", error);
      // Improved error message display
      let message = 'Could not add location.';
      if (error instanceof Error) {
        message = error.message;
      } else if (typeof error === 'string') {
        message = error;
      }
      toast({ title: 'Error', description: message, variant: 'destructive' });
    }
  };
  
  const handleAddAssignment = async () => {
    if (!numericTrekId || !newAssignment.driver_id || !newAssignment.participant_id || !newAssignment.pickup_location_id) {
      toast({ title: 'Missing Info', description: 'Please select driver, participant, and pickup location.', variant: 'destructive' });
      return;
    }
    
    try {
      const { error } = await supabase.from('trek_driver_assignments').insert({
        trek_id: numericTrekId,
        driver_id: newAssignment.driver_id,
        participant_id: newAssignment.participant_id,
        pickup_location_id: newAssignment.pickup_location_id,
        pickup_status: newAssignment.status
      });
      if (error) throw error;
      toast({ title: 'Success', description: 'Assignment created.' });
      setNewAssignment({ driver_id: '', participant_id: '', pickup_location_id: 0, status: 'pending' });
      setAddAssignmentOpen(false);
      fetchTransportData();
    } catch (error: any) {
      console.error("Error adding assignment:", error);
      toast({ title: 'Error', description: error.message || 'Could not create assignment.', variant: 'destructive' });
    }
  };
  
  const handleUpdateAssignment = async (assignment_id: number, status: 'confirmed' | 'cancelled') => {
    try {
      const { error } = await supabase
        .from('trek_driver_assignments')
        .update({ pickup_status: status })
        .eq('id', assignment_id);
      if (error) throw error;
      toast({ title: 'Success', description: 'Assignment status updated.' });
      fetchTransportData();
    } catch (error: any) {
      console.error("Error updating assignment:", error);
      toast({ title: 'Error', description: error.message || 'Could not update assignment.', variant: 'destructive' });
    }
  };
  
  const handleDeleteDriver = async (driver_id: number) => {
    try {
      const { error } = await supabase
        .from('trek_drivers')
        .delete()
        .eq('id', driver_id);
        
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Driver removed successfully',
        variant: 'default'
      });
      
      fetchTransportData();
    } catch (error) {
      console.error('Error deleting driver:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove driver',
        variant: 'destructive'
      });
    }
  };
  
  const handleDeleteLocation = async (location_id: number) => {
    try {
      const { error } = await supabase
        .from('trek_pickup_locations')
        .delete()
        .eq('id', location_id);
        
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Pickup location removed successfully',
        variant: 'default'
      });
      
      fetchTransportData();
    } catch (error) {
      console.error('Error deleting location:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove pickup location',
        variant: 'destructive'
      });
    }
  };
  
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Car className="h-5 w-5" />
          Transport Coordination Management
        </CardTitle>
        <CardDescription>
          Manage drivers, pickup locations, and participant assignments
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="drivers">
          <TabsList className="mb-4">
            <TabsTrigger value="drivers">Drivers</TabsTrigger>
            <TabsTrigger value="locations">Pickup Locations</TabsTrigger>
            <TabsTrigger value="assignments">Participant Assignments</TabsTrigger>
          </TabsList>
          
          <TabsContent value="drivers" className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Registered Drivers</h3>
              <Dialog open={addDriverOpen} onOpenChange={setAddDriverOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-1">
                    <Plus className="h-4 w-4" /> Add Driver
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Driver</DialogTitle>
                    <DialogDescription>
                      Register a new driver for this trek
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="grid gap-4 py-4">
                    <div>
                      <Label htmlFor="user_id">Select Participant</Label>
                      <Select 
                        value={newDriver.user_id} 
                        onValueChange={(value) => setNewDriver({...newDriver, user_id: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a participant" />
                        </SelectTrigger>
                        <SelectContent>
                          {participants.map((p) => (
                            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="vehicle_info">Vehicle Information</Label>
                      <Input 
                        id="vehicle_info" 
                        value={newDriver.vehicle_info}
                        onChange={(e) => setNewDriver({...newDriver, vehicle_info: e.target.value})}
                        placeholder="e.g., Red Toyota Innova (KA-01-AB-1234)"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="seating_capacity">Seating Capacity</Label>
                      <Input 
                        id="seating_capacity" 
                        type="number"
                        min={1}
                        max={20}
                        value={newDriver.seating_capacity}
                        onChange={(e) => setNewDriver({...newDriver, seating_capacity: parseInt(e.target.value)})}
                      />
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setAddDriverOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="button" onClick={handleAddDriver}>
                      Add Driver
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            
            {loading ? (
              <p>Loading drivers...</p>
            ) : drivers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No drivers registered yet
              </div>
            ) : (
              <div className="space-y-4">
                {drivers.map((driver) => (
                  <Card key={driver.driver_id}>
                    <CardContent className="pt-6 flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{driver.user_name}</h4>
                        <p className="text-sm text-muted-foreground">{driver.vehicle_info}</p>
                        <p className="text-sm">Capacity: {driver.seating_capacity} seats</p>
                      </div>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => handleDeleteDriver(driver.driver_id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="locations" className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Pickup Locations</h3>
              <Dialog open={addLocationOpen} onOpenChange={setAddLocationOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-1">
                    <Plus className="h-4 w-4" /> Add Location
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Pickup Location</DialogTitle>
                    <DialogDescription>
                      Enter details for a new pickup point for drivers.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="location-name" className="text-right">
                        Name
                      </Label>
                      <Input
                        id="location-name"
                        value={newLocation.name}
                        onChange={(e) => setNewLocation({ ...newLocation, name: e.target.value })}
                        className="col-span-3"
                        placeholder="e.g., Central Bus Station"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="location-address" className="text-right">
                        Address
                      </Label>
                      <Input
                        id="location-address"
                        value={newLocation.address}
                        onChange={(e) => setNewLocation({ ...newLocation, address: e.target.value })}
                        className="col-span-3"
                        placeholder="Full address details"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="location-latitude" className="text-right">
                        Latitude
                      </Label>
                      <Input
                        id="location-latitude"
                        type="number"
                        value={newLocation.latitude}
                        onChange={(e) => setNewLocation({ ...newLocation, latitude: e.target.value })}
                        className="col-span-3"
                        placeholder="e.g., 12.9716 (Optional)"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="location-longitude" className="text-right">
                        Longitude
                      </Label>
                      <Input
                        id="location-longitude"
                        type="number"
                        value={newLocation.longitude}
                        onChange={(e) => setNewLocation({ ...newLocation, longitude: e.target.value })}
                        className="col-span-3"
                        placeholder="e.g., 77.5946 (Optional)"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setAddLocationOpen(false)}>Cancel</Button>
                    <Button onClick={handleAddLocation}>Add Location</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            
            {loading ? (
              <p>Loading locations...</p>
            ) : locations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No pickup locations added yet
              </div>
            ) : (
              <div className="space-y-4">
                {locations.map((location) => (
                  <Card key={location.id}>
                    <CardContent className="pt-6 flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{location.name}</h4>
                        <p className="text-sm text-muted-foreground">{location.address}</p>
                      </div>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => handleDeleteLocation(location.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="assignments" className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Participant Assignments</h3>
              <Dialog open={addAssignmentOpen} onOpenChange={setAddAssignmentOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-1">
                    <Plus className="h-4 w-4" /> Assign Participant
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Assign Participant to Driver</DialogTitle>
                    <DialogDescription>
                      Create a new assignment for pickup.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="driver-select" className="text-right">
                        Driver
                      </Label>
                      <Select 
                        value={newAssignment.driver_id}
                        onValueChange={(value) => setNewAssignment({...newAssignment, driver_id: value})}
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Select a driver" />
                        </SelectTrigger>
                        <SelectContent>
                          {drivers.map((d) => (
                            <SelectItem key={d.driver_id} value={d.user_id}> 
                              {d.user_name || 'Loading...'} ({d.vehicle_info} - {d.seating_capacity} seats)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="participant-select" className="text-right">
                        Participant
                      </Label>
                      <Select
                        value={newAssignment.participant_id}
                        onValueChange={(value) => setNewAssignment({ ...newAssignment, participant_id: value })}
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Select a participant" />
                        </SelectTrigger>
                        <SelectContent>
                          {participants.map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="pickup-location-select" className="text-right">
                        Pickup Location
                      </Label>
                      <Select 
                        value={newAssignment.pickup_location_id?.toString()}
                        onValueChange={(value) => setNewAssignment({...newAssignment, pickup_location_id: parseInt(value, 10)})}
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Select a pickup location" />
                        </SelectTrigger>
                        <SelectContent>
                          {locations.map((l) => (
                            <SelectItem key={l.id} value={l.id.toString()}> 
                              {l.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                     <Button variant="outline" onClick={() => setAddAssignmentOpen(false)}>Cancel</Button>
                     <Button onClick={handleAddAssignment}>Assign</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            
            {loading ? (
              <p>Loading assignments...</p>
            ) : assignments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No participant assignments yet
              </div>
            ) : (
              <div className="space-y-4">
                {assignments.map((assignment) => (
                  <Card key={assignment.assignment_id}>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium">{assignment.participant_name}</h4>
                          <p className="text-sm text-muted-foreground">
                            Driver: {assignment.driver_name}
                          </p>
                          <p className="text-sm">
                            Pickup: {assignment.pickup_name}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          {assignment.status === 'pending' && (
                            <>
                              <Button 
                                variant="default" 
                                size="sm"
                                onClick={() => handleUpdateAssignment(assignment.assignment_id, 'confirmed')}
                              >
                                Confirm
                              </Button>
                              <Button 
                                variant="destructive" 
                                size="sm"
                                onClick={() => handleUpdateAssignment(assignment.assignment_id, 'cancelled')}
                              >
                                Cancel
                              </Button>
                            </>
                          )}
                          {assignment.status === 'confirmed' && (
                            <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                              Confirmed
                            </div>
                          )}
                          {assignment.status === 'cancelled' && (
                            <div className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-medium">
                              Cancelled
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={fetchTransportData} className="gap-1">
          <RefreshCw className="h-4 w-4" /> Refresh Data
        </Button>
      </CardFooter>
    </Card>
  );
} 