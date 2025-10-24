import { formatIndianDate } from '@/utils/indianStandards';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  Mountain,
  IndianRupee,
  TreePine,
  Zap,
} from "lucide-react";
import { format } from "date-fns";

interface EventCardProps {
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
}

export const EventCard: React.FC<EventCardProps> = ({
  trek,
  onClick,
  showProgress = true,
}) => {
  const participantCount = trek.participant_count ?? 0;

  // Get image URL - filter out videos
  const getFirstImageUrl = () => {
    if (
      trek.image_url &&
      !trek.image_url.match(/\.(mp4|mov|avi|wmv|flv|webm)$/i) &&
      !trek.image_url.includes("video")
    ) {
      return trek.image_url;
    }
    if (trek.images && trek.images.length > 0) {
      const firstImage = trek.images.find(
        (url) =>
          !url.match(/\.(mp4|mov|avi|wmv|flv|webm)$/i) &&
          !url.includes("video"),
      );
      return firstImage || trek.images[0];
    }
    return null;
  };

  const imageUrl = getFirstImageUrl();

  const maxParticipants = trek.max_participants ?? 0;
  const availableSpots = maxParticipants - participantCount;
  const spotsFillPercent =
    maxParticipants > 0 ? (participantCount / maxParticipants) * 100 : 0;

  // Get price
  const price = trek.cost || trek.base_price || 0;

  // Format date
  const startDate = new Date(trek.start_datetime);
  const formattedDate = formatIndianDate(startDate);

  // Get difficulty icon - matches existing TrekCard.tsx pattern
  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case "easy":
        return (
          <TreePine className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
        );
      case "moderate":
        return (
          <Mountain className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
        );
      case "hard":
        return (
          <Zap className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0" />
        );
      case "expert":
        return (
          <Zap className="w-4 h-4 text-purple-600 dark:text-purple-400 flex-shrink-0" />
        );
      default:
        return (
          <Mountain className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        );
    }
  };

  return (
    <div
      className="mobile-trek-card"
      data-type="event"
      onClick={() => onClick?.(trek.trek_id)}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {/* Image Section */}
      <div className="mobile-trek-card-image">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={trek.name}
            loading="lazy"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/20 dark:from-primary/5 dark:to-secondary/10">
            <Mountain className="w-12 h-12 text-muted-foreground" />
          </div>
        )}

        {/* Badges overlay - only past adventure for events */}
        <div className="absolute top-2 right-2 flex flex-col gap-1">
          {/* Past adventure indicator for gallery type - not used in events */}
        </div>
      </div>

      {/* Content Section */}
      <div className="mobile-trek-card-content">
        {/* Title - moved below image */}
        <h3 className="mobile-trek-card-title text-base font-bold text-foreground mb-2 truncate">
          {trek.name}
        </h3>

        {/* Category badge - horizontal */}
        {trek.category && (
          <div className="mb-3">
            <Badge variant="outline" className="text-xs">
              {trek.category.charAt(0).toUpperCase() + trek.category.slice(1)}
            </Badge>
          </div>
        )}

        {/* Meta Information with Difficulty Icon */}
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

          {/* Difficulty as visual icon in meta section */}
          {trek.difficulty && (
            <div className="flex items-center gap-1">
              {getDifficultyIcon(trek.difficulty)}
              <span className="capitalize">{trek.difficulty}</span>
            </div>
          )}
        </div>

        {/* Description */}
        {trek.description && (
          <p className="mobile-trek-card-description">{trek.description}</p>
        )}

        {/* Spots Left Counter - consistently positioned above footer */}
        {showProgress && maxParticipants > 0 && (
          <div className="flex justify-between items-center text-sm font-medium mb-2">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>
                {participantCount} / {maxParticipants}
              </span>
            </div>
            <span className="text-muted-foreground">
              {availableSpots} spots left
            </span>
          </div>
        )}

        {/* Footer */}
        <div className="mobile-trek-card-footer">
          <div className="flex items-center gap-1 font-bold text-lg text-primary">
            <IndianRupee className="w-4 h-4" />
            {price.toLocaleString("en-IN")}
          </div>

          <Button size="sm" variant="default">
            View Details
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
