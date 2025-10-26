import {
  Calendar,
  Car,
  CheckCircle,
  Home,
  Loader2,
  Mail,
  MapPin,
  PawPrint,
  Phone,
  Settings,
  User,
  XCircle,
} from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";

import { useAuth } from "@/components/auth/AuthProvider";
import FormActions from "@/components/forms/FormActions";
import FormField from "@/components/forms/FormField";
import FormSection from "@/components/forms/FormSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { validateField } from "@/lib/validation";

import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix default Leaflet icon issue with bundlers
// @ts-expect-error - This is a known workaround for a Leaflet-bundler issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
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
function LocationMarker({
  position,
  onPositionChange,
}: {
  position: [number, number];
  onPositionChange: (pos: [number, number]) => void;
}) {
  const [markerPosition, setMarkerPosition] = useState<[number, number]>(position);

  const map = useMapEvents({
    click(e) {
      const newPos: [number, number] = [e.latlng.lat, e.latlng.lng];
      setMarkerPosition(newPos);
      onPositionChange(newPos);
      map.flyTo(e.latlng, map.getZoom());
    },
  });

  // Update marker if external position changes
  useEffect(() => {
    setMarkerPosition(position);
  }, [position]);

  return markerPosition ? <Marker position={markerPosition} /> : null;
}

