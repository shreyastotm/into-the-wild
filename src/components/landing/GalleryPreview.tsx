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

  const mockGalleryItems: GalleryItem[] = [
    {
      id: 1,
      image:
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80",
      title: "Golden Hour at Rajmachi",
      location: "Lonavala, Maharashtra",
      date: "12 Feb 2025",
      photographer: "Adventure Seeker",
      likes: 124,
      views: 892,
      tags: ["Sunrise", "Mountain", "Heritage"],
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
        "https://images.unsplash.com/photo-1574263867128-a3d5c1b1deac?w=600&q=80",
      title: "Waterfall Wonder",
      location: "Western Ghats",
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
        "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&q=80",
      title: "Misty Forest Trail",
      location: "Coorg, Karnataka",
      date: "02 Feb 2025",
      photographer: "Mountain Explorer",
      likes: 98,
      views: 743,
      tags: ["Forest", "Mist", "Wildlife"],
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

  return (
    <div className="relative">
      {/* Gallery Grid */}
      <div className="grid grid-cols-2 gap-3">
        {mockGalleryItems.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="group relative aspect-square bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-all duration-300"
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
                const item = mockGalleryItems.find(
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
