import { AnimatePresence, motion } from "framer-motion";
import {
  Calendar,
  Camera,
  ChevronLeft,
  ChevronRight,
  Eye,
  Heart,
  MapPin,
  Mountain,
  Share2,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";

import { useAuth } from "@/components/auth/AuthProvider";
import { OrigamiHamburger } from "@/components/navigation/OrigamiHamburger";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { formatIndianDate } from "@/utils/indianStandards";
import {
  fetchTrekEngagement,
  fetchTrekParticipants,
  getTrekDistance,
} from "@/utils/trekDataHelpers";

// Enhanced Glass Morphism Card Component
interface GlassGalleryCardProps {
  trek: {
    trek_id: number;
    name: string;
    description?: string;
    location?: string;
    start_datetime: string;
    images?: string[];
    tags?: Array<{ id: number; name: string; color: string }>;
    user_contributions?: Array<{
      id: number;
      image_url: string;
      caption: string | null;
      uploader_name: string;
    }>;
  };
  onClick: () => void;
  onLike: () => void;
  onShare: () => void;
  isLiked: boolean;
  likeCount: number;
  viewCount: number;
}

const GlassGalleryCard: React.FC<GlassGalleryCardProps> = ({
  trek,
  onClick,
  onLike,
  onShare,
  isLiked,
  likeCount,
  viewCount,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const getFirstImageUrl = () => {
    if (trek.images && trek.images.length > 0) {
      return (
        trek.images.find(
          (url) =>
            !url.match(/\.(mp4|mov|avi|wmv|flv|webm)$/i) &&
            !url.includes("video"),
        ) || trek.images[0]
      );
    }
    return null;
  };

  const imageUrl = getFirstImageUrl();
  const totalMediaCount =
    (trek.images?.length || 0) + (trek.user_contributions?.length || 0);

  return (
    <motion.div
      className={cn(
        "group relative overflow-hidden cursor-pointer h-[450px]", // Increased height
        // 2026 Glass Morphism - Ultra High Transparency
        "bg-white/5 dark:bg-gray-900/5",
        "backdrop-blur-xl backdrop-saturate-150",
        // Enhanced Dew Drop Effect
        "border border-white/10 dark:border-gray-700/10",
        "rounded-3xl",
        // Orange Glow Highlight Band
        "ring-0 ring-orange-400/0 ring-offset-0",
        "hover:ring-2 hover:ring-orange-400/60 hover:ring-offset-2 hover:ring-offset-orange-100/20",
        // Enhanced Shadow with Orange Tint
        "shadow-lg shadow-black/5 hover:shadow-2xl hover:shadow-orange-500/20",
        // Smooth Transitions
        "transition-all duration-500 ease-out",
        "hover:scale-[1.02] hover:rotate-[0.5deg]",
        // Glass Surface Texture
        "before:absolute before:inset-0 before:rounded-3xl",
        "before:bg-gradient-to-br before:from-white/20 before:via-transparent before:to-transparent",
        "before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300",
        // Flex layout for consistent spacing
        "flex flex-col",
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      whileHover={{
        y: -8,
        transition: { duration: 0.3, ease: "easeOut" },
      }}
    >
      {/* Dew Drop Reflection Effect */}
      <div
        className={cn(
          "absolute top-4 left-4 w-3 h-3 rounded-full",
          "bg-gradient-to-br from-white/80 via-orange-200/60 to-transparent",
          "shadow-inner shadow-white/40",
          "opacity-0 group-hover:opacity-100 transition-opacity duration-300",
          "animate-pulse",
        )}
      />

      {/* Multiple Dew Drops */}
      <div
        className={cn(
          "absolute top-6 right-8 w-2 h-2 rounded-full",
          "bg-gradient-to-br from-white/70 via-orange-100/50 to-transparent",
          "opacity-0 group-hover:opacity-80 transition-opacity duration-500 delay-100",
        )}
      />

      {/* Image Section with Enhanced Glass Effect */}
      <div className="relative h-56 sm:h-64 overflow-hidden rounded-t-3xl">
        {imageUrl ? (
          <>
            <motion.img
              src={imageUrl}
              alt={trek.name}
              className="w-full h-full object-cover"
              loading="lazy"
              onLoad={() => setImageLoaded(true)}
              initial={{ scale: 1.1, opacity: 0 }}
              animate={{
                scale: imageLoaded ? 1 : 1.1,
                opacity: imageLoaded ? 1 : 0,
              }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              whileHover={{ scale: 1.05 }}
            />

            {/* Gradient Overlay with Orange Tint */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-orange-900/10 to-transparent" />

            {/* Glass Morphism Overlay */}
            <div
              className={cn(
                "absolute inset-0 bg-gradient-to-br",
                "from-white/10 via-orange-50/5 to-transparent",
                "backdrop-blur-[1px]",
                "opacity-0 group-hover:opacity-100 transition-opacity duration-300",
              )}
            />
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-orange-100/20 via-white/10 to-orange-50/20 flex items-center justify-center backdrop-blur-sm">
            <Mountain className="w-16 h-16 text-orange-300/40" />
          </div>
        )}

        {/* Media Count Badge - Moved to top-left to make room for friends */}
        {totalMediaCount > 0 && (
          <motion.div
            className="absolute top-3 left-3"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Badge
              className={cn(
                "bg-black/20 backdrop-blur-md border-white/20 text-white",
                "hover:bg-black/30 transition-colors duration-200",
                "flex items-center gap-1 px-2 py-1",
              )}
            >
              <Camera className="w-3 h-3" />
              {totalMediaCount}
            </Badge>
          </motion.div>
        )}

        {/* Tagged Friends - Floating in top-right like autumn leaves */}
        {trek.taggedFriends && trek.taggedFriends.length > 0 && (
          <div className="absolute top-3 right-3 flex -space-x-2">
            {trek.taggedFriends.slice(0, 3).map((friend, index) => (
              <motion.div
                key={friend.id}
                className={cn(
                  "w-8 h-8 rounded-full border-2 border-white/60 backdrop-blur-sm",
                  "bg-gradient-to-br from-green-400/20 to-orange-400/20",
                  "flex items-center justify-center text-xs font-medium text-white",
                  "shadow-lg hover:scale-110 transition-transform duration-200",
                )}
                initial={{ opacity: 0, scale: 0, rotate: -180 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  rotate: 0,
                  y: [0, -2, 0], // Gentle floating animation
                }}
                transition={{
                  delay: index * 0.1,
                  y: { duration: 2, repeat: Infinity, ease: "easeInOut" },
                }}
                title={friend.name}
              >
                {friend.avatar ? (
                  <img
                    src={friend.avatar}
                    className="w-full h-full rounded-full object-cover"
                    alt={friend.name}
                  />
                ) : (
                  <span>{friend.name.charAt(0).toUpperCase()}</span>
                )}
              </motion.div>
            ))}
            {trek.taggedFriends.length > 3 && (
              <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/60 flex items-center justify-center text-xs text-white font-medium">
                +{trek.taggedFriends.length - 3}
              </div>
            )}
          </div>
        )}

        {/* Floating Social Actions */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              className="absolute top-3 left-3 flex flex-col gap-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, staggerChildren: 0.1 }}
            >
              <motion.button
                className={cn(
                  "w-8 h-8 rounded-full backdrop-blur-md",
                  "bg-white/20 hover:bg-red-500/80 border border-white/30",
                  "flex items-center justify-center transition-all duration-200",
                  "hover:scale-110 active:scale-95",
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  onLike();
                }}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
              >
                <Heart
                  className={cn(
                    "w-4 h-4 transition-colors duration-200",
                    isLiked ? "text-red-500 fill-red-500" : "text-white",
                  )}
                />
              </motion.button>

              <motion.button
                className={cn(
                  "w-8 h-8 rounded-full backdrop-blur-md",
                  "bg-white/20 hover:bg-blue-500/80 border border-white/30",
                  "flex items-center justify-center transition-all duration-200",
                  "hover:scale-110 active:scale-95",
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  onShare();
                }}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Share2 className="w-4 h-4 text-white" />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Content Section with Enhanced Glass - Better Spacing */}
      <div className="p-6 flex flex-col gap-2">
        {/* Title */}
        <motion.h3
          className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {trek.name}
        </motion.h3>

        {/* Location & Date */}
        <div className="flex items-center justify-between text-sm">
          {trek.location && (
            <div className="flex items-center gap-1 bg-black/20 backdrop-blur-sm px-2 py-1 rounded-lg">
              <MapPin className="w-4 h-4 text-orange-400" />
              <span className="text-white font-medium truncate">
                {trek.location && trek.location.length > 14
                  ? `${trek.location.substring(0, 14)}...`
                  : trek.location}
              </span>
            </div>
          )}
          <div className="flex items-center gap-1 bg-black/20 backdrop-blur-sm px-2 py-1 rounded-lg">
            <Calendar className="w-4 h-4 text-orange-400" />
            <span className="text-white font-medium">
              {formatIndianDate(new Date(trek.start_datetime))}
            </span>
          </div>
        </div>

        {/* Tags - Minimal single line */}
        {trek.tags && trek.tags.length > 0 && (
          <div className="flex items-center gap-1 overflow-hidden">
            {trek.tags.slice(0, 2).map((tag) => {
              // Smart icon mapping
              const getTagIcon = (tagName: string) => {
                const name = tagName.toLowerCase();
                if (name.includes("mountain") || name.includes("alpine"))
                  return <Mountain className="w-3 h-3" />;
                if (name.includes("beach") || name.includes("coastal"))
                  return <MapPin className="w-3 h-3" />;
                if (name.includes("forest") || name.includes("nature"))
                  return <Sparkles className="w-3 h-3" />;
                if (name.includes("desert"))
                  return <Calendar className="w-3 h-3" />;
                if (name.includes("lake") || name.includes("water"))
                  return <Eye className="w-3 h-3" />;
                return <MapPin className="w-3 h-3" />;
              };

              // Limited color palette - ONLY 2 colors for nature theme
              const getTagColor = (tagName: string) => {
                const name = tagName.toLowerCase();
                // Nature/Adventure tags - Forest Green
                if (
                  name.includes("mountain") ||
                  name.includes("forest") ||
                  name.includes("nature") ||
                  name.includes("alpine")
                ) {
                  return "bg-green-800/80 text-white border-green-700";
                }
                // Water/Beach/Desert tags - Ocean Blue
                return "bg-blue-800/80 text-white border-blue-700";
              };

              return (
                <Badge
                  key={tag.id}
                  className={cn(
                    "text-xs backdrop-blur-sm flex items-center gap-1 px-1.5 py-0.5",
                    "border transition-colors duration-200 font-medium",
                    "whitespace-nowrap",
                    getTagColor(tag.name),
                  )}
                >
                  {getTagIcon(tag.name)}
                  <span className="truncate max-w-[60px]">{tag.name}</span>
                </Badge>
              );
            })}
            {trek.tags.length > 2 && (
              <Badge className="text-xs bg-gray-700/80 text-white border-gray-600 px-1.5 py-0.5">
                +{trek.tags.length - 2}
              </Badge>
            )}
          </div>
        )}

        {/* Stats - Fixed at bottom */}
        <div className="flex items-center justify-between pt-2 mt-2 border-t border-white/20 dark:border-gray-600/30">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 bg-black/30 backdrop-blur-sm px-2 py-1 rounded-lg">
              <Heart className="w-4 h-4 text-red-400" />
              <span className="text-white font-medium text-sm">
                {likeCount}
              </span>
            </div>
            <div className="flex items-center gap-1 bg-black/30 backdrop-blur-sm px-2 py-1 rounded-lg">
              <Eye className="w-4 h-4 text-blue-400" />
              <span className="text-white font-medium text-sm">
                {viewCount}
              </span>
            </div>
          </div>

          {/* Simple Eye Icon */}
          <div className="text-orange-400/80">
            <Eye className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Orange Glow Effect on Hover */}
      <div
        className={cn(
          "absolute inset-0 rounded-3xl pointer-events-none",
          "bg-gradient-to-br from-orange-400/0 via-orange-500/0 to-orange-600/0",
          "group-hover:from-orange-400/10 group-hover:via-orange-500/5 group-hover:to-orange-600/10",
          "transition-all duration-500 ease-out",
        )}
      />
    </motion.div>
  );
};

// Enhanced Carousel Modal Component
interface CarouselModalProps {
  trek: any;
  isOpen: boolean;
  onClose: () => void;
  initialIndex: number;
}

const CarouselModal: React.FC<CarouselModalProps> = ({
  trek,
  isOpen,
  onClose,
  initialIndex,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isLoading, setIsLoading] = useState(true);

  const allImages = [
    ...(trek?.images || []),
    ...(trek?.user_contributions?.map((contrib: any) => contrib.image_url) ||
      []),
  ].filter((url) => !url.match(/\.(mp4|mov|avi|wmv|flv|webm)$/i));

  const nextImage = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % allImages.length);
    setIsLoading(true);
  }, [allImages.length]);

  const prevImage = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
    setIsLoading(true);
  }, [allImages.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prevImage();
      if (e.key === "ArrowRight") nextImage();
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, nextImage, prevImage, onClose]);

  if (!isOpen || !trek) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        onClick={onClose}
      >
        {/* Enhanced Glass Modal Container */}
        <motion.div
          className={cn(
            "relative max-w-6xl max-h-[90vh] w-full mx-4",
            "bg-white/5 backdrop-blur-2xl backdrop-saturate-150",
            "border border-white/10 rounded-3xl overflow-hidden",
            "shadow-2xl shadow-black/50",
          )}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button - Rock Glossy Style */}
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "absolute top-4 right-4 z-10",
              "w-12 h-12 rounded-full",
              "bg-white/20 hover:bg-white/30 backdrop-blur-md",
              "border border-white/30 hover:border-white/50",
              "text-white hover:text-white",
              "btn-rock-glossy transition-all duration-300",
              "hover:scale-110 active:scale-95",
            )}
            onClick={onClose}
          >
            <X className="w-6 h-6" />
          </Button>

          {/* Navigation Buttons - Positioned relative to modal */}
          {allImages.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20",
                  "w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full",
                  "bg-white/20 hover:bg-white/30 backdrop-blur-md",
                  "border border-white/30 hover:border-orange-400/50",
                  "text-white hover:text-orange-300",
                  "btn-rock-glossy transition-all duration-300",
                  "hover:scale-110 active:scale-95",
                  "hover:shadow-lg hover:shadow-orange-500/20",
                )}
                onClick={prevImage}
              >
                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20",
                  "w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full",
                  "bg-white/20 hover:bg-white/30 backdrop-blur-md",
                  "border border-white/30 hover:border-orange-400/50",
                  "text-white hover:text-orange-300",
                  "btn-rock-glossy transition-all duration-300",
                  "hover:scale-110 active:scale-95",
                  "hover:shadow-lg hover:shadow-orange-500/20",
                )}
                onClick={nextImage}
              >
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8" />
              </Button>
            </>
          )}

          {/* Image Container */}
          <div className="relative w-full h-[70vh] flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.img
                key={currentIndex}
                src={allImages[currentIndex]}
                alt={`${trek.name} - Image ${currentIndex + 1}`}
                className="max-w-full max-h-full object-contain rounded-2xl"
                onLoad={() => setIsLoading(false)}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
              />
            </AnimatePresence>

            {/* Loading Indicator */}
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-orange-400/30 border-t-orange-400 rounded-full animate-spin" />
              </div>
            )}
          </div>

          {/* Tagged Friends at Top */}
          {trek.taggedFriends && trek.taggedFriends.length > 0 && (
            <div className="absolute top-3 right-3 z-10 flex -space-x-2">
              {trek.taggedFriends.slice(0, 4).map((friend, index) => (
                <motion.div
                  key={friend.id}
                  className={cn(
                    "w-8 h-8 sm:w-9 sm:h-9 rounded-full border-2 border-white/60 backdrop-blur-sm",
                    "bg-gradient-to-br from-green-400/20 to-orange-400/20",
                    "flex items-center justify-center text-xs font-medium text-white",
                    "shadow-lg",
                  )}
                  initial={{ opacity: 0, scale: 0, y: -20 }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    y: 0,
                  }}
                  transition={{
                    delay: 0.3 + index * 0.1,
                  }}
                  title={friend.name}
                >
                  {friend.avatar ? (
                    <img
                      src={friend.avatar}
                      className="w-full h-full rounded-full object-cover"
                      alt={friend.name}
                    />
                  ) : (
                    <span>{friend.name.charAt(0).toUpperCase()}</span>
                  )}
                </motion.div>
              ))}
              {trek.taggedFriends.length > 4 && (
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/60 flex items-center justify-center text-xs text-white font-medium">
                  +{trek.taggedFriends.length - 4}
                </div>
              )}
            </div>
          )}

          {/* Event Details Section - Below Friends */}
          <div className="absolute top-14 left-0 right-0 p-3 sm:p-4 md:p-6 bg-gradient-to-b from-black/70 via-black/35 to-transparent backdrop-blur-md">
            <div className="space-y-2 md:space-y-3">
              {/* Trek Stats - Responsive layout */}
              <div className="flex items-center gap-2 md:gap-4 flex-wrap">
                <div className="flex items-center gap-1.5 md:gap-2 bg-white/10 backdrop-blur-sm px-2 md:px-3 py-1.5 md:py-2 rounded-lg flex-shrink-0">
                  <Mountain className="w-3 h-3 md:w-4 md:h-4 text-orange-400" />
                  <span className="text-white text-xs md:text-sm font-medium whitespace-nowrap">
                    {trek.difficulty || "Moderate"}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 md:gap-2 bg-white/10 backdrop-blur-sm px-2 md:px-3 py-1.5 md:py-2 rounded-lg flex-shrink-0">
                  <MapPin className="w-3 h-3 md:w-4 md:h-4 text-orange-400" />
                  <span className="text-white text-xs md:text-sm font-medium whitespace-nowrap">
                    {trek.distance || "12"} km
                  </span>
                </div>
                <div className="flex items-center gap-1.5 md:gap-2 bg-white/10 backdrop-blur-sm px-2 md:px-3 py-1.5 md:py-2 rounded-lg flex-shrink-0">
                  <Calendar className="w-3 h-3 md:w-4 md:h-4 text-orange-400" />
                  <span className="text-white text-xs md:text-sm font-medium whitespace-nowrap">
                    {trek.duration || "2"} days
                  </span>
                </div>
              </div>

              {/* Trek Write-up - Show on all devices */}
              <div className="bg-white/5 backdrop-blur-sm p-3 md:p-4 rounded-lg border border-white/10">
                <h4 className="text-white font-medium mb-2 text-xs md:text-sm">
                  About This Adventure
                </h4>
                <p className="text-gray-200 text-xs leading-relaxed">
                  {trek.description ||
                    `Join us for an unforgettable ${trek.difficulty?.toLowerCase() || "moderate"} trek through ${trek.location || "beautiful landscapes"}. 
                  This ${trek.duration || "2"}-day adventure covers ${trek.distance || "12"} kilometers of stunning terrain, 
                  perfect for nature enthusiasts and adventure seekers. Experience the beauty of the great outdoors 
                  while creating lasting memories with fellow trekkers.`}
                </p>
              </div>
            </div>
          </div>

          {/* Image Counter & Info - Mobile Optimized */}
          <div
            className={cn(
              "absolute bottom-0 left-0 right-0 p-3 sm:p-4 md:p-6",
              "bg-gradient-to-t from-black/90 via-black/60 to-transparent",
              "backdrop-blur-md",
            )}
          >
            <div className="space-y-2 md:space-y-3">
              {/* Title and Location */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="text-base sm:text-lg md:text-xl font-semibold mb-1 md:mb-2 text-white line-clamp-2">
                    {trek.name}
                  </h3>

                  {trek.location && (
                    <div className="flex items-center gap-1 text-orange-300 mb-2">
                      <MapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span className="font-medium text-xs sm:text-sm md:text-base truncate">
                        {trek.location}
                      </span>
                    </div>
                  )}

                  {/* Event Tags in Detail Modal - Minimal single line */}
                  {trek.tags && trek.tags.length > 0 && (
                    <div className="flex items-center gap-2 mb-2 overflow-hidden">
                      <span className="text-white/80 text-xs font-medium flex-shrink-0">
                        Tags:
                      </span>
                      <div className="flex items-center gap-1 overflow-hidden">
                        {trek.tags.slice(0, 3).map((tag) => {
                          // Smart icon mapping (reusing the same function)
                          const getTagIcon = (tagName: string) => {
                            const name = tagName.toLowerCase();
                            if (
                              name.includes("mountain") ||
                              name.includes("alpine")
                            )
                              return <Mountain className="w-3 h-3" />;
                            if (
                              name.includes("beach") ||
                              name.includes("coastal")
                            )
                              return <MapPin className="w-3 h-3" />;
                            if (
                              name.includes("forest") ||
                              name.includes("nature")
                            )
                              return <Sparkles className="w-3 h-3" />;
                            if (name.includes("desert"))
                              return <Calendar className="w-3 h-3" />;
                            if (name.includes("lake") || name.includes("water"))
                              return <Eye className="w-3 h-3" />;
                            return <MapPin className="w-3 h-3" />;
                          };

                          // Limited color palette - ONLY 2 colors for nature theme
                          const getTagColor = (tagName: string) => {
                            const name = tagName.toLowerCase();
                            // Nature/Adventure tags - Forest Green
                            if (
                              name.includes("mountain") ||
                              name.includes("forest") ||
                              name.includes("nature") ||
                              name.includes("alpine")
                            ) {
                              return "bg-green-800/80 text-white border-green-700";
                            }
                            // Water/Beach/Desert tags - Ocean Blue
                            return "bg-blue-800/80 text-white border-blue-700";
                          };

                          return (
                            <Badge
                              key={tag.id}
                              className={cn(
                                "text-xs backdrop-blur-sm flex items-center gap-1 px-1.5 py-0.5",
                                "border transition-colors duration-200 font-medium",
                                "whitespace-nowrap",
                                getTagColor(tag.name),
                              )}
                            >
                              {getTagIcon(tag.name)}
                              <span className="truncate max-w-[50px]">
                                {tag.name}
                              </span>
                            </Badge>
                          );
                        })}
                        {trek.tags.length > 3 && (
                          <Badge className="text-xs bg-gray-700/80 text-white border-gray-600 px-1.5 py-0.5">
                            +{trek.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="text-right flex-shrink-0 ml-2 flex flex-col justify-start">
                  <div className="text-sm sm:text-base md:text-lg font-medium text-white whitespace-nowrap">
                    {currentIndex + 1} / {allImages.length}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-300 whitespace-nowrap">
                    {formatIndianDate(new Date(trek.start_datetime))}
                  </div>
                </div>
              </div>

              {/* Progress Dots */}
              <div className="flex justify-center gap-2 mt-2 sm:mt-3 md:mt-4">
                {allImages.map((_, index) => (
                  <button
                    key={index}
                    className={cn(
                      "w-2 h-2 rounded-full transition-all duration-300",
                      index === currentIndex
                        ? "bg-orange-400 w-8"
                        : "bg-white/40 hover:bg-white/60",
                    )}
                    onClick={() => {
                      setCurrentIndex(index);
                      setIsLoading(true);
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Main Gallery Component
export default function GlassMorphismGallery() {
  const { user } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrek, setSelectedTrek] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Apply minimal scrollbar styling to html/body
  useEffect(() => {
    document.documentElement.classList.add("glass-theme-active");
    document.body.classList.add("glass-theme-active");
    return () => {
      document.documentElement.classList.remove("glass-theme-active");
      document.body.classList.remove("glass-theme-active");
    };
  }, []);

  // Fetch real trek data from database
  useEffect(() => {
    const fetchTreks = async () => {
      setLoading(true);
      try {
        // Fetch completed trek events (past events)
        const { data: treks, error } = await supabase
          .from("trek_events")
          .select(
            "trek_id, name, description, location, difficulty, start_datetime, duration, base_price, distance, route_data",
          )
          .lt("start_datetime", new Date().toISOString())
          .order("start_datetime", { ascending: false })
          .limit(12);

        if (error) throw error;

        if (!treks || treks.length === 0) {
          setItems([]);
          setLoading(false);
          return;
        }

        const trekIds = treks.map((t) => t.trek_id);

        // Fetch images for all treks (using correct table name)
        const { data: images, error: imgError } = await supabase
          .from("trek_event_images")
          .select("trek_id, image_url")
          .in("trek_id", trekIds);

        if (imgError) {
          console.warn("Error fetching trek images:", imgError);
          // Continue without images rather than failing
        }

        // Group images by trek_id
        const imagesByTrek: Record<number, string[]> = {};
        (images || []).forEach((img) => {
          if (!imagesByTrek[img.trek_id]) {
            imagesByTrek[img.trek_id] = [];
          }
          imagesByTrek[img.trek_id].push(img.image_url);
        });

        // Generate tags based on location/difficulty since trek_event_tags table doesn't exist
        const generateTags = (trek: any) => {
          const tags = [];
          if (trek.difficulty) {
            tags.push({ id: 1, name: trek.difficulty });
          }
          if (trek.location) {
            // Generate location-based tags
            if (
              trek.location.toLowerCase().includes("himalaya") ||
              trek.location.toLowerCase().includes("himachal")
            ) {
              tags.push({ id: 2, name: "Mountain" });
            } else if (
              trek.location.toLowerCase().includes("goa") ||
              trek.location.toLowerCase().includes("coast")
            ) {
              tags.push({ id: 3, name: "Coastal" });
            } else if (
              trek.location.toLowerCase().includes("kerala") ||
              trek.location.toLowerCase().includes("forest")
            ) {
              tags.push({ id: 4, name: "Forest" });
            } else if (
              trek.location.toLowerCase().includes("rajasthan") ||
              trek.location.toLowerCase().includes("desert")
            ) {
              tags.push({ id: 5, name: "Desert" });
            } else {
              tags.push({ id: 6, name: "Adventure" });
            }
          }
          return tags;
        };

        // Fetch participants and engagement for all treks in parallel
        const participantsPromises = trekIds.map((id) =>
          fetchTrekParticipants(id),
        );
        const engagementPromises = trekIds.map((id) => fetchTrekEngagement(id));

        const participantsResults = await Promise.all(participantsPromises);
        const engagementResults = await Promise.all(engagementPromises);

        // Create maps for quick lookup
        const participantsByTrek: Record<number, any[]> = {};
        const engagementByTrek: Record<
          number,
          { likes: number; views: number }
        > = {};

        trekIds.forEach((id, index) => {
          participantsByTrek[id] = participantsResults[index];
          engagementByTrek[id] = engagementResults[index];
        });

        // Transform data to match expected format
        const transformedTreks = await Promise.all(
          treks.map(async (trek) => ({
            trek_id: trek.trek_id,
            name: trek.name,
            description:
              trek.description ||
              `Join us for an unforgettable ${trek.difficulty?.toLowerCase() || "moderate"} trek through ${trek.location || "beautiful landscapes"}.`,
            location: trek.location || "Unknown Location",
            difficulty: trek.difficulty || "Moderate",
            distance: getTrekDistance(trek),
            duration: trek.duration || "1",
            start_datetime: trek.start_datetime,
            cost: trek.base_price,
            images: imagesByTrek[trek.trek_id] || [
              "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
            ],
            tags: generateTags(trek),
            user_contributions: [],
            taggedFriends: participantsByTrek[trek.trek_id] || [],
            likeCount: engagementByTrek[trek.trek_id]?.likes || 0,
            viewCount: engagementByTrek[trek.trek_id]?.views || 0,
          })),
        );

        setItems(transformedTreks);
      } catch (error) {
        console.error("Error fetching treks:", error);
        // Fallback to empty array on error
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTreks();
  }, []);

  const handleTrekClick = (trek: any) => {
    setSelectedTrek(trek);
    setCurrentImageIndex(0);
    setIsModalOpen(true);
  };

  const handleLike = (trekId: number) => {
    console.log("Liked trek:", trekId);
    // Implement like functionality
  };

  const handleShare = (trekId: number) => {
    console.log("Shared trek:", trekId);
    // Implement share functionality
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-900/20 via-transparent to-orange-900/20">
        <div className="w-16 h-16 border-4 border-orange-400/30 border-t-orange-400 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Origami Hamburger Menu */}
      <OrigamiHamburger />

      {/* Blurred Nature Background */}
      <div className="fixed inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1920&q=80')`,
            filter: "blur(8px) brightness(0.7) saturate(1.2)",
          }}
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-900/20 via-transparent to-orange-900/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/20" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1
            className={cn(
              "text-4xl md:text-6xl font-bold mb-4",
              "bg-gradient-to-r from-white via-orange-200 to-white bg-clip-text text-transparent",
              "drop-shadow-2xl",
            )}
          >
            Adventure Gallery
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Discover breathtaking moments from our community's adventures
          </p>
        </motion.div>

        {/* Gallery Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {items.map((trek, index) => (
            <motion.div
              key={trek.trek_id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.6,
                delay: index * 0.1,
                ease: "easeOut",
              }}
            >
              <GlassGalleryCard
                trek={trek}
                onClick={() => handleTrekClick(trek)}
                onLike={() => handleLike(trek.trek_id)}
                onShare={() => handleShare(trek.trek_id)}
                isLiked={false}
                likeCount={trek.likeCount || 0}
                viewCount={trek.viewCount || 0}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Carousel Modal */}
      <CarouselModal
        trek={selectedTrek}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialIndex={currentImageIndex}
      />
    </div>
  );
}
