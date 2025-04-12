
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { MapPin, Car, Bus, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TravelCoordinationProps {
  transportMode: 'cars' | 'mini_van' | 'bus' | null;
  pickupTimeWindow: string | null;
  pickupLocations?: Array<{id: string; location: string}> | null;
  additionalNotes?: string | null;
  isRegistered: boolean;
}

export const TravelCoordination: React.FC<TravelCoordinationProps> = ({
  transportMode,
  pickupTimeWindow,
  pickupLocations = null,
  additionalNotes = null,
  isRegistered
}) => {
  
  const getTransportIcon = () => {
    switch(transportMode) {
      case 'cars':
        return <Car className="h-5 w-5" />;
      case 'mini_van':
      case 'bus':
        return <Bus className="h-5 w-5" />;
      default:
        return <MapPin className="h-5 w-5" />;
    }
  };

  const formatTransportMode = (mode: 'cars' | 'mini_van' | 'bus' | null): string => {
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          {getTransportIcon()}
          <span className="ml-2">Travel Coordination</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-1">Transport Mode</h3>
            <Badge variant="secondary" className="text-sm">
              {formatTransportMode(transportMode)}
            </Badge>
          </div>
          
          {pickupTimeWindow && (
            <div>
              <h3 className="font-medium mb-1">Pickup Time</h3>
              <p className="text-sm">{pickupTimeWindow}</p>
            </div>
          )}
          
          {pickupLocations && pickupLocations.length > 0 && (
            <div>
              <h3 className="font-medium mb-1">Pickup Locations</h3>
              <ul className="list-disc list-inside text-sm space-y-1">
                {pickupLocations.map(loc => (
                  <li key={loc.id}>{loc.location}</li>
                ))}
              </ul>
            </div>
          )}
          
          {additionalNotes && (
            <div>
              <h3 className="font-medium mb-1">Additional Notes</h3>
              <p className="text-sm">{additionalNotes}</p>
            </div>
          )}
          
          {!isRegistered && (
            <div className="bg-amber-50 border border-amber-200 rounded-md p-3 flex items-start">
              <AlertCircle className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-700">
                Register for this trek to see complete travel coordination details.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
