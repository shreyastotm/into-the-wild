import { AnimatePresence, motion } from "framer-motion";
import {
  Calendar,
  Camera,
  Compass,
  Eye,
  Heart,
  MapPin,
  Star,
  Trophy,
  Users,
} from "lucide-react";
import React, { useEffect, useState } from "react";

import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface GalleryItem {
  id: number;
  image: string;
  title: string;
  location: string;
  date: string;
  photographer: string;
  likes: number;
  views: number;
  tags: string[];
  achievement?: {
    icon: React.ElementType;
    label: string;
    color: string;
  };
}

const GalleryPreview: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [likedImages, setLikedImages] = useState<Set<number>>(new Set());
  const [dbGalleryItems, setDbGalleryItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch real gallery items from database
  useEffect(() => {
    const fetchGalleryItems = async () => {
      try {
        // Fetch completed/past trek events from Karnataka/Bangalore
        const { data: events, error } = await supabase
          .from("trek_events")
          .select("trek_id, name, location, start_datetime, image_url")
          .lt("start_datetime", new Date().toISOString())
          .or(
            "location.ilike.%Karnataka%,location.ilike.%Bengaluru%,location.ilike.%Bangalore%",
          )
          .order("start_datetime", { ascending: false })
          .limit(4);

        if (error) {
          console.warn("Error fetching gallery events:", error);
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

          // Group images by trek_id, get first image per trek
          const firstImageByTrek: Record<number, string> = {};
          (images || []).forEach((img) => {
            if (!firstImageByTrek[img.trek_id]) {
              firstImageByTrek[img.trek_id] = img.image_url;
            }
          });

          // Transform to GalleryItem format
          const transformedItems: GalleryItem[] = events.map((event, index) => {
            const galleryImage =
              firstImageByTrek[event.trek_id] || event.image_url;
            const locationParts = (event.location || "Karnataka").split(",");
            const shortLocation = locationParts[0] || "Karnataka";

            return {
              id: event.trek_id,
              image:
                galleryImage ||
                "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&q=80",
              title: event.name || "Adventure Memory",
              location: event.location || "Karnataka",
              date: new Date(event.start_datetime).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              }),
              photographer: "Adventure Friend",
              likes: Math.floor(Math.random() * 200) + 50,
              views: Math.floor(Math.random() * 1500) + 500,
              tags: shortLocation.toLowerCase().includes("coorg")
                ? ["Coffee", "Misty Hills", "Friends"]
                : shortLocation.toLowerCase().includes("gokarna")
                  ? ["Beach", "Sunset", "Camping"]
                  : shortLocation.toLowerCase().includes("nandi")
                    ? ["Sunrise", "Day Trek", "Friends"]
                    : ["Nature", "Adventure", "Friends"],
              achievement:
                index === 0
                  ? {
                      icon: Trophy,
                      label: "Peak Conqueror",
                      color: "from-yellow-400 to-orange-500",
                    }
                  : index === 1
                    ? {
                        icon: Star,
                        label: "Nature Photographer",
                        color: "from-purple-400 to-pink-500",
                      }
                    : index === 2
                      ? {
                          icon: Compass,
                          label: "Trail Blazer",
                          color: "from-green-400 to-teal-500",
                        }
                      : undefined,
            };
          });

          if (transformedItems.length > 0) {
            setDbGalleryItems(transformedItems);
          }
        }
      } catch (error) {
        console.warn("Error in fetchGalleryItems:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGalleryItems();
  }, []);

  const mockGalleryItems: GalleryItem[] = [
    {
      id: 1,
      image:
        "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&q=80",
      title: "Sunrise at Nandi Hills",
      location: "Nandi Hills, Karnataka",
      date: "12 Feb 2025",
      photographer: "Adventure Seeker",
      likes: 124,
      views: 892,
      tags: ["Sunrise", "Day Trek", "Friends"],
      achievement: {
        icon: Trophy,
        label: "Peak Conqueror",
        color: "from-yellow-400 to-orange-500",
      },
    },
    {
      id: 2,
      image:
        "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600&q=80",
      title: "Coastal Paradise",
      location: "Gokarna, Karnataka",
      date: "08 Feb 2025",
      photographer: "Nature Lover",
      likes: 89,
      views: 654,
      tags: ["Beach", "Sunset", "Camping"],
      achievement: {
        icon: Star,
        label: "Nature Photographer",
        color: "from-purple-400 to-pink-500",
      },
    },
    {
      id: 3,
      image:
        "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=600&q=80",
      title: "Waterfall Wonder",
      location: "Jog Falls, Karnataka",
      date: "05 Feb 2025",
      photographer: "Trail Blazer",
      likes: 156,
      views: 1203,
      tags: ["Waterfall", "Forest", "Monsoon"],
      achievement: {
        icon: Compass,
        label: "Trail Blazer",
        color: "from-green-400 to-teal-500",
      },
    },
    {
      id: 4,
      image:
        "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600&q=80",
      title: "Misty Forest Trail",
      location: "Coorg, Karnataka",
      date: "02 Feb 2025",
      photographer: "Mountain Explorer",
      likes: 98,
      views: 743,
      tags: ["Forest", "Mist", "Coffee"],
    },
  ];

  const handleLike = (id: number) => {
    setLikedImages((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // Use real gallery items if available, otherwise use mock items
  const displayGalleryItems =
    dbGalleryItems.length > 0 ? dbGalleryItems : mockGalleryItems;

  return (
    <div className="relative">
      {/* Gallery Grid */}
      <div className="grid grid-cols-2 gap-3">
        {displayGalleryItems.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="group relative aspect-square bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-all duration-300 anime-sketch-card anime-motion-blur"
            onClick={() => setSelectedImage(item.id)}
          >
            {/* Image */}
            <img
              src={item.image}
              alt={item.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Achievement Badge */}
            {item.achievement && (
              <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div
                  className={cn(
                    "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-white backdrop-blur-sm border border-white/20",
                    `bg-gradient-to-r ${item.achievement.color}`,
                  )}
                >
                  <item.achievement.icon className="w-3 h-3" />
                  {item.achievement.label}
                </div>
              </div>
            )}

            {/* Stats overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <h4 className="font-semibold text-white text-sm mb-1 line-clamp-1">
                {item.title}
              </h4>
              <div className="flex items-center justify-between text-xs text-white/80">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Heart
                      className={cn(
                        "w-3 h-3 cursor-pointer transition-colors",
                        likedImages.has(item.id)
                          ? "text-red-400 fill-red-400"
                          : "text-white/60",
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLike(item.id);
                      }}
                    />
                    <span>
                      {item.likes + (likedImages.has(item.id) ? 1 : 0)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="w-3 h-3 text-white/60" />
                    <span>{item.views}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-orange-400" />
                  <span className="truncate max-w-16">
                    {item.location.split(",")[0]}
                  </span>
                </div>
              </div>
            </div>

            {/* Hover glow */}
            <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-orange-500/20 via-transparent to-purple-500/20" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Floating camera icon */}
      <motion.div
        animate={{
          y: [0, -10, 0],
          rotate: [0, 5, -5, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -top-6 -left-6 w-12 h-12 bg-gradient-to-r from-orange-400 to-pink-500 rounded-full flex items-center justify-center shadow-lg"
      >
        <Camera className="w-6 h-6 text-white" />
      </motion.div>

      {/* Stats summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-6 grid grid-cols-3 gap-4 text-center"
      >
        {[
          { label: "Photos", value: "2.4k+", icon: Camera },
          { label: "Adventurers", value: "500+", icon: Users },
          { label: "Memories", value: "∞", icon: Heart },
        ].map((stat, index) => (
          <div key={index} className="space-y-1">
            <div className="w-8 h-8 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg flex items-center justify-center mx-auto">
              <stat.icon className="w-4 h-4 text-white/80" />
            </div>
            <div className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-purple-400">
              {stat.value}
            </div>
            <div className="text-xs text-white/70">{stat.label}</div>
          </div>
        ))}
      </motion.div>

      {/* Modal for selected image */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative max-w-2xl w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {(() => {
                const item = displayGalleryItems.find(
                  (i) => i.id === selectedImage,
                );
                if (!item) return null;

                return (
                  <>
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-64 object-cover"
                    />
                    <div className="p-4 space-y-3">
                      <h3 className="text-xl font-bold text-white">
                        {item.title}
                      </h3>
                      <div className="flex items-center justify-between text-sm text-white/80">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-orange-400" />
                          <span>{item.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-blue-400" />
                          <span>{item.date}</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {item.tags.map((tag, tagIndex) => (
                          <span
                            key={tagIndex}
                            className="px-2 py-1 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-xs text-white/80"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </>
                );
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GalleryPreview;
