
import React from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/components/auth/AuthProvider';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useTrekEvent } from '@/hooks/useTrekEvent';
import { TrekEventHeader } from '@/components/trek/TrekEventHeader';
import { TrekEventDetailsComponent } from '@/components/trek/TrekEventDetails';
import { RegistrationCard } from '@/components/trek/RegistrationCard';

export default function TrekEventDetails() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  
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
              {/* Header is now part of the TrekEventHeader component shown above the grid */}
            </CardHeader>
            <CardContent>
              <TrekEventDetailsComponent 
                description={trekEvent.description}
                duration={trekEvent.duration}
                transportMode={trekEvent.transport_mode}
                maxParticipants={trekEvent.max_participants}
                currentParticipants={trekEvent.current_participants}
                pickupTimeWindow={trekEvent.pickup_time_window}
                cancellationPolicy={trekEvent.cancellation_policy}
              />
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
