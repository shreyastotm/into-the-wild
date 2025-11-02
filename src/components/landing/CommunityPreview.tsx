import { AnimatePresence, motion } from "framer-motion";
import {
  Calendar,
  Camera,
  Compass,
  Heart,
  MapPin,
  MessageCircle,
  MoreHorizontal,
  Mountain,
  Send,
  Star,
  TreePine,
  Trophy,
  Users,
} from "lucide-react";
import React, { useEffect, useState } from "react";

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

const CommunityPreview: React.FC = () => {
  const [activeCommunity, setActiveCommunity] = useState(0);
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set());

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
  ];

  // Auto-cycle through communities
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveCommunity((prev) => (prev + 1) % communities.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

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

  return (
    <div className="relative space-y-6">
      {/* Community Tabs */}
      <div className="flex gap-2 overflow-x-auto scrollbar-none">
        {communities.map((community, index) => (
          <motion.button
            key={community.id}
            onClick={() => setActiveCommunity(index)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap",
              activeCommunity === index
                ? "bg-white/20 backdrop-blur-sm border border-white/30 text-white"
                : "bg-white/5 backdrop-blur-sm border border-white/10 text-white/70 hover:bg-white/10",
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
          className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "w-12 h-12 rounded-xl bg-gradient-to-r flex items-center justify-center text-2xl",
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

      {/* Community Feed */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-white flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-teal-400" />
          Recent Activity
        </h4>

        <div className="space-y-3 max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
          {communityPosts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all duration-300"
            >
              {/* Post Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <img
                    src={post.avatar}
                    alt={post.author}
                    className="w-8 h-8 rounded-full border border-white/20"
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
                            `bg-gradient-to-r ${post.badge.color}`,
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
              <p className="text-white/90 text-sm mb-3 leading-relaxed">
                {post.content}
              </p>

              {/* Post Image */}
              {post.image && (
                <div className="mb-3 rounded-lg overflow-hidden">
                  <img
                    src={post.image}
                    alt="Post content"
                    className="w-full h-32 object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}

              {/* Post Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleLike(post.id)}
                    className="flex items-center gap-1 text-sm text-white/70 hover:text-red-400 transition-colors"
                  >
                    <Heart
                      className={cn(
                        "w-4 h-4 transition-colors",
                        likedPosts.has(post.id)
                          ? "text-red-400 fill-red-400"
                          : "text-white/60",
                      )}
                    />
                    <span>
                      {post.likes + (likedPosts.has(post.id) ? 1 : 0)}
                    </span>
                  </button>
                  <button className="flex items-center gap-1 text-sm text-white/70 hover:text-blue-400 transition-colors">
                    <MessageCircle className="w-4 h-4" />
                    <span>{post.comments}</span>
                  </button>
                </div>
                <button className="text-white/40 hover:text-white/60 transition-colors">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Join Community CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-center p-4 bg-gradient-to-r from-teal-500/10 to-green-500/10 backdrop-blur-sm border border-teal-400/20 rounded-xl"
      >
        <h4 className="font-semibold text-white mb-2">
          Ready to Join the Adventure?
        </h4>
        <p className="text-sm text-white/80 mb-4">
          Connect with like-minded adventurers and share your journey
        </p>
        <button className="px-6 py-2 bg-gradient-to-r from-teal-500 to-green-500 rounded-full text-white font-medium hover:scale-105 transition-transform">
          Join Communities
        </button>
      </motion.div>

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
        className="absolute -top-4 -right-4 w-6 h-6 bg-gradient-to-r from-teal-400 to-green-400 rounded-full opacity-30"
      />
    </div>
  );
};

export default CommunityPreview;
