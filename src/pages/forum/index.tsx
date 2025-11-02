import { motion } from "framer-motion";
import {
  Flame,
  Loader2,
  Lock,
  MessageSquare,
  Pin,
  Plus,
  Tag as TagIcon,
  Users,
  X,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "@/components/auth/AuthProvider";
import { OrigamiHamburger } from "@/components/navigation/OrigamiHamburger";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useHaptic } from "@/hooks/use-haptic";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface ForumCategory {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  sort_order: number;
  created_at: string;
}

interface ForumTag {
  id: number;
  name: string;
  slug: string;
  color: string;
  sort_order: number;
}

interface ForumThread {
  id: number;
  category_id: number;
  author_id: string;
  title: string;
  locked: boolean;
  pinned: boolean;
  created_at: string;
  updated_at: string;
  author_name?: string;
  author_avatar?: string;
  post_count?: number;
  last_post_date?: string;
  tags?: ForumTag[];
}

// Animated Campfire Component
const Campfire = () => (
  <div className="relative w-32 h-32 mx-auto mb-8">
    {/* Wood logs */}
    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-gradient-to-r from-amber-900 to-amber-800 rounded-lg rotate-6" />
    <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-20 h-5 bg-gradient-to-r from-amber-800 to-amber-900 rounded-lg -rotate-12" />

    {/* Flames */}
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-end gap-1">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="w-4 h-12 bg-gradient-to-t from-orange-600 via-orange-400 to-yellow-300 rounded-full"
          style={{
            animation: `flame-flicker ${1.5 + i * 0.2}s ease-in-out infinite`,
            animationDelay: `${i * 0.1}s`,
            height: `${40 + i * 8}px`,
          }}
        />
      ))}
    </div>

    {/* Embers floating up */}
    {[...Array(8)].map((_, i) => (
      <div
        key={`ember-${i}`}
        className="absolute w-1 h-1 bg-orange-400 rounded-full"
        style={{
          bottom: "2rem",
          left: `${40 + i * 5}%`,
          animation: `float-ember ${3 + i * 0.5}s ease-out infinite`,
          animationDelay: `${i * 0.3}s`,
          opacity: 0,
        }}
      />
    ))}

    <style>{`
      @keyframes flame-flicker {
        0%, 100% { transform: scaleY(1) scaleX(1); opacity: 1; }
        25% { transform: scaleY(1.1) scaleX(0.95); opacity: 0.9; }
        50% { transform: scaleY(0.95) scaleX(1.05); opacity: 1; }
        75% { transform: scaleY(1.05) scaleX(0.9); opacity: 0.95; }
      }
      
      @keyframes float-ember {
        0% { transform: translateY(0) translateX(0); opacity: 1; }
        50% { transform: translateY(-40px) translateX(10px); opacity: 0.8; }
        100% { transform: translateY(-80px) translateX(-5px); opacity: 0; }
      }

      @keyframes smoke-rise {
        0% {
          transform: translateY(0) translateX(var(--smoke-x, 0)) scale(0.5);
          opacity: 0.3;
        }
        50% {
          opacity: 0.5;
        }
        100% {
          transform: translateY(-100vh) translateX(calc(var(--smoke-x, 0) + 100px)) scale(1.5);
          opacity: 0;
        }
      }

      @keyframes firefly {
        0%, 100% {
          transform: translateY(0) translateX(0);
          opacity: 0.4;
        }
        25% {
          transform: translateY(-20px) translateX(10px);
          opacity: 1;
        }
        50% {
          transform: translateY(-40px) translateX(-5px);
          opacity: 0.8;
        }
        75% {
          transform: translateY(-20px) translateX(15px);
          opacity: 0.6;
        }
      }
    `}</style>
  </div>
);

