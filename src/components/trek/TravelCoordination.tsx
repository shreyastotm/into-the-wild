
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bus, Car, MapPin, Phone, Mail, Calendar, Clock } from 'lucide-react';

interface TravelCoordinationProps {
  transportMode: 'cars' | 'mini_van' | 'bus' | null;
  pickupTimeWindow: string | null;
  vendorContacts: any; // Using any for simplicity, ideally this would be typed properly
}

export const TravelCoordination: React.FC<TravelCoordinationProps> = ({
  transportMode,
  pickupTimeWindow,
  vendorContacts
}) => {
  const getTransportIcon = () => {
    switch(transportMode) {
      case 'cars':
        return <Car className="h-6 w-6 text-blue-500" />;
      case 'mini_van':
      case 'bus':
        return <Bus className="h-6 w-6 text-blue-500" />;
      default:
        return <MapPin className="h-6 w-6 text-blue-500" />;
    }
  };

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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            {getTransportIcon()}
            <span className="ml-2">Transport Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
              <div>
                <h4 className="font-medium">Transport Mode</h4>
                <p>{formatTransportMode(transportMode)}</p>
              </div>
            </div>
            
            {pickupTimeWindow && (
              <div className="flex items-start space-x-3">
                <Clock className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <h4 className="font-medium">Pickup Window</h4>
                  <p>{pickupTimeWindow}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {vendorContacts && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Contact Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {vendorContacts.name && (
                <div className="flex items-start space-x-3">
                  <div>
                    <h4 className="font-medium">{vendorContacts.name}</h4>
                    {vendorContacts.role && <p className="text-sm text-gray-500">{vendorContacts.role}</p>}
                  </div>
                </div>
              )}
              
              {vendorContacts.phone && (
                <div className="flex items-center space-x-3">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <p>{vendorContacts.phone}</p>
                </div>
              )}
              
              {vendorContacts.email && (
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <p>{vendorContacts.email}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
