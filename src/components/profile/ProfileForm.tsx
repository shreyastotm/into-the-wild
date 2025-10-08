import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle, XCircle, MapPin, Car, PawPrint } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix default Leaflet icon issue with bundlers
// @ts-expect-error - This is a known workaround for a Leaflet-bundler issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface ProfileFormData {
    full_name: string;
    email: string;
    phone_number: string;
    date_of_birth: string;
    address: string;
    interests: string;
    trekking_experience: string;
    latitude: number | null;
    longitude: number | null;
    has_car: boolean;
    car_seating_capacity: number | string;
    vehicle_number: string;
    pet_details: string;
    transport_volunteer_opt_in: boolean;
}

// Component to handle map interaction
function LocationMarker({ position, onPositionChange }: { position: L.LatLngTuple, onPositionChange: (pos: L.LatLngTuple) => void }) {
    const [markerPosition, setMarkerPosition] = useState<L.LatLngTuple>(position);

    const map = useMapEvents({
        click(e) {
            const newPos: L.LatLngTuple = [e.latlng.lat, e.latlng.lng];
            setMarkerPosition(newPos);
            onPositionChange(newPos);
            map.flyTo(e.latlng, map.getZoom());
        },
    });

    // Update marker if external position changes
    useEffect(() => {
        setMarkerPosition(position);
    }, [position]);

    return markerPosition ? (
        <Marker position={markerPosition}></Marker>
    ) : null;
}

