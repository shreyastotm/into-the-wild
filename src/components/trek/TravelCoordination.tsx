
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { MapPin, Car, Bus, AlertCircle, Users, CalendarClock, Map } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <CalendarClock className="h-4 w-4 mr-2 text-gray-600" />
                <h3 className="font-medium">Transport Details</h3>
              </div>
              <div className="ml-6 space-y-2">
                <div className="flex items-center">
                  <span className="text-sm font-medium w-24">Mode:</span>
                  <Badge variant="secondary" className="text-sm">
                    {formatTransportMode(transportMode)}
                  </Badge>
                </div>
                
                {pickupTimeWindow && (
                  <div className="flex items-start">
                    <span className="text-sm font-medium w-24">Pickup Time:</span>
                    <span className="text-sm">{pickupTimeWindow}</span>
                  </div>
                )}
              </div>
            </div>
            
            {isRegistered && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <Users className="h-4 w-4 mr-2 text-gray-600" />
                  <h3 className="font-medium">Coordination</h3>
                </div>
                <p className="text-sm text-gray-600 ml-6">
                  Details about fellow trekkers and coordination will be available here once finalized.
                </p>
              </div>
            )}
          </div>
          
          {pickupLocations && pickupLocations.length > 0 && (
            <div>
              <div className="flex items-center mb-2">
                <Map className="h-4 w-4 mr-2 text-gray-600" />
                <h3 className="font-medium">Pickup Locations</h3>
              </div>
              <ul className="list-disc list-inside text-sm space-y-1 ml-6">
                {pickupLocations.map(loc => (
                  <li key={loc.id}>{loc.location}</li>
                ))}
              </ul>
            </div>
          )}
          
          {additionalNotes && (
            <div>
              <Separator className="my-3" />
              <h3 className="font-medium mb-1">Additional Notes</h3>
              <p className="text-sm">{additionalNotes}</p>
            </div>
          )}
          
          {!isRegistered && (
            <div className="bg-amber-50 border border-amber-200 rounded-md p-3 flex items-start mt-4">
              <AlertCircle className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-amber-700 mb-2">
                  Register for this trek to see complete travel coordination details.
                </p>
                <Button variant="outline" size="sm" className="text-amber-600 border-amber-300 hover:bg-amber-100">
                  Register Now
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
