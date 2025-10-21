import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  Mountain,
  IndianRupee
} from 'lucide-react';
import { format } from 'date-fns';

interface StandardizedTrekCardProps {
  trek: {
    trek_id: number;
    name: string;
    description?: string | null;
    location?: string | null;
    start_datetime: string;
    difficulty?: string | null;
    duration?: string | null;
    cost?: number;
    base_price?: number;
    max_participants?: number;
    participant_count?: number | null;
    image_url?: string | null;
    images?: string[];
    category?: string | null;
  };
  onClick?: (trekId: number) => void;
  showProgress?: boolean;
  type?: 'event' | 'gallery';
}

export const StandardizedTrekCard: React.FC<StandardizedTrekCardProps> = ({
  trek,
  onClick,
  showProgress = true,
  type = 'event'
}) => {
  const participantCount = trek.participant_count ?? 0;
  const maxParticipants = trek.max_participants ?? 0;
  const availableSpots = maxParticipants - participantCount;
  const spotsFillPercent = maxParticipants > 0 ? (participantCount / maxParticipants) * 100 : 0;

  // Get image URL
  const imageUrl = trek.image_url || trek.images?.[0] || null;

  // Get price
  const price = trek.cost || trek.base_price || 0;

  // Format date
  const startDate = new Date(trek.start_datetime);
  const formattedDate = format(startDate, 'MMM dd, yyyy');

  // Get difficulty badge color
  const getDifficultyVariant = (difficulty: string | null) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'default';
      case 'moderate': return 'secondary';
      case 'hard': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div
      className="mobile-trek-card"
      onClick={() => onClick?.(trek.trek_id)}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {/* Image Section */}
      <div className="mobile-trek-card-image">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={trek.name}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Mountain className="w-12 h-12 text-gray-400 dark:text-gray-600" />
          </div>
        )}

        {/* Badges overlay */}
        <div className="absolute top-2 right-2 flex flex-col gap-1">
          {trek.difficulty && (
            <Badge variant={getDifficultyVariant(trek.difficulty)}>
              {trek.difficulty}
            </Badge>
          )}
        </div>
      </div>

      {/* Content Section */}
      <div className="mobile-trek-card-content">
        {/* Title */}
        <h3 className="mobile-trek-card-title">
          {trek.name}
        </h3>

        {/* Meta Information */}
        <div className="mobile-trek-card-meta">
          {trek.location && (
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{trek.location}</span>
            </div>
          )}

          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4 flex-shrink-0" />
            <span>{formattedDate}</span>
          </div>

          {trek.duration && (
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4 flex-shrink-0" />
              <span>{trek.duration}</span>
            </div>
          )}
        </div>

        {/* Description */}
        {trek.description && (
          <p className="mobile-trek-card-description">
            {trek.description}
          </p>
        )}

        {/* Progress Bar (for events only) */}
        {showProgress && type === 'event' && maxParticipants > 0 && (
          <div className="mobile-trek-card-progress">
            <div className="flex justify-between items-center text-xs mb-1">
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                <span>{participantCount} / {maxParticipants}</span>
              </div>
              <span className="text-gray-500 dark:text-gray-500">
                {availableSpots} spots left
              </span>
            </div>
            <Progress value={spotsFillPercent} className="h-1.5" />
          </div>
        )}

        {/* Footer */}
        <div className="mobile-trek-card-footer">
          <div className="flex items-center gap-1 font-bold text-lg text-primary">
            <IndianRupee className="w-4 h-4" />
            {price.toLocaleString('en-IN')}
          </div>

          {type === 'event' ? (
            <Button size="sm" variant="default">
              View Details
            </Button>
          ) : (
            <Button size="sm" variant="outline">
              View Gallery
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default StandardizedTrekCard;
