import React, { useEffect, useState } from 'react';
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { CalendarClock, Users, Clock, MapPin, CreditCard, Info, Map, Car, Bus, UserCheck } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { supabase } from '@/integrations/supabase/client';

interface TrekEventDetailsProps {
  description: string | null;
  duration: string | null;
  transportMode: string | null;
  maxParticipants: number;
  currentParticipants: number | null;
  pickupTimeWindow: string | null;
  cancellationPolicy: string | null;
  image_url?: string | null;
  trekId?: number;
}

export const TrekEventDetailsComponent: React.FC<TrekEventDetailsProps> = ({
  description,
  duration,
  transportMode,
  maxParticipants,
  currentParticipants,
  pickupTimeWindow,
  cancellationPolicy,
  image_url,
  trekId,
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

  const getTransportIcon = () => {
    switch(transportMode) {
      case 'cars':
        return <Car className="h-4 w-4 mr-1 text-gray-600" />;
      case 'mini_van':
      case 'bus':
        return <Bus className="h-4 w-4 mr-1 text-gray-600" />;
      default:
        return <MapPin className="h-4 w-4 mr-1 text-gray-600" />;
    }
  };

  const availableSpots = maxParticipants - (currentParticipants || 0);
  const spotsFillPercent = ((currentParticipants || 0) / maxParticipants) * 100;

  // --- Packing List State ---
  const [packingList, setPackingList] = useState<any[]>([]);
  const [packingLoading, setPackingLoading] = useState(false);
  useEffect(() => {
    if (!trekId) return;
    setPackingLoading(true);
    supabase
      .from('trek_packing_list')
      .select('name, mandatory, item_order')
      .eq('trek_id', trekId)
      .order('item_order', { ascending: true })
      .then(({ data }) => {
        setPackingList(data || []);
        setPackingLoading(false);
      });
  }, [trekId]);

  return (
    <div className="prose max-w-none">
      {/* Trek Image Display */}
      {image_url && (
        <img
          src={image_url}
          alt="Trek Event"
          className="w-full max-h-64 object-cover rounded mb-4 border border-gray-200"
        />
      )}
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
                  <Badge variant="outline" className="flex items-center">
                    {getTransportIcon()}
                    {formatTransportMode(transportMode)}
                  </Badge>
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
                  <div className="flex items-center">
                    <UserCheck className="h-4 w-4 mr-1 text-green-600" />
                    <span className="font-medium">{currentParticipants || 0} participants</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Available Spots:</span>
                  <Badge variant={availableSpots > 5 ? "outline" : "secondary"} className={availableSpots <= 5 ? "bg-amber-100 text-amber-800 border-amber-200" : ""}>
                    {availableSpots} remaining
                  </Badge>
                </div>
                <div className="mt-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span>{currentParticipants || 0} joined</span>
                    <span>{availableSpots} spots left</span>
                  </div>
                  <Progress value={spotsFillPercent} className="h-2" />
                </div>
              </div>
            </div>
          </div>

          {(transportMode || pickupTimeWindow) && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
              <div className="flex items-center mb-3">
                <Map className="h-4 w-4 mr-2 text-gray-600" />
                <h4 className="font-medium">Travel Information</h4>
              </div>
              <p className="text-sm text-gray-600 ml-6">
                Travel will be arranged via {formatTransportMode(transportMode)}. 
                {pickupTimeWindow && ` Pickup will be available during the ${pickupTimeWindow} time window.`}
                See the Travel tab for more detailed coordination information.
              </p>
            </div>
          )}
        </div>
        
        {/* --- Packing List Section --- */}
        <Separator className="my-4" />
        <div>
          <h3 className="text-xl font-semibold flex items-center">
            <MapPin className="h-5 w-5 mr-2" />
            Packing Checklist
          </h3>
          {packingLoading ? (
            <div className="text-sm text-gray-500">Loading packing list...</div>
          ) : packingList && packingList.length > 0 ? (
            <ul className="mt-2">
              {packingList.map((item, idx) => (
                <li key={idx} className="flex items-center gap-2 text-sm">
                  <span className="inline-block w-2 h-2 rounded-full bg-blue-400" />
                  <span>{item.name}</span>
                  {item.mandatory ? <span className="ml-2 text-xs text-red-600 font-semibold">(Mandatory)</span> : <span className="ml-2 text-xs text-gray-500">(Optional)</span>}
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-sm text-gray-500">No packing list provided for this trek.</div>
          )}
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
