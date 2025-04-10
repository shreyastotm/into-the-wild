
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export default function Profile() {
  const { user, userProfile, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
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

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }

    if (userProfile) {
      setFormData({
        full_name: userProfile.full_name || '',
        email: user?.email || '',
        phone: userProfile.phone || '',
        address: userProfile.address || '',
        date_of_birth: userProfile.date_of_birth || '',
        health_data: userProfile.health_data || '',
        trekking_experience: userProfile.trekking_experience || '',
        interests: userProfile.interests || '',
        pet_details: userProfile.pet_details || '',
      });
    } else if (user) {
      setFormData((prev) => ({
        ...prev,
        email: user.email || '',
        full_name: user.user_metadata?.full_name || '',
        phone: user.user_metadata?.phone || '',
      }));
    }
  }, [user, userProfile, loading, navigate]);

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
      if (!user) return;

      // Update user metadata
      const { error: metadataError } = await supabase.auth.updateUser({
        data: {
          full_name: formData.full_name,
          phone: formData.phone,
        },
      });

      if (metadataError) throw metadataError;

      // Update or insert user profile in the users table
      const { error: profileError } = await supabase
        .from('users')
        .upsert({
          id: user.id,
          full_name: formData.full_name,
          phone: formData.phone,
          address: formData.address,
          date_of_birth: formData.date_of_birth,
          health_data: formData.health_data,
          trekking_experience: formData.trekking_experience,
          interests: formData.interests,
          pet_details: formData.pet_details,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'id',
        });

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
    } finally {
      setUpdating(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center py-10">
          <div className="text-lg">Loading...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Your Profile</h1>
          <Button variant="outline" onClick={handleSignOut}>
            Sign Out
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
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
                <textarea
                  name="health_data"
                  value={formData.health_data}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm h-24 px-3 py-2 border"
                  placeholder="Share any health conditions or allergies that trek organizers should know about"
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Trekking Experience</label>
                <textarea
                  name="trekking_experience"
                  value={formData.trekking_experience}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm h-24 px-3 py-2 border"
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Interests</label>
                <textarea
                  name="interests"
                  value={formData.interests}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm h-24 px-3 py-2 border"
                  placeholder="Mountain climbing, Photography, Bird watching, etc."
                ></textarea>
              </div>

              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Pet Details</label>
                <textarea
                  name="pet_details"
                  value={formData.pet_details}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm h-24 px-3 py-2 border"
                  placeholder="Information about pets you might bring on treks"
                ></textarea>
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={updating}>
                {updating ? 'Updating...' : 'Save Profile'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
