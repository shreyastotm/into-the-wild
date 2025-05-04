import React, { useEffect, useState } from 'react';
import { MapPin } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';

interface TrekEventDetailsProps {
  trek_id?: number;
  description?: string;
  duration?: string;
  transportMode?: 'cars' | 'mini_van' | 'bus' | null; // Added null
  maxParticipants?: number;
  currentParticipants?: number;
  pickupTimeWindow?: string | null; // Added null
  cancellationPolicy?: string | null; // Added null
}

export const TrekEventDetailsComponent: React.FC<TrekEventDetailsProps> = ({
  description,
  duration,
  transportMode,
  maxParticipants,
  currentParticipants,
  pickupTimeWindow,
  cancellationPolicy,
}) => {
  return (
    <div className="space-y-6">
      {/* Description Section */}
      {description && (
        <div>
          <h3 className="text-xl font-semibold mb-2">Event Description</h3>
          <p className="text-muted-foreground whitespace-pre-wrap">{description}</p>
        </div>
      )}
      
      {/* Key Details Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {duration && (
          <div className="bg-muted/50 p-3 rounded-md">
            <p className="text-xs font-medium text-muted-foreground">Duration</p>
            <p className="font-medium">{duration}</p>
          </div>
        )}
        {transportMode && (
          <div className="bg-muted/50 p-3 rounded-md">
            <p className="text-xs font-medium text-muted-foreground">Transport Mode</p>
            <p className="font-medium capitalize">{transportMode.replace('_', ' ')}</p>
          </div>
        )}
        {maxParticipants !== undefined && (
          <div className="bg-muted/50 p-3 rounded-md">
            <p className="text-xs font-medium text-muted-foreground">Group Size</p>
            <p className="font-medium">
              {currentParticipants ?? '0'} / {maxParticipants} Participants
            </p>
          </div>
        )}
        {pickupTimeWindow && (
          <div className="bg-muted/50 p-3 rounded-md">
            <p className="text-xs font-medium text-muted-foreground">Pickup Window</p>
            <p className="font-medium">{pickupTimeWindow}</p>
          </div>
        )}
      </div>
      
       {/* Cancellation Policy Section */}
      {cancellationPolicy && (
        <div>
          <h3 className="text-xl font-semibold mb-2">Cancellation Policy</h3>
          <p className="text-muted-foreground text-sm bg-muted/50 p-3 rounded-md whitespace-pre-wrap">
            {cancellationPolicy}
          </p>
        </div>
      )}
    </div>
  );
};
