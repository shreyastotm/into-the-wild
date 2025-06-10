import React, { useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import PackingItemsAdmin from '@/components/trek/PackingItemsAdmin';
import TrekEventsAdmin from './admin/TrekEventsAdmin';
import UserVerificationPanel from '@/components/admin/UserVerificationPanel';
import RegistrationAdmin from '@/components/admin/RegistrationAdmin';
import { useAuth } from '@/components/auth/AuthProvider';

export default function AdminPanel() {
  const { userProfile, loading, refreshUserProfile } = useAuth();

  useEffect(() => {
    refreshUserProfile();
  }, [refreshUserProfile]);

  // Allow access only to admins
  if (loading) {
    return <div className="max-w-3xl mx-auto p-6">Loading...</div>;
  }
  if (!loading && (!userProfile || userProfile.user_type !== 'admin')) {
    return (
      <div className="max-w-2xl mx-auto p-8 text-center text-red-600">
        <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
        <p className="mb-4">Only admins can access this page.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Panel</h1>
      <Tabs defaultValue="packing" className="w-full">
        <TabsList>
          <TabsTrigger value="packing">Packing Items</TabsTrigger>
          <TabsTrigger value="events">Trek Events</TabsTrigger>
          <TabsTrigger value="verification">Micro-Community Verification</TabsTrigger>
          <TabsTrigger value="registrations">Trek Registrations</TabsTrigger>
          {/* <TabsTrigger value="users">Users</TabsTrigger> */}
          {/* Add more admin tabs as needed */}
        </TabsList>
        <TabsContent value="packing">
          <PackingItemsAdmin />
        </TabsContent>
        <TabsContent value="events">
          <TrekEventsAdmin />
        </TabsContent>
        <TabsContent value="verification">
          <UserVerificationPanel />
        </TabsContent>
        <TabsContent value="registrations">
          <RegistrationAdmin />
        </TabsContent>
        {/* <TabsContent value="users">Users Admin Coming Soon</TabsContent> */}
      </Tabs>
    </div>
  );
}
