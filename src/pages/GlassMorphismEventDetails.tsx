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
  DollarSign,
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
import { ExpenseSplitting } from "@/components/expenses/ExpenseSplitting";
import { GlassThemeHeader } from "@/components/navigation/GlassThemeHeader";
import { OrigamiHamburger } from "@/components/navigation/OrigamiHamburger";
import { TravelCoordination } from "@/components/trek/TravelCoordination";
import { TrekDiscussion } from "@/components/trek/TrekDiscussion";
import TrekPackingList from "@/components/trek/TrekPackingList";
import { TrekRequirements } from "@/components/trek/TrekRequirements";
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
import { EventType } from "@/types/trek";
import { getTrekImageUrl } from "@/utils/imageStorage";
import { formatIndianDate, parseDuration } from "@/utils/indianStandards";

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
    <div className="relative w-full aspect-[4/5] sm:aspect-[3/4] lg:aspect-square lg:h-[600px] rounded-2xl overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.img
          key={currentIndex}
          src={images[currentIndex]}
          alt={`${eventName} - Image ${currentIndex + 1}`}
          className="w-full h-full object-cover sm:object-contain lg:object-cover"
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
  const [tabScrollLeft, setTabScrollLeft] = useState(0);
  const [tabScrollWidth, setTabScrollWidth] = useState(0);
  const [tabClientWidth, setTabClientWidth] = useState(0);
  const tabsListRef = React.useRef<HTMLDivElement>(null);

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
    comments,
    commentsLoading,
    addComment,
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

        // Fetch admin-uploaded images from trek_event_images table
        const { data: imagesData, error: imagesError } = await supabase
          .from("trek_event_images")
          .select("image_url, position")
          .eq("trek_id", numericId)
          .order("position", { ascending: true });

        if (imagesError) {
          console.error(
            "❌ Error fetching trek_event_images for trek",
            numericId,
            ":",
            imagesError,
          );
        } else {
          console.log(
            `✅ Fetched ${imagesData?.length || 0} admin images from trek_event_images for trek ${numericId}`,
          );
        }

        // ALSO fetch approved user-contributed images
        const { data: userImagesData, error: userImagesError } = await supabase
          .from("user_trek_images")
          .select("image_url, created_at")
          .eq("trek_id", numericId)
          .eq("status", "approved")
          .order("created_at", { ascending: true });

        if (userImagesError) {
          console.error(
            "❌ Error fetching user_trek_images for trek",
            numericId,
            ":",
            userImagesError,
          );
        } else {
          console.log(
            `✅ Fetched ${userImagesData?.length || 0} approved user images for trek ${numericId}`,
          );
        }

        // Combine both sources: admin images first (ordered by position), then user images (ordered by date)
        const allImageUrls: string[] = [];

        // Add admin images first
        if (imagesData && imagesData.length > 0) {
          imagesData.forEach((img: any) => {
            if (img.image_url && img.image_url.trim() !== "") {
              allImageUrls.push(img.image_url);
            }
          });
        }

        // Add approved user images
        if (userImagesData && userImagesData.length > 0) {
          userImagesData.forEach((img: any) => {
            if (img.image_url && img.image_url.trim() !== "") {
              allImageUrls.push(img.image_url);
            }
          });
        }

        // Validate and filter image URLs, converting storage paths to public URLs
        const validImages = allImageUrls
          .map((url: string) => getTrekImageUrl(url))
          .filter((url: string) => url !== "");

        console.log(
          `📊 Valid images after filtering: ${validImages.length} for trek ${numericId} (${imagesData?.length || 0} admin + ${userImagesData?.length || 0} user)`,
        );

        if (validImages.length > 0) {
          console.log(
            `✅ Using ${validImages.length} DB images for trek ${numericId}`,
          );
          setImages(validImages);
        } else {
          // Try to use image_url from trek_events as fallback
          if (trekEvent?.image_url && trekEvent.image_url.trim() !== "") {
            console.log(
              `⚠️ Using trek_events.image_url fallback for trek ${numericId}`,
            );
            const fallbackUrl = getTrekImageUrl(trekEvent.image_url);
            setImages(fallbackUrl ? [fallbackUrl] : []);
          } else {
            console.log(
              `❌ Using placeholder images for trek ${numericId} (no DB images)`,
            );
            // Final fallback to default images
            setImages([
              "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80",
              "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
              "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&q=80",
            ]);
          }
        }
      } catch (error) {
        console.error("Error fetching images:", error);
        setImages([
          "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
        ]);
      }
    };

    fetchImages();
  }, [id, trekEvent]);

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

  // Fetch requirements from database
  const [requirements, setRequirements] = useState<string[]>([]);

  useEffect(() => {
    const loadRequirements = async () => {
      if (!id || !trekEvent) return;

      try {
        const numericId = parseInt(id, 10);
        if (isNaN(numericId)) {
          setRequirements(getDefaultRequirements());
          return;
        }

        // Fetch packing list items assigned to this trek
        const { data: assignments, error } = await supabase
          .from("trek_packing_list_assignments")
          .select(
            `
            master_item_id,
            mandatory,
            item_order,
            master_packing_items:master_item_id (
              name,
              category
            )
          `,
          )
          .eq("trek_id", numericId)
          .order("item_order", { ascending: true });

        if (error) {
          console.warn("Error fetching requirements:", error);
          setRequirements(getDefaultRequirements());
          return;
        }

        if (assignments && assignments.length > 0) {
          // Extract item names, prioritizing mandatory items first
          const mandatoryItems = assignments
            .filter((a: any) => a.mandatory && a.master_packing_items)
            .map((a: any) => a.master_packing_items.name);

          const optionalItems = assignments
            .filter((a: any) => !a.mandatory && a.master_packing_items)
            .map((a: any) => a.master_packing_items.name);

          // Combine: mandatory first, then optional
          const allItems = [...mandatoryItems, ...optionalItems];

          // Always include ID proof requirement
          const reqs = ["Valid ID proof"];
          if (trekEvent.government_id_required) {
            reqs.push("Government ID verification");
          }

          // Add database items (avoid duplicates)
          allItems.forEach((item) => {
            if (item && !reqs.includes(item)) {
              reqs.push(item);
            }
          });

          setRequirements(reqs.length > 2 ? reqs : getDefaultRequirements());
        } else {
          setRequirements(getDefaultRequirements());
        }
      } catch (error) {
        console.error("Error fetching requirements:", error);
        setRequirements(getDefaultRequirements());
      }
    };

    const getDefaultRequirements = (): string[] => {
      const reqs = ["Valid ID proof"];
      if (trekEvent?.government_id_required) {
        reqs.push("Government ID verification");
      }
      reqs.push(
        "Trekking boots",
        "Warm clothing",
        "Personal water bottle",
        "First aid kit",
      );
      return reqs;
    };

    loadRequirements();
  }, [id, trekEvent]);

  // Fetch tags from database
  const [tags, setTags] = useState<Array<{ id: number; name: string }>>([]);

  useEffect(() => {
    const loadTags = async () => {
      if (!id || !trekEvent) {
        return;
      }

      const generateFallbackTags = (): Array<{ id: number; name: string }> => {
        const fallbackTags: Array<{ id: number; name: string }> = [];
        if (trekEvent?.difficulty) {
          fallbackTags.push({ id: 1, name: trekEvent.difficulty });
        }
        if (trekEvent?.location) {
          const locationStr =
            typeof trekEvent.location === "string"
              ? trekEvent.location
              : JSON.stringify(trekEvent.location);
          if (
            locationStr.toLowerCase().includes("himalaya") ||
            locationStr.toLowerCase().includes("himachal")
          ) {
            fallbackTags.push({ id: 2, name: "Mountain" });
          } else if (
            locationStr.toLowerCase().includes("goa") ||
            locationStr.toLowerCase().includes("coast")
          ) {
            fallbackTags.push({ id: 3, name: "Coastal" });
          } else if (
            locationStr.toLowerCase().includes("karnataka") ||
            locationStr.toLowerCase().includes("coorg") ||
            locationStr.toLowerCase().includes("western ghats")
          ) {
            fallbackTags.push({ id: 4, name: "Western Ghats" });
          } else {
            fallbackTags.push({ id: 5, name: "Adventure" });
          }
        }
        return fallbackTags.length > 0
          ? fallbackTags
          : [{ id: 1, name: "Adventure" }];
      };

      try {
        const numericId = parseInt(id, 10);
        if (isNaN(numericId)) {
          setTags(generateFallbackTags());
          return;
        }

        // Fetch tags from database (gracefully handle missing table)
        try {
          const { data: tagsData, error } = await supabase
            .from("trek_event_tag_assignments")
            .select(
              `
              tag_id,
              trek_event_tags:tag_id (
                id,
                name,
                color,
                category
              )
            `,
            )
            .eq("trek_id", numericId);

          if (error) {
            // Check if it's a "table not found" error
            if (
              error.code === "PGRST205" ||
              error.message?.includes("Could not find the table")
            ) {
              console.warn(
                "⚠️ Tags table not found - using fallback tags. Migration may need to be applied.",
              );
            } else {
              console.warn("Error fetching tags:", error);
            }
            setTags(generateFallbackTags());
            return;
          }

          if (tagsData && tagsData.length > 0) {
            const dbTags = tagsData
              .filter((t: any) => t.trek_event_tags)
              .map((t: any) => ({
                id: t.trek_event_tags.id,
                name: t.trek_event_tags.name,
              }));

            if (dbTags.length > 0) {
              setTags(dbTags);
              return;
            }
          }
        } catch (dbError) {
          // Handle table not found or other database errors
          if (
            (dbError as any)?.code === "PGRST205" ||
            (dbError as any)?.message?.includes("Could not find the table")
          ) {
            console.warn("⚠️ Tags table not found - using fallback tags.");
          } else {
            console.error("Error fetching tags:", dbError);
          }
        }

        // Fallback to generated tags
        setTags(generateFallbackTags());
      } catch (error) {
        console.error("Error in tags fetch:", error);
        const generateFallbackTags = (): Array<{
          id: number;
          name: string;
        }> => {
          return [{ id: 1, name: "Adventure" }];
        };
        setTags(generateFallbackTags());
      }
    };

    loadTags();
  }, [id, trekEvent]);

  // Transform trekEvent to event format expected by UI
  useEffect(() => {
    if (!trekEvent) {
      setEvent(null);
      return;
    }

    // Generate tags from difficulty and location (will be replaced with DB tags)
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
      // Parse PostgreSQL interval format (e.g., "3 days" or "2 days 12:00:00")
      const days = parseInt(parseDuration(trekEvent.duration), 10) || 3;
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

    // For Jam Yard events, use skill_level from jam_yard_details instead of difficulty
    let displayDifficulty: string;
    if (
      trekEvent.event_type === EventType.JAM_YARD &&
      trekEvent.jam_yard_details
    ) {
      const skillLevel = trekEvent.jam_yard_details?.skill_level;
      if (skillLevel) {
        // Capitalize skill level for display (beginner -> Beginner, etc.)
        displayDifficulty =
          skillLevel.charAt(0).toUpperCase() + skillLevel.slice(1);
        // Handle "all" -> "All Levels"
        if (skillLevel === "all") {
          displayDifficulty = "All Levels";
        }
      } else {
        // Fallback: if no skill_level but has difficulty (combined event), use difficulty
        displayDifficulty = trekEvent.difficulty || "Moderate";
      }
    } else {
      // For non-Jam Yard events, use difficulty field
      displayDifficulty = trekEvent.difficulty || "Moderate";
    }

    setEvent({
      trek_id: trekEvent.trek_id,
      name: trekEvent.trek_name || "Trek Event",
      description: trekEvent.description || "Join us for an amazing adventure!",
      location: locationStr,
      difficulty: displayDifficulty,
      duration: parseDuration(trekEvent.duration),
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
      requirements:
        requirements.length > 0
          ? requirements
          : [
              "Valid ID proof",
              ...(trekEvent.government_id_required
                ? ["Government ID verification"]
                : []),
              "Trekking boots",
              "Warm clothing",
              "Personal water bottle",
              "First aid kit",
            ],
      itinerary: generateItinerary(),
      government_id_required: trekEvent.government_id_required || false,
      costs: costs || [],
    });
  }, [trekEvent, participantCount, images, costs, requirements]);

  // Tab scroll handler
  const handleTabScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    setTabScrollLeft(target.scrollLeft);
    setTabScrollWidth(target.scrollWidth);
    setTabClientWidth(target.clientWidth);
  };

  // Initialize scroll metrics (must be before any early returns to satisfy hooks rules)
  useEffect(() => {
    const updateScrollMetrics = () => {
      if (tabsListRef.current) {
        setTabScrollLeft(tabsListRef.current.scrollLeft);
        setTabScrollWidth(tabsListRef.current.scrollWidth);
        setTabClientWidth(tabsListRef.current.clientWidth);
      }
    };

    // Initial update
    updateScrollMetrics();

    // Update on resize
    window.addEventListener("resize", updateScrollMetrics);

    // Small delay to ensure DOM is ready (only when event exists)
    const timeoutId = event ? setTimeout(updateScrollMetrics, 100) : null;

    return () => {
      window.removeEventListener("resize", updateScrollMetrics);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [
    event?.trek_id,
    trekEvent?.itinerary,
    event ? true : false, // Only run when event exists
  ]); // Re-check when tabs might change

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
    const diffLower = difficulty?.toLowerCase();

    // Handle skill levels (for Jam Yard events)
    if (diffLower === "beginner" || diffLower === "all levels") {
      return {
        icon: TreePine,
        color: "text-green-400",
        bg: "bg-green-500/20",
      };
    }
    if (diffLower === "intermediate") {
      return {
        icon: Mountain,
        color: "text-yellow-400",
        bg: "bg-yellow-500/20",
      };
    }
    if (diffLower === "advanced") {
      return { icon: Zap, color: "text-red-400", bg: "bg-red-500/20" };
    }

    // Handle traditional difficulty levels
    switch (diffLower) {
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
      case "difficult":
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

  // Check if itinerary exists and has content
  const hasItinerary =
    trekEvent?.itinerary &&
    (trekEvent.itinerary.days
      ? Array.isArray(trekEvent.itinerary.days) &&
        trekEvent.itinerary.days.length > 0
      : typeof trekEvent.itinerary === "object" &&
        Object.keys(trekEvent.itinerary).length > 0);

  // Define tabs dynamically based on available data
  const tabsToShow = [
    { id: "overview", label: "Overview", mobileLabel: "Overview", icon: Info },
    ...(hasItinerary
      ? [
          {
            id: "itinerary",
            label: "Itinerary",
            mobileLabel: "Itinerary",
            icon: Route,
          },
        ]
      : []),
    {
      id: "requirements",
      label: "Requirements",
      mobileLabel: "Requirements",
      icon: Backpack,
    },
    {
      id: "travel",
      label: "Travel Plans",
      mobileLabel: "Travel",
      icon: MapPin,
    },
    {
      id: "expense",
      label: "Expense",
      mobileLabel: "Expense",
      icon: DollarSign,
    },
    { id: "chat", label: "Chat", mobileLabel: "Chat", icon: MessageSquare },
  ];

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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-8 lg:items-start">
            {/* Image Carousel */}
            <div className="w-full">
              <ImageCarousel images={event.images} eventName={event.name} />
            </div>

            {/* Event Info Panel - Match height with carousel on desktop */}
            <GlassPanel
              delay={0.2}
              className="lg:h-[600px] lg:flex lg:flex-col"
            >
              <div className="space-y-6 flex-1 flex flex-col lg:overflow-y-auto lg:pr-2">
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

                {/* Quick Info - Mobile Optimized */}
                <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 sm:gap-4">
                  <div className="flex items-center gap-2 text-white/80 p-2 sm:p-0 rounded-lg sm:rounded-none bg-white/5 sm:bg-transparent">
                    <Calendar className="w-5 h-5 text-blue-400 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs sm:text-sm text-white/60">
                        Date
                      </div>
                      <div className="font-medium text-sm sm:text-base truncate">
                        {formatIndianDate(new Date(event.start_datetime))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-white/80 p-2 sm:p-0 rounded-lg sm:rounded-none bg-white/5 sm:bg-transparent">
                    <MapPin className="w-5 h-5 text-blue-400 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs sm:text-sm text-white/60">
                        Location
                      </div>
                      <div className="font-medium text-sm sm:text-base truncate">
                        {event.location}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-white/80 p-2 sm:p-0 rounded-lg sm:rounded-none bg-white/5 sm:bg-transparent">
                    <Clock className="w-5 h-5 text-blue-400 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs sm:text-sm text-white/60">
                        Duration
                      </div>
                      <div className="font-medium text-sm sm:text-base">
                        {(() => {
                          const days = parseDuration(event.duration);
                          return `${days} ${days === "1" ? "day" : "days"}`;
                        })()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-white/80 p-2 sm:p-0 rounded-lg sm:rounded-none bg-white/5 sm:bg-transparent">
                    <IndianRupee className="w-5 h-5 text-blue-400 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs sm:text-sm text-white/60">
                        Cost
                      </div>
                      <div className="font-medium text-sm sm:text-base">
                        {event.base_price === 0 ? (
                          <Badge variant="secondary" className="text-white">
                            Free
                          </Badge>
                        ) : (
                          `₹${(event.base_price || 0).toLocaleString("en-IN")}`
                        )}
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
              {/* Mobile-Optimized Horizontal Scrollable Tab Bar (iOS Safari Style) */}
              <div className="relative">
                {/* Left Gradient Fade Indicator */}
                {tabScrollLeft > 0 && (
                  <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-white/20 via-white/10 to-transparent pointer-events-none z-10 sm:hidden rounded-l-lg" />
                )}

                {/* Right Gradient Fade Indicator */}
                {tabScrollLeft < tabScrollWidth - tabClientWidth - 10 && (
                  <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white/20 via-white/10 to-transparent pointer-events-none z-10 sm:hidden rounded-r-lg" />
                )}

                <TabsList
                  ref={tabsListRef}
                  onScroll={handleTabScroll}
                  className={cn(
                    "w-full bg-white/10 backdrop-blur-sm border border-white/20",
                    // Mobile: Horizontal scrollable flex layout
                    "flex sm:grid gap-2 p-2 h-auto",
                    "overflow-x-auto sm:overflow-x-visible",
                    "scrollbar-none snap-x snap-mandatory", // Hide scrollbar, snap scrolling
                    // Desktop: Grid layout
                    tabsToShow.length <= 3
                      ? tabsToShow.length === 1
                        ? "sm:grid-cols-1"
                        : tabsToShow.length === 2
                          ? "sm:grid-cols-2"
                          : "sm:grid-cols-3"
                      : "sm:grid-cols-3 lg:grid-cols-6",
                  )}
                >
                  {tabsToShow.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <TabsTrigger
                        key={tab.id}
                        value={tab.id}
                        className={cn(
                          "text-white data-[state=active]:bg-white/20 data-[state=active]:text-white",
                          // Mobile: Icon-focused, fixed width for scrolling
                          "min-w-[100px] sm:min-w-0", // Fixed width on mobile
                          "w-[100px] sm:w-auto", // Auto width on desktop
                          "h-14 sm:h-11", // Taller on mobile for better touch target
                          "px-3 sm:px-4",
                          "flex flex-col sm:flex-row items-center justify-center",
                          "gap-1 sm:gap-2",
                          "text-[10px] sm:text-sm",
                          "flex-shrink-0 snap-start", // Prevent shrinking, snap on scroll
                          "transition-all duration-200",
                        )}
                      >
                        <Icon className="w-5 h-5 sm:w-4 sm:h-4 flex-shrink-0" />
                        {/* Mobile: Show label always (shorter), Desktop: Full label */}
                        <span className="truncate text-center block">
                          <span className="sm:hidden">{tab.mobileLabel}</span>
                          <span className="hidden sm:inline">{tab.label}</span>
                        </span>
                      </TabsTrigger>
                    );
                  })}
                </TabsList>
              </div>

              <TabsContent value="overview" className="mt-6 text-white/80">
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-white">
                    About This Adventure
                  </h4>
                  <p className="leading-relaxed">
                    {event.description ||
                      "Join us for an incredible adventure that will challenge and inspire you. Experience the beauty of nature while creating lasting memories with fellow adventurers."}
                  </p>

                  {/* Government ID Requirement Notice */}
                  {trekEvent?.government_id_required && (
                    <div className="p-4 rounded-lg bg-amber-500/20 border border-amber-400/30 mt-6">
                      <div className="flex items-center gap-2 text-amber-300">
                        <Shield className="w-5 h-5" />
                        <span className="font-semibold">
                          Government ID Required
                        </span>
                      </div>
                      <p className="text-sm text-amber-200/80 mt-2">
                        This trek requires government ID verification for
                        participants. Please upload your ID in the Requirements
                        tab.
                      </p>
                    </div>
                  )}

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

              {hasItinerary && (
                <TabsContent value="itinerary" className="mt-6 text-white/80">
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-white">
                      Day-by-Day Itinerary
                    </h4>
                    {trekEvent?.itinerary?.days &&
                    Array.isArray(trekEvent.itinerary.days) &&
                    trekEvent.itinerary.days.length > 0 ? (
                      trekEvent.itinerary.days.map(
                        (day: any, index: number) => (
                          <motion.div
                            key={day.day || index}
                            className="flex gap-4 p-4 rounded-lg bg-white/5 border border-white/10"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold">
                              {day.day || index + 1}
                            </div>
                            <div className="flex-1">
                              <h5 className="font-semibold text-white">
                                {day.title || `Day ${day.day || index + 1}`}
                              </h5>
                              {day.accommodation && (
                                <p className="text-white/80 text-sm mt-1">
                                  <span className="font-medium">
                                    Accommodation:
                                  </span>{" "}
                                  {day.accommodation}
                                </p>
                              )}
                              {day.activities &&
                                Array.isArray(day.activities) &&
                                day.activities.length > 0 && (
                                  <div className="mt-2">
                                    <p className="text-white/70 text-sm font-medium mb-1">
                                      Activities:
                                    </p>
                                    <ul className="text-white/70 text-sm space-y-1">
                                      {day.activities.map(
                                        (
                                          activity: string,
                                          actIndex: number,
                                        ) => (
                                          <li
                                            key={actIndex}
                                            className="flex items-start gap-2"
                                          >
                                            <span className="text-blue-400 mt-1">
                                              •
                                            </span>
                                            <span>{activity}</span>
                                          </li>
                                        ),
                                      )}
                                    </ul>
                                  </div>
                                )}
                              {day.description && (
                                <p className="text-white/70 text-sm mt-2">
                                  {day.description}
                                </p>
                              )}
                            </div>
                          </motion.div>
                        ),
                      )
                    ) : (
                      <p className="text-white/60">
                        Itinerary details will be available soon.
                      </p>
                    )}
                  </div>
                </TabsContent>
              )}

              <TabsContent value="requirements" className="mt-6 text-white/80">
                <div className="space-y-6">
                  {/* ID Upload Section - Only if government ID is required */}
                  {trekEvent?.government_id_required && (
                    <div className="rounded-xl border border-white/20 bg-white/10 backdrop-blur-xl p-4 sm:p-6">
                      <h4 className="text-lg font-semibold text-white mb-4">
                        ID Proof Upload
                      </h4>
                      <div className="[&_*]:!text-white/90 [&_*]:!text-white [&_h1]:!text-white [&_h2]:!text-white [&_h3]:!text-white [&_h4]:!text-white [&_h5]:!text-white [&_h6]:!text-white [&_p]:!text-white/80 [&_span]:!text-white/80 [&_li]:!text-white/80 [&_label]:!text-white/80 [&_label]:!font-medium [&_.card]:!bg-white/5 [&_.card]:!border-white/10 [&_.card]:!text-white [&_Card]:!bg-white/5 [&_Card]:!border-white/10 [&_CardHeader]:!text-white [&_CardTitle]:!text-white [&_CardDescription]:!text-white/80 [&_CardContent]:!text-white/80 [&_button]:!bg-white/10 [&_button]:hover:!bg-white/20 [&_button]:!border-white/20 [&_button]:!text-white [&_Button]:!bg-white/10 [&_Button]:hover:!bg-white/20 [&_Button]:!border-white/20 [&_Button]:!text-white [&_input]:!bg-white/5 [&_input]:!border-white/10 [&_input]:!text-white [&_input]:!placeholder:text-white/50 [&_Input]:!bg-white/5 [&_Input]:!border-white/10 [&_Input]:!text-white [&_select]:!bg-white/5 [&_select]:!border-white/10 [&_select]:!text-white [&_SelectTrigger]:!bg-white/5 [&_SelectTrigger]:!border-white/10 [&_SelectTrigger]:!text-white [&_.bg-muted]:!bg-white/5 [&_.bg-card]:!bg-white/5 [&_.text-muted-foreground]:!text-white/60 [&_.border]:!border-white/10 [&_.rounded-lg]:!border-white/10 [&_.rounded-xl]:!border-white/10 [&_.rounded-md]:!border-white/10">
                        <TrekRequirements
                          trekId={parseInt(id || "0", 10)}
                          governmentIdRequired={
                            trekEvent.government_id_required
                          }
                          userRegistration={userRegistration || undefined}
                          onUploadProof={async (
                            idTypeId: number,
                            file: File,
                          ) => {
                            // Handle ID proof upload through the registration hook if available
                            if (uploadPaymentProof) {
                              try {
                                // Note: This is a placeholder - adjust based on actual uploadPaymentProof signature
                                return true;
                              } catch (error) {
                                console.error(
                                  "Error uploading ID proof:",
                                  error,
                                );
                                return false;
                              }
                            }
                            return false;
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Packing Checklist Section - Always shown */}
                  <div className="rounded-xl border border-white/20 bg-white/10 backdrop-blur-xl p-4 sm:p-6">
                    <h4 className="text-lg font-semibold text-white mb-4">
                      Packing Checklist
                    </h4>
                    <div className="[&_*]:!text-white/90 [&_*]:!text-white [&_h1]:!text-white [&_h2]:!text-white [&_h3]:!text-white [&_h4]:!text-white [&_h5]:!text-white [&_p]:!text-white/80 [&_span]:!text-white/80 [&_li]:!text-white/80 [&_label]:!text-white/80 [&_.card]:!bg-white/5 [&_.card]:!border-white/10 [&_.card]:!text-white [&_Card]:!bg-white/5 [&_Card]:!border-white/10 [&_CardHeader]:!text-white [&_CardTitle]:!text-white [&_CardDescription]:!text-white/80 [&_CardContent]:!text-white/80 [&_button]:!bg-white/10 [&_button]:hover:!bg-white/20 [&_button]:!border-white/20 [&_button]:!text-white [&_Button]:!bg-white/10 [&_Button]:hover:!bg-white/20 [&_Button]:!border-white/20 [&_Button]:!text-white [&_input]:!bg-white/5 [&_input]:!border-white/10 [&_input]:!text-white [&_checkbox]:!border-white/20 [&_.bg-muted]:!bg-white/5 [&_.bg-card]:!bg-white/5 [&_.text-muted-foreground]:!text-white/60 [&_.border]:!border-white/10 [&_.hover\\:bg-muted\\/50]:!hover:bg-white/10">
                      <TrekPackingList trekId={id} />
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="travel" className="mt-6 text-white/80">
                <div className="rounded-xl border border-white/20 bg-white/10 backdrop-blur-xl p-4 sm:p-6 [&_*]:!text-white/90 [&_*]:!text-white [&_h1]:!text-white [&_h2]:!text-white [&_h3]:!text-white [&_h4]:!text-white [&_h5]:!text-white [&_h6]:!text-white [&_p]:!text-white/80 [&_span]:!text-white/80 [&_li]:!text-white/80 [&_label]:!text-white/80 [&_label]:!font-medium [&_.card]:!bg-white/5 [&_.card]:!border-white/10 [&_.card]:!text-white [&_Card]:!bg-white/5 [&_Card]:!border-white/10 [&_Card]:!text-white [&_CardHeader]:!text-white [&_CardTitle]:!text-white [&_CardDescription]:!text-white/80 [&_CardContent]:!text-white/80 [&_CardFooter]:!text-white/80 [&_button]:!bg-white/10 [&_button]:hover:!bg-white/20 [&_button]:!border-white/20 [&_button]:!text-white [&_Button]:!bg-white/10 [&_Button]:hover:!bg-white/20 [&_Button]:!border-white/20 [&_Button]:!text-white [&_input]:!bg-white/5 [&_input]:!border-white/10 [&_input]:!text-white [&_input]:!placeholder:text-white/50 [&_Input]:!bg-white/5 [&_Input]:!border-white/10 [&_Input]:!text-white [&_textarea]:!bg-white/5 [&_textarea]:!border-white/10 [&_textarea]:!text-white [&_textarea]:!placeholder:text-white/50 [&_Textarea]:!bg-white/5 [&_Textarea]:!border-white/10 [&_Textarea]:!text-white [&_select]:!bg-white/5 [&_select]:!border-white/10 [&_select]:!text-white [&_SelectTrigger]:!bg-white/5 [&_SelectTrigger]:!border-white/10 [&_SelectTrigger]:!text-white [&_SelectContent]:!bg-white/10 [&_SelectContent]:!backdrop-blur-xl [&_SelectItem]:!text-white [&_SelectItem]:hover:!bg-white/20 [&_Alert]:!bg-white/5 [&_Alert]:!border-white/10 [&_Alert]:!text-white [&_AlertTitle]:!text-white [&_AlertDescription]:!text-white/80 [&_Badge]:!bg-white/10 [&_Badge]:!text-white [&_Badge]:!border-white/20 [&_.bg-muted]:!bg-white/5 [&_.bg-card]:!bg-white/5 [&_.text-muted-foreground]:!text-white/60 [&_.border]:!border-white/10 [&_Separator]:!bg-white/20 [&_Avatar]:!border-white/20">
                  <TravelCoordination
                    transportMode={trekEvent?.transport_mode}
                    pickupTimeWindow={trekEvent?.pickup_time_window}
                    vendorContacts={trekEvent?.vendor_contacts as any}
                  />
                </div>
              </TabsContent>

              <TabsContent value="expense" className="mt-6 text-white/80">
                <div className="rounded-xl border border-white/20 bg-white/10 backdrop-blur-xl p-4 sm:p-6 [&_*]:!text-white/90 [&_*]:!text-white [&_h1]:!text-white [&_h2]:!text-white [&_h3]:!text-white [&_h4]:!text-white [&_h5]:!text-white [&_h6]:!text-white [&_p]:!text-white/80 [&_span]:!text-white/80 [&_li]:!text-white/80 [&_label]:!text-white/80 [&_label]:!font-medium [&_.card]:!bg-white/5 [&_.card]:!border-white/10 [&_.card]:!text-white [&_Card]:!bg-white/5 [&_Card]:!border-white/10 [&_Card]:!text-white [&_CardHeader]:!text-white [&_CardTitle]:!text-white [&_CardDescription]:!text-white/80 [&_CardContent]:!text-white/80 [&_CardFooter]:!text-white/80 [&_button]:!bg-white/10 [&_button]:hover:!bg-white/20 [&_button]:!border-white/20 [&_button]:!text-white [&_Button]:!bg-white/10 [&_Button]:hover:!bg-white/20 [&_Button]:!border-white/20 [&_Button]:!text-white [&_input]:!bg-white/5 [&_input]:!border-white/10 [&_input]:!text-white [&_input]:!placeholder:text-white/50 [&_Input]:!bg-white/5 [&_Input]:!border-white/10 [&_Input]:!text-white [&_Badge]:!bg-white/10 [&_Badge]:!text-white [&_Badge]:!border-white/20 [&_Badge.bg-green-100]:!bg-green-500/20 [&_Badge.text-green-800]:!text-green-300 [&_Badge.bg-red-100]:!bg-red-500/20 [&_Badge.text-red-800]:!text-red-300 [&_Avatar]:!border-white/20 [&_Skeleton]:!bg-white/10 [&_.bg-muted]:!bg-white/5 [&_.bg-card]:!bg-white/5 [&_.text-muted-foreground]:!text-white/60 [&_.border]:!border-white/10 [&_.text-green-600]:!text-green-300 [&_.text-red-600]:!text-red-300 [&_TabsList]:!bg-white/5 [&_TabsTrigger]:!text-white/80 [&_TabsTrigger[data-state=active]]:!text-white [&_TabsTrigger[data-state=active]]:!bg-white/10 [&_TabsContent]:!text-white/80">
                  <ExpenseSplitting trekId={id} fixedCosts={costs || []} />
                </div>
              </TabsContent>

              <TabsContent value="chat" className="mt-6 text-white/80">
                <div className="rounded-xl border border-white/20 bg-white/10 backdrop-blur-xl p-4 sm:p-6 [&_*]:!text-white/90 [&_*]:!text-white [&_h1]:!text-white [&_h2]:!text-white [&_h3]:!text-white [&_h4]:!text-white [&_h5]:!text-white [&_h6]:!text-white [&_p]:!text-white/80 [&_span]:!text-white/80 [&_li]:!text-white/80 [&_label]:!text-white/80 [&_label]:!font-medium [&_textarea]:!bg-white/5 [&_textarea]:!border-white/10 [&_textarea]:!text-white [&_textarea]:!placeholder:text-white/50 [&_Textarea]:!bg-white/5 [&_Textarea]:!border-white/10 [&_Textarea]:!text-white [&_button]:!bg-white/10 [&_button]:hover:!bg-white/20 [&_button]:!border-white/20 [&_button]:!text-white [&_Button]:!bg-white/10 [&_Button]:hover:!bg-white/20 [&_Button]:!border-white/20 [&_Button]:!text-white [&_Avatar]:!border-white/20 [&_AvatarFallback]:!bg-white/10 [&_AvatarFallback]:!text-white [&_AvatarImage]:!border-white/20 [&_Badge]:!bg-white/10 [&_Badge]:!text-white [&_Badge]:!border-white/20 [&_PopoverContent]:!bg-white/10 [&_PopoverContent]:!backdrop-blur-xl [&_PopoverContent]:!border-white/20 [&_PopoverContent]:!text-white [&_Separator]:!bg-white/20 [&_.bg-muted]:!bg-white/5 [&_.bg-card]:!bg-white/5 [&_.text-muted-foreground]:!text-white/60 [&_.border]:!border-white/10">
                  <TrekDiscussion
                    trekId={id || ""}
                    comments={comments || []}
                    onAddComment={addComment}
                    isLoading={commentsLoading}
                  />
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
