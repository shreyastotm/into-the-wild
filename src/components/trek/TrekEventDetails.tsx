
import React from 'react';
import { Separator } from "@/components/ui/separator";

interface TrekEventDetailsProps {
  description: string | null;
  duration: string | null;
  transportMode: string | null;
  maxParticipants: number;
  currentParticipants: number | null;
  pickupTimeWindow: string | null;
  cancellationPolicy: string | null;
}

export const TrekEventDetailsComponent: React.FC<TrekEventDetailsProps> = ({
  description,
  duration,
  transportMode,
  maxParticipants,
  currentParticipants,
  pickupTimeWindow,
  cancellationPolicy
}) => {
  return (
    <div className="prose max-w-none">
      <p>{description}</p>
      
      <Separator className="my-4" />
      
      <h3 className="text-xl font-semibold">Trek Details</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h4 className="font-medium">Duration</h4>
          <p>{duration || 'Not specified'}</p>
        </div>
        <div>
          <h4 className="font-medium">Transport Mode</h4>
          <p>{transportMode || 'Not specified'}</p>
        </div>
        <div>
          <h4 className="font-medium">Max Participants</h4>
          <p>{maxParticipants}</p>
        </div>
        <div>
          <h4 className="font-medium">Current Registrations</h4>
          <p>{currentParticipants || 0} participants</p>
        </div>
      </div>
      
      {pickupTimeWindow && (
        <>
          <h3 className="text-xl font-semibold mt-4">Pickup Details</h3>
          <p>{pickupTimeWindow}</p>
        </>
      )}
      
      {cancellationPolicy && (
        <>
          <h3 className="text-xl font-semibold mt-4">Cancellation Policy</h3>
          <p>{cancellationPolicy}</p>
        </>
      )}
    </div>
  );
};
