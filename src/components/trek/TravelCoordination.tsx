import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Car, MapPin, LocateFixed, Clock, Info, User, Users, AlertCircle } from 'lucide-react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/components/auth/AuthProvider';
import { useTransportCoordination, PickupStatus } from '@/hooks/trek/useTransportCoordination';

interface TravelCoordinationProps {
  transportMode?: 'cars' | 'mini_van' | 'bus' | 'self_drive' | null;
  pickupTimeWindow?: string | null;
  vendorContacts?: Record<string, { phone?: string; email?: string }> | null;
  isAdmin?: boolean;
}

export const TravelCoordination: React.FC<TravelCoordinationProps> = ({
  transportMode,
  pickupTimeWindow,
  vendorContacts,
  isAdmin = false
}) => {
  const { id: trekId } = useParams<{ id: string }>();
  const { user, userProfile } = useAuth();
  const {
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
    refreshData,
    // Admin helpers
    createPickupLocation,
    updatePickupLocation,
    deletePickupLocation,
    upsertDriver,
    removeDriver
  } = useTransportCoordination(trekId);

  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [newLocation, setNewLocation] = useState({ name: '', address: '', latitude: '', longitude: '' });
  const [newDriver, setNewDriver] = useState({ user_id: '', vehicle_type: '', vehicle_name: '', registration_number: '', seats_available: '' });

  useEffect(() => {
    if (userPickupLocation) {
      setSelectedLocation(userPickupLocation.id);
    }
  }, [userPickupLocation]);

  const handleSetPickupLocation = async () => {
    if (!user || !selectedLocation) return;
    await setParticipantPickupLocation(user.id, selectedLocation);
  };

  const handleUpdatePickupStatus = async (participantId: string, status: PickupStatus) => {
    if (!user) return;
    await updatePickupStatus(user.id, participantId, status);
  };

  const getStatusBadge = (status: PickupStatus) => {
    const statusStyles = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      confirmed: "bg-blue-100 text-blue-800 border-blue-200",
      picked_up: "bg-green-100 text-green-800 border-green-200",
      cancelled: "bg-red-100 text-red-800 border-red-200"
    };

    const statusLabels = {
      pending: "Pending",
      confirmed: "Confirmed",
      picked_up: "Picked Up",
      cancelled: "Cancelled"
    };

    return (
      <Badge className={`${statusStyles[status]} border`}>
        {statusLabels[status]}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="h-32 bg-gray-200 rounded"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (!transportMode) {
    return (
      <Alert variant="default" className="bg-amber-50 border-amber-200">
        <AlertCircle className="h-4 w-4 text-amber-600" />
        <AlertTitle>Transport details not available</AlertTitle>
        <AlertDescription>
          Transport details have not been added for this trek yet. Check back closer to the event date.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
        <h3 className="text-xl font-semibold flex items-center">
          <Car className="h-5 w-5 mr-2 text-primary" />
          Travel Coordination
        </h3>
        
        {userIsParticipant && !userIsDriver && (
          <Button size="sm" onClick={refreshData} variant="outline">
            Refresh Data
          </Button>
        )}
      </div>

      {/* General Travel Info */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">General Information</CardTitle>
        </CardHeader>
        <CardContent className="pb-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-2">
              <Car className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">Transport Mode</p>
                <p className="text-sm text-muted-foreground capitalize">
                  {transportMode?.replace('_', ' ') || 'Not specified'}
                </p>
              </div>
            </div>
            {pickupTimeWindow && (
              <div className="flex items-start gap-2">
                <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Pickup Window</p>
                  <p className="text-sm text-muted-foreground">{pickupTimeWindow}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Participant View - Set Pickup Location */}
      {userIsParticipant && !userIsDriver && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Your Pickup Details</CardTitle>
            <CardDescription>
              {userAssignedDriver 
                ? "You've been assigned to a driver. Coordinate with them for pickup." 
                : "Select your preferred pickup location."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Pickup Location Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Pickup Location</label>
              <div className="flex gap-2">
                <Select 
                  value={selectedLocation} 
                  onValueChange={setSelectedLocation}
                  disabled={!pickupLocations.length || userAssignedDriver !== null}
                >
                  <SelectTrigger className="flex-grow">
                    <SelectValue placeholder="Select pickup location" />
                  </SelectTrigger>
                  <SelectContent>
                    {pickupLocations.map(location => (
                      <SelectItem key={location.id} value={location.id}>
                        {location.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button 
                  onClick={handleSetPickupLocation} 
                  disabled={!selectedLocation || selectedLocation === userPickupLocation?.id || userAssignedDriver !== null}
                >
                  Set Location
                </Button>
              </div>
              {userPickupLocation && (
                <p className="text-sm text-muted-foreground mt-1">
                  <MapPin className="h-3.5 w-3.5 inline mr-1" />
                  {userPickupLocation.address}
                </p>
              )}
            </div>

            {/* Assigned Driver Info */}
            {userAssignedDriver && (
              <div className="pt-2">
                <h4 className="text-sm font-medium mb-2">Your Assigned Driver</h4>
                <div className="flex items-center gap-3 p-3 bg-muted rounded-md">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={userAssignedDriver.avatar_url || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {(userAssignedDriver.full_name || 'D').substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-grow">
                    <p className="font-medium">{userAssignedDriver.full_name || 'Driver'}</p>
                    <p className="text-xs text-muted-foreground">
                      {userAssignedDriver.vehicle_details?.vehicle_name} ({userAssignedDriver.vehicle_details?.registration_number})
                    </p>
                  </div>
                  <div>
                    {userAssignedDriver.pickup_status[user?.id || ''] && 
                      getStatusBadge(userAssignedDriver.pickup_status[user?.id || ''])}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Driver View */}
      {userIsDriver && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Driver Dashboard</CardTitle>
            <CardDescription>Manage your assigned passengers and pickup status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Vehicle Info */}
            {drivers.find(d => d.user_id === user?.id)?.vehicle_details && (
              <div className="p-3 bg-muted rounded-md mb-4">
                <h4 className="text-sm font-medium mb-2">Your Vehicle</h4>
                <div className="flex flex-wrap gap-3 text-sm">
                  <div>
                    <span className="text-muted-foreground mr-1">Type:</span>
                    <span className="font-medium capitalize">
                      {drivers.find(d => d.user_id === user?.id)?.vehicle_details?.vehicle_type || 'Not specified'}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground mr-1">Vehicle:</span>
                    <span className="font-medium">
                      {drivers.find(d => d.user_id === user?.id)?.vehicle_details?.vehicle_name || 'Not specified'}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground mr-1">Reg No:</span>
                    <span className="font-medium">
                      {drivers.find(d => d.user_id === user?.id)?.vehicle_details?.registration_number || 'Not specified'}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground mr-1">Seats:</span>
                    <span className="font-medium">
                      {drivers.find(d => d.user_id === user?.id)?.vehicle_details?.seats_available || '0'} available
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Passenger Management */}
            <h4 className="text-sm font-medium mb-2">Your Passengers</h4>
            {drivers.find(d => d.user_id === user?.id)?.assigned_participants.length === 0 ? (
              <p className="text-sm text-muted-foreground">No passengers assigned to you yet.</p>
            ) : (
              <div className="space-y-3">
                {drivers.find(d => d.user_id === user?.id)?.assigned_participants.map(passenger => (
                  <div key={passenger.user_id} className="p-3 border rounded-md">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={passenger.avatar_url || undefined} />
                          <AvatarFallback className="bg-secondary text-secondary-foreground">
                            {(passenger.full_name || 'P').substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{passenger.full_name || 'Passenger'}</span>
                      </div>
                      {drivers.find(d => d.user_id === user?.id)?.pickup_status[passenger.user_id] && 
                        getStatusBadge(drivers.find(d => d.user_id === user?.id)?.pickup_status[passenger.user_id] || 'pending')}
                    </div>
                    
                    {passenger.pickup_location && (
                      <div className="text-xs text-muted-foreground mb-3">
                        <MapPin className="h-3 w-3 inline mr-1" />
                        <span>Pickup: {passenger.pickup_location.name} - {passenger.pickup_location.address}</span>
                      </div>
                    )}
                    
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleUpdatePickupStatus(passenger.user_id, 'confirmed')}
                        disabled={drivers.find(d => d.user_id === user?.id)?.pickup_status[passenger.user_id] === 'confirmed'}
                      >
                        Confirm
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleUpdatePickupStatus(passenger.user_id, 'picked_up')}
                        disabled={drivers.find(d => d.user_id === user?.id)?.pickup_status[passenger.user_id] === 'picked_up'}
                      >
                        Picked Up
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="text-destructive"
                        onClick={() => handleUpdatePickupStatus(passenger.user_id, 'cancelled')}
                        disabled={drivers.find(d => d.user_id === user?.id)?.pickup_status[passenger.user_id] === 'cancelled'}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Admin View */}
      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Admin Transport Management</CardTitle>
            <CardDescription>Assign drivers and manage pickup coordination</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="drivers">
              <TabsList>
                <TabsTrigger value="drivers">Drivers ({drivers.length})</TabsTrigger>
                <TabsTrigger value="participants">Participants ({participants.length})</TabsTrigger>
                <TabsTrigger value="locations">Pickup Locations ({pickupLocations.length})</TabsTrigger>
                <TabsTrigger value="add">Add / Edit</TabsTrigger>
              </TabsList>
              
              <TabsContent value="drivers" className="pt-4">
                {drivers.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No drivers assigned yet.</p>
                ) : (
            <div className="space-y-4">
                    {drivers.map(driver => (
                      <Card key={driver.user_id}>
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={driver.avatar_url || undefined} />
                                <AvatarFallback className="bg-primary/10 text-primary">
                                  {(driver.full_name || 'D').substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                  <div>
                                <CardTitle className="text-base">{driver.full_name || 'Driver'}</CardTitle>
                                <CardDescription className="text-xs">
                                  {driver.vehicle_details?.vehicle_name} ({driver.vehicle_details?.registration_number})
                                </CardDescription>
                              </div>
                            </div>
                            <Badge variant="outline">
                              {driver.assigned_participants.length} / {driver.vehicle_details?.seats_available || 0} passengers
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="pb-2 pt-0">
                          {driver.assigned_participants.length > 0 ? (
                            <div className="text-sm space-y-2">
                              {driver.assigned_participants.map(p => (
                                <div key={p.user_id} className="flex justify-between items-center py-1">
                                  <span>{p.full_name || 'Passenger'}</span>
                                  {driver.pickup_status[p.user_id] && getStatusBadge(driver.pickup_status[p.user_id])}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-muted-foreground">No passengers assigned</p>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                </div>
              )}
              </TabsContent>
              
              <TabsContent value="participants" className="pt-4">
                {participants.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No participants registered yet.</p>
                ) : (
                  <div className="space-y-2">
                    {participants.filter(p => !p.is_driver).map(participant => {
                      const assignedDriver = drivers.find(d => 
                        d.assigned_participants.some(p => p.user_id === participant.user_id)
                      );
                      
                      return (
                        <div key={participant.user_id} className="flex justify-between items-center p-3 border rounded-md">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={participant.avatar_url || undefined} />
                              <AvatarFallback className="bg-secondary text-secondary-foreground">
                                {(participant.full_name || 'P').substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{participant.full_name || 'Participant'}</p>
                              {participant.pickup_location && (
                                <p className="text-xs text-muted-foreground">
                                  Pickup: {participant.pickup_location.name}
                                </p>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {assignedDriver ? (
                              <div className="text-sm">
                                <span className="text-muted-foreground mr-1">Driver:</span>
                                <span className="font-medium">{assignedDriver.full_name}</span>
                              </div>
                            ) : (
                              <Select
                                onValueChange={(driverId) => assignDriverToParticipant(driverId, participant.user_id)}
                              >
                                <SelectTrigger className="w-40">
                                  <SelectValue placeholder="Assign Driver" />
                                </SelectTrigger>
                                <SelectContent>
                                  {drivers.map(driver => (
                                    <SelectItem key={driver.user_id} value={driver.user_id} disabled={
                                      driver.assigned_participants.length >= (driver.vehicle_details?.seats_available || 0)
                                    }>
                                      {driver.full_name || 'Driver'} 
                                      ({driver.assigned_participants.length}/{driver.vehicle_details?.seats_available || 0})
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
              </TabsContent>
              
              <TabsContent value="locations" className="pt-4">
                {pickupLocations.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No pickup locations defined yet.</p>
                ) : (
                  <div className="space-y-2">
                    {pickupLocations.map(location => (
                      <Card key={location.id}>
                        <CardHeader className="py-3">
                          <CardTitle className="text-base flex items-start">
                            <MapPin className="h-4 w-4 mr-1 mt-1 flex-shrink-0" />
                            <span>{location.name}</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="py-0">
                          <p className="text-sm text-muted-foreground">{location.address}</p>
                          <div className="text-xs text-muted-foreground mt-1">
                            <span>Lat: {location.coordinates.latitude}, </span>
                            <span>Long: {location.coordinates.longitude}</span>
                          </div>
                          <div className="h-40 w-full rounded-md overflow-hidden mt-3">
                            <MapContainer center={[location.coordinates.latitude, location.coordinates.longitude]} zoom={13} style={{ height: '100%', width: '100%' }}>
                              <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                              />
                              <Marker position={[location.coordinates.latitude, location.coordinates.longitude]} />
                            </MapContainer>
                          </div>
                          <div className="flex gap-2 mt-3">
                            <Button size="sm" variant="outline" onClick={() => deletePickupLocation(location.id)}>Delete</Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="add" className="pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Add Pickup Location</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Input placeholder="Name" value={newLocation.name} onChange={(e) => setNewLocation({ ...newLocation, name: e.target.value })} />
                      <Textarea placeholder="Address" value={newLocation.address} onChange={(e) => setNewLocation({ ...newLocation, address: e.target.value })} />
                      <div className="grid grid-cols-2 gap-2">
                        <Input placeholder="Latitude" value={newLocation.latitude} onChange={(e) => setNewLocation({ ...newLocation, latitude: e.target.value })} />
                        <Input placeholder="Longitude" value={newLocation.longitude} onChange={(e) => setNewLocation({ ...newLocation, longitude: e.target.value })} />
                      </div>
                      <Button onClick={async () => {
                        await createPickupLocation({
                          name: newLocation.name.trim(),
                          address: newLocation.address.trim(),
                          latitude: newLocation.latitude ? parseFloat(newLocation.latitude) : undefined,
                          longitude: newLocation.longitude ? parseFloat(newLocation.longitude) : undefined,
                        });
                        setNewLocation({ name: '', address: '', latitude: '', longitude: '' });
                      }}>Add Location</Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Add / Update Driver</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Input placeholder="Driver User ID (UUID)" value={newDriver.user_id} onChange={(e) => setNewDriver({ ...newDriver, user_id: e.target.value })} />
                      <div className="grid grid-cols-2 gap-2">
                        <Input placeholder="Vehicle Type" value={newDriver.vehicle_type} onChange={(e) => setNewDriver({ ...newDriver, vehicle_type: e.target.value })} />
                        <Input placeholder="Vehicle Name" value={newDriver.vehicle_name} onChange={(e) => setNewDriver({ ...newDriver, vehicle_name: e.target.value })} />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Input placeholder="Reg Number" value={newDriver.registration_number} onChange={(e) => setNewDriver({ ...newDriver, registration_number: e.target.value })} />
                        <Input placeholder="Seats Available" value={newDriver.seats_available} onChange={(e) => setNewDriver({ ...newDriver, seats_available: e.target.value })} />
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={async () => {
                          await upsertDriver({
                            user_id: newDriver.user_id.trim(),
                            vehicle_type: newDriver.vehicle_type.trim() || undefined,
                            vehicle_name: newDriver.vehicle_name.trim() || undefined,
                            registration_number: newDriver.registration_number.trim() || undefined,
                            seats_available: newDriver.seats_available ? parseInt(newDriver.seats_available, 10) : undefined,
                          });
                        }}>Save Driver</Button>
                        <Button variant="outline" onClick={async () => {
                          if (newDriver.user_id.trim()) {
                            await removeDriver(newDriver.user_id.trim());
                            setNewDriver({ user_id: '', vehicle_type: '', vehicle_name: '', registration_number: '', seats_available: '' });
                          }
                        }}>Remove Driver</Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Not Logged In or Not Registered */}
      {!userIsParticipant && !userIsDriver && !isAdmin && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Register to see transport details</AlertTitle>
          <AlertDescription>
            Transportation details are only available for registered participants.
          </AlertDescription>
        </Alert>
      )}

      {/* Special Service Providers */}
      {vendorContacts && typeof vendorContacts === 'object' && Object.keys(vendorContacts).length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Service Providers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(vendorContacts).map(([name, contact]) => (
                <div key={name} className="p-2 border rounded">
                  <p className="font-medium">{name}</p>
                  <p className="text-sm text-muted-foreground">{contact.phone || contact.email || 'No contact details'}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
