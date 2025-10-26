import { format } from "date-fns";
import { Calendar, Clock, MapPin, Mountain } from "lucide-react";
import React, { Component } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatIndianDate } from '@/utils/indianStandards';

interface GalleryCardProps {
  trek: {
    trek_id: number;
    name: string;
    description?: string | null;
    location?: string | null;
    start_datetime: string;
    image_url?: string | null;
    images?: string[];
    // duration and category are optional for gallery items
    duration?: string | null;
    category?: string | null;
  };
  onClick?: (trekId: number) => void;
}

export const GalleryCard: React.FC<GalleryCardProps> = ({ trek, onClick }) => {
  // Safety check for undefined trek
  if (!trek) {
    return null;
  }
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

  // Format date
  const startDate = new Date(trek.start_datetime);
  const formattedDate = formatIndianDate(startDate);

  return (
    <div
      className="mobile-trek-card"
      data-type="gallery"
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
          <Badge
            variant="outline"
            className="bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700"
          >
            Past Adventure
          </Badge>
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

        {/* Meta Information - No difficulty for gallery items */}
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
          <p className="mobile-trek-card-description">{trek.description}</p>
        )}

        {/* Footer - Gallery button instead of View Details */}
        <div className="mobile-trek-card-footer">
          <Button size="sm" variant="outline">
            View Gallery
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GalleryCard;
