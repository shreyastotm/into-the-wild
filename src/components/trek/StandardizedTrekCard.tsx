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

import React, { Component } from "react";

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
  type?: "event" | "gallery";
}

export const StandardizedTrekCard: React.FC<StandardizedTrekCardProps> = ({
  trek,
  onClick,
  showProgress = true,
  type = "event",
}) => {
  const participantCount = trek.participant_count ?? 0;
  const maxParticipants = trek.max_participants ?? 0;
  const availableSpots = maxParticipants - participantCount;
  const spotsFillPercent =
    maxParticipants > 0 ? (participantCount / maxParticipants) * 100 : 0;

  // Get image URL - filter out videos (they often end with .mp4, .mov, etc. or contain 'video')
  const getFirstImageUrl = () => {
    if (
      trek.image_url &&
      !trek.image_url.match(/\.(mp4|mov|avi|wmv|flv|webm)$/i) &&
      !trek.image_url.includes("video")
    ) {
      return trek.image_url;
    }
    if (trek.images && trek.images.length > 0) {
      // Find first non-video URL
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

  // Get price
  const price = trek.cost || trek.base_price || 0;

  // Format date
  const startDate = new Date(trek.start_datetime);
  const formattedDate = formatIndianDate(startDate);

  // Get difficulty badge color
  const getDifficultyVariant = (difficulty: string | null) => {
    switch (difficulty?.toLowerCase()) {
      case "easy":
        return "default";
      case "moderate":
        return "secondary";
      case "hard":
        return "destructive";
      default:
        return "outline";
    }
  };

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
      data-type={type}
      onClick={() => onClick?.(trek.trek_id)}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {/* Image Section */}
      <div className="mobile-trek-card-image">
        {imageUrl ? (
          <img src={imageUrl} alt={trek.name} loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Mountain className="w-12 h-12 text-muted-foreground" />
          </div>
        )}

        {/* Badges overlay */}
        <div className="absolute top-2 right-2 flex flex-col gap-1">
          {/* Past adventure indicator for gallery type */}
          {type === "gallery" && (
            <Badge
              variant="outline"
              className="bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700"
            >
              Past Adventure
            </Badge>
          )}

          {/* Difficulty badge removed from overlay - now in meta section */}
        </div>
      </div>

      {/* Content Section */}
      <div className="mobile-trek-card-content">
        {/* Title */}
        <h3 className="mobile-trek-card-title">{trek.name}</h3>

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

        {/* Progress Bar (for events only) */}
        {showProgress && type === "event" && maxParticipants > 0 && (
          <div className="mobile-trek-card-progress">
            <div className="flex justify-between items-center text-xs mb-1">
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                <span>
                  {participantCount} / {maxParticipants}
                </span>
              </div>
              <span className="text-muted-foreground">
                {availableSpots} spots left
              </span>
            </div>
            <Progress value={spotsFillPercent} className="h-1.5" />
          </div>
        )}

        {/* Footer */}
        <div className="mobile-trek-card-footer">
          {type === "event" ? (
            <div className="flex items-center gap-1 font-bold text-lg text-primary">
              <IndianRupee className="w-4 h-4" />
              {price.toLocaleString("en-IN")}
            </div>
          ) : null}

          {type === "event" ? (
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
