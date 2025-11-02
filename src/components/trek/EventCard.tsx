import { format } from "date-fns";
import {
  Calendar,
  Clock,
  IndianRupee,
  MapPin,
  Mountain,
  TreePine,
  Users,
  Zap,
} from "lucide-react";
import React, { Component } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { formatIndianDate } from "@/utils/indianStandards";

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
    event_type?: string | null;
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
      className={cn(
        "group relative overflow-hidden rounded-2xl transition-all duration-300",
        "bg-white/10 dark:bg-gray-800/10",
        "backdrop-blur-md border border-white/20 dark:border-gray-700/30",
        "hover:shadow-2xl hover:border-primary/50 hover:scale-105",
        "hover:bg-white/15 dark:hover:bg-gray-800/20",
        onClick ? "cursor-pointer active:scale-95" : "",
      )}
      onClick={() => onClick?.(trek.trek_id)}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {/* Image Section - Glass Morphism Enhancement */}
      <div className="relative h-40 sm:h-48 overflow-hidden">
        {imageUrl ? (
          <>
            <img
              src={imageUrl}
              alt={trek.name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              loading="lazy"
            />
            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
            <Mountain className="w-12 h-12 text-muted-foreground/30" />
          </div>
        )}

        {/* Category Badge */}
        {trek.category && (
          <div className="absolute top-3 left-3">
            <Badge
              variant="secondary"
              className="backdrop-blur-md bg-black/40 text-white border-white/20"
            >
              {trek.category}
            </Badge>
          </div>
        )}

        {/* Difficulty Badge */}
        {trek.difficulty && (
          <div className="absolute top-3 right-3">
            <Badge
              variant="outline"
              className="backdrop-blur-md bg-black/40 text-white border-white/20 flex items-center gap-1"
            >
              {getDifficultyIcon(trek.difficulty)}
              <span className="capitalize text-xs">{trek.difficulty}</span>
            </Badge>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-4 sm:p-6 space-y-4">
        {/* Title */}
        <div className="space-y-2">
          <h3 className="text-lg sm:text-xl font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
            {trek.name}
          </h3>
          {trek.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {trek.description}
            </p>
          )}
        </div>

        {/* Quick Info Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Date */}
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-primary flex-shrink-0" />
            <span className="text-muted-foreground">{formattedDate}</span>
          </div>

          {/* Duration */}
          {trek.duration && (
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-primary flex-shrink-0" />
              <span className="text-muted-foreground">{trek.duration}</span>
            </div>
          )}

          {/* Location */}
          {trek.location && (
            <div className="flex items-center gap-2 text-sm col-span-2">
              <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
              <span className="text-muted-foreground truncate">
                {trek.location}
              </span>
            </div>
          )}
        </div>

        {/* Price and Participants */}
        <div className="flex justify-between items-center pt-2 border-t border-white/10">
          <div className="flex items-center gap-1">
            <IndianRupee className="w-4 h-4 text-primary" />
            <span className="font-bold text-foreground">{price}</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Users className="w-4 h-4" />
            <span className="text-sm">
              {participantCount}/{maxParticipants}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        {showProgress && (
          <div className="space-y-2">
            <Progress
              value={spotsFillPercent}
              className="h-2 bg-white/10 backdrop-blur-sm"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{availableSpots} spots left</span>
              <span>{Math.round(spotsFillPercent)}% full</span>
            </div>
          </div>
        )}

        {/* CTA Button */}
        <Button
          onClick={(e) => {
            e.stopPropagation();
            onClick?.(trek.trek_id);
          }}
          className={cn(
            "w-full",
            "bg-gradient-to-r from-primary/80 to-accent/80",
            "hover:from-primary hover:to-accent",
            "text-white font-semibold",
            "transition-all duration-300",
            "backdrop-blur-sm border border-white/20",
          )}
        >
          View Details
        </Button>
      </div>

      {/* Hover Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/0 group-hover:from-primary/5 to-transparent pointer-events-none transition-opacity duration-300" />
    </div>
  );
};

export default EventCard;
