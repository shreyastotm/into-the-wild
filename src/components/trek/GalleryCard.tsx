import { format } from "date-fns";
import {
  Calendar,
  Camera,
  Clock,
  Eye,
  Heart,
  MapPin,
  MessageCircle,
  Mountain,
  Share2,
  Users,
} from "lucide-react";
import React, { useState } from "react";

import { useAuth } from "@/components/auth/AuthProvider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSocialFeatures } from "@/hooks/useSocialFeatures";
import { cn } from "@/lib/utils";
import { formatIndianDate } from "@/utils/indianStandards";

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
    // Social features
    tags?: Array<{
      id: number;
      name: string;
      color: string;
    }>;
    user_contributions?: Array<{
      id: number;
      image_url: string;
      caption: string | null;
      uploader_name: string;
    }>;
  };
  onClick?: (trekId: number) => void;
  onLike?: (trekId: number) => void;
  onShare?: (trekId: number) => void;
  isLiked?: boolean;
  likeCount?: number;
  viewCount?: number;
}

export const GalleryCard: React.FC<GalleryCardProps> = ({
  trek,
  onClick,
  onLike,
  onShare,
  isLiked = false,
  likeCount = 0,
  viewCount = 0,
}) => {
  const { user } = useAuth();
  const { likePost, sharePost } = useSocialFeatures();
  const [isHovered, setIsHovered] = useState(false);

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

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onLike) {
      onLike(trek.trek_id);
    }
    // For demo purposes, we'll simulate the like action
    console.log("Liked trek:", trek.trek_id);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onShare) {
      onShare(trek.trek_id);
    }
    // For demo purposes, we'll simulate the share action
    console.log("Shared trek:", trek.trek_id);
  };

  const totalMediaCount =
    (trek.images?.length || 0) + (trek.user_contributions?.length || 0);

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl transition-all duration-300 cursor-pointer",
        "bg-white/10 dark:bg-gray-800/10",
        "backdrop-blur-md border border-white/20 dark:border-gray-700/30",
        "hover:shadow-2xl hover:border-primary/50 hover:scale-105",
        "hover:bg-white/15 dark:hover:bg-gray-800/20",
      )}
      onClick={() => onClick?.(trek.trek_id)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {/* Image Section - Enhanced with Glass Morphism */}
      <div className="relative h-48 sm:h-56 overflow-hidden">
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

            {/* Social Interaction Overlay */}
            <div
              className={cn(
                "absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity duration-300",
                isHovered ? "opacity-100" : "opacity-0",
              )}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={handleLike}
                    className={cn(
                      "backdrop-blur-md border-white/20 text-white hover:bg-white/20",
                      isLiked && "bg-red-500/20 hover:bg-red-500/30",
                    )}
                  >
                    <Heart
                      className={cn("w-4 h-4 mr-1", isLiked && "fill-current")}
                    />
                    {likeCount}
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="backdrop-blur-md border-white/20 text-white hover:bg-white/20"
                  >
                    <MessageCircle className="w-4 h-4 mr-1" />
                    Comment
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={handleShare}
                    className="backdrop-blur-md border-white/20 text-white hover:bg-white/20"
                  >
                    <Share2 className="w-4 h-4 mr-1" />
                    Share
                  </Button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
            <Mountain className="w-12 h-12 text-muted-foreground/30" />
          </div>
        )}

        {/* Badges overlay */}
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          {/* Past adventure indicator for gallery type */}
          <Badge
            variant="outline"
            className="backdrop-blur-md bg-black/40 text-white border-white/20"
          >
            Past Adventure
          </Badge>

          {/* Media count badge */}
          {totalMediaCount > 1 && (
            <Badge
              variant="outline"
              className="backdrop-blur-md bg-black/40 text-white border-white/20 flex items-center gap-1"
            >
              <Camera className="w-3 h-3" />
              {totalMediaCount}
            </Badge>
          )}
        </div>

        {/* Social proof indicators */}
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {trek.tags && trek.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {trek.tags.slice(0, 2).map((tag) => (
                <Badge
                  key={tag.id}
                  variant="secondary"
                  className="backdrop-blur-md bg-black/40 text-white border-white/20 text-xs"
                  style={{
                    backgroundColor: `${tag.color}40`,
                    borderColor: `${tag.color}60`,
                    color: tag.color,
                  }}
                >
                  {tag.name}
                </Badge>
              ))}
              {trek.tags.length > 2 && (
                <Badge
                  variant="secondary"
                  className="backdrop-blur-md bg-black/40 text-white border-white/20 text-xs"
                >
                  +{trek.tags.length - 2}
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Community contributions indicator */}
        {trek.user_contributions && trek.user_contributions.length > 0 && (
          <div className="absolute bottom-3 right-3">
            <Badge
              variant="outline"
              className="backdrop-blur-md bg-black/40 text-white border-white/20 flex items-center gap-1"
            >
              <Users className="w-3 h-3" />
              {trek.user_contributions.length}
            </Badge>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-4 sm:p-6 space-y-4">
        {/* Title and Description */}
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

        {/* Category badge */}
        {trek.category && (
          <Badge variant="outline" className="text-xs">
            {trek.category.charAt(0).toUpperCase() + trek.category.slice(1)}
          </Badge>
        )}

        {/* Meta Information */}
        <div className="grid grid-cols-2 gap-3">
          {trek.location && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
              <span className="text-muted-foreground truncate">
                {trek.location}
              </span>
            </div>
          )}

          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-primary flex-shrink-0" />
            <span className="text-muted-foreground">{formattedDate}</span>
          </div>

          {trek.duration && (
            <div className="flex items-center gap-2 text-sm col-span-2">
              <Clock className="w-4 h-4 text-primary flex-shrink-0" />
              <span className="text-muted-foreground">{trek.duration}</span>
            </div>
          )}
        </div>

        {/* Social stats */}
        <div className="flex justify-between items-center pt-2 border-t border-white/10">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Heart className="w-4 h-4" />
              <span>{likeCount}</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              <span>{viewCount}</span>
            </div>
          </div>

          {trek.user_contributions && trek.user_contributions.length > 0 && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Users className="w-4 h-4" />
              <span>{trek.user_contributions.length} photos</span>
            </div>
          )}
        </div>

        {/* CTA Button */}
        <Button
          className={cn(
            "w-full",
            "bg-gradient-to-r from-primary/80 to-accent/80",
            "hover:from-primary hover:to-accent",
            "text-white font-semibold",
            "transition-all duration-300",
            "backdrop-blur-sm border border-white/20",
          )}
        >
          View Gallery
        </Button>
      </div>

      {/* Hover Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/0 group-hover:from-primary/5 to-transparent pointer-events-none transition-opacity duration-300" />
    </div>
  );
};

export default GalleryCard;
