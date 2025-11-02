import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  Backpack,
  Calendar,
  Camera,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Heart,
  IndianRupee,
  Info,
  Mail,
  MapPin,
  MessageSquare,
  Mountain,
  Phone,
  Route,
  Share2,
  Shield,
  Star,
  Timer,
  TreePine,
  UserPlus,
  Users,
  X,
  Zap,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { useAuth } from "@/components/auth/AuthProvider";
import { GlassThemeHeader } from "@/components/navigation/GlassThemeHeader";
import { OrigamiHamburger } from "@/components/navigation/OrigamiHamburger";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTrekCosts } from "@/hooks/trek/useTrekCosts";
import { useTrekEventDetails } from "@/hooks/trek/useTrekEventDetails";
import { useTrekRegistration } from "@/hooks/trek/useTrekRegistration";
import { useGA4Analytics } from "@/hooks/useGA4Analytics";
import { useTrekCommunity } from "@/hooks/useTrekCommunity";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { formatIndianDate } from "@/utils/indianStandards";

// Glass Panel Component
interface GlassPanelProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

const GlassPanel: React.FC<GlassPanelProps> = ({
  children,
  className,
  delay = 0,
}) => (
  <motion.div
    className={cn(
      "backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl",
      "bg-white/10",
      className,
    )}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
  >
    {children}
  </motion.div>
);

// Image Carousel Component
interface ImageCarouselProps {
  images: string[];
  eventName: string;
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({ images, eventName }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { trackGalleryView } = useGA4Analytics();

  // Track gallery view when image changes
  useEffect(() => {
    if (images.length > 0 && currentIndex < images.length) {
      trackGalleryView(`image_${currentIndex}`, eventName);
    }
  }, [currentIndex, images.length, eventName, trackGalleryView]);

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="relative h-[70vh] rounded-2xl overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.img
          key={currentIndex}
          src={images[currentIndex]}
          alt={`${eventName} - Image ${currentIndex + 1}`}
          className="w-full h-full object-cover"
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.5 }}
        />
      </AnimatePresence>

      {/* Navigation Buttons */}
      {images.length > 1 && (
        <>
          <button
            onClick={prevImage}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full backdrop-blur-sm bg-black/30 border border-white/20 flex items-center justify-center text-white hover:bg-black/50 transition-all duration-200 z-20"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={nextImage}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full backdrop-blur-sm bg-black/30 border border-white/20 flex items-center justify-center text-white hover:bg-black/50 transition-all duration-200 z-20"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Image Counter */}
      <div className="absolute bottom-4 right-4 px-3 py-1 rounded-full backdrop-blur-sm bg-black/30 border border-white/20 text-white text-sm">
        {currentIndex + 1} / {images.length}
      </div>

      {/* Progress Dots */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-300",
                index === currentIndex
                  ? "bg-blue-400 w-8"
                  : "bg-white/40 hover:bg-white/60",
              )}
            />
          ))}
        </div>
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
    </div>
  );
};

// Participant Avatar Component
interface ParticipantAvatarProps {
  participant: {
    id: number;
    name: string;
    avatar?: string | null;
  };
  index: number;
}

const ParticipantAvatar: React.FC<ParticipantAvatarProps> = ({
  participant,
  index,
}) => (
  <motion.div
    className="relative group"
    initial={{ scale: 0, rotate: -180 }}
    animate={{ scale: 1, rotate: 0 }}
    transition={{ delay: index * 0.1, type: "spring", stiffness: 200 }}
  >
    <div className="w-12 h-12 rounded-full border-2 border-white/30 backdrop-blur-sm bg-white/10 flex items-center justify-center overflow-hidden">
      {participant.avatar ? (
        <img
          src={participant.avatar}
          alt={participant.name}
          className="w-full h-full object-cover"
        />
      ) : (
        <Users className="w-6 h-6 text-white" />
      )}
    </div>

    {/* Tooltip */}
    <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-black/80 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
      {participant.name}
    </div>
  </motion.div>
);

