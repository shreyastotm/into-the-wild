import { AnimatePresence, motion } from "framer-motion";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  Heart,
  IndianRupee,
  MapPin,
  Mountain,
  Share2,
  Timer,
  TreePine,
  UserPlus,
  Users,
  X,
  Zap,
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
  checkUserRegistration,
  fetchTrekEngagement,
  fetchTrekParticipants,
} from "@/utils/trekDataHelpers";

// Enhanced Glass Event Card Component
interface GlassEventCardProps {
  event: {
    trek_id: number;
    name: string;
    description?: string;
    location?: string;
    start_datetime: string;
    difficulty?: string;
    duration?: string;
    cost?: number;
    max_participants?: number;
    participant_count?: number;
    images?: string[];
    tags?: Array<{ id: number; name: string }>;
    registration_status?: "open" | "closed" | "full";
    days_until_event?: number;
    registeredFriends?: Array<{
      id: number;
      name: string;
      avatar: string | null;
    }>;
    likeCount?: number;
    viewCount?: number;
    isRegistered?: boolean;
  };
  onClick: () => void;
  onRegister: () => void;
  onShare: () => void;
  isRegistered: boolean;
}

const GlassEventCard: React.FC<GlassEventCardProps> = ({
  event,
  onClick,
  onRegister,
  onShare,
  isRegistered,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const images = event.images || [
    "https://images.unsplash.com/photo-1464822759844-d150baec0494?w=800&q=80",
  ];

  // Auto-rotate images
  useEffect(() => {
    if (images.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [images.length]);

  // Get difficulty icon and color
  const getDifficultyConfig = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case "easy":
        return {
          icon: TreePine,
          color: "text-green-400",
          bg: "bg-green-500/20",
        };
      case "moderate":
        return {
          icon: Mountain,
          color: "text-yellow-400",
          bg: "bg-yellow-500/20",
        };
      case "hard":
        return { icon: Zap, color: "text-red-400", bg: "bg-red-500/20" };
      case "expert":
        return { icon: Zap, color: "text-purple-400", bg: "bg-purple-500/20" };
      default:
        return { icon: Mountain, color: "text-gray-400", bg: "bg-gray-500/20" };
    }
  };

  const difficultyConfig = getDifficultyConfig(event.difficulty || "moderate");
  const DifficultyIcon = difficultyConfig.icon;

  // Calculate registration progress
  const participantCount = event.participant_count || 0;
  const maxParticipants = event.max_participants || 1;
  const registrationProgress = (participantCount / maxParticipants) * 100;
  const spotsLeft = maxParticipants - participantCount;

  // Get registration status
  const getRegistrationStatus = () => {
    if (isRegistered)
      return {
        text: "Registered",
        color: "bg-green-500/20 text-green-400 border-green-400/30",
      };
    if (event.registration_status === "full" || spotsLeft <= 0)
      return {
        text: "Full",
        color: "bg-red-500/20 text-red-400 border-red-400/30",
      };
    if (event.registration_status === "closed")
      return {
        text: "Closed",
        color: "bg-gray-500/20 text-gray-400 border-gray-400/30",
      };
    return {
      text: "Open",
      color: "bg-green-500/20 text-green-400 border-green-400/30",
    };
  };

  const registrationStatus = getRegistrationStatus();

  // Smart tag icons
  const getTagIcon = (tagName: string) => {
    const name = tagName.toLowerCase();
    if (name.includes("mountain") || name.includes("peak")) return Mountain;
    if (name.includes("forest") || name.includes("tree")) return TreePine;
    if (name.includes("water") || name.includes("lake")) return "💧";
    if (name.includes("adventure")) return Zap;
    return TreePine;
  };

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
    // Water/Beach tags - Ocean Blue
    if (
      name.includes("water") ||
      name.includes("lake") ||
      name.includes("coastal") ||
      name.includes("beach")
    ) {
      return "bg-blue-800/80 text-white border-blue-700";
    }
    // Adventure/Action tags - Orange accent
    if (
      name.includes("adventure") ||
      name.includes("trek") ||
      name.includes("climb") ||
      name.includes("hard") ||
      name.includes("expert")
    ) {
      return "bg-orange-800/80 text-white border-orange-700";
    }
    // Default - Teal
    return "bg-teal-800/80 text-white border-teal-700";
  };

  return (
    <motion.div
      className={cn(
        "group relative overflow-hidden cursor-pointer h-[620px]",
        // Enhanced transparency with better contrast
        "bg-white/8 dark:bg-gray-900/8",
        "backdrop-blur-xl backdrop-saturate-150",
        // Enhanced Dew Drop Effect
        "border border-white/10 dark:border-gray-700/10",
        "rounded-3xl",
        // Green Glow Highlight Band (like gallery's orange)
        "ring-0 ring-green-400/0 ring-offset-0",
        "hover:ring-2 hover:ring-green-400/60 hover:ring-offset-2 hover:ring-offset-green-100/20",
        // Enhanced Shadow with Green Tint
        "shadow-lg shadow-black/5 hover:shadow-2xl hover:shadow-green-500/20",
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{
        y: -8,
        scale: 1.02,
        transition: { duration: 0.3, ease: "easeOut" },
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={onClick}
    >
      {/* Enhanced animated glow effect */}
      <motion.div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background:
            "linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(8, 145, 178, 0.08))",
          filter: "blur(25px)",
          transform: "scale(1.15)",
        }}
      />

      {/* Dew Drop Reflection Effect - Match Gallery */}
      <div
        className={cn(
          "absolute top-4 left-4 w-3 h-3 rounded-full",
          "bg-gradient-to-br from-white/80 via-green-200/60 to-transparent",
          "shadow-inner shadow-white/40",
          "opacity-0 group-hover:opacity-100 transition-opacity duration-300",
          "animate-pulse",
        )}
      />

      {/* Multiple Dew Drops */}
      <div
        className={cn(
          "absolute top-6 right-8 w-2 h-2 rounded-full",
          "bg-gradient-to-br from-white/70 via-green-100/50 to-transparent",
          "opacity-0 group-hover:opacity-80 transition-opacity duration-500 delay-100",
        )}
      />

      {/* Glass surface reflection */}
      <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-30 transition-opacity duration-300">
        <div className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-b from-white/10 to-transparent rounded-t-3xl" />
      </div>

      {/* Image Section */}
      <div className="relative h-[280px] overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentImageIndex}
            src={images[currentImageIndex]}
            alt={event.name}
            className="w-full h-full object-cover"
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5 }}
          />
        </AnimatePresence>

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Image indicators */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, index) => (
              <div
                key={index}
                className={cn(
                  "w-2 h-2 rounded-full transition-all duration-300",
                  index === currentImageIndex
                    ? "bg-white shadow-lg"
                    : "bg-white/40 hover:bg-white/60",
                )}
              />
            ))}
          </div>
        )}

        {/* Top badges */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          {/* Countdown badge */}
          {event.days_until_event !== undefined &&
            event.days_until_event >= 0 && (
              <motion.div
                className="flex items-center gap-1 px-2 py-1 rounded-full backdrop-blur-sm bg-black/30 border border-white/20"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Timer className="w-3 h-3 text-green-400" />
                <span className="text-xs text-white font-medium">
                  {event.days_until_event === 0
                    ? "Today"
                    : `${event.days_until_event}d`}
                </span>
              </motion.div>
            )}

          {/* Registration status */}
          <motion.div
            className={cn(
              "px-2 py-1 rounded-full backdrop-blur-sm border text-xs font-medium",
              registrationStatus.color,
            )}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            {registrationStatus.text}
          </motion.div>
        </div>

        {/* Difficulty badge */}
        <div className="absolute top-3 right-3">
          <motion.div
            className={cn(
              "flex items-center gap-1 px-2 py-1 rounded-full backdrop-blur-sm border border-white/20",
              difficultyConfig.bg,
            )}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            <DifficultyIcon className={cn("w-3 h-3", difficultyConfig.color)} />
            <span className="text-xs text-white font-medium capitalize">
              {event.difficulty || "Moderate"}
            </span>
          </motion.div>
        </div>

        {/* Registered friends floating bubbles */}
        {event.registeredFriends && event.registeredFriends.length > 0 && (
          <div className="absolute bottom-3 right-3 flex -space-x-2">
            {event.registeredFriends.slice(0, 3).map((friend, index) => (
              <motion.div
                key={friend.id}
                className="relative"
                initial={{ scale: 0, x: 20 }}
                animate={{ scale: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
              >
                <div className="w-8 h-8 rounded-full border-2 border-white/30 backdrop-blur-sm bg-white/10 flex items-center justify-center overflow-hidden">
                  {friend.avatar ? (
                    <img
                      src={friend.avatar}
                      alt={friend.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Users className="w-4 h-4 text-white" />
                  )}
                </div>
                {index === 2 && event.registeredFriends!.length > 3 && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-xs text-white font-bold">
                      +{event.registeredFriends!.length - 3}
                    </span>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Content Section - Optimized spacing */}
      <div className="p-6 h-[340px] flex flex-col justify-between">
        {/* Title and Location */}
        <div className="space-y-3">
          <h3 className="text-xl font-bold text-white line-clamp-1 leading-tight">
            {event.name}
          </h3>

          <div className="flex items-center justify-between text-sm">
            {event.location && (
              <div className="flex items-center gap-1 bg-black/20 backdrop-blur-sm px-2 py-1 rounded-lg">
                <MapPin className="w-4 h-4 text-orange-400" />
                <span className="text-white font-medium truncate">
                  {event.location && event.location.length > 14
                    ? `${event.location.substring(0, 14)}...`
                    : event.location}
                </span>
              </div>
            )}
            <div className="flex items-center gap-1 bg-black/20 backdrop-blur-sm px-2 py-1 rounded-lg">
              <Calendar className="w-4 h-4 text-orange-400" />
              <span className="text-white font-medium">
                {formatIndianDate(new Date(event.start_datetime))}
              </span>
            </div>
          </div>
        </div>

        {/* Tags - Full Display */}
        <div className="flex flex-wrap gap-1">
          {event.tags?.map((tag) => {
            const TagIcon = getTagIcon(tag.name);
            return (
              <Badge
                key={tag.id}
                className={cn(
                  "text-xs px-2 py-1 backdrop-blur-sm border flex items-center gap-1 max-w-[60px]",
                  getTagColor(tag.name),
                )}
              >
                {typeof TagIcon === "string" ? (
                  <span className="text-xs">{TagIcon}</span>
                ) : (
                  <TagIcon className="w-3 h-3 flex-shrink-0" />
                )}
                <span className="truncate text-xs">
                  {tag.name.length > 6
                    ? `${tag.name.substring(0, 6)}...`
                    : tag.name}
                </span>
              </Badge>
            );
          })}
        </div>

        {/* Event Details */}
        <div className="flex items-center justify-between text-sm text-white/80">
          <div className="flex items-center gap-3">
            {event.duration && (
              <div className="flex items-center gap-1 bg-black/30 backdrop-blur-sm px-2 py-1 rounded-lg">
                <Clock className="w-4 h-4 text-blue-400" />
                <span className="text-white font-medium">
                  {event.duration}d
                </span>
              </div>
            )}
            <div className="flex items-center gap-1 bg-black/30 backdrop-blur-sm px-2 py-1 rounded-lg">
              <Users className="w-4 h-4 text-blue-400" />
              <span className="text-white font-medium">
                {participantCount}/{maxParticipants}
              </span>
            </div>
          </div>

          {event.cost && (
            <div className="flex items-center gap-1 font-semibold text-green-400">
              <IndianRupee className="w-4 h-4" />
              <span>{event.cost.toLocaleString("en-IN")}</span>
            </div>
          )}
        </div>

        {/* Registration Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-white/70">
            <span>{spotsLeft} spots left</span>
            <span>{Math.round(registrationProgress)}% filled</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2">
            <motion.div
              className="h-2 bg-gradient-to-r from-green-400 to-teal-400 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${registrationProgress}%` }}
              transition={{ duration: 1, delay: 0.5 }}
            />
          </div>
        </div>

        {/* Stats - Fixed at bottom */}
        <div className="flex items-center justify-between pt-2 mt-2 border-t border-white/20 dark:border-gray-600/30">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 bg-black/30 backdrop-blur-sm px-2 py-1 rounded-lg">
              <Heart className="w-4 h-4 text-red-400" />
              <span className="text-white font-medium text-sm">
                {event.likeCount || 0}
              </span>
            </div>
            <div className="flex items-center gap-1 bg-black/30 backdrop-blur-sm px-2 py-1 rounded-lg">
              <Eye className="w-4 h-4 text-blue-400" />
              <span className="text-white font-medium text-sm">
                {event.viewCount || 0}
              </span>
            </div>
          </div>

          {/* Simple Eye Icon */}
          <div className="text-green-400/80">
            <Eye className="w-5 h-5" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Main Events Page Component
const GlassMorphismEvents = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch upcoming events from database
  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        // Fetch upcoming trek events (including image_url for fallback)
        const { data: treks, error } = await supabase
          .from("trek_events")
          .select(
            "trek_id, name, description, location, difficulty, start_datetime, duration, base_price, max_participants, image_url, event_type",
          )
          .gt("start_datetime", new Date().toISOString())
          .order("start_datetime", { ascending: true })
          .limit(12);

        if (error) throw error;

        if (!treks || treks.length === 0) {
          setEvents([]);
          setLoading(false);
          return;
        }

        const trekIds = treks.map((t) => t.trek_id);
        console.log("🔍 Fetching images for treks:", trekIds);
        console.log("🔍 Trek IDs type check:", trekIds.map(id => ({ id, type: typeof id })));

        // DEBUG: Direct query with all fields to see what's actually in the database
        const { data: debugImages, error: debugError } = await supabase
          .from("trek_event_images")
          .select("*")
          .in("trek_id", trekIds);
        
        console.log("🔍 DEBUG: Direct query result:", {
          count: debugImages?.length || 0,
          error: debugError,
          trekIdsQueried: trekIds,
          imagesFound: debugImages
        });

        // DEBUG: Check individual treks one by one
        for (const trekId of trekIds) {
          const { data: singleTrekImages, error: singleError } = await supabase
            .from("trek_event_images")
            .select("*")
            .eq("trek_id", trekId);
          console.log(`🔍 DEBUG: Trek ${trekId} has ${singleTrekImages?.length || 0} images`, {
            error: singleError,
            images: singleTrekImages
          });
        }

        // DEBUG: Check what's in trek_events.image_url for these treks
        treks.forEach(trek => {
          console.log(`🔍 DEBUG: Trek ${trek.trek_id} (${trek.name}) image_url:`, {
            value: trek.image_url,
            type: typeof trek.image_url,
            isStringNull: trek.image_url === "null",
            isActualNull: trek.image_url === null,
            isUndefined: trek.image_url === undefined,
            isEmpty: trek.image_url === "",
            truthy: !!trek.image_url,
            rawValue: JSON.stringify(trek.image_url)
          });
        });

        // Fetch images from trek_event_images table
        const { data: images, error: imgError } = await supabase
          .from("trek_event_images")
          .select("trek_id, image_url, position")
          .in("trek_id", trekIds)
          .order("position", { ascending: true });

        if (imgError) {
          console.error("❌ Error fetching trek images:", imgError);
          console.error("❌ Error details:", JSON.stringify(imgError, null, 2));
        } else {
          console.log("✅ Fetched from trek_event_images:", images?.length || 0, "images for", trekIds.length, "treks");
          console.log("✅ Raw images data:", images);
          if (images && images.length > 0) {
            console.log("📸 Sample image data:", images[0]);
            console.log("📸 All images:", images);
          } else {
            console.warn("⚠️ No images returned - This could mean:");
            console.warn("  1. Images don't exist in database for these treks");
            console.warn("  2. RLS policies are blocking access");
            console.warn("  3. Data type mismatch in trek_id");
          }
        }

        // Helper function to convert storage path to public URL if needed
        const getImageUrl = (imageUrl: string): string => {
          if (!imageUrl || imageUrl.trim() === "") return "";
          
          // If it's already a full URL (http/https), check if it needs bucket migration
          if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
            // If URL points to old trek-images bucket, update to trek-assets bucket
            if (imageUrl.includes("/storage/v1/object/public/trek-images/")) {
              const updatedUrl = imageUrl.replace("/storage/v1/object/public/trek-images/", "/storage/v1/object/public/trek-assets/");
              console.log(`🔄 Migrated URL from trek-images to trek-assets: ${imageUrl.substring(0, 80)}... -> ${updatedUrl.substring(0, 80)}...`);
              return updatedUrl;
            }
            // If it already points to trek-assets or is external, return as is
            return imageUrl;
          }
          
          // If it's a storage path (starts with treks/), convert to public URL
          // Trek images are stored in trek-assets bucket
          if (imageUrl.startsWith("treks/") || imageUrl.startsWith("trek-assets/") || imageUrl.startsWith("trek-images/")) {
            let path = imageUrl;
            if (imageUrl.startsWith("trek-assets/")) {
              path = imageUrl.replace("trek-assets/", "");
            } else if (imageUrl.startsWith("trek-images/")) {
              path = imageUrl.replace("trek-images/", "");
            } else if (imageUrl.startsWith("treks/")) {
              // Keep treks/ prefix as is for trek-assets bucket
              path = imageUrl;
            }
            const { data } = supabase.storage.from("trek-assets").getPublicUrl(path);
            return data.publicUrl;
          }
          
          // Return as is (might be a relative path or other format)
          return imageUrl;
        };

        // Group images by trek_id with validation and URL conversion
        const imagesByTrek: Record<number, string[]> = {};
        (images || []).forEach((img) => {
          if (!imagesByTrek[img.trek_id]) {
            imagesByTrek[img.trek_id] = [];
          }
          // Only add valid, non-empty image URLs (convert storage paths to public URLs)
          if (img.image_url && img.image_url.trim() !== "") {
            const publicUrl = getImageUrl(img.image_url);
            if (publicUrl && publicUrl.trim() !== "") {
              imagesByTrek[img.trek_id].push(publicUrl);
              console.log(`✅ Processed image for trek ${img.trek_id} at position ${img.position}: ${publicUrl.substring(0, 60)}...`);
            } else {
              console.warn(`⚠️ Failed to process image URL for trek ${img.trek_id}:`, img.image_url);
            }
          }
        });

        console.log("📊 Images by trek from trek_event_images:", Object.keys(imagesByTrek).length, "treks have images");
        
        // Check image_url from trek_events table for treks that don't have images
        const treksNeedingFallback = treks.filter(
          (t) => !imagesByTrek[t.trek_id] || imagesByTrek[t.trek_id].length === 0
        );
        
        console.log("🔍 Treks needing fallback from trek_events.image_url:", treksNeedingFallback.map(t => ({
          trek_id: t.trek_id,
          name: t.name,
          has_image_url: !!t.image_url,
          image_url: t.image_url ? `${t.image_url.substring(0, 50)}...` : 'null'
        })));

        // Add image_url from trek_events as fallback for treks without images
        treksNeedingFallback.forEach((trek) => {
          // Handle both actual null and string "null" case
          const imageUrl = trek.image_url;
          const isValidUrl = imageUrl && 
                            typeof imageUrl === 'string' && 
                            imageUrl.trim() !== "" && 
                            imageUrl.toLowerCase() !== "null" &&
                            imageUrl.toLowerCase() !== "undefined";
          
          if (isValidUrl) {
            if (!imagesByTrek[trek.trek_id]) {
              imagesByTrek[trek.trek_id] = [];
            }
            const publicUrl = getImageUrl(imageUrl);
            if (publicUrl && publicUrl.trim() !== "") {
              imagesByTrek[trek.trek_id].push(publicUrl);
              console.log(`✅ Added fallback image from trek_events.image_url for trek ${trek.trek_id}: ${publicUrl.substring(0, 60)}...`);
            } else {
              console.warn(`⚠️ Failed to convert image_url for trek ${trek.trek_id}:`, {
                original: imageUrl,
                converted: publicUrl
              });
            }
          } else {
            console.warn(`⚠️ Invalid image_url for trek ${trek.trek_id} (${trek.name}):`, {
              value: imageUrl,
              type: typeof imageUrl,
              isNull: imageUrl === null,
              isStringNull: imageUrl === "null",
              isEmpty: imageUrl === "",
              needsManualCheck: "Check database - image_url may need to be set or images uploaded to trek_event_images"
            });
          }
        });

        console.log("📊 Final images by trek:", Object.keys(imagesByTrek).length, "treks have images after fallback");

        // Fetch registration counts
        const { data: registrations, error: regError } = await supabase
          .from("trek_registrations")
          .select("trek_id")
          .in("trek_id", trekIds)
          .eq("payment_status", "Paid");

        if (regError) {
          console.warn("Error fetching registrations:", regError);
        }

        // Count registrations by trek
        const registrationCounts: Record<number, number> = {};
        (registrations || []).forEach((reg) => {
          registrationCounts[reg.trek_id] =
            (registrationCounts[reg.trek_id] || 0) + 1;
        });

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

        // Fetch tags for all treks from database (gracefully handle missing table)
        let tagsByTrek: Record<number, Array<{ id: number; name: string }>> = {};
        
        try {
          const { data: allTags, error: tagsError } = await supabase
            .from("trek_event_tag_assignments")
            .select(`
              trek_id,
              tag_id,
              trek_event_tags:tag_id (
                id,
                name,
                color,
                category
              )
            `)
            .in("trek_id", trekIds);

          if (tagsError) {
            // Check if it's a "table not found" error
            if (tagsError.code === "PGRST205" || tagsError.message?.includes("Could not find the table")) {
              console.warn("⚠️ Tags table not found - using fallback tags. Migration may need to be applied.");
            } else {
              console.warn("Error fetching tags:", tagsError);
            }
          } else if (allTags && allTags.length > 0) {
            // Group tags by trek_id
            allTags.forEach((tagAssignment: any) => {
              if (!tagsByTrek[tagAssignment.trek_id]) {
                tagsByTrek[tagAssignment.trek_id] = [];
              }
              if (tagAssignment.trek_event_tags) {
                tagsByTrek[tagAssignment.trek_id].push({
                  id: tagAssignment.trek_event_tags.id,
                  name: tagAssignment.trek_event_tags.name,
                });
              }
            });
          }
        } catch (error) {
          // Handle any unexpected errors gracefully
          console.warn("Error in tags fetch, using fallback:", error);
          tagsByTrek = {};
        }

        // Generate fallback tags from difficulty, location, and event_type
        const generateFallbackTags = (trek: any) => {
          const fallbackTags = [];
          if (trek.difficulty) {
            fallbackTags.push({ id: 1, name: trek.difficulty });
          }
          if (trek.location) {
            const locationLower = trek.location.toLowerCase();
            if (locationLower.includes("himalaya") || locationLower.includes("himachal")) {
              fallbackTags.push({ id: 2, name: "Mountain" });
            } else if (locationLower.includes("goa") || locationLower.includes("coast")) {
              fallbackTags.push({ id: 3, name: "Coastal" });
            } else if (
              locationLower.includes("karnataka") ||
              locationLower.includes("coorg") ||
              locationLower.includes("western ghats") ||
              locationLower.includes("chikmagalur") ||
              locationLower.includes("kudremukh") ||
              locationLower.includes("gokarna")
            ) {
              fallbackTags.push({ id: 4, name: "Western Ghats" });
            } else if (locationLower.includes("kerala") || locationLower.includes("forest")) {
              fallbackTags.push({ id: 5, name: "Forest" });
            } else {
              fallbackTags.push({ id: 6, name: "Adventure" });
            }
          }
          // Add event type tag
          if (trek.event_type === "camping") {
            fallbackTags.push({ id: 7, name: "Camping" });
          } else if (trek.event_type === "jam_yard") {
            fallbackTags.push({ id: 8, name: "Jam Yard" });
          }
          return fallbackTags.length > 0 ? fallbackTags : [{ id: 1, name: "Adventure" }];
        };

        const calculateDaysUntil = (dateString: string) => {
          const eventDate = new Date(dateString);
          const today = new Date();
          const diffTime = eventDate.getTime() - today.getTime();
          return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        };

        // Check user registration status for all events in parallel
        const userRegistrationChecks = user?.id
          ? await Promise.all(
              trekIds.map((id) => checkUserRegistration(user.id, id)),
            )
          : trekIds.map(() => false);

        const isRegisteredByTrek: Record<number, boolean> = {};
        trekIds.forEach((id, index) => {
          isRegisteredByTrek[id] = userRegistrationChecks[index];
        });

        // Transform data to match expected format
        const transformedEvents = treks.map((trek, index) => ({
          trek_id: trek.trek_id,
          name: trek.name,
          description:
            trek.description ||
            `Join us for an exciting ${trek.difficulty?.toLowerCase() || "moderate"} adventure in ${trek.location || "beautiful landscapes"}.`,
          location: trek.location || "Location TBD",
          difficulty: trek.difficulty || "Moderate",
          duration: (() => {
            // Parse PostgreSQL interval to display format
            if (!trek.duration) return "1";
            // Handle interval type (PostgreSQL returns as string like "3 days" or "2 days 12:00:00")
            const durationStr = String(trek.duration);
            const daysMatch = durationStr.match(/(\d+)\s*days?/i);
            if (daysMatch) {
              return daysMatch[1];
            }
            // If it's already a number string, use it
            const num = parseInt(durationStr, 10);
            return isNaN(num) ? "1" : num.toString();
          })(),
          start_datetime: trek.start_datetime,
          cost: trek.base_price,
          max_participants: trek.max_participants || 20,
          participant_count: registrationCounts[trek.trek_id] || 0,
          images: (() => {
            const dbImages = imagesByTrek[trek.trek_id];
            if (dbImages && dbImages.length > 0) {
              console.log(`✅ Using ${dbImages.length} DB images for trek ${trek.trek_id}`);
              return dbImages;
            }
            // This should not happen since we already added trek.image_url in the fallback above
            // But keeping as extra safety check
            if (trek.image_url && trek.image_url.trim() !== "") {
              console.log(`⚠️ Using trek_events.image_url fallback (late check) for trek ${trek.trek_id}`);
              return [trek.image_url];
            }
            console.log(`❌ Using placeholder images for trek ${trek.trek_id} (no DB images)`);
            console.log(`   Trek data: name="${trek.name}", image_url="${trek.image_url || 'null'}"`);
            return [
                  // Each event gets 3 rotating images based on index (final fallback)
                  ...(function () {
                    const imageGroups = [
                      // Group 1: Mountain Adventures
                      [
                        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80", // Mountain Lake
                        "https://images.unsplash.com/photo-1464822759844-d150baec0494?w=800&q=80", // Mountain Peak
                        "https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&q=80", // Snow peaks
                      ],
                      // Group 2: Coastal Adventures
                      [
                        "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80", // Coastal
                        "https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?w=800&q=80", // Ocean
                        "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80", // Beach sunset
                      ],
                      // Group 3: Forest Adventures
                      [
                        "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80", // Forest
                        "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&q=80", // Forest path
                        "https://images.unsplash.com/photo-1574263867128-a3d5c1b1deac?w=800&q=80", // Waterfall
                      ],
                      // Group 4: Desert Adventures
                      [
                        "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=800&q=80", // Desert
                        "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&q=80", // Sunrise
                        "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=800&q=80", // Desert dunes
                      ],
                      // Group 5: Valley Adventures
                      [
                        "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=80", // Valley
                        "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800&q=80", // Wildlife
                        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80", // Mountain Lake
                      ],
                      // Group 6: Night Adventures
                      [
                        "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=800&q=80", // Night sky
                        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80", // Mountain Lake
                        "https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&q=80", // Snow peaks
                      ],
                    ];
                    return imageGroups[index % imageGroups.length];
                  })(),
                ];
          })(),
          tags: tagsByTrek[trek.trek_id]?.length > 0 
            ? tagsByTrek[trek.trek_id] 
            : generateFallbackTags(trek),
          registration_status: "open" as const,
          days_until_event: calculateDaysUntil(trek.start_datetime),
          registeredFriends: participantsByTrek[trek.trek_id] || [],
          likeCount: engagementByTrek[trek.trek_id]?.likes || 0,
          viewCount: engagementByTrek[trek.trek_id]?.views || 0,
          isRegistered: isRegisteredByTrek[trek.trek_id] || false,
        }));

        setEvents(transformedEvents);
      } catch (error) {
        console.error("Error fetching events:", error);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const handleEventClick = (event: any) => {
    // Navigate to glass event details page
    window.location.href = `/glass-event-details/${event.trek_id}`;
  };

  const handleRegister = (eventId: number) => {
    console.log("Register for event:", eventId);
    // Implement registration logic
  };

  const handleShare = (eventId: number) => {
    console.log("Share event:", eventId);
    // Implement share functionality
  };

  if (loading) {
    return (
      <div className="glass-events-theme min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-900/20 via-green-900/15 to-emerald-900/10">
        <div className="w-16 h-16 border-4 border-amber-400/30 border-t-amber-400 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="glass-events-theme min-h-screen relative overflow-hidden">
      {/* Golden Hour Forest Background - Enhanced Impact */}
      <div className="fixed inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80')`,
            filter: "blur(8px) brightness(0.6) saturate(1.3)",
          }}
        />
        {/* Warm Golden-Green Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-900/30 via-green-900/25 to-emerald-900/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-amber-900/20" />

        {/* Subtle Animated Stars */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white/40 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                opacity: [0.2, 0.6, 0.2],
                scale: [0.5, 1, 0.5],
              }}
              transition={{
                duration: Math.random() * 3 + 2,
                repeat: Infinity,
                delay: Math.random() * 2,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        {/* Subtle Floating Particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={`particle-${i}`}
              className="absolute w-1 h-1 bg-amber-300/15 rounded-full blur-sm"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [-15, -80, -15],
                x: [-8, 8, -8],
                opacity: [0, 0.4, 0],
              }}
              transition={{
                duration: 10 + Math.random() * 5,
                repeat: Infinity,
                delay: Math.random() * 4,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      </div>

      {/* Origami Hamburger */}
      <OrigamiHamburger />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-8 pt-24">
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
              "bg-gradient-to-r from-white via-green-200 to-white bg-clip-text text-transparent",
              "drop-shadow-2xl",
            )}
          >
            Upcoming Adventures
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Join fellow adventurers on incredible journeys into nature's wonders
          </p>
        </motion.div>

        {/* Events Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {events.map((event, index) => (
            <motion.div
              key={event.trek_id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <GlassEventCard
                event={event}
                onClick={() => handleEventClick(event)}
                onRegister={() => handleRegister(event.trek_id)}
                onShare={() => handleShare(event.trek_id)}
                isRegistered={event.isRegistered || false}
              />
            </motion.div>
          ))}
        </motion.div>

        {events.length === 0 && (
          <motion.div
            className="text-center py-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <TreePine className="w-16 h-16 text-white/40 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white/80 mb-2">
              No Upcoming Adventures
            </h3>
            <p className="text-white/60">
              Check back soon for new exciting events!
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default GlassMorphismEvents;

