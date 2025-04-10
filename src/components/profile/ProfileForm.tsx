
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';

interface FormData {
  full_name: string;
  email: string;
  phone: string;
  address: string;
  date_of_birth: string;
  health_data: string;
  trekking_experience: string;
  interests: string;
  pet_details: string;
}

export default function ProfileForm() {
  const { user, userProfile } = useAuth();
  const [formData, setFormData] = useState<FormData>({
    full_name: '',
    email: '',
    phone: '',
    address: '',
    date_of_birth: '',
    health_data: '',
    trekking_experience: '',
    interests: '',
    pet_details: '',
  });
  const [updating, setUpdating] = useState(false);

  // Update form data when userProfile changes
  useEffect(() => {
    if (user) {
      // Always set email from user object
      setFormData(prev => ({
        ...prev,
        email: user.email || '',
      }));
    }
    
    if (userProfile) {
      setFormData({
        full_name: userProfile?.full_name || '',
        email: user?.email || '',
        phone: userProfile?.phone_number || '',
        address: userProfile?.address || '',
        date_of_birth: userProfile?.date_of_birth || '',
        health_data: userProfile?.health_data || '',
        trekking_experience: userProfile?.trekking_experience || '',
        interests: userProfile?.interests || '',
        pet_details: userProfile?.pet_details || '',
      });
    }
  }, [userProfile, user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);

    try {
      if (!user) {
        toast({
          title: "Error",
          description: "You need to be logged in to update your profile",
          variant: "destructive",
        });
        return;
      }

      console.log("Updating profile for user:", user.id);
      console.log("Profile data:", formData);

      // Update user metadata
      const { error: metadataError } = await supabase.auth.updateUser({
        data: {
          full_name: formData.full_name,
          phone: formData.phone,
        },
      });

      if (metadataError) throw metadataError;

      // Check if profile exists
      const { data: existingProfile } = await supabase
        .from('users')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      let profileError;
      
      if (existingProfile) {
        // Update existing profile
        const { error } = await supabase
          .from('users')
          .update({
            full_name: formData.full_name,
            phone_number: formData.phone,
            address: formData.address,
            date_of_birth: formData.date_of_birth,
            health_data: formData.health_data,
            trekking_experience: formData.trekking_experience,
            interests: formData.interests,
            pet_details: formData.pet_details,
          })
          .eq('user_id', user.id);
        
        profileError = error;
      } else {
        // Create new profile if it doesn't exist
        const { error } = await supabase
          .from('users')
          .insert({
            user_id: user.id,
            full_name: formData.full_name,
            email: user.email || '',
            subscription_type: 'community', // Valid enum value
            phone_number: formData.phone,
            address: formData.address,
            date_of_birth: formData.date_of_birth,
            health_data: formData.health_data,
            trekking_experience: formData.trekking_experience,
            interests: formData.interests,
            pet_details: formData.pet_details
          });
        
        profileError = error;
      }

      if (profileError) throw profileError;

      toast({
        title: "Profile updated successfully",
        description: "Your profile information has been saved.",
      });
    } catch (error: any) {
      toast({
        title: "Error updating profile",
        description: error.message || "An error occurred while updating your profile",
        variant: "destructive",
      });
      console.error("Profile update error:", error);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Full Name</label>
          <Input
            name="full_name"
            value={formData.full_name}
            onChange={handleChange}
            className="mt-1"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <Input
            name="email"
            value={formData.email}
            disabled
            className="mt-1 bg-gray-50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Phone</label>
          <Input
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="mt-1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Address</label>
          <Input
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="mt-1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
          <Input
            type="date"
            name="date_of_birth"
            value={formData.date_of_birth}
            onChange={handleChange}
            className="mt-1"
          />
        </div>
        
        <div className="col-span-1 md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Health Data</label>
          <Textarea
            name="health_data"
            value={formData.health_data}
            onChange={handleChange}
            className="mt-1"
            placeholder="Share any health conditions or allergies that trek organizers should know about"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Trekking Experience</label>
          <Textarea
            name="trekking_experience"
            value={formData.trekking_experience}
            onChange={handleChange}
            className="mt-1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Interests</label>
          <Textarea
            name="interests"
            value={formData.interests}
            onChange={handleChange}
            className="mt-1"
            placeholder="Mountain climbing, Photography, Bird watching, etc."
          />
        </div>

        <div className="col-span-1 md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Pet Details</label>
          <Textarea
            name="pet_details"
            value={formData.pet_details}
            onChange={handleChange}
            className="mt-1"
            placeholder="Information about pets you might bring on treks"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={updating}>
          {updating ? 'Updating...' : 'Save Profile'}
        </Button>
      </div>
    </form>
  );
}