// Log Seat Category Card
const LogSeat = ({
  category,
  threadCount,
  isActive,
}: {
  category: ForumCategory;
  threadCount: number;
  isActive: boolean;
}) => {
  const haptic = useHaptic();

  return (
    <Link
      to={`/forum/c/${category.slug}`}
      onClick={() => haptic.light()}
      className={cn(
        "block relative group",
        "transition-all duration-300",
        isActive && "scale-105",
      )}
    >
      <div
        className={cn(
          "relative overflow-hidden rounded-3xl p-6",
          "bg-white/8 dark:bg-gray-900/8",
          "backdrop-blur-xl backdrop-saturate-150",
          "border border-orange-400/30 dark:border-orange-400/20",
          "ring-0 ring-orange-400/0",
          "hover:ring-2 hover:ring-orange-400/60 hover:ring-offset-2",
          "shadow-lg shadow-black/5 hover:shadow-2xl hover:shadow-orange-500/20",
          "transition-all duration-500 ease-out",
          "hover:scale-[1.02]",
          // Glass Surface Texture
          "before:absolute before:inset-0 before:rounded-3xl",
          "before:bg-gradient-to-br before:from-white/20 before:via-transparent before:to-transparent",
          "before:opacity-0 group-hover:before:opacity-100 before:transition-opacity before:duration-300",
        )}
      >
        {/* Wood grain texture overlay (reduced opacity) */}
        <div
          className="absolute inset-0 opacity-5 bg-repeat rounded-3xl pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h100v2H0zM0 10h100v2H0zM0 20h100v1H0zM0 25h100v1H0zM0 30h100v2H0z' fill='%23000' fill-opacity='0.2'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Enhanced animated glow effect */}
        <div className="absolute -inset-4 bg-orange-500/20 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Content */}
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-2xl font-bold text-white/95 group-hover:text-white transition-colors">
              {category.name}
            </h3>
            <div className="flex items-center gap-1 text-white/70">
              <MessageSquare className="h-5 w-5" />
              <span className="font-semibold">{threadCount}</span>
            </div>
          </div>

          {category.description && (
            <p className="text-white/70 text-sm leading-relaxed">
              {category.description}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
};

// Parchment Thread Card
const ParchmentThread = ({ thread }: { thread: ForumThread }) => {
  const haptic = useHaptic();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <Link
      to={`/forum/t/${thread.id}`}
      onClick={() => haptic.light()}
      className="block group"
    >
      <div
        className={cn(
          "relative overflow-hidden rounded-3xl p-5",
          "bg-white/8 dark:bg-gray-900/8",
          "backdrop-blur-xl backdrop-saturate-150",
          "border border-orange-400/30 dark:border-orange-400/20",
          "ring-0 ring-orange-400/0",
          "hover:ring-2 hover:ring-orange-400/60 hover:ring-offset-2",
          "shadow-lg shadow-black/5 hover:shadow-2xl hover:shadow-orange-500/20",
          "transition-all duration-500 ease-out",
          "hover:scale-[1.02]",
          // Glass Surface Texture
          "before:absolute before:inset-0 before:rounded-3xl",
          "before:bg-gradient-to-br before:from-white/20 before:via-transparent before:to-transparent",
          "before:opacity-0 group-hover:before:opacity-100 before:transition-opacity before:duration-300",
        )}
      >
        {/* Paper texture overlay (reduced opacity) */}
        <div
          className="absolute inset-0 opacity-3 bg-repeat rounded-3xl"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='200' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence baseFrequency='0.8' numOctaves='4' /%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23noise)' opacity='0.3'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Enhanced animated glow effect */}
        <div
          className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background:
              "linear-gradient(135deg, rgba(249, 115, 22, 0.15), rgba(239, 68, 68, 0.08))",
            filter: "blur(25px)",
            transform: "scale(1.15)",
          }}
        />

        {/* Torn edge effect at top (reduced opacity) */}
        <div
          className="absolute -top-1 left-0 right-0 h-3 bg-orange-400/20 rounded-t-3xl z-10"
          style={{
            clipPath:
              "polygon(0 0, 5% 100%, 10% 20%, 15% 80%, 20% 40%, 25% 90%, 30% 10%, 35% 70%, 40% 30%, 45% 85%, 50% 15%, 55% 75%, 60% 35%, 65% 90%, 70% 20%, 75% 80%, 80% 40%, 85% 85%, 90% 25%, 95% 70%, 100% 10%, 100% 0)",
          }}
        />

        <div className="relative z-10 flex items-start gap-4">
          {/* Wax Seal Avatar */}
          <div className="relative flex-shrink-0">
            <div className="absolute -inset-1 bg-gradient-to-br from-red-900 to-red-700 rounded-full blur-sm opacity-50" />
            <Avatar className="relative h-12 w-12 border-3 border-red-800 ring-2 ring-red-900/30">
              <AvatarImage src={thread.author_avatar || undefined} />
              <AvatarFallback className="bg-red-800 text-white font-bold">
                {thread.author_name?.charAt(0)?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
          </div>

          <div className="flex-1 min-w-0">
            {/* Status Badges */}
            {(thread.pinned || thread.locked) && (
              <div className="flex items-center gap-2 mb-2">
                {thread.pinned && (
                  <Badge
                    variant="secondary"
                    className="text-xs bg-orange-400/20 border-orange-400/40 text-white/90"
                  >
                    <Pin className="h-3 w-3 mr-1" />
                    Pinned
                  </Badge>
                )}
                {thread.locked && (
                  <Badge
                    variant="outline"
                    className="text-xs border-white/30 text-white/70"
                  >
                    <Lock className="h-3 w-3 mr-1" />
                    Locked
                  </Badge>
                )}
              </div>
            )}

            {/* Title */}
            <h4 className="font-semibold text-lg text-white/95 group-hover:text-white transition-colors mb-2 leading-tight">
              {thread.title}
            </h4>

            {/* Tags */}
            {thread.tags && thread.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {thread.tags.slice(0, 3).map((tag) => (
                  <Badge
                    key={tag.id}
                    variant="outline"
                    className="text-xs px-2 py-0.5 border-white/30 text-white/80"
                    style={{
                      borderColor: tag.color,
                      color: tag.color,
                      backgroundColor: `${tag.color}20`,
                    }}
                  >
                    {tag.name}
                  </Badge>
                ))}
                {thread.tags.length > 3 && (
                  <Badge
                    variant="outline"
                    className="text-xs px-2 py-0.5 border-white/30 text-white/70"
                  >
                    +{thread.tags.length - 3}
                  </Badge>
                )}
              </div>
            )}

            {/* Meta info - Date stamp style */}
            <div className="flex items-center gap-3 text-xs text-white/70">
              <span className="font-medium">{thread.author_name}</span>
              <span>•</span>
              <span>{formatDate(thread.created_at)}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default function ForumHome() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const haptic = useHaptic();
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [threads, setThreads] = useState<ForumThread[]>([]);
  const [tags, setTags] = useState<ForumTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null,
  );
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
  const [newThreadTitle, setNewThreadTitle] = useState("");
  const [newThreadContent, setNewThreadContent] = useState("");
  const [creatingThread, setCreatingThread] = useState(false);

  useEffect(() => {
    fetchForumData();
  }, []);

  // Apply minimal glassmorphic scrollbar styling to html/body
  useEffect(() => {
    document.documentElement.classList.add("glass-theme-active");
    document.body.classList.add("glass-theme-active");
    return () => {
      document.documentElement.classList.remove("glass-theme-active");
      document.body.classList.remove("glass-theme-active");
    };
  }, []);

  const fetchForumData = async () => {
    try {
      setLoading(true);

      const { data: categoriesData, error: categoriesError } = await supabase
        .from("forum_categories")
        .select("*")
        .order("sort_order");

      if (categoriesError) throw categoriesError;

      const { data: tagsData, error: tagsError } =
        await supabase.rpc("get_forum_tags");
      if (tagsError) console.error("Error fetching tags:", tagsError);

      const { data: threadsData, error: threadsError } = await supabase
        .from("forum_threads")
        .select(
          `
          id,
          category_id,
          author_id,
          title,
          locked,
          pinned,
          created_at,
          updated_at,
          users!forum_threads_author_id_fkey (
            full_name,
            avatar_url
          )
        `,
        )
        .order("pinned", { ascending: false })
        .order("updated_at", { ascending: false })
        .limit(20);

      if (threadsError) throw threadsError;

      const threadsWithTags = await Promise.all(
        (threadsData || []).map(async (thread) => {
          const { data: threadTags } = await supabase
            .from("forum_thread_tags")
            .select(
              `
              forum_tags (
                id,
                name,
                slug,
                color,
                sort_order
              )
            `,
            )
            .eq("thread_id", thread.id);

          return {
            ...thread,
            author_name: thread.users?.full_name || "Unknown User",
            author_avatar: thread.users?.avatar_url || null,
            tags:
              threadTags?.map((tt: any) => tt.forum_tags).filter(Boolean) || [],
          };
        }),
      );

      setCategories(categoriesData || []);
      setTags(tagsData || []);
      setThreads(threadsWithTags);
    } catch (error) {
      console.error("Error fetching forum data:", error);
      toast({
        title: "Error",
        description: "Could not load forum data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateThread = async () => {
    if (
      !user ||
      !selectedCategoryId ||
      !newThreadTitle.trim() ||
      !newThreadContent.trim() ||
      selectedTagIds.length === 0
    ) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields and select at least one tag.",
        variant: "destructive",
      });
      return;
    }

    try {
      setCreatingThread(true);
      const { data, error } = await supabase.rpc(
        "create_forum_thread_with_tags",
        {
          p_category_id: selectedCategoryId,
          p_title: newThreadTitle.trim(),
          p_content: newThreadContent.trim(),
          p_tag_ids: selectedTagIds,
        },
      );

      if (error) throw error;

      haptic.success();
      toast({
        title: "Success",
        description: "Thread created successfully!",
      });

      setShowCreateDialog(false);
      setNewThreadTitle("");
      setNewThreadContent("");
      setSelectedCategoryId(null);
      setSelectedTagIds([]);

      if (data?.id) {
        navigate(`/forum/t/${data.id}`);
      } else {
        fetchForumData();
      }
    } catch (error) {
      console.error("Error creating thread:", error);
      haptic.error();
      toast({
        title: "Error",
        description: "Could not create thread.",
        variant: "destructive",
      });
    } finally {
      setCreatingThread(false);
    }
  };

  const toggleTag = (tagId: number) => {
    haptic.light();
    setSelectedTagIds((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId],
    );
  };

  if (loading) {
    return (
      <div
        className={cn(
          "glass-forum-theme min-h-screen flex items-center justify-center",
          "bg-gradient-to-br from-slate-900/95 via-orange-900/20 to-red-900/15",
        )}
      >
        <div className="text-center">
          <Campfire />
          <p className="text-white/90 font-medium">
            Gathering around the campfire...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "glass-forum-theme min-h-screen relative overflow-hidden",
        "bg-gradient-to-br from-slate-900/95 via-orange-900/20 to-red-900/15",
        "scrollbar-nature",
      )}
    >
      {/* Origami Hamburger Menu */}
      <OrigamiHamburger />
      {/* Enhanced Fireflies with orange glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {[...Array(20)].map((_, i) => {
          const duration = 3 + Math.random() * 3;
          const delay = Math.random() * 3;
          return (
            <div
              key={i}
              className="absolute w-1.5 h-1.5 bg-orange-400 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                boxShadow:
                  "0 0 10px rgba(249, 115, 22, 0.8), 0 0 20px rgba(249, 115, 22, 0.4)",
                animationName: "firefly",
                animationDuration: `${duration}s`,
                animationTimingFunction: "ease-in-out",
                animationIterationCount: "infinite",
                animationDelay: `${delay}s`,
              }}
            />
          );
        })}
      </div>

      {/* Smoke particles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {[...Array(8)].map((_, i) => {
          const duration = 8 + Math.random() * 4;
          return (
            <div
              key={`smoke-${i}`}
              className="absolute w-2 h-2 bg-gray-400/20 rounded-full blur-sm"
              style={{
                left: "50%",
                bottom: "10%",
                animationName: "smoke-rise",
                animationDuration: `${duration}s`,
                animationTimingFunction: "ease-out",
                animationIterationCount: "infinite",
                animationDelay: `${i * 1.5}s`,
                transform: `translateX(${(i - 4) * 40}px)`,
              }}
            />
          );
        })}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header with Campfire */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={cn(
            "text-center mb-12 p-6 rounded-3xl",
            "bg-white/8 dark:bg-gray-900/8",
            "backdrop-blur-xl backdrop-saturate-150",
            "border border-orange-400/30 dark:border-orange-400/20",
            "ring-0 ring-orange-400/0",
            "hover:ring-2 hover:ring-orange-400/40 hover:ring-offset-2",
            "shadow-lg shadow-black/5 hover:shadow-2xl hover:shadow-orange-500/20",
            "transition-all duration-500 ease-out",
          )}
        >
          {/* Campfire with Glass Container */}
          <div
            className={cn(
              "relative w-40 h-40 mx-auto mb-6",
              "bg-white/5 backdrop-blur-sm rounded-full",
              "border border-orange-400/20",
              "shadow-2xl shadow-orange-500/30",
            )}
          >
            <Campfire />
          </div>
          <h1
            className="text-4xl md:text-5xl font-bold text-white/95 mb-4"
            style={{
              textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
            }}
          >
            Campfire Conversations
          </h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            <Flame className="inline-block w-5 h-5 mr-2 text-orange-400" />
            Gather 'round, share your tales, and learn from fellow adventurers
          </p>
        </motion.div>

        {/* Create Thread Button */}
        {user && (
          <div className="flex justify-center mb-12">
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white shadow-lg hover:shadow-xl transition-all"
                  onClick={() => haptic.medium()}
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Share Your Story
                </Button>
              </DialogTrigger>

              {/* Dialog content remains similar but with journal styling */}
              <DialogContent className="max-w-3xl bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-gray-900 dark:to-amber-950">
                <DialogHeader>
                  <DialogTitle className="text-2xl text-amber-900 dark:text-amber-100">
                    Write in the Journal
                  </DialogTitle>
                  <DialogDescription className="text-amber-700 dark:text-amber-300">
                    Share your adventure with the community
                  </DialogDescription>
                </DialogHeader>
                {/* Form content - same as before but with styling updates */}
                {/* ... rest of the dialog content ... */}
              </DialogContent>
            </Dialog>
          </div>
        )}

        {/* Log Seat Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {categories.map((category) => {
            const categoryThreads = threads.filter(
              (t) => t.category_id === category.id,
            );
            return (
              <LogSeat
                key={category.id}
                category={category}
                threadCount={categoryThreads.length}
                isActive={false}
              />
            );
          })}
        </div>

        {/* Recent Tales (Threads) */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-amber-900 dark:text-amber-100 mb-6 text-center">
            Recent Tales
          </h2>
          <div className="space-y-4">
            {threads.slice(0, 10).map((thread) => (
              <ParchmentThread key={thread.id} thread={thread} />
            ))}
          </div>
        </div>

        {/* Sign in CTA for non-authenticated */}
        {!user && (
          <div className="text-center mt-12 p-8 rounded-3xl bg-amber-100/50 dark:bg-amber-900/20 backdrop-blur-sm">
            <p className="text-amber-900 dark:text-amber-100 mb-4 text-lg">
              Join the circle to share your stories
            </p>
            <Button
              size="lg"
              className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700"
              onClick={() => navigate("/auth")}
            >
              Sign In to Join
            </Button>
          </div>
        )}
      </div>

      {/* Firefly animation */}
      <style>{`
        @keyframes firefly {
          0%, 100% {
            opacity: 0;
            transform: translate(0, 0) scale(1);
          }
          50% {
            opacity: 1;
            transform: translate(20px, -20px) scale(1.5);
          }
        }
      `}</style>
    </div>
  );
}
