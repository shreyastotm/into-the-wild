import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  Wifi, 
  Car, 
  Bus, 
  Train,
  Mountain,
  Camera,
  Heart,
  Share2,
  Bookmark,
  BookmarkCheck
} from 'lucide-react';
import { formatDistanceToNow, isPast, isToday, isTomorrow, format } from 'date-fns';
import { TrekEventStatus } from '@/types/trek';
import { getTrekStatusBadgeProps, formatCurrency } from '@/lib/utils';
import StatusBadge from '@/components/admin/StatusBadge';

export interface TrekCardBaseProps {
  trek: {
    trek_id: number;
    trek_name: string;
    description?: string | null;
    category?: string | null;
    start_datetime: string;
    duration?: string | null;
    cost: number;
    max_participants: number;
    participant_count?: number | null;
    location?: { name?: string } | null;
    transport_mode?: 'cars' | 'mini_van' | 'bus' | null;
    cancellation_policy?: string | null;
    image_url?: string | null;
    event_creator_type?: string;
    status?: TrekEventStatus | string | null;
  };
  variant?: 'default' | 'compact' | 'detailed' | 'minimal';
  showImage?: boolean;
  showActions?: boolean;
  showProgress?: boolean;
  showStatus?: boolean;
  showTimeStatus?: boolean;
  showTransport?: boolean;
  showCategory?: boolean;
  showLocation?: boolean;
  showDuration?: boolean;
  showDescription?: boolean;
  showCreator?: boolean;
  onCardClick?: (trekId: number) => void;
  onRegister?: (trekId: number) => void;
  onBookmark?: (trekId: number) => void;
  onShare?: (trekId: number) => void;
  isBookmarked?: boolean;
  isRegistered?: boolean;
  className?: string;
  actions?: React.ReactNode;
  footer?: React.ReactNode;
}

const TrekCardBase: React.FC<TrekCardBaseProps> = ({
  trek,
  variant = 'default',
  showImage = true,
  showActions = true,
  showProgress = true,
  showStatus = true,
  showTimeStatus = true,
  showTransport = true,
  showCategory = true,
  showLocation = true,
  showDuration = true,
  showDescription = true,
  showCreator = false,
  onCardClick,
  onRegister,
  onBookmark,
  onShare,
  isBookmarked = false,
  isRegistered = false,
  className = '',
  actions,
  footer,
}) => {
  const participantCount = trek.participant_count ?? 0;
  const availableSpots = trek.max_participants - participantCount;
  const spotsFillPercent = (participantCount / trek.max_participants) * 100;
  const isFull = availableSpots <= 0;


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
      return null;
    }
    return null;
  };

  const getSpacesLeftText = (participantCount: number | null, max: number) => {
    const filled = participantCount ?? 0;
    if (max <= 0) return "Max participants not set";
    const remaining = max - filled;
    if (remaining <= 0) return "Fully Booked";
    if (remaining <= 3) return `Only ${remaining} spots left`;
    return `${remaining} spots available`;
  };

  const getSpacesLeftColor = (participantCount: number | null, max: number) => {
    const filled = participantCount ?? 0;
    if (max <= 0) return "text-gray-500";
    const remaining = max - filled;
    if (remaining <= 0) return "text-red-500";
    if (remaining <= 3) return "text-amber-500";
    return "text-green-500";
  };

  const getTransportIcon = (mode: string | null) => {
    switch (mode) {
      case 'cars': return <Car className="h-4 w-4" />;
      case 'mini_van': return <Car className="h-4 w-4" />;
      case 'bus': return <Bus className="h-4 w-4" />;
      default: return <Car className="h-4 w-4" />;
    }
  };

  const timeStatus = getTimeStatus(trek.start_datetime);
  const startDate = new Date(trek.start_datetime);

  const cardContent = (
    <Card className={`h-full flex flex-col ${className}`}>
      {/* Image */}
      {showImage && (
        <div className="relative h-56 w-full overflow-hidden rounded-t-lg bg-gradient-to-br from-blue-50 to-indigo-100">
          {trek.image_url && (
            <img
              src={trek.image_url}
              alt={trek.trek_name}
              className="h-full w-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          )}
          {/* Fallback image when no image_url or image fails to load */}
          <div className="h-full w-full flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <Mountain className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm font-medium">{trek.trek_name}</p>
            </div>
          </div>
          {showTimeStatus && timeStatus && (
            <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${timeStatus.class}`}>
              {timeStatus.label}
            </div>
          )}
        </div>
      )}

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-lg leading-tight mb-2 line-clamp-2">
              {trek.trek_name}
            </h3>
            
            {/* Status Tags */}
            {showStatus && trek.status && (
              <div className="flex items-center gap-2 mb-2">
                {(() => {
                  const badgeProps = getTrekStatusBadgeProps(trek.status);
                  return (
                    <Badge 
                      variant={badgeProps.variant} 
                      className={`text-xs font-medium ${badgeProps.className}`}
                    >
                      {trek.status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                    </Badge>
                  );
                })()}
              </div>
            )}
            
            {/* Category and Creator */}
            <div className="flex items-center gap-2 mb-2">
              {showCategory && trek.category && (
                <Badge className={getCategoryColor(trek.category)}>
                  {trek.category}
                </Badge>
              )}
              {showCreator && trek.event_creator_type && (
                <Badge variant="outline" className="text-xs">
                  {trek.event_creator_type}
                </Badge>
              )}
            </div>

            {/* Location and Duration */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              {showLocation && trek.location?.name && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span className="truncate">{trek.location.name}</span>
                </div>
              )}
              {showDuration && trek.duration && (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{trek.duration}</span>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          {showActions && (
            <div className="flex items-center gap-1 ml-2">
              {onBookmark && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onBookmark(trek.trek_id);
                  }}
                >
                  {isBookmarked ? (
                    <BookmarkCheck className="h-4 w-4 text-primary" />
                  ) : (
                    <Bookmark className="h-4 w-4" />
                  )}
                </Button>
              )}
              {onShare && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onShare(trek.trek_id);
                  }}
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 pb-3">
        {/* Description */}
        {showDescription && trek.description && variant !== 'compact' && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
            {trek.description}
          </p>
        )}

        {/* Transport Mode */}
        {showTransport && trek.transport_mode && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
            {getTransportIcon(trek.transport_mode)}
            <span className="capitalize">{trek.transport_mode.replace('_', ' ')}</span>
          </div>
        )}

        {/* Progress Bar */}
        {showProgress && (
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>{participantCount} registered</span>
              </div>
              <span className={getSpacesLeftColor(participantCount, trek.max_participants)}>
                {getSpacesLeftText(participantCount, trek.max_participants)}
              </span>
            </div>
            <Progress value={spotsFillPercent} className="h-2" />
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-3 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{format(startDate, 'MMM dd, yyyy')}</span>
          </div>
          <div className="font-bold text-lg">
            {formatCurrency(trek.cost)}
          </div>
        </div>

        {actions || (
          onRegister && (
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onRegister(trek.trek_id);
              }}
              disabled={isFull || isRegistered}
              className="w-full sm:w-auto"
            >
              {isRegistered ? 'Registered' : isFull ? 'Full' : 'Register'}
            </Button>
          )
        )}
      </CardFooter>

      {footer}
    </Card>
  );

  if (onCardClick) {
    return (
      <div
        className="cursor-pointer h-full"
        onClick={() => onCardClick(trek.trek_id)}
      >
        {cardContent}
      </div>
    );
  }

  return cardContent;
};

export default TrekCardBase;
