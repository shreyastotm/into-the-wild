import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import PackingItemsAdmin from '@/components/trek/PackingItemsAdmin';
import TrekEventsAdmin from '@/components/trek/TrekEventsAdmin';
import PackingListTemplatesAdmin from '@/components/trek/PackingListTemplatesAdmin';
// Future: import other admin tools here

export default function AdminPanel() {
  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Panel</h1>
      <Tabs defaultValue="packing" className="w-full">
        <TabsList>
          <TabsTrigger value="packing">Packing Items</TabsTrigger>
          <TabsTrigger value="templates">Packing Templates</TabsTrigger>
          <TabsTrigger value="events">Trek Events</TabsTrigger>
          {/* <TabsTrigger value="users">Users</TabsTrigger> */}
          {/* Add more admin tabs as needed */}
        </TabsList>
        <TabsContent value="packing">
          <PackingItemsAdmin />
        </TabsContent>
        <TabsContent value="templates">
          <PackingListTemplatesAdmin />
        </TabsContent>
        <TabsContent value="events">
          <TrekEventsAdmin />
        </TabsContent>
        {/* <TabsContent value="users">Users Admin Coming Soon</TabsContent> */}
      </Tabs>
    </div>
  );
}
