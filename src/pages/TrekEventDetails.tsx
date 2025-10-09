import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { TrekEventHeader } from '@/components/trek/TrekEventHeader';
import { TrekEventDetailsComponent } from '@/components/trek/TrekEventDetails';
import { RegistrationCard } from '@/components/trek/RegistrationCard';
import { TravelCoordination } from '@/components/trek/TravelCoordination';
import { TrekParticipants } from '@/components/trek/TrekParticipants';
import { TrekDiscussion } from '@/components/trek/TrekDiscussion';
import { ExpenseSplitting } from '@/components/expenses/ExpenseSplitting';
import { TrekRatings } from '@/components/trek/TrekRatings';
import { TrekPackingList } from '@/components/trek/TrekPackingList';
import { TentRental } from '@/components/trek/TentRental';
import { useTrekRegistration } from '../hooks/trek/useTrekRegistration';
import { useTrekCommunity } from '@/hooks/useTrekCommunity';
import { useTrekCosts } from '@/hooks/trek/useTrekCosts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ChevronLeft, 
  Map, 
  MessageSquare, 
  Users,
  Receipt,
  Award,
  ClipboardList,
  Info,
  Tent
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/auth/AuthProvider';
import { TrekEventStatus, EventType } from '@/types/trek';

export default function TrekEventDetails() {
  const { id } = useParams<{ id: string }>();
  const { user, userProfile } = useAuth();
  const [isUploadingProof, setIsUploadingProof] = useState(false);

  const { 
    trekEvent, 
    loading: trekLoading, 
    registering, 
    userRegistration,
    registerForTrek, 
    cancelRegistration,
    uploadPaymentProof
  } = useTrekRegistration(id);
  
  const { costs, loading: costsLoading } = useTrekCosts(id);

  const trekIdNum = id ? parseInt(id, 10) : 0;

  const {
    participants,
    participantCount,
    comments,
    loading: communityLoading,
    commentsLoading,
    addComment
  } = useTrekCommunity(id);

  const isRegistered = !!userRegistration && userRegistration.payment_status !== 'Cancelled';
  const isAdmin = userProfile?.user_type === 'admin';

  const formattedParticipants = participants.map(participant => ({
    user_id: participant.id,
    full_name: participant.name || 'Unknown User'
  }));

  if (trekLoading || costsLoading) {
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
        <Link to="/events">
          <Button>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Events
          </Button>
        </Link>
      </div>
    );
  }

  const handleRegistration = async (indemnityAccepted: boolean) => {
    if (!user || !trekEvent) return { success: false, registrationId: null };
    const success = await registerForTrek(indemnityAccepted);
    return { success: success, registrationId: null }; 
  };

  const handleUploadProof = async (registrationId: number, file: File, registrantName: string, registrantPhone: string): Promise<boolean> => {
    if (!trekEvent || !userRegistration) return false;
    setIsUploadingProof(true);
    try {
      const uploadSuccess = await uploadPaymentProof(file, registrantName, registrantPhone);
      if (uploadSuccess) {
        // Payment proof uploaded successfully
      } else {
        console.error('Payment proof upload failed');
      }
      return !!uploadSuccess;
    } catch (error) {
      console.error('Error uploading payment proof:', error);
      return false;
    } finally {
      setIsUploadingProof(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Link to="/trek-events" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6">
        <ChevronLeft className="mr-1 h-4 w-4" />
        Back to Events
      </Link>

      <TrekEventHeader
        trekName={trekEvent.trek_name}
        startDatetime={trekEvent.start_datetime}
        category={trekEvent.category}
        status={trekEvent.status as TrekEventStatus | undefined}
        imageUrl={trekEvent.image_url}
        cost={trekEvent.cost}
        description={trekEvent.description}
        maxParticipants={trekEvent.max_participants}
        participantCount={participantCount}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="md:col-span-2">
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="mb-4 flex flex-wrap gap-1 w-full">
              <TabsTrigger value="details" className="flex-1 min-w-0 text-xs sm:text-sm">
                <Info className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                <span className="hidden sm:inline">Details</span>
              </TabsTrigger>
              <TabsTrigger value="participants-discussion" className="flex-1 min-w-0 text-xs sm:text-sm">
                <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                <span className="hidden sm:inline">Participants</span>
              </TabsTrigger>
              <TabsTrigger value="packing-list" className="flex-1 min-w-0 text-xs sm:text-sm">
                <ClipboardList className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                <span className="hidden sm:inline">Packing</span>
              </TabsTrigger>
              <TabsTrigger value="travel" className="flex-1 min-w-0 text-xs sm:text-sm">
                <Map className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                <span className="hidden sm:inline">Travel</span>
              </TabsTrigger>
              {trekEvent.event_type === EventType.CAMPING && (
                <TabsTrigger value="tent-rental" className="flex-1 min-w-0 text-xs sm:text-sm">
                  <Tent className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  <span className="hidden sm:inline">Tent</span>
                </TabsTrigger>
              )}
              {isRegistered && (
                <TabsTrigger value="expenses" className="flex-1 min-w-0 text-xs sm:text-sm">
                  <Receipt className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  <span className="hidden sm:inline">Expenses</span>
                </TabsTrigger>
              )}
              {trekEvent.status === 'completed' && (
                <TabsTrigger value="ratings" className="flex-1 min-w-0 text-xs sm:text-sm">
                  <Award className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  <span className="hidden sm:inline">Ratings</span>
                </TabsTrigger>
              )}
            </TabsList>
            
            <TabsContent value="details">
              <TrekEventDetailsComponent
                description={trekEvent.description}
                duration={trekEvent.duration}
                transportMode={trekEvent.transport_mode}
                maxParticipants={trekEvent.max_participants}
                currentParticipants={participantCount}
                pickupTimeWindow={trekEvent.pickup_time_window}
                cancellationPolicy={trekEvent.cancellation_policy}
                fixedCosts={costs}
              />
            </TabsContent>
            
            <TabsContent value="participants-discussion" className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-4">Participants ({participantCount})</h3>
                 <TrekParticipants 
                  participants={participants} 
                  maxParticipants={trekEvent.max_participants}
                  currentUser={user?.id} 
                />
              </div>
              <hr /> 
              <div>
                 <h3 className="text-xl font-semibold mb-4">Discussion ({comments.length})</h3>
                 <TrekDiscussion 
                  trekId={trekIdNum} 
                  comments={comments}
                  onAddComment={addComment}
                  isRegistered={isRegistered}
                  isLoading={commentsLoading}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="packing-list">
              <TrekPackingList trekId={id} />
            </TabsContent>
            
            <TabsContent value="travel">
              <TravelCoordination
                transportMode={trekEvent.transport_mode}
                pickupTimeWindow={trekEvent.pickup_time_window}
                vendorContacts={trekEvent.vendor_contacts}
                isAdmin={isAdmin}
              />
            </TabsContent>
            
            {trekEvent.event_type === EventType.CAMPING && (
              <TabsContent value="tent-rental">
                <TentRental
                  eventId={trekIdNum}
                  eventStartDate={trekEvent.start_datetime}
                  eventEndDate={trekEvent.end_datetime}
                  isRegistered={isRegistered}
                />
              </TabsContent>
            )}
            
            {isRegistered && (
              <TabsContent value="expenses">
                <ExpenseSplitting
                  trekId={id || ''}
                  isAdmin={isAdmin}
                  fixedCosts={costs}
                />
              </TabsContent>
            )}
            
            {trekEvent.status === 'completed' && (
              <TabsContent value="ratings">
                <TrekRatings
                  trekId={id || ''}
                  isCompleted={true}
                />
              </TabsContent>
            )}
          </Tabs>
        </div>

        <div>
          <RegistrationCard
            trek={{
              trek_id: trekEvent.trek_id,
              max_participants: trekEvent.max_participants,
              participant_count: participantCount,
              cost: trekEvent.cost,
              name: trekEvent.trek_name,
              status: trekEvent.status,
            }}
            userRegistration={userRegistration}
            onRegister={async (indemnityAccepted, options) => {
              return await registerForTrek(indemnityAccepted, options);
            }}
            onCancel={cancelRegistration}
            isLoading={registering}
            onUploadProof={handleUploadProof}
            isUploadingProof={isUploadingProof}
            canVolunteerDriver={!!userProfile?.has_car && !!userProfile?.transport_volunteer_opt_in}
          />
        </div>
      </div>
    </div>
  );
}
