
import React, { useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { MapPin, Car, Bus, AlertCircle, Users, CalendarClock, Map, Phone, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TravelCoordinationProps {
  transportMode: 'cars' | 'mini_van' | 'bus' | null;
  pickupTimeWindow: string | null;
  pickupLocations?: Array<{id: string; location: string}> | null;
  additionalNotes?: string | null;
  isRegistered: boolean;
  vendorContacts?: Array<{id: string; name: string; role: string; phone: string}> | null;
}

export const TravelCoordination: React.FC<TravelCoordinationProps> = ({
  transportMode,
  pickupTimeWindow,
  pickupLocations = null,
  additionalNotes = null,
  isRegistered,
  vendorContacts = null
}) => {
  const [activeTab, setActiveTab] = useState("transport");
  
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
          {isRegistered ? (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="transport">Transport</TabsTrigger>
                <TabsTrigger value="pickup">Pickup</TabsTrigger>
                <TabsTrigger value="contacts">Contacts</TabsTrigger>
              </TabsList>
              
              <TabsContent value="transport" className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <CalendarClock className="h-4 w-4 mr-2 text-gray-600" />
                    <h3 className="font-medium">Transport Details</h3>
                  </div>
                  <div className="ml-6 space-y-3">
                    <div className="flex items-center">
                      <span className="text-sm font-medium w-24">Mode:</span>
                      <Badge variant="secondary" className="text-sm">
                        {formatTransportMode(transportMode)}
                      </Badge>
                    </div>
                    
                    {pickupTimeWindow && (
                      <div className="flex items-start">
                        <span className="text-sm font-medium w-24">Time Window:</span>
                        <span className="text-sm">{pickupTimeWindow}</span>
                      </div>
                    )}
                    
                    <div className="flex items-start">
                      <span className="text-sm font-medium w-24">Status:</span>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                        Confirmed
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <Users className="h-4 w-4 mr-2 text-gray-600" />
                    <h3 className="font-medium">Fellow Trekkers</h3>
                  </div>
                  <p className="text-sm text-gray-600 ml-6">
                    You will be traveling with 4 other trekkers in your vehicle.
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="pickup" className="space-y-4">
                {pickupLocations && pickupLocations.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <Map className="h-4 w-4 mr-2 text-gray-600" />
                      <h3 className="font-medium">Pickup Locations</h3>
                    </div>
                    <div className="ml-6">
                      <div className="space-y-3">
                        {pickupLocations.map(loc => (
                          <div key={loc.id} className="flex items-center">
                            <div className="h-6 w-6 rounded-full bg-primary text-white flex items-center justify-center text-xs mr-2">
                              {Number(loc.id)}
                            </div>
                            <div className="text-sm">{loc.location}</div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="mt-4 pt-3 border-t border-gray-200">
                        <h4 className="text-sm font-medium mb-2">Your Pickup Details</h4>
                        <p className="text-sm text-gray-600">
                          You will be picked up from the City Center Bus Stand at 6:00 AM. Please be at the location 10 minutes early.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="bg-amber-50 border border-amber-200 rounded-md p-3 flex items-start">
                  <Info className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-amber-700">
                    <p className="font-medium mb-1">Important</p>
                    <p>The pickup vehicle will wait for a maximum of 10 minutes. If you're going to be late, please contact the coordinator.</p>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="contacts" className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <Phone className="h-4 w-4 mr-2 text-gray-600" />
                    <h3 className="font-medium">Emergency Contacts</h3>
                  </div>
                  <div className="ml-6 space-y-3">
                    {vendorContacts ? (
                      vendorContacts.map(contact => (
                        <div key={contact.id} className="border-b border-gray-200 pb-2 last:border-0 last:pb-0">
                          <div className="font-medium text-sm">{contact.name}</div>
                          <div className="text-xs text-gray-500">{contact.role}</div>
                          <div className="flex items-center mt-1">
                            <Phone className="h-3 w-3 mr-1" />
                            <a href={`tel:${contact.phone}`} className="text-sm text-primary hover:underline">
                              {contact.phone}
                            </a>
                          </div>
                        </div>
                      ))
                    ) : (
                      <>
                        <div className="border-b border-gray-200 pb-2">
                          <div className="font-medium text-sm">Trek Coordinator</div>
                          <div className="text-xs text-gray-500">Main Contact</div>
                          <div className="flex items-center mt-1">
                            <Phone className="h-3 w-3 mr-1" />
                            <a href="tel:+919876543210" className="text-sm text-primary hover:underline">
                              +91 98765 43210
                            </a>
                          </div>
                        </div>
                        <div>
                          <div className="font-medium text-sm">Driver</div>
                          <div className="text-xs text-gray-500">Transport</div>
                          <div className="flex items-center mt-1">
                            <Phone className="h-3 w-3 mr-1" />
                            <a href="tel:+919988776655" className="text-sm text-primary hover:underline">
                              +91 99887 76655
                            </a>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          ) : (
            <>
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
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <Users className="h-4 w-4 mr-2 text-gray-600" />
                    <h3 className="font-medium">Coordination</h3>
                  </div>
                  <p className="text-sm text-gray-600 ml-6">
                    Details about fellow trekkers and coordination will be available here once finalized.
                  </p>
                </div>
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
            </>
          )}
        </div>
      </CardContent>
      {isRegistered && (
        <CardFooter className="border-t pt-4">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" className="w-full">
                  <Phone className="h-4 w-4 mr-2" /> Emergency Contact
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Call Trek Coordinator: +91 98765 43210</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardFooter>
      )}
    </Card>
  );
};
