import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  Calendar,
  Camera,
  Compass,
  Filter,
  Heart,
  MapPin,
  MessageCircle,
  MoreHorizontal,
  Mountain,
  Search,
  Send,
  Star,
  TreePine,
  TrendingUp,
  Trophy,
  Users,
} from "lucide-react";
import React, { useEffect, useState } from "react";

import { useAuth } from "@/components/auth/AuthProvider";
import { MobilePage, MobileSection } from "@/components/mobile/MobilePage";
import { OrigamiHamburger } from "@/components/navigation/OrigamiHamburger";
import { cn } from "@/lib/utils";

interface Community {
  id: number;
  name: string;
  description: string;
  members: number;
  specialty: string;
  avatar: string;
  color: string;
  isActive: boolean;
  recentActivity: string;
}

interface CommunityPost {
  id: number;
  author: string;
  avatar: string;
  content: string;
  timestamp: string;
  likes: number;
  comments: number;
  image?: string;
  badge?: {
    icon: React.ElementType;
    label: string;
    color: string;
  };
}

export default function Community() {
  const { user } = useAuth();
  const [activeCommunity, setActiveCommunity] = useState(0);
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");

  const communities: Community[] = [
    {
      id: 1,
      name: "Peak Seekers",
      description: "High-altitude adventures and mountain conquests",
      members: 2400,
      specialty: "Mountain Climbing",
      avatar: "🏔️",
      color: "from-blue-400 to-purple-500",
      isActive: true,
      recentActivity: "New trek to Kedarkantha announced!",
    },
    {
      id: 2,
      name: "Wildlife Watchers",
      description: "Nature photography and wildlife safaris",
      members: 1800,
      specialty: "Photography",
      avatar: "📸",
      color: "from-green-400 to-teal-500",
      isActive: true,
      recentActivity: "Tiger spotted in Ranthambore!",
    },
    {
      id: 3,
      name: "Trail Runners",
      description: "Running adventures and trail marathons",
      members: 3100,
      specialty: "Trail Running",
      avatar: "🏃",
      color: "from-orange-400 to-red-500",
      isActive: false,
      recentActivity: "Ultra marathon registration open",
    },
    {
      id: 4,
      name: "Sunrise Trekkers",
      description: "Early morning treks and golden hour photography",
      members: 1500,
      specialty: "Photography",
      avatar: "🌅",
      color: "from-yellow-400 to-orange-500",
      isActive: true,
      recentActivity: "New sunrise trek locations shared!",
    },
  ];

  const communityPosts: CommunityPost[] = [
    {
      id: 1,
      author: "Adventure Seeker",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
      content:
        "Just completed the sunrise trek to Rajmachi! The golden hour views were absolutely breathtaking. Can't wait for the next adventure! 🌅",
      timestamp: "2 hours ago",
      likes: 24,
      comments: 8,
      image:
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80",
      badge: {
        icon: Trophy,
        label: "Peak Conqueror",
        color: "from-yellow-400 to-orange-500",
      },
    },
    {
      id: 2,
      author: "Nature Lover",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg",
      content:
        "Spotted this beautiful Malabar Giant Squirrel during our Western Ghats expedition. Nature never fails to amaze! 🐿️",
      timestamp: "5 hours ago",
      likes: 18,
      comments: 5,
      badge: {
        icon: Camera,
        label: "Wildlife Expert",
        color: "from-green-400 to-teal-500",
      },
    },
    {
      id: 3,
      author: "Trail Blazer",
      avatar: "https://randomuser.me/api/portraits/men/55.jpg",
      content:
        "Who's joining the night trek to Harishchandragad this weekend? The full moon will make it extra special! 🌕",
      timestamp: "1 day ago",
      likes: 31,
      comments: 12,
      badge: {
        icon: Compass,
        label: "Trail Master",
        color: "from-purple-400 to-pink-500",
      },
    },
    {
      id: 4,
      author: "Mountain Explorer",
      avatar: "https://randomuser.me/api/portraits/women/28.jpg",
      content:
        "Just finished the 7-day trek to Valley of Flowers. The wildflowers were in full bloom! Absolutely magical experience. 💐",
      timestamp: "2 days ago",
      likes: 45,
      comments: 15,
      image:
        "https://images.unsplash.com/photo-1464822759844-d150ad3bfc1d?w=400&q=80",
      badge: {
        icon: Mountain,
        label: "Nature Guide",
        color: "from-blue-400 to-indigo-500",
      },
    },
  ];

  const handleLike = (postId: number) => {
    setLikedPosts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };

  const filteredPosts = communityPosts.filter(
    (post) =>
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.author.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div
      className={cn(
        "glass-community-theme min-h-screen relative overflow-hidden",
        "bg-gradient-to-br from-teal-900/20 via-green-900/15 to-cyan-900/10",
        "scrollbar-nature",
      )}
    >
      <OrigamiHamburger />
      <MobilePage>
        <MobileSection className="relative z-10 space-y-6 pb-20">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={cn(
              "p-4 rounded-3xl",
              "bg-white/8 dark:bg-gray-900/8",
              "backdrop-blur-xl backdrop-saturate-150",
              "border border-teal-400/30 dark:border-teal-400/20",
              "ring-0 ring-teal-400/0",
              "hover:ring-2 hover:ring-teal-400/40 hover:ring-offset-2 hover:ring-offset-teal-100/20",
              "shadow-lg shadow-black/5",
            )}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-white/95 mb-1">
                  Community
                </h1>
                <p className="text-white/70 text-sm">
                  Connect with fellow adventurers
                </p>
              </div>
              <div
                className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center",
                  "bg-gradient-to-br from-teal-400/20 to-green-400/20",
                  "border border-teal-400/30",
                  "backdrop-blur-sm",
                )}
              >
                <Users className="w-6 h-6 text-teal-300" />
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60" />
              <input
                type="text"
                placeholder="Search posts, people..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={cn(
                  "w-full pl-10 pr-4 py-2 rounded-xl",
                  "bg-white/5 backdrop-blur-sm",
                  "border border-teal-400/20",
                  "text-white placeholder:text-white/50",
                  "focus:outline-none focus:ring-2 focus:ring-teal-400/40",
                  "transition-all duration-300",
                )}
              />
            </div>
          </motion.div>

          {/* Community Tabs */}
          <div className="flex gap-2 overflow-x-auto scrollbar-none pb-2">
            {communities.map((community, index) => (
              <motion.button
                key={community.id}
                onClick={() => setActiveCommunity(index)}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap",
                  "backdrop-blur-sm border",
                  activeCommunity === index
                    ? cn(
                        "bg-white/20 border-teal-400/40 text-white",
                        "ring-2 ring-teal-400/60 ring-offset-2 ring-offset-teal-400/20",
                        "shadow-lg shadow-teal-500/20",
                      )
                    : "bg-white/8 border-teal-400/20 text-white/70 hover:bg-white/12",
                )}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="text-lg">{community.avatar}</span>
                <span>{community.name}</span>
                <div className="flex items-center gap-1 text-xs">
                  <Users className="w-3 h-3" />
                  <span>{(community.members / 1000).toFixed(1)}k</span>
                </div>
                {community.isActive && (
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                )}
              </motion.button>
            ))}
          </div>

          {/* Active Community Info */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCommunity}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className={cn(
                "p-4 rounded-3xl",
                "bg-white/8 dark:bg-gray-900/8",
                "backdrop-blur-xl backdrop-saturate-150",
                "border border-teal-400/30 dark:border-teal-400/20",
                "ring-0 ring-teal-400/0",
                "hover:ring-2 hover:ring-teal-400/40 hover:ring-offset-2 hover:ring-offset-teal-100/20",
                "shadow-lg shadow-black/5 hover:shadow-2xl hover:shadow-teal-500/20",
                "transition-all duration-500 ease-out",
              )}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "w-12 h-12 rounded-xl bg-gradient-to-r flex items-center justify-center text-2xl",
                      "border border-teal-400/30",
                      communities[activeCommunity].color,
                    )}
                  >
                    {communities[activeCommunity].avatar}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">
                      {communities[activeCommunity].name}
                    </h3>
                    <p className="text-sm text-white/70">
                      {communities[activeCommunity].description}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-green-400">
                    {(communities[activeCommunity].members / 1000).toFixed(1)}k
                  </div>
                  <div className="text-xs text-white/60">members</div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-white/80">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span>{communities[activeCommunity].recentActivity}</span>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Community Feed Header */}
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold text-white flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-teal-400" />
              Recent Activity
            </h4>
            <button
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium",
                "bg-white/10 hover:bg-white/15",
                "border border-teal-400/20",
                "text-white/80 hover:text-white",
                "backdrop-blur-sm",
                "transition-all duration-300",
                "flex items-center gap-1.5",
              )}
            >
              <Filter className="w-3 h-3" />
              Filter
            </button>
          </div>

          {/* Community Feed */}
          <div className="space-y-4">
            {filteredPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className={cn(
                  "group relative overflow-hidden",
                  "bg-white/8 dark:bg-gray-900/8",
                  "backdrop-blur-xl backdrop-saturate-150",
                  "border border-teal-400/30 dark:border-teal-400/20",
                  "rounded-3xl",
                  "ring-0 ring-teal-400/0 ring-offset-0",
                  "hover:ring-2 hover:ring-teal-400/60 hover:ring-offset-2 hover:ring-offset-teal-100/20",
                  "shadow-lg shadow-black/5 hover:shadow-2xl hover:shadow-teal-500/20",
                  "transition-all duration-500 ease-out",
                  "hover:scale-[1.01]",
                  "p-4",
                  // Glass Surface Texture
                  "before:absolute before:inset-0 before:rounded-3xl",
                  "before:bg-gradient-to-br before:from-white/20 before:via-transparent before:to-transparent",
                  "before:opacity-0 group-hover:before:opacity-100 before:transition-opacity before:duration-300",
                )}
              >
                {/* Dew Drop Reflection Effect */}
                <div
                  className={cn(
                    "absolute top-4 left-4 w-3 h-3 rounded-full",
                    "bg-gradient-to-br from-white/60 to-white/20",
                    "backdrop-blur-sm",
                    "shadow-lg shadow-white/20",
                    "opacity-0 group-hover:opacity-100 transition-opacity duration-500",
                  )}
                />

                {/* Enhanced animated glow effect */}
                <motion.div
                  className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(8, 145, 178, 0.15), rgba(34, 197, 94, 0.08))",
                    filter: "blur(25px)",
                    transform: "scale(1.15)",
                  }}
                />

                {/* Post Header */}
                <div className="flex items-center justify-between mb-3 relative z-10">
                  <div className="flex items-center gap-3">
                    <img
                      src={post.avatar}
                      alt={post.author}
                      className="w-10 h-10 rounded-full border-2 border-teal-400/30 ring-2 ring-teal-400/10"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white text-sm">
                          {post.author}
                        </span>
                        {post.badge && (
                          <div
                            className={cn(
                              "flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium text-white",
                              "bg-gradient-to-r backdrop-blur-sm border border-white/20",
                              post.badge.color,
                            )}
                          >
                            <post.badge.icon className="w-3 h-3" />
                            {post.badge.label}
                          </div>
                        )}
                      </div>
                      <span className="text-xs text-white/60">
                        {post.timestamp}
                      </span>
                    </div>
                  </div>
                  <button className="text-white/40 hover:text-white/60 transition-colors">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>

                {/* Post Content */}
                <p className="text-white/90 text-sm mb-3 leading-relaxed relative z-10">
                  {post.content}
                </p>

                {/* Post Image */}
                {post.image && (
                  <div className="mb-3 rounded-xl overflow-hidden relative z-10 border border-teal-400/20">
                    <img
                      src={post.image}
                      alt="Post content"
                      className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}

                {/* Post Actions */}
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleLike(post.id)}
                      className={cn(
                        "flex items-center gap-1.5 text-sm transition-all duration-300",
                        likedPosts.has(post.id)
                          ? "text-red-400"
                          : "text-white/70 hover:text-teal-300",
                      )}
                    >
                      <Heart
                        className={cn(
                          "w-4 h-4 transition-all duration-300",
                          likedPosts.has(post.id)
                            ? "fill-red-400 text-red-400 scale-110"
                            : "",
                        )}
                      />
                      <span>
                        {post.likes + (likedPosts.has(post.id) ? 1 : 0)}
                      </span>
                    </button>
                    <button className="flex items-center gap-1.5 text-sm text-white/70 hover:text-teal-300 transition-colors">
                      <MessageCircle className="w-4 h-4" />
                      <span>{post.comments}</span>
                    </button>
                  </div>
                  <button className="text-white/40 hover:text-teal-300 transition-colors">
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Join Community CTA */}
          {!user && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className={cn(
                "text-center p-6 rounded-3xl",
                "bg-gradient-to-r from-teal-500/10 to-green-500/10",
                "backdrop-blur-xl border border-teal-400/30",
                "ring-2 ring-teal-400/20",
              )}
            >
              <h4 className="font-semibold text-white mb-2">
                Ready to Join the Adventure?
              </h4>
              <p className="text-sm text-white/80 mb-4">
                Connect with like-minded adventurers and share your journey
              </p>
              <button
                className={cn(
                  "px-6 py-2.5 rounded-full text-white font-medium",
                  "bg-gradient-to-r from-teal-500 to-green-500",
                  "hover:from-teal-600 hover:to-green-600",
                  "shadow-lg shadow-teal-500/30",
                  "transition-all duration-300",
                  "hover:scale-105",
                )}
              >
                Join Communities
              </button>
            </motion.div>
          )}

          {/* Floating decoration */}
          <motion.div
            animate={{
              rotate: [0, 360],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "linear",
            }}
            className="fixed top-20 right-4 w-6 h-6 bg-gradient-to-r from-teal-400 to-green-400 rounded-full opacity-30 pointer-events-none z-0"
          />
        </MobileSection>
      </MobilePage>
    </div>
  );
}
