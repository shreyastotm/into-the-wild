import { AnimatePresence, motion } from "framer-motion";
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
import React, { useEffect, useState } from "react";

import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface EventCard {
  id: number;
  title: string;
  location: string;
  date: string;
  difficulty: "easy" | "moderate" | "hard";
  participants: number;
  maxParticipants: number;
  cost: number;
  duration: string;
  images: string[];
  tags: string[];
}

const EventCardsPreview: React.FC = () => {
  const [currentImageIndices, setCurrentImageIndices] = useState<{
    [key: number]: number;
  }>({});
  const [dbEvents, setDbEvents] = useState<EventCard[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch real events from database
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        // Fetch Karnataka/Bangalore events or camping/jam_yard events
        const { data: events, error } = await supabase
          .from("trek_events")
          .select("trek_id, name, location, event_type, start_datetime, duration, difficulty, max_participants, image_url")
          .or("location.ilike.%Karnataka%,location.ilike.%Bengaluru%,location.ilike.%Bangalore%,event_type.eq.camping,event_type.eq.jam_yard")
          .gt("start_datetime", new Date().toISOString())
          .order("start_datetime", { ascending: true })
          .limit(3);

        if (error) {
          console.warn("Error fetching events:", error);
          setLoading(false);
          return;
        }

        if (events && events.length > 0) {
          const trekIds = events.map((e) => e.trek_id);

          // Fetch images for these events
          const { data: images } = await supabase
            .from("trek_event_images")
            .select("trek_id, image_url, position")
            .in("trek_id", trekIds)
            .order("position", { ascending: true });

          // Group images by trek_id
          const imagesByTrek: Record<number, string[]> = {};
          (images || []).forEach((img) => {
            if (!imagesByTrek[img.trek_id]) {
              imagesByTrek[img.trek_id] = [];
            }
            imagesByTrek[img.trek_id].push(img.image_url);
          });

          // Transform to EventCard format
          const transformedEvents: EventCard[] = events.map((event, index) => {
            const eventImages = imagesByTrek[event.trek_id] || [];
            // Use first image from database, fallback to event.image_url, then mock images
            const primaryImage = eventImages[0] || event.image_url;
            const allImages = primaryImage
              ? [primaryImage, ...eventImages.slice(1)]
              : [
                  "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&q=80",
                  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80",
                  "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400&q=80",
                ];

            return {
              id: event.trek_id,
              title: event.name || "Adventure Trek",
              location: event.location || "Karnataka",
              date: new Date(event.start_datetime).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              }),
              difficulty: (event.difficulty?.toLowerCase() as "easy" | "moderate" | "hard") || "moderate",
              participants: Math.floor((event.max_participants || 20) * 0.6),
              maxParticipants: event.max_participants || 20,
              cost: 0,
              duration: event.duration ? `${event.duration}` : "2 Days",
              images: allImages,
              tags: event.event_type === "camping" 
                ? ["Camping", "Adventure", "Community"]
                : event.event_type === "jam_yard"
                ? ["Workshop", "Skill", "Community"]
                : event.location?.toLowerCase().includes("coorg")
                ? ["Coffee", "Misty Hills", "Western Ghats"]
                : event.location?.toLowerCase().includes("gokarna")
                ? ["Beach", "Camping", "Sunset"]
                : ["Western Ghats", "Nature", "Friends"],
            };
          });

          if (transformedEvents.length > 0) {
            setDbEvents(transformedEvents);
          }
        }
      } catch (error) {
        console.warn("Error in fetchEvents:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const mockEvents: EventCard[] = [
    {
      id: 1,
      title: "Kudremukh Peak Trek",
      location: "Kudremukh, Karnataka",
      date: "15 Feb 2025",
      difficulty: "moderate",
      participants: 12,
      maxParticipants: 20,
      cost: 2500,
      duration: "2 Days",
      images: [
        "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&q=80",
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80",
        "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400&q=80",
      ],
      tags: ["Western Ghats", "Rolling Hills", "Nature"],
    },
    {
      id: 2,
      title: "Coastal Adventure Gokarna",
      location: "Gokarna, Karnataka",
      date: "22 Feb 2025",
      difficulty: "easy",
      participants: 8,
      maxParticipants: 15,
      cost: 2800,
      duration: "2 Days",
      images: [
        "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&q=80",
        "https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?w=400&q=80",
        "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&q=80",
      ],
      tags: ["Beach", "Camping", "Sunset"],
    },
    {
      id: 3,
      title: "Coorg Coffee Plantation Trek",
      location: "Coorg, Karnataka",
      date: "05 Mar 2025",
      difficulty: "moderate",
      participants: 10,
      maxParticipants: 18,
      cost: 3200,
      duration: "2 Days",
      images: [
        "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=400&q=80",
        "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400&q=80",
        "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&q=80",
      ],
      tags: ["Coffee", "Misty Hills", "Plantation"],
    },
  ];

  // Use real events if available, otherwise use mock events
  const displayEvents = dbEvents.length > 0 ? dbEvents : mockEvents;

  // Auto-rotate images for each card
  useEffect(() => {
    const intervals: { [key: number]: NodeJS.Timeout } = {};

    displayEvents.forEach((event) => {
      intervals[event.id] = setInterval(
        () => {
          setCurrentImageIndices((prev) => ({
            ...prev,
            [event.id]: ((prev[event.id] || 0) + 1) % event.images.length,
          }));
        },
        3000 + event.id * 500,
      ); // Stagger the rotations
    });

    return () => {
      Object.values(intervals).forEach(clearInterval);
    };
  }, [displayEvents]);

  const getDifficultyConfig = (difficulty: string) => {
    switch (difficulty) {
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
      default:
        return { icon: Mountain, color: "text-gray-400", bg: "bg-gray-500/20" };
    }
  };

  return (
    <div className="relative">
      {/* Cards Container */}
      <div className="grid grid-cols-1 gap-6">
        {displayEvents.map((event, index) => {
          const difficultyConfig = getDifficultyConfig(event.difficulty);
          const DifficultyIcon = difficultyConfig.icon;
          const currentImageIndex = currentImageIndices[event.id] || 0;
          const spotsLeft = event.maxParticipants - event.participants;

          return (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              className="group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden hover:bg-white/10 transition-all duration-300 hover:scale-[1.02] anime-sketch-card sketchy-border"
            >
              {/* Glass surface reflection */}
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-300">
                <div className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-b from-white/10 to-transparent rounded-t-2xl" />
              </div>

              <div className="flex flex-col sm:flex-row">
                {/* Image Section */}
                <div className="relative w-full sm:w-48 h-48 sm:h-auto overflow-hidden">
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={currentImageIndex}
                      src={event.images[currentImageIndex]}
                      alt={event.title}
                      className="w-full h-full object-cover"
                      initial={{ opacity: 0, scale: 1.1 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.5 }}
                    />
                  </AnimatePresence>

                  {/* Image indicators */}
                  {event.images.length > 1 && (
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                      {event.images.map((_, imgIndex) => (
                        <div
                          key={imgIndex}
                          className={cn(
                            "w-1.5 h-1.5 rounded-full transition-all duration-300",
                            imgIndex === currentImageIndex
                              ? "bg-white shadow-lg"
                              : "bg-white/40",
                          )}
                        />
                      ))}
                    </div>
                  )}

                  {/* Difficulty Badge */}
                  <div className="absolute top-2 left-2">
                    <div
                      className={cn(
                        "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm border border-white/20",
                        difficultyConfig.bg,
                        difficultyConfig.color,
                      )}
                    >
                      <DifficultyIcon className="w-3 h-3" />
                      {event.difficulty}
                    </div>
                  </div>

                  {/* Spots Left Badge */}
                  <div className="absolute top-2 right-2">
                    <div className="px-2 py-1 bg-black/40 backdrop-blur-sm rounded-full text-xs text-white border border-white/20">
                      {spotsLeft} spots left
                    </div>
                  </div>
                </div>

                {/* Content Section */}
                <div className="flex-1 p-4 space-y-3">
                  {/* Title */}
                  <h3 className="font-semibold text-white text-lg line-clamp-1 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-orange-400 transition-all duration-300">
                    {event.title}
                  </h3>

                  {/* Location & Date */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-white/80">
                      <div className="w-5 h-5 rounded bg-orange-500/20 flex items-center justify-center">
                        <MapPin className="w-3 h-3 text-orange-400" />
                      </div>
                      <span className="truncate">{event.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-white/80">
                      <div className="w-5 h-5 rounded bg-blue-500/20 flex items-center justify-center">
                        <Calendar className="w-3 h-3 text-blue-400" />
                      </div>
                      <span>{event.date}</span>
                    </div>
                  </div>

                  {/* Stats Row */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1 text-white/70">
                        <Users className="w-4 h-4 text-green-400" />
                        <span>
                          {event.participants}/{event.maxParticipants} friends
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-white/70">
                        <Clock className="w-4 h-4 text-purple-400" />
                        <span>{event.duration}</span>
                      </div>
                    </div>
                    {/* Cost removed for preview/fabricated content */}
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1">
                    {event.tags.slice(0, 3).map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className="px-2 py-1 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-xs text-white/80"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Hover glow effect */}
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/10 via-transparent to-orange-500/10" />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Floating decoration */}
      <motion.div
        animate={{
          rotate: [0, 360],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-r from-purple-400 to-orange-400 rounded-full opacity-20"
      />
    </div>
  );
};

export default EventCardsPreview;