export const ProfileForm: React.FC = () => {
  const {
    user,
    userProfile,
    loading: authLoading,
    fetchUserProfile,
  } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState<ProfileFormData>({
    full_name: "",
    email: "",
    phone_number: "",
    date_of_birth: "",
    address: "",
    interests: "",
    trekking_experience: "",
    latitude: null,
    longitude: null,
    has_car: false,
    car_seating_capacity: "",
    vehicle_number: "",
    pet_details: "",
    transport_volunteer_opt_in: false,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<ProfileFormData>>({});
  // Default map center to Bangalore, India
  const [mapCenter, setMapCenter] = useState<[number, number]>([12.9716, 77.5946]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<
    Array<{ display_name: string; lat: string; lon: string }>
  >([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setFormData({
        full_name: userProfile.full_name || "",
        email: user?.email || "",
        phone_number: userProfile.phone_number || "",
        date_of_birth: userProfile.date_of_birth || "",
        address: userProfile.address || "",
        interests: userProfile.interests || "",
        trekking_experience: userProfile.trekking_experience || "",
        latitude: userProfile.latitude || null,
        longitude: userProfile.longitude || null,
        has_car: userProfile.has_car || false,
        car_seating_capacity:
          userProfile.car_seating_capacity?.toString() || "",
        vehicle_number: userProfile.vehicle_number || "",
        pet_details: userProfile.pet_details || "",
        transport_volunteer_opt_in: !!userProfile.transport_volunteer_opt_in,
      });
      if (userProfile.latitude && userProfile.longitude) {
        setMapCenter([userProfile.latitude, userProfile.longitude]);
      }
    } else if (user) {
      setFormData((prev) => ({ ...prev, email: user.email || "" }));
    }
  }, [userProfile, user]);

  const handleFieldChange = (field: keyof ProfileFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleMapPositionChange = useCallback((pos: [number, number]) => {
    setFormData((prev) => ({ ...prev, latitude: pos[0], longitude: pos[1] }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    const carCapacity = formData.has_car
      ? parseInt(formData.car_seating_capacity.toString(), 10) || 0
      : null;

    // Define a more specific type for the updates object
    type UserUpdatePayload = Omit<
      Partial<ProfileFormData>,
      "car_seating_capacity"
    > & {
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
      vehicle_number: formData.has_car ? formData.vehicle_number || null : null,
      pet_details: formData.pet_details || null,
      transport_volunteer_opt_in: formData.transport_volunteer_opt_in,
      updated_at: new Date().toISOString(),
    };

    // Only include car_seating_capacity if the user has a car
    if (formData.has_car) {
      try {
        // First attempt to update with car_seating_capacity
        const result = await supabase
          .from("users")
          .update({ ...updates, car_seating_capacity: carCapacity })
          .eq("user_id", user.id);

        if (result.error) {
          // If there's an error related to car_seating_capacity, retry without it
          if (result.error.message.includes("car_seating_capacity")) {
            const { error: retryError } = await supabase
              .from("users")
              .update(updates)
              .eq("user_id", user.id);

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
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Could not update your profile. Please try again.";
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
          .from("users")
          .update(updates)
          .eq("user_id", user.id);

        if (error) throw error;

        toast({
          title: "Profile Updated",
          description: "Your profile information has been saved successfully.",
          variant: "default",
          action: <CheckCircle className="text-green-500" />,
        });
        fetchUserProfile();
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Could not update your profile. Please try again.";
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
    return (
      <div className="flex justify-center items-center p-10">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Search for locations using Nominatim (OpenStreetMap)
  const handleSearchLocation = async () => {
    if (!searchQuery.trim()) return;

    setSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?` +
          `q=${encodeURIComponent(`${searchQuery  }, India`)}&` +
          `format=json&limit=5&addressdetails=1`,
      );
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error("Error searching location:", error);
      toast({
        title: "Search failed",
        description: "Could not search for location",
        variant: "destructive",
      });
    } finally {
      setSearching(false);
    }
  };

  const handleSelectSearchResult = (result: {
    display_name: string;
    lat: string;
    lon: string;
  }) => {
    setFormData((prev) => ({
      ...prev,
      address: result.display_name,
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
    }));
    setMapCenter([parseFloat(result.lat), parseFloat(result.lon)]);
    setSearchResults([]);
    setSearchQuery("");
  };

  const handleCancel = () => {
    // Reset form to original values
    if (userProfile) {
      setFormData({
        full_name: userProfile.full_name || "",
        email: user?.email || "",
        phone_number: userProfile.phone_number || "",
        date_of_birth: userProfile.date_of_birth || "",
        address: userProfile.address || "",
        interests: userProfile.interests || "",
        trekking_experience: userProfile.trekking_experience || "",
        latitude: userProfile.latitude || null,
        longitude: userProfile.longitude || null,
        has_car: userProfile.has_car || false,
        car_seating_capacity:
          userProfile.car_seating_capacity?.toString() || "",
        vehicle_number: userProfile.vehicle_number || "",
        pet_details: userProfile.pet_details || "",
        transport_volunteer_opt_in: !!userProfile.transport_volunteer_opt_in,
      });
    }
    setErrors({});
  };

  return (
    <div className="space-y-6">
      {/* Personal Information Section */}
      <FormSection
        title="Personal Information"
        description="Update your personal details"
        icon={User}
        variant="card"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            label="Full Name"
            name="full_name"
            type="text"
            value={formData.full_name}
            onChange={(value) => handleFieldChange("full_name", value)}
            required
            error={errors.full_name}
            icon={<User className="h-4 w-4" />}
          />

          <FormField
            label="Email Address"
            name="email"
            type="email"
            value={formData.email}
            disabled
            helpText="Email cannot be changed here"
            icon={<Mail className="h-4 w-4" />}
          />

          <FormField
            label="Phone Number"
            name="phone_number"
            type="tel"
            value={formData.phone_number}
            onChange={(value) => handleFieldChange("phone_number", value)}
            placeholder="9876543210"
            required
            error={errors.phone_number}
            icon={<Phone className="h-4 w-4" />}
            helpText="Enter 10-digit Indian phone number"
          />

          <FormField
            label="Date of Birth"
            name="date_of_birth"
            type="date"
            value={formData.date_of_birth}
            onChange={(value) => handleFieldChange("date_of_birth", value)}
            icon={<Calendar className="h-4 w-4" />}
          />
        </div>

        <FormField
          label="Address"
          name="address"
          type="textarea"
          value={formData.address}
          onChange={(value) => handleFieldChange("address", value)}
          placeholder="Your street address"
          rows={3}
          icon={<Home className="h-4 w-4" />}
        />
      </FormSection>

      {/* Trekking Preferences Section */}
      <FormSection
        title="Trekking Preferences"
        description="Tell us about your trekking interests and experience"
        icon={Settings}
        variant="card"
      >
        <FormField
          label="Interests & Hobbies"
          name="interests"
          type="textarea"
          value={formData.interests}
          onChange={(value) => handleFieldChange("interests", value)}
          placeholder="e.g., Photography, Bird watching, Camping..."
          rows={3}
        />

        <FormField
          label="Trekking Experience"
          name="trekking_experience"
          type="textarea"
          value={formData.trekking_experience}
          onChange={(value) => handleFieldChange("trekking_experience", value)}
          placeholder="Describe your hiking/trekking experience level (beginner, intermediate, advanced) and any notable treks completed."
          rows={4}
        />
      </FormSection>

      {/* Pet Details Section */}
      <FormSection
        title="Pet Details"
        description="Information about your pets for trek planning"
        icon={PawPrint}
        variant="card"
      >
        <FormField
          label="Pet Information"
          name="pet_details"
          type="textarea"
          value={formData.pet_details}
          onChange={(value) => handleFieldChange("pet_details", value)}
          placeholder="If you plan to bring pets on treks, please provide details like name, breed, size, temperament, and any special requirements."
          rows={3}
          helpText="Specify pet details here if you sometimes trek with them. You can confirm or adjust details when registering for a specific trek."
        />
      </FormSection>

      {/* Vehicle Information Section */}
      <FormSection
        title="Vehicle Information"
        description="Help us plan carpooling for treks"
        icon={Car}
        variant="card"
      >
        <FormField
          label="I have a car and may be willing to help carpool"
          name="has_car"
          type="checkbox"
          value={formData.has_car}
          onChange={(value) => handleFieldChange("has_car", value)}
        />

        <FormField
          label="I want to volunteer as a driver when events need it"
          name="transport_volunteer_opt_in"
          type="checkbox"
          value={formData.transport_volunteer_opt_in}
          onChange={(value) =>
            handleFieldChange("transport_volunteer_opt_in", value)
          }
        />

        {formData.has_car && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pl-4 sm:pl-6 border-l-2 ml-2 border-muted">
            <FormField
              label="Passenger Capacity (excluding driver)"
              name="car_seating_capacity"
              type="number"
              value={formData.car_seating_capacity}
              onChange={(value) =>
                handleFieldChange("car_seating_capacity", value)
              }
              placeholder="e.g., 3"
              min={0}
              error={errors.car_seating_capacity}
            />

            <FormField
              label="Vehicle Number / License Plate"
              name="vehicle_number"
              type="text"
              value={formData.vehicle_number}
              onChange={(value) => handleFieldChange("vehicle_number", value)}
              placeholder="Optional, for identification"
            />
          </div>
        )}
      </FormSection>

      {/* Location Section */}
      <FormSection
        title="Home Location for Pickup"
        description="Search for your location or click on the map to set your approximate home location. This helps organizers plan carpooling routes if needed."
        icon={MapPin}
        variant="card"
      >
        {/* Search Bar */}
        <div className="mb-4 space-y-2">
          <div className="flex gap-2">
            <Input
              placeholder="Search for your location in India..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearchLocation()}
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleSearchLocation}
              disabled={searching || !searchQuery.trim()}
            >
              {searching ? "Searching..." : "Search"}
            </Button>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="border rounded-md max-h-32 overflow-y-auto">
              {searchResults.map((result, idx) => (
                <div
                  key={idx}
                  className="p-2 hover:bg-muted cursor-pointer text-sm"
                  onClick={() => handleSelectSearchResult(result)}
                >
                  {result.display_name}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="h-48 sm:h-64 w-full rounded-md overflow-hidden z-0">
          <MapContainer
            center={mapCenter}
            zoom={12}
            style={{ height: "100%", width: "100%" }}
            key={JSON.stringify(mapCenter)}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LocationMarker
              position={
                formData.latitude && formData.longitude
                  ? [formData.latitude, formData.longitude]
                  : mapCenter
              }
              onPositionChange={handleMapPositionChange}
            />
          </MapContainer>
        </div>
        <div className="text-xs sm:text-sm text-muted-foreground">
          Selected Coordinates: {formData.latitude?.toFixed(5) ?? "N/A"},{" "}
          {formData.longitude?.toFixed(5) ?? "N/A"}
        </div>
      </FormSection>

      {/* Form Actions */}
      <FormActions
        onSave={handleSubmit}
        onCancel={handleCancel}
        saveLabel="Save Changes"
        cancelLabel="Reset"
        loading={loading}
        saveLoading={loading}
        variant="card"
        position="right"
      />
    </div>
  );
};
