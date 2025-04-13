
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
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="w-12 h-12 border-t-2 border-b-2 border-primary rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-lg text-gray-600">Loading trek details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!trekEvent) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive" className="max-w-md mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Trek event not found. The event may have been removed or you entered an invalid URL.
          </AlertDescription>
        </Alert>
      </div>
    );
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
  
  // Sample vendor contacts - in a real app, this would come from the API
  const sampleVendorContacts = [
    { id: '1', name: 'Rahul Sharma', role: 'Trek Coordinator', phone: '+91 98765 43210' },
    { id: '2', name: 'Aditya Singh', role: 'Driver', phone: '+91 99887 76655' },
    { id: '3', name: 'Priya Patel', role: 'Medical Support', phone: '+91 90001 23456' }
  ];

  const startDate = new Date(trekEvent.start_datetime);
  const isUpcoming = startDate > new Date();

  return (
    <div className="container mx-auto px-4 py-8">
      <TrekEventHeader 
        trekName={trekEvent.trek_name}
        category={trekEvent.category}
        startDatetime={trekEvent.start_datetime}
      />
      
      {!isUpcoming && (
        <Alert className="my-4">
          <Info className="h-4 w-4" />
          <AlertTitle>Past Event</AlertTitle>
          <AlertDescription>
            This trek has already taken place on {startDate.toLocaleDateString()}.
          </AlertDescription>
        </Alert>
      )}
      
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
                  vendorContacts={isRegistered && !isCancelled ? sampleVendorContacts : null}
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
              {isUpcoming ? (
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    Registration {isRegistered ? (isCancelled ? "Cancelled" : "Confirmed") : "Open"}
                  </Badge>
                  {isFull && !isRegistered && (
                    <Badge variant="secondary" className="bg-red-50 text-red-700 border-red-200">
                      Fully Booked
                    </Badge>
                  )}
                </div>
              ) : (
                <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-200">
                  Past Event
                </Badge>
              )}
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
