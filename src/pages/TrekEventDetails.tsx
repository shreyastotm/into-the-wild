
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/components/auth/AuthProvider';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTrekEvent } from '@/hooks/useTrekEvent';
import { TrekEventHeader } from '@/components/trek/TrekEventHeader';
import { TrekEventDetailsComponent } from '@/components/trek/TrekEventDetails';
import { RegistrationCard } from '@/components/trek/RegistrationCard';
import { ExpenseList } from '@/components/expenses/ExpenseList';
import { TravelCoordination } from '@/components/trek/TravelCoordination';

export default function TrekEventDetails() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("details");
  
  const {
    trekEvent,
    loading,
    registering,
    userRegistration,
    registerForTrek,
    cancelRegistration
  } = useTrekEvent(id);

  if (loading) {
    return <div className="container mx-auto px-4 py-8 text-center">Loading trek details...</div>;
  }

  if (!trekEvent) {
    return <div className="container mx-auto px-4 py-8 text-center">Trek event not found</div>;
  }

  const isFull = (trekEvent.current_participants || 0) >= trekEvent.max_participants;
  const isRegistered = userRegistration !== null;
  const isCancelled = userRegistration?.payment_status === 'Cancelled';

  // Sample pickup locations - in a real app, this would come from the API
  const samplePickupLocations = [
    { id: '1', location: 'City Center Bus Stand (6:00 AM)' },
    { id: '2', location: 'Railway Station Entrance (6:30 AM)' },
    { id: '3', location: 'Airport Terminal 2 (7:00 AM)' }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <TrekEventHeader 
        trekName={trekEvent.trek_name}
        category={trekEvent.category}
        startDatetime={trekEvent.start_datetime}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-3">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="travel">Travel</TabsTrigger>
                  <TabsTrigger value="expenses">Expenses</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent>
              <TabsContent value="details" className="mt-0">
                <TrekEventDetailsComponent 
                  description={trekEvent.description}
                  duration={trekEvent.duration}
                  transportMode={trekEvent.transport_mode}
                  maxParticipants={trekEvent.max_participants}
                  currentParticipants={trekEvent.current_participants}
                  pickupTimeWindow={trekEvent.pickup_time_window}
                  cancellationPolicy={trekEvent.cancellation_policy}
                />
              </TabsContent>
              <TabsContent value="travel" className="mt-0">
                <TravelCoordination
                  transportMode={trekEvent.transport_mode}
                  pickupTimeWindow={trekEvent.pickup_time_window}
                  pickupLocations={isRegistered && !isCancelled ? samplePickupLocations : null}
                  additionalNotes={isRegistered && !isCancelled ? "Please arrive 15 minutes before the scheduled pickup time. Carry water and light snacks for the journey." : null}
                  isRegistered={isRegistered && !isCancelled}
                />
              </TabsContent>
              <TabsContent value="expenses" className="mt-0">
                <ExpenseList 
                  trekId={trekEvent.trek_id} 
                  isRegistered={isRegistered && !isCancelled} 
                />
              </TabsContent>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <h2 className="text-2xl">Registration</h2>
            </CardHeader>
            <CardContent>
              <RegistrationCard 
                cost={trekEvent.cost}
                maxParticipants={trekEvent.max_participants}
                currentParticipants={trekEvent.current_participants}
                isRegistered={isRegistered}
                isCancelled={isCancelled}
                isFull={isFull}
                isLoggedIn={!!user}
                registering={registering}
                onRegister={registerForTrek}
                onCancel={cancelRegistration}
                paymentStatus={userRegistration?.payment_status}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