// Main Event Details Component
const GlassMorphismEventDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState<any>(null);
  const [images, setImages] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("overview");

  // Use hooks for data fetching
  const { trekEvent, loading: trekLoading } = useTrekEventDetails(id);
  const {
    registerForTrek,
    userRegistration,
    registering,
    cancelRegistration,
    uploadPaymentProof,
  } = useTrekRegistration(id);
  const {
    participants,
    participantCount,
    loading: communityLoading,
  } = useTrekCommunity(id);
  const { costs, loading: costsLoading } = useTrekCosts(id);

  // GA4 Analytics
  const {
    trackEvent,
    trackTrekRegistration,
    trackGalleryView,
    trackButtonClick,
  } = useGA4Analytics();

  const loading = trekLoading || communityLoading;
  const isRegistered =
    !!userRegistration && userRegistration.payment_status !== "Cancelled";

  // Fetch images for the trek
  useEffect(() => {
    const fetchImages = async () => {
      if (!id) return;

      try {
        const numericId = id ? parseInt(id, 10) : null;
        if (!numericId || isNaN(numericId)) return;

        const { data: imagesData, error: imagesError } = await (supabase
          .from("trek_event_images")
          .select("image_url")
          .eq("trek_id", numericId as any) as any);

        if (imagesError) {
          console.error("Error fetching images:", imagesError);
        }

        if (imagesData && imagesData.length > 0) {
          setImages(imagesData.map((img: any) => img.image_url));
        } else {
          // Fallback to default images if none found
          setImages([
            "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
            "https://images.unsplash.com/photo-1464822759844-d150baec0494?w=800&q=80",
            "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80",
            "https://images.unsplash.com/photo-1574263867128-a3d5c1b1deac?w=800&q=80",
          ]);
        }
      } catch (error) {
        console.error("Error fetching images:", error);
        setImages([
          "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
        ]);
      }
    };

    fetchImages();
  }, [id]);

  // Track page view when event loads
  useEffect(() => {
    if (event && trekEvent) {
      trackEvent("trek_view", {
        event_category: "Trek",
        event_label: trekEvent.trek_name || "Unknown Trek",
        trek_id: id,
        trek_name: trekEvent.trek_name,
        trek_difficulty: trekEvent.difficulty || "Unknown",
        trek_cost: costs?.[0]?.amount || trekEvent.cost || 0,
      });
    }
  }, [event, trekEvent, id, costs, trackEvent]);

  // Transform trekEvent to event format expected by UI
  useEffect(() => {
    if (!trekEvent) {
      setEvent(null);
      return;
    }

    // Generate tags from difficulty and location
    const generateTags = () => {
      const tags = [];
      if (trekEvent.difficulty) {
        tags.push({ id: 1, name: trekEvent.difficulty });
      }
      if (trekEvent.location) {
        const locationStr =
          typeof trekEvent.location === "string"
            ? trekEvent.location
            : JSON.stringify(trekEvent.location);
        if (
          locationStr.toLowerCase().includes("himalaya") ||
          locationStr.toLowerCase().includes("himachal")
        ) {
          tags.push({ id: 2, name: "Mountain" });
        } else if (
          locationStr.toLowerCase().includes("goa") ||
          locationStr.toLowerCase().includes("coast")
        ) {
          tags.push({ id: 3, name: "Coastal" });
        } else {
          tags.push({ id: 4, name: "Adventure" });
        }
      }
      return tags.length > 0 ? tags : [{ id: 1, name: "Adventure" }];
    };

    // Generate basic requirements
    const generateRequirements = () => {
      const requirements = ["Valid ID proof"];
      if (trekEvent.government_id_required) {
        requirements.push("Government ID verification");
      }
      requirements.push(
        "Trekking boots",
        "Warm clothing",
        "Personal water bottle",
        "First aid kit",
      );
      return requirements;
    };

    // Generate itinerary from event data or create default
    const generateItinerary = () => {
      if (trekEvent.itinerary && Array.isArray(trekEvent.itinerary)) {
        return trekEvent.itinerary.map((item: any, index: number) => ({
          day: index + 1,
          title: item.title || `Day ${index + 1}`,
          description: item.description || item.activities || "Trek activities",
        }));
      }

      // Fallback to duration-based itinerary
      const days = parseInt(trekEvent.duration || "3");
      return Array.from({ length: days }, (_, i) => ({
        day: i + 1,
        title:
          i === 0
            ? "Arrival & Orientation"
            : i === days - 1
              ? "Departure"
              : "Trek Day",
        description:
          i === 0
            ? "Check-in and briefing"
            : i === days - 1
              ? "Final day and departure"
              : `Day ${i + 1} trek activities`,
      }));
    };

    const locationStr =
      typeof trekEvent.location === "string"
        ? trekEvent.location
        : (trekEvent.location as any)?.name || "Location TBD";

    setEvent({
      trek_id: trekEvent.trek_id,
      name: trekEvent.trek_name || "Trek Event",
      description: trekEvent.description || "Join us for an amazing adventure!",
      location: locationStr,
      difficulty: trekEvent.difficulty || "Moderate",
      duration: trekEvent.duration || "3",
      start_datetime: trekEvent.start_datetime,
      base_price: trekEvent.cost || 0,
      max_participants: trekEvent.max_participants || 20,
      participant_count: participantCount || 0,
      images:
        images.length > 0
          ? images
          : [
              "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
            ],
      tags: generateTags(),
      requirements: generateRequirements(),
      itinerary: generateItinerary(),
      government_id_required: trekEvent.government_id_required || false,
      costs: costs || [],
    });
  }, [trekEvent, participantCount, images, costs]);

  const handleRegister = async () => {
    if (!user) {
      // Track login redirect
      trackButtonClick("register_login_redirect", {
        trek_id: id,
        trek_name: trekEvent?.trek_name,
      });
      navigate("/login");
      return;
    }

    if (!trekEvent || !user) return;

    // Track registration attempt
    const trekCost = costs?.[0]?.amount || trekEvent.cost || 0;
    trackTrekRegistration(
      id || "unknown",
      trekEvent.trek_name || "Unknown Trek",
      trekCost,
    );

    // For glass pages, we'll show a simple registration flow
    // Users can complete full registration with details later
    try {
      // Check if user has profile details
      const userProfile = user.user_metadata || {};
      const registrantName =
        userProfile.full_name || user.email?.split("@")[0] || "User";
      const registrantPhone = userProfile.phone || "";

      const success = await registerForTrek(
        true, // indemnityAccepted - for glass UI, we accept by default
        {
          registrantName,
          registrantPhone: registrantPhone || undefined,
        },
      );

      if (success) {
        // Track successful registration
        trackEvent("trek_registration_success", {
          event_category: "Trek",
          event_label: trekEvent.trek_name,
          trek_id: id,
          trek_name: trekEvent.trek_name,
          trek_cost: trekCost,
        });
      }

      if (!success && !registrantPhone) {
        // Prompt for phone number if missing
        const phone = prompt(
          "Please enter your phone number to complete registration:",
        );
        if (phone) {
          const retrySuccess = await registerForTrek(true, {
            registrantName,
            registrantPhone: phone,
          });
          if (retrySuccess) {
            trackEvent("trek_registration_success", {
              event_category: "Trek",
              event_label: trekEvent.trek_name,
              trek_id: id,
              trek_name: trekEvent.trek_name,
              trek_cost: trekCost,
            });
          }
        }
      }
    } catch (error) {
      console.error("Registration error:", error);
      trackEvent("trek_registration_error", {
        event_category: "Trek",
        event_label: "Registration Error",
        trek_id: id,
        error_message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  const handleShare = async () => {
    if (!event) return;

    // Track share attempt
    trackButtonClick("share_trek", {
      trek_id: id,
      trek_name: event.name,
      share_method: navigator.share ? "native" : "clipboard",
    });

    if (navigator.share) {
      try {
        await navigator.share({
          title: event.name,
          text: event.description,
          url: window.location.href,
        });
        // Track successful share
        trackEvent("trek_shared", {
          event_category: "Social",
          event_label: event.name,
          trek_id: id,
          share_method: "native",
        });
      } catch (error) {
        // User cancelled or error - track cancellation
        trackEvent("trek_share_cancelled", {
          event_category: "Social",
          event_label: event.name,
          trek_id: id,
        });
        console.log("Share cancelled:", error);
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        // Track successful clipboard copy
        trackEvent("trek_shared", {
          event_category: "Social",
          event_label: event.name,
          trek_id: id,
          share_method: "clipboard",
        });
        // You could show a toast here
      } catch (error) {
        console.error("Failed to copy URL:", error);
        trackEvent("trek_share_error", {
          event_category: "Social",
          event_label: "Share Error",
          trek_id: id,
          error_message:
            error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="glass-details-theme min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900/20 via-transparent to-purple-900/20">
        <div className="w-16 h-16 border-4 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="glass-details-theme min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-white/40 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white/80 mb-2">
            Event Not Found
          </h2>
          <p className="text-white/60 mb-4">
            The event you're looking for doesn't exist.
          </p>
          <Button
            onClick={() => navigate("/glass-events")}
            variant="outline"
            className="text-white border-white/20"
          >
            Back to Events
          </Button>
        </div>
      </div>
    );
  }

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

  const registrationProgress =
    event.max_participants > 0
      ? (event.participant_count / event.max_participants) * 100
      : 0;
  const spotsLeft = Math.max(
    0,
    event.max_participants - event.participant_count,
  );

  // Transform participants to format expected by UI
  const formattedParticipants = participants.map((p, index) => ({
    id: parseInt(p.id) || index + 1,
    name: p.name || "Unknown User",
    avatar: p.avatar || null,
  }));

  return (
    <div className="glass-details-theme min-h-screen relative overflow-hidden">
      {/* Golden Hour Adventure Background */}
      <div className="fixed inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1920&q=80')`,
            filter: "blur(8px) brightness(0.65) saturate(1.4)",
          }}
        />
        {/* Adventure Blue-Purple Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/25 via-purple-900/20 to-indigo-900/15" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-blue-900/25" />

        {/* Subtle Floating Elements */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-blue-300/30 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                opacity: [0.2, 0.5, 0.2],
                scale: [0.5, 1, 0.5],
              }}
              transition={{
                duration: Math.random() * 4 + 3,
                repeat: Infinity,
                delay: Math.random() * 3,
              }}
            />
          ))}
        </div>
      </div>

      {/* Glass Theme Header */}
      <GlassThemeHeader />

      {/* Origami Hamburger */}
      <OrigamiHamburger />

      {/* Back Button */}
      <motion.button
        onClick={() => navigate("/glass-events")}
        className="fixed top-20 left-4 z-40 p-3 rounded-full backdrop-blur-sm bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all duration-200"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
      >
        <ChevronLeft className="w-6 h-6" />
      </motion.button>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-8 pt-24">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Image Carousel */}
            <div>
              <ImageCarousel images={event.images} eventName={event.name} />
            </div>

            {/* Event Info Panel */}
            <GlassPanel delay={0.2}>
              <div className="space-y-6">
                {/* Title and Status */}
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <Badge
                      className={cn(
                        "px-3 py-1 backdrop-blur-sm border",
                        difficultyConfig.bg,
                        difficultyConfig.color,
                        "border-white/20",
                      )}
                    >
                      <DifficultyIcon className="w-4 h-4 mr-1" />
                      {event.difficulty || "Moderate"}
                    </Badge>
                    <Badge className="bg-blue-500/20 text-blue-400 border-blue-400/30">
                      {spotsLeft > 0 ? "Open" : "Full"}
                    </Badge>
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                    {event.name}
                  </h1>
                  <p className="text-white/80 leading-relaxed">
                    {event.description}
                  </p>
                </div>

                {/* Quick Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-white/80">
                    <Calendar className="w-5 h-5 text-blue-400" />
                    <div>
                      <div className="text-sm text-white/60">Date</div>
                      <div className="font-medium">
                        {formatIndianDate(new Date(event.start_datetime))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-white/80">
                    <MapPin className="w-5 h-5 text-blue-400" />
                    <div>
                      <div className="text-sm text-white/60">Location</div>
                      <div className="font-medium">{event.location}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-white/80">
                    <Clock className="w-5 h-5 text-blue-400" />
                    <div>
                      <div className="text-sm text-white/60">Duration</div>
                      <div className="font-medium">
                        {event.duration || "1"} days
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-white/80">
                    <IndianRupee className="w-5 h-5 text-blue-400" />
                    <div>
                      <div className="text-sm text-white/60">Cost</div>
                      <div className="font-medium">
                        ₹{(event.base_price || 0).toLocaleString("en-IN")}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Registration Progress */}
                <div className="space-y-3">
                  <div className="flex justify-between text-sm text-white/70">
                    <span>{event.participant_count} registered</span>
                    <span>{spotsLeft} spots left</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-3">
                    <motion.div
                      className="h-3 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${registrationProgress}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button
                    onClick={handleRegister}
                    disabled={isRegistered || spotsLeft <= 0 || registering}
                    className={cn(
                      "flex-1 backdrop-blur-sm border transition-all duration-200",
                      isRegistered
                        ? "bg-green-500/20 text-green-400 border-green-400/30"
                        : spotsLeft <= 0
                          ? "bg-gray-500/20 text-gray-400 border-gray-400/30 cursor-not-allowed"
                          : "bg-white/10 hover:bg-white/20 text-white border-white/20 hover:border-white/40",
                    )}
                  >
                    {registering ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                        Registering...
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4 mr-2" />
                        {isRegistered
                          ? "Registered"
                          : spotsLeft <= 0
                            ? "Full"
                            : "Register Now"}
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={handleShare}
                    variant="outline"
                    className="backdrop-blur-sm bg-white/10 hover:bg-white/20 text-white border-white/20"
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </GlassPanel>
          </div>

          {/* Participants Panel */}
          <GlassPanel delay={0.4} className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-400" />
                Fellow Adventurers ({event.participant_count})
              </h3>
            </div>
            <div className="flex flex-wrap gap-3">
              {formattedParticipants
                .slice(0, 10)
                .map((participant: any, index: number) => (
                  <ParticipantAvatar
                    key={participant.id || index}
                    participant={participant}
                    index={index}
                  />
                ))}
              {event.participant_count > formattedParticipants.length && (
                <div className="w-12 h-12 rounded-full border-2 border-white/30 backdrop-blur-sm bg-white/10 flex items-center justify-center">
                  <span className="text-white text-sm font-bold">
                    +{event.participant_count - formattedParticipants.length}
                  </span>
                </div>
              )}
              {formattedParticipants.length === 0 &&
                event.participant_count === 0 && (
                  <div className="text-white/60 text-sm">
                    No participants yet. Be the first to register!
                  </div>
                )}
            </div>
          </GlassPanel>

          {/* Detailed Information Tabs */}
          <GlassPanel delay={0.6}>
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-4 bg-white/10 backdrop-blur-sm border border-white/20">
                <TabsTrigger
                  value="overview"
                  className="text-white data-[state=active]:bg-white/20"
                >
                  <Info className="w-4 h-4 mr-2" />
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  value="itinerary"
                  className="text-white data-[state=active]:bg-white/20"
                >
                  <Route className="w-4 h-4 mr-2" />
                  Itinerary
                </TabsTrigger>
                <TabsTrigger
                  value="requirements"
                  className="text-white data-[state=active]:bg-white/20"
                >
                  <Backpack className="w-4 h-4 mr-2" />
                  Requirements
                </TabsTrigger>
                <TabsTrigger
                  value="contact"
                  className="text-white data-[state=active]:bg-white/20"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Contact
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-6">
                <div className="space-y-4 text-white/80">
                  <h4 className="text-lg font-semibold text-white">
                    About This Adventure
                  </h4>
                  <p className="leading-relaxed">
                    {event.description ||
                      "Join us for an incredible adventure that will challenge and inspire you. Experience the beauty of nature while creating lasting memories with fellow adventurers."}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <div className="space-y-2">
                      <h5 className="font-semibold text-white">
                        What's Included
                      </h5>
                      <ul className="space-y-1 text-sm">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          Professional guide
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          Safety equipment
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          Group meals
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          Transportation
                        </li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h5 className="font-semibold text-white">
                        What to Expect
                      </h5>
                      <ul className="space-y-1 text-sm">
                        <li className="flex items-center gap-2">
                          <Star className="w-4 h-4 text-yellow-400" />
                          Breathtaking views
                        </li>
                        <li className="flex items-center gap-2">
                          <Star className="w-4 h-4 text-yellow-400" />
                          Physical challenge
                        </li>
                        <li className="flex items-center gap-2">
                          <Star className="w-4 h-4 text-yellow-400" />
                          Cultural experiences
                        </li>
                        <li className="flex items-center gap-2">
                          <Star className="w-4 h-4 text-yellow-400" />
                          New friendships
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="itinerary" className="mt-6">
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-white">
                    Day-by-Day Itinerary
                  </h4>
                  {event.itinerary.map((day: any, index: number) => (
                    <motion.div
                      key={day.day}
                      className="flex gap-4 p-4 rounded-lg bg-white/5 border border-white/10"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold">
                        {day.day}
                      </div>
                      <div>
                        <h5 className="font-semibold text-white">
                          {day.title}
                        </h5>
                        <p className="text-white/70 text-sm">
                          {day.description}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="requirements" className="mt-6">
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-white">
                    What You Need to Bring
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {event.requirements.map(
                      (requirement: string, index: number) => (
                        <motion.div
                          key={index}
                          className="flex items-center gap-2 p-2 rounded-lg bg-white/5"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <Shield className="w-4 h-4 text-blue-400 flex-shrink-0" />
                          <span className="text-white/80 text-sm">
                            {requirement}
                          </span>
                        </motion.div>
                      ),
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="contact" className="mt-6">
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-white">
                    Get in Touch
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                        <Phone className="w-5 h-5 text-blue-400" />
                        <div>
                          <div className="text-sm text-white/60">Phone</div>
                          <div className="text-white">+91 98765 43210</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                        <Mail className="w-5 h-5 text-blue-400" />
                        <div>
                          <div className="text-sm text-white/60">Email</div>
                          <div className="text-white">
                            adventures@intothewild.com
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <Button className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/20">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Ask a Question
                      </Button>
                      <Button className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/20">
                        <Camera className="w-4 h-4 mr-2" />
                        View Gallery
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </GlassPanel>
        </div>
      </div>
    </div>
  );
};

export default GlassMorphismEventDetails;
