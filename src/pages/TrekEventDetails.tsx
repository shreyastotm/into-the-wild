
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { TrekEventHeader } from '@/components/trek/TrekEventHeader';
import { TrekEventDetailsComponent } from '@/components/trek/TrekEventDetails';
import { RegistrationCard } from '@/components/trek/RegistrationCard';
import { TravelCoordination } from '@/components/trek/TravelCoordination';
import { TrekParticipants } from '@/components/trek/TrekParticipants';
import { TrekDiscussion } from '@/components/trek/TrekDiscussion';
import { useTrekEvent } from '@/hooks/useTrekEvent';
import { useTrekCommunity } from '@/hooks/useTrekCommunity';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronLeft, Map, MessageSquare, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/auth/AuthProvider';

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
  
  const {
    participants,
    comments,
    loading: communityLoading,
    commentsLoading,
    addComment
  } = useTrekCommunity(id);

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="animate-pulse">
          <div className="h-12 bg-gray-200 rounded mb-6"></div>
          <div className="h-64 bg-gray-200 rounded mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <div className="h-96 bg-gray-200 rounded"></div>
            </div>
            <div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!trekEvent) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Trek Not Found</h1>
        <p className="mb-6">The trek event you're looking for doesn't exist or has been removed.</p>
        <Link to="/trek-events">
          <Button>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Trek Events
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Link to="/trek-events" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6">
        <ChevronLeft className="mr-1 h-4 w-4" />
        Back to Trek Events
      </Link>

      <TrekEventHeader
        trekName={trekEvent.trek_name}
        startDatetime={trekEvent.start_datetime}
        category={trekEvent.category}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="md:col-span-2">
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="travel">
                <Map className="h-4 w-4 mr-2" />
                Travel
              </TabsTrigger>
              <TabsTrigger value="participants">
                <Users className="h-4 w-4 mr-2" />
                Participants ({trekEvent.current_participants || 0})
              </TabsTrigger>
              <TabsTrigger value="discussion">
                <MessageSquare className="h-4 w-4 mr-2" />
                Discussion ({comments.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="details">
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
            
            <TabsContent value="travel">
              <TravelCoordination
                transportMode={trekEvent.transport_mode}
                pickupTimeWindow={trekEvent.pickup_time_window}
                vendorContacts={trekEvent.vendor_contacts}
              />
            </TabsContent>
            
            <TabsContent value="participants">
              <TrekParticipants 
                participants={participants} 
                maxParticipants={trekEvent.max_participants}
                currentUser={user?.id} 
              />
            </TabsContent>
            
            <TabsContent value="discussion">
              <TrekDiscussion 
                trekId={id || ''} 
                comments={comments}
                onAddComment={addComment}
              />
            </TabsContent>
          </Tabs>
        </div>

        <div>
          <RegistrationCard
            trek={trekEvent}
            userRegistration={userRegistration}
            onRegister={registerForTrek}
            onCancel={cancelRegistration}
            isLoading={registering}
          />
        </div>
      </div>
    </div>
  );
}
