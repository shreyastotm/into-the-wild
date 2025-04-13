
import React from 'react';
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { CalendarClock, Users, Clock, MapPin, CreditCard, Info } from "lucide-react";

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
  const formatTransportMode = (mode: string | null): string => {
    switch(mode) {
      case 'cars':
        return 'Personal Cars';
      case 'mini_van':
        return 'Mini Van';
      case 'bus':
        return 'Bus';
      default:
        return 'Not specified';
    }
  };

  const availableSpots = maxParticipants - (currentParticipants || 0);
  const spotsFillPercent = ((currentParticipants || 0) / maxParticipants) * 100;

  return (
    <div className="prose max-w-none">
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold flex items-center">
            <Info className="h-5 w-5 mr-2" />
            About This Trek
          </h3>
          <p className="mt-2">{description || 'No description available for this trek.'}</p>
        </div>
        
        <Separator className="my-4" />
        
        <div>
          <h3 className="text-xl font-semibold flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Trek Details
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <CalendarClock className="h-4 w-4 mr-2 text-gray-600" />
                <h4 className="font-medium">Duration & Travel</h4>
              </div>
              <div className="space-y-2 ml-6">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Duration:</span>
                  <span className="font-medium">{duration || 'Not specified'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Transport Mode:</span>
                  <Badge variant="outline">{formatTransportMode(transportMode)}</Badge>
                </div>
                {pickupTimeWindow && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Pickup Window:</span>
                    <span className="font-medium">{pickupTimeWindow}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <Users className="h-4 w-4 mr-2 text-gray-600" />
                <h4 className="font-medium">Participation</h4>
              </div>
              <div className="space-y-2 ml-6">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Max Participants:</span>
                  <span className="font-medium">{maxParticipants}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Current Registrations:</span>
                  <span className="font-medium">{currentParticipants || 0} participants</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Available Spots:</span>
                  <Badge variant={availableSpots > 5 ? "outline" : "secondary"} className={availableSpots <= 5 ? "bg-amber-100 text-amber-800 border-amber-200" : ""}>
                    {availableSpots} remaining
                  </Badge>
                </div>
                <div className="mt-2">
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${spotsFillPercent >= 80 ? 'bg-amber-500' : 'bg-green-500'}`} 
                      style={{ width: `${spotsFillPercent}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {cancellationPolicy && (
          <>
            <Separator className="my-4" />
            
            <div>
              <h3 className="text-xl font-semibold flex items-center">
                <CreditCard className="h-5 w-5 mr-2" />
                Cancellation Policy
              </h3>
              <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm">{cancellationPolicy}</p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