export const ProfileForm: React.FC = () => {
    const { user, userProfile, loading: authLoading, fetchUserProfile } = useAuth();
    const { toast } = useToast();
    const [formData, setFormData] = useState<ProfileFormData>({
        full_name: '',
        email: '',
        phone_number: '',
        date_of_birth: '',
        address: '',
        interests: '',
        trekking_experience: '',
        latitude: null,
        longitude: null,
        has_car: false,
        car_seating_capacity: '',
        vehicle_number: '',
        pet_details: '',
        transport_volunteer_opt_in: false,
    });
    const [loading, setLoading] = useState(false);
    // Default map center to Bangalore, India
    const [mapCenter, setMapCenter] = useState<L.LatLngTuple>([12.9716, 77.5946]); 

    useEffect(() => {
        if (userProfile) {
            setFormData({
                full_name: userProfile.full_name || '',
                email: user?.email || '',
                phone_number: userProfile.phone_number || '',
                date_of_birth: userProfile.date_of_birth || '',
                address: userProfile.address || '',
                interests: userProfile.interests || '',
                trekking_experience: userProfile.trekking_experience || '',
                latitude: userProfile.latitude || null,
                longitude: userProfile.longitude || null,
                has_car: userProfile.has_car || false,
                car_seating_capacity: userProfile.car_seating_capacity?.toString() || '',
                vehicle_number: userProfile.vehicle_number || '',
                pet_details: userProfile.pet_details || '',
                transport_volunteer_opt_in: !!userProfile.transport_volunteer_opt_in,
            });
            if (userProfile.latitude && userProfile.longitude) {
                setMapCenter([userProfile.latitude, userProfile.longitude]);
            }
        } else if (user) {
            setFormData(prev => ({ ...prev, email: user.email || '' }));
        }
    }, [userProfile, user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCheckboxChange = (checked: boolean | 'indeterminate', name: keyof ProfileFormData) => {
         if (typeof checked === 'boolean') {
            setFormData(prev => ({ ...prev, [name]: checked }));
        }
    };

    const handleMapPositionChange = useCallback((pos: L.LatLngTuple) => {
        setFormData(prev => ({ ...prev, latitude: pos[0], longitude: pos[1] }));
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setLoading(true);

        const carCapacity = formData.has_car 
                            ? (parseInt(formData.car_seating_capacity.toString(), 10) || 0) 
                            : null;

        // Define a more specific type for the updates object
        type UserUpdatePayload = Omit<Partial<ProfileFormData>, 'car_seating_capacity'> & { 
            car_seating_capacity?: number | null; // Explicitly type this as number | null
            updated_at: string; 
        };

        const updates: UserUpdatePayload = {
            full_name: formData.full_name,
            phone_number: formData.phone_number,
            date_of_birth: formData.date_of_birth || null,
            address: formData.address || null,
            interests: formData.interests || null,
            trekking_experience: formData.trekking_experience || null,
            latitude: formData.latitude,
            longitude: formData.longitude,
            has_car: formData.has_car,
            vehicle_number: formData.has_car ? (formData.vehicle_number || null) : null,
            pet_details: formData.pet_details || null,
            transport_volunteer_opt_in: formData.transport_volunteer_opt_in,
            updated_at: new Date().toISOString(),
        };

        // Only include car_seating_capacity if the user has a car
        if (formData.has_car) {
            try {
                // First attempt to update with car_seating_capacity
                const result = await supabase
                    .from('users')
                    .update({...updates, car_seating_capacity: carCapacity})
                    .eq('user_id', user.id);
                
                if (result.error) {
                    // If there's an error related to car_seating_capacity, retry without it
                    if (result.error.message.includes('car_seating_capacity')) {
                        const { error: retryError } = await supabase
                            .from('users')
                            .update(updates)
                            .eq('user_id', user.id);
                        
                        if (retryError) throw retryError;
                    } else {
                        throw result.error;
                    }
                }
                
                toast({
                    title: "Profile Updated",
                    description: "Your profile information has been saved successfully.",
                    variant: "default",
                    action: <CheckCircle className="text-green-500" />,
                });
                fetchUserProfile();
            } catch (error: unknown) {    
                const errorMessage = error instanceof Error ? error.message : "Could not update your profile. Please try again.";
                console.error("Error updating profile:", error);
                toast({
                    title: "Update Failed",
                    description: errorMessage,
                    variant: "destructive",
                    action: <XCircle className="text-red-500" />,
                });
            } finally {
                setLoading(false);
            }
        } else {
            // If user doesn't have a car, just update without car_seating_capacity
            try {
                const { error } = await supabase
                    .from('users')
                    .update(updates)
                    .eq('user_id', user.id);
                
                if (error) throw error;
                
                toast({
                    title: "Profile Updated",
                    description: "Your profile information has been saved successfully.",
                    variant: "default",
                    action: <CheckCircle className="text-green-500" />,
                });
                fetchUserProfile();
            } catch (error: unknown) {
                const errorMessage = error instanceof Error ? error.message : "Could not update your profile. Please try again.";
                console.error("Error updating profile:", error);
                toast({
                    title: "Update Failed",
                    description: errorMessage,
                    variant: "destructive",
                    action: <XCircle className="text-red-500" />,
                });
            } finally {
                setLoading(false);
            }
        }
    };

    if (authLoading) {
         return <div className="flex justify-center items-center p-10"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    return (
        <form onSubmit={handleSubmit}>
            <Card>
                <CardHeader>
                    <CardTitle>My Profile</CardTitle>
                    <CardDescription>Update your personal information, preferences, and settings.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 sm:space-y-8 p-4 sm:p-6">
                    <div className="space-y-4">
                         <h3 className="text-lg font-medium border-b pb-2">Personal Information</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="sm:col-span-2 lg:col-span-1">
                                <Label htmlFor="fullName">Full Name</Label>
                                <Input id="fullName" name="full_name" value={formData.full_name} onChange={handleChange} required className="w-full" />
                            </div>
                             <div className="sm:col-span-2 lg:col-span-1">
                                <Label htmlFor="email">Email Address</Label>
                                <Input id="email" name="email" type="email" value={formData.email} disabled className="text-muted-foreground w-full" />
                                <p className="text-xs text-muted-foreground mt-1">Email cannot be changed here.</p>
                            </div>
                            <div className="sm:col-span-2 lg:col-span-1">
                                <Label htmlFor="phone_number">Phone Number</Label>
                                <Input id="phone_number" name="phone_number" value={formData.phone_number} onChange={handleChange} className="w-full" />
                            </div>
                            <div className="sm:col-span-2 lg:col-span-1">
                                <Label htmlFor="date_of_birth">Date of Birth</Label>
                                <Input id="date_of_birth" name="date_of_birth" type="date" value={formData.date_of_birth} onChange={handleChange} className="w-full" />
                            </div>
                            <div className="sm:col-span-2">
                                <Label htmlFor="address">Address</Label>
                                <Textarea id="address" name="address" value={formData.address} onChange={handleChange} placeholder="Your street address" className="w-full" />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                         <h3 className="text-lg font-medium border-b pb-2">Trekking Preferences</h3>
                        <div className="grid grid-cols-1 gap-4">
                           <div>
                                <Label htmlFor="interests">Interests & Hobbies</Label>
                                <Textarea id="interests" name="interests" value={formData.interests} onChange={handleChange} placeholder="e.g., Photography, Bird watching, Camping..." className="w-full" />
                            </div>
                           <div>
                                <Label htmlFor="trekking_experience">Trekking Experience</Label>
                                <Textarea id="trekking_experience" name="trekking_experience" value={formData.trekking_experience} onChange={handleChange} placeholder="Describe your hiking/trekking experience level (beginner, intermediate, advanced) and any notable treks completed." className="w-full"/>
                            </div>
                         </div>
                    </div>

                    <div className="space-y-4">
                         <h3 className="text-lg font-medium border-b pb-2 flex items-center">
                             <PawPrint className="h-5 w-5 mr-2" /> Pet Details
                         </h3>
                         <div>
                             <Label htmlFor="pet_details">Information about your Pet(s)</Label>
                             <Textarea id="pet_details" name="pet_details" value={formData.pet_details} onChange={handleChange} placeholder="If you plan to bring pets on treks, please provide details like name, breed, size, temperament, and any special requirements." className="w-full"/>
                             <p className="text-xs text-muted-foreground mt-1">Specify pet details here if you sometimes trek with them. You can confirm or adjust details when registering for a specific trek.</p>
                         </div>
                     </div>

                    <div className="space-y-4">
                         <h3 className="text-lg font-medium border-b pb-2 flex items-center">
                             <Car className="h-5 w-5 mr-2"/> Vehicle Information
                        </h3>
                        <div className="flex items-center space-x-2">
                            <Checkbox id="has_car" name="has_car" checked={formData.has_car} onCheckedChange={(checked) => handleCheckboxChange(checked, 'has_car')} />
                            <Label htmlFor="has_car" className="font-medium">I have a car and may be willing to help carpool.</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox id="transport_volunteer_opt_in" name="transport_volunteer_opt_in" checked={formData.transport_volunteer_opt_in} onCheckedChange={(checked) => handleCheckboxChange(checked, 'transport_volunteer_opt_in')} />
                            <Label htmlFor="transport_volunteer_opt_in" className="font-medium">I want to volunteer as a driver when events need it.</Label>
                        </div>
                         {formData.has_car && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pl-4 sm:pl-6 border-l-2 ml-2 border-muted">
                                <div>
                                    <Label htmlFor="car_seating_capacity">Passenger Capacity (excluding driver)</Label>
                                    <Input id="car_seating_capacity" name="car_seating_capacity" type="number" min="0" value={formData.car_seating_capacity} onChange={handleChange} placeholder="e.g., 3" className="w-full" />
                                </div>
                                <div>
                                    <Label htmlFor="vehicle_number">Vehicle Number / License Plate</Label>
                                    <Input id="vehicle_number" name="vehicle_number" value={formData.vehicle_number} onChange={handleChange} placeholder="Optional, for identification" className="w-full" />
                                </div>
                            </div>
                        )}
                     </div>

                    <div className="space-y-4">
                         <h3 className="text-lg font-medium border-b pb-2 flex items-center">
                             <MapPin className="h-5 w-5 mr-2" /> Home Location for Pickup
                         </h3>
                         <p className="text-sm text-muted-foreground">Click on the map to set your approximate home location. This helps organizers plan carpooling routes if needed. Your exact address is not required.</p>
                         <div className="h-48 sm:h-64 w-full rounded-md overflow-hidden z-0">
                             <MapContainer center={mapCenter} zoom={12} style={{ height: '100%', width: '100%' }} key={JSON.stringify(mapCenter)} >
                                 <TileLayer
                                     attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                     url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                 />
                                 <LocationMarker 
                                     position={formData.latitude && formData.longitude ? [formData.latitude, formData.longitude] : mapCenter} 
                                     onPositionChange={handleMapPositionChange} 
                                 />
                             </MapContainer>
                        </div>
                         <div className="text-xs sm:text-sm text-muted-foreground">
                            Selected Coordinates: {formData.latitude?.toFixed(5) ?? 'N/A'}, {formData.longitude?.toFixed(5) ?? 'N/A'}
                        </div>
                     </div>
                </CardContent>
                <CardFooter>
                    <Button type="submit" disabled={loading || authLoading}>
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Save Changes
                    </Button>
                </CardFooter>
            </Card>
        </form>
    );
};
