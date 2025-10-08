import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Calendar, MapPin, Users, Clock, Wifi } from 'lucide-react';
import { formatDistanceToNow, isPast, isToday, isTomorrow, format } from 'date-fns';
import { TrekEventStatus } from '@/types/trek';
import { getTrekStatusBadgeProps, formatCurrency } from '@/lib/utils'; // Import formatCurrency

// Define type for Trek Events
export interface TrekEvent {
  trek_id: number;
  trek_name: string;
  description: string | null;
  category: string | null;
  start_datetime: string;
  duration?: string | null; // Made duration optional
  cost: number;
  max_participants: number;
  participant_count: number | null;
  location: { name?: string } | null;
  transport_mode: 'cars' | 'mini_van' | 'bus' | null;
  cancellation_policy: string | null;
  image_url?: string | null;
  event_creator_type: string;
  status?: TrekEventStatus | string | null;
}

interface TrekEventsListProps {
  treks: TrekEvent[];
  useLinks?: boolean;
}

export const TrekEventsList: React.FC<TrekEventsListProps> = ({ treks, useLinks = true }) => {
  const navigate = useNavigate();

  const getCategoryColor = (category: string | null) => {
    if (!category) return "bg-gray-100 text-gray-800";

    const categoryMap: Record<string, string> = {
      'Beginner': 'bg-green-100 text-green-800',
      'Intermediate': 'bg-blue-100 text-blue-800',
      'Advanced': 'bg-red-100 text-red-800',
      'Family': 'bg-purple-100 text-purple-800',
      'Weekend': 'bg-amber-100 text-amber-800',
      'Overnight': 'bg-indigo-100 text-indigo-800',
      'Day Trek': 'bg-sky-100 text-sky-800',
    };

    return categoryMap[category] || "bg-gray-100 text-gray-800";
  };

  const getTimeStatus = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) throw new Error('Invalid date');

      if (isPast(date)) return null;
      if (isToday(date)) return { label: 'Today', class: 'bg-green-500 text-white' };
      if (isTomorrow(date)) return { label: 'Tomorrow', class: 'bg-blue-500 text-white' };

      const daysUntil = Math.ceil((date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      if (daysUntil <= 3) return { label: `In ${daysUntil} days`, class: 'bg-amber-500 text-white' };

    } catch (e) {
      console.error("Error parsing date in getTimeStatus:", dateStr, e);
      return null; // Don't crash if date is invalid
    }
    return null;
  };

  const getSpacesLeftText = (participantCount: number | null, max: number) => {
    const filled = participantCount ?? 0;
    if (max <= 0) return "Max participants not set"; // Handle invalid max
    const remaining = max - filled;
    if (remaining <= 0) return "Fully Booked";
    if (remaining <= 3) return `Only ${remaining} spots left`;
    return `${remaining} spots available`;
  };

  const getSpacesLeftColor = (participantCount: number | null, max: number) => {
    const filled = participantCount ?? 0;
    if (max <= 0) return "bg-gray-100 text-gray-700"; // Handle invalid max
    const remaining = max - filled;
    if (remaining <= 0) return "bg-red-100 text-red-700";
    if (remaining <= 3) return "bg-amber-100 text-amber-700";
    return "bg-green-100 text-green-700";
  };

  const handleTrekClick = (trekId: number) => {
    navigate(`/trek-events/${trekId}`);
  };

  const getCreatorBadge = (event: TrekEvent) => {
    let badgeText = 'Trekker';
    let badgeClass = 'bg-gray-100 text-gray-800';

    if (event.event_creator_type === 'internal') {
      badgeText = 'Admin';
      badgeClass = 'bg-blue-100 text-blue-800';
    } else if (event.event_creator_type === 'external') {
      badgeText = 'Micro-Community';
      badgeClass = 'bg-green-100 text-green-800';
    }
    
    return <span className={`${badgeClass} px-2 py-1 rounded text-xs ml-2 whitespace-nowrap`}>{badgeText}</span>;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
      {treks.map((trek) => {
        let startDate: Date | null = null;
        let isLive = false; // Initialize isLive flag

        try {
          startDate = new Date(trek.start_datetime);
          if (isNaN(startDate.getTime())) throw new Error('Invalid date');
          // Simplistic definition: Live if the start date is today.
          // A more robust solution would check if now is between start and end.
          isLive = isToday(startDate); 
        } catch (e) {
           console.error("Error parsing start_datetime for trek:", trek.trek_id, trek.start_datetime, e);
        }

        // Get the standard time status (Tomorrow, In X days)
        // We will override this with "Live" if isLive is true
        const timeStatus = startDate && !isLive ? getTimeStatus(trek.start_datetime) : null; 

        const cardContent = (
          <Card className="h-full flex flex-col overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-primary/20 relative group">
            {/* Trek Image Display */}
            {(trek.image_url || trek.image) ? (
              <div className="aspect-video overflow-hidden">
                 <img
                  src={trek.image_url || trek.image}
                  alt={trek.trek_name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                 />
              </div>
            ) : (
              <div className="aspect-video bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-400">
                 {/* Icon could be added here */}
                 <MapPin className="h-8 w-8 sm:h-12 sm:w-12" />
              </div>
            )}

            {/* Status Badge Area */}
            <div className="absolute top-2 right-2 sm:top-3 sm:right-3 z-10 flex gap-1 flex-wrap justify-end">
              {trek.status && trek.status !== TrekEventStatus.UPCOMING && trek.status !== TrekEventStatus.OPEN_FOR_REGISTRATION && (
                (() => {
                  const badgeProps = getTrekStatusBadgeProps(trek.status);
                  return (
                    <Badge variant={badgeProps.variant} 
                           className={`text-xs capitalize whitespace-nowrap ${badgeProps.className}`}>
                      {trek.status}
                    </Badge>
                  );
                })()
              )}
              {isLive && (
                <Badge className="bg-red-500 text-white border-red-600 flex items-center gap-1 text-xs">
                  <Wifi size={10} className="animate-pulse sm:w-3 sm:h-3"/> 
                  Live
                </Badge>
              )}
              {timeStatus && ( // Only show other statuses if not live
                <Badge className={`${timeStatus.class} text-xs`}> {/* Ensure text size consistency */}
                  {timeStatus.label}
                </Badge>
              )}
            </div>

            <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-1">
                <h3 className="text-base sm:text-lg font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                  <span className="flex items-center gap-2">
                    <span className="flex-1">{trek.trek_name}</span>
                    {getCreatorBadge(trek)}
                  </span>
                </h3>
                {trek.category && (
                  <Badge variant="outline" className={`${getCategoryColor(trek.category)} border-0 whitespace-nowrap self-start`}>
                    {trek.category}
                  </Badge>
                )}
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem] sm:min-h-[2.75rem]">
                {trek.description || "No description available."}
              </p>
            </CardHeader>

            <CardContent className="pb-2 sm:pb-3 px-3 sm:px-6 flex-grow">
              <div className="space-y-1.5 sm:space-y-2">
                {startDate && (
                  <div className="flex items-center text-xs sm:text-sm">
                    <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 text-muted-foreground flex-shrink-0" />
                    <span className="truncate">
                      {format(startDate, 'EEE, MMM d, yyyy')} at {format(startDate, 'h:mm a')}
                    </span>
                  </div>
                )}

                {trek.duration && (
                  <div className="flex items-center text-xs sm:text-sm">
                    <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 text-muted-foreground flex-shrink-0" />
                    <span className="truncate">Duration: {trek.duration}</span>
                  </div>
                )}

                <div className="flex items-center text-xs sm:text-sm">
                  <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 text-muted-foreground flex-shrink-0" />
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${getSpacesLeftColor(trek.participant_count, trek.max_participants)}`}>
                    {getSpacesLeftText(trek.participant_count, trek.max_participants)}
                  </span>
                </div>
              </div>
            </CardContent>

            <CardFooter className="pt-2 sm:pt-3 px-3 sm:px-6 flex flex-col sm:flex-row sm:justify-between sm:items-center border-t mt-auto gap-2 sm:gap-0">
               <div className="order-2 sm:order-1">
                  {startDate && (
                    <p className="text-xs sm:text-sm text-muted-foreground">
                       Starts {formatDistanceToNow(startDate, { addSuffix: true })}
                    </p>
                  )}
               </div>
               <div className="order-1 sm:order-2 text-left sm:text-right">
                 <p className="font-bold text-base sm:text-lg">{formatCurrency(trek.cost)}</p>
               </div>
            </CardFooter>
          </Card>
        );

        if (useLinks) {
          return (
            <div
              key={trek.trek_id}
              className="h-full cursor-pointer" // Ensure div takes full height for proper layout
              onClick={() => handleTrekClick(trek.trek_id)}
            >
              {cardContent}
            </div>
          );
        } else {
          return (
            <div key={trek.trek_id} className="h-full"> {/* Ensure div takes full height */}
              {cardContent}
            </div>
          );
        }
      })}
    </div>
  );
};
