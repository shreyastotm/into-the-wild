import React, { useEffect, useMemo, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
// Remove useAuth import - this is a public page
import { setHomeBackground, getHomeBackground } from "@/lib/siteSettings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  MobilePage,
  MobileSection,
  MobileGrid,
} from "@/components/mobile/MobilePage";
import { GalleryCard } from "@/components/trek";
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Calendar,
  Users,
  Mountain,
  Search,
  Filter,
  X,
  Play,
  Loader2,
  Tag,
} from "lucide-react";

type PastTrek = {
  trek_id: number;
  name: string;
  description: string | null;
  location: string | null;
  start_datetime: string;
  difficulty?: string | null;
  max_participants?: number | null;
  images: string[];
  video?: {
    id: number;
    video_url: string;
    thumbnail_url?: string;
    duration_seconds?: number;
  } | null;
  user_contributions?: Array<{
    id: number;
    image_url: string;
    caption: string | null;
    uploader_name: string;
  }>;
  tags?: Array<{
    id: number;
    name: string;
    color: string;
  }>;
  base_price?: number;
};

export default function PublicGallery() {
  const [items, setItems] = useState<PastTrek[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentBg, setCurrentBg] = useState<string | null>(null);
  const [selectedTrek, setSelectedTrek] = useState<PastTrek | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"date" | "name">("date");
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [availableTags, setAvailableTags] = useState<
    Array<{ id: number; name: string; color: string; count: number }>
  >([]);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  // Remove userProfile and isAdmin - this is a public page
  const ITEMS_PER_PAGE = 12;

  // Fetch available tags
  const fetchTags = useCallback(async () => {
    try {
      const { data, error } = (await supabase.rpc("get_all_image_tags")) as {
        data: any[] | null;
        error: any;
      };
      if (error) throw error;
      setAvailableTags(data || []);
    } catch (error) {
      console.error("Error fetching tags:", error);
    }
  }, []);

  // Fetch tags for all treks
  const fetchTrekTags = useCallback(async (trekIds: number[]) => {
    if (trekIds.length === 0) return {};

    try {
      // Get all tag assignments for these treks by joining through images/videos
      const { data: tagAssignments, error } = (await supabase.from(
        "image_tag_assignments",
      ).select(`
          image_id,
          image_type,
          image_tags!inner(id, name, color)
        `)) as { data: any[] | null; error: any };

      if (error) throw error;

      // Group tags by trek_id - fetch trek info for each image type
      const tagsByTrek: Record<
        number,
        Array<{ id: number; name: string; color: string }>
      > = {};

      if (tagAssignments && (tagAssignments as any[]).length > 0) {
        // Group assignments by image type and fetch trek info
        const officialImageIds = tagAssignments
          .filter((a) => a.image_type === "official_image")
          .map((a) => a.image_id);

        const officialVideoIds = tagAssignments
          .filter((a) => a.image_type === "official_video")
          .map((a) => a.image_id);

        const userImageIds = tagAssignments
          .filter((a) => a.image_type === "user_image")
          .map((a) => a.image_id);

        // Fetch trek info for official images
        if (officialImageIds.length > 0) {
          const { data: officialImages } = (await supabase
            .from("trek_event_images")
            .select("id, trek_id")
            .in("id", officialImageIds)) as { data: any[] | null; error: any };

          if (officialImages) {
            officialImages.forEach((img) => {
              const assignments = tagAssignments.filter(
                (a) =>
                  a.image_type === "official_image" && a.image_id === img.id,
              );
              assignments.forEach((assignment) => {
                if (trekIds.includes(img.trek_id)) {
                  if (!tagsByTrek[img.trek_id]) {
                    tagsByTrek[img.trek_id] = [];
                  }
                  const existingTag = tagsByTrek[img.trek_id].find(
                    (t) => t.id === assignment.image_tags.id,
                  );
                  if (!existingTag) {
                    tagsByTrek[img.trek_id].push({
                      id: assignment.image_tags.id,
                      name: assignment.image_tags.name,
                      color: assignment.image_tags.color,
                    });
                  }
                }
              });
            });
          }
        }

        // Fetch trek info for official videos
        if (officialVideoIds.length > 0) {
          const { data: officialVideos } = (await supabase
            .from("trek_event_videos")
            .select("id, trek_id")
            .in("id", officialVideoIds)) as { data: any[] | null; error: any };

          if (officialVideos) {
            officialVideos.forEach((video) => {
              const assignments = tagAssignments.filter(
                (a) =>
                  a.image_type === "official_video" && a.image_id === video.id,
              );
              assignments.forEach((assignment) => {
                if (trekIds.includes(video.trek_id)) {
                  if (!tagsByTrek[video.trek_id]) {
                    tagsByTrek[video.trek_id] = [];
                  }
                  const existingTag = tagsByTrek[video.trek_id].find(
                    (t) => t.id === assignment.image_tags.id,
                  );
                  if (!existingTag) {
                    tagsByTrek[video.trek_id].push({
                      id: assignment.image_tags.id,
                      name: assignment.image_tags.name,
                      color: assignment.image_tags.color,
                    });
                  }
                }
              });
            });
          }
        }

        // Fetch trek info for user images
        if (userImageIds.length > 0) {
          const { data: userImages } = (await supabase
            .from("user_trek_images")
            .select("id, trek_id")
            .in("id", userImageIds)) as { data: any[] | null; error: any };

          if (userImages) {
            userImages.forEach((img) => {
              const assignments = tagAssignments.filter(
                (a) => a.image_type === "user_image" && a.image_id === img.id,
              );
              assignments.forEach((assignment) => {
                if (trekIds.includes(img.trek_id)) {
                  if (!tagsByTrek[img.trek_id]) {
                    tagsByTrek[img.trek_id] = [];
                  }
                  const existingTag = tagsByTrek[img.trek_id].find(
                    (t) => t.id === assignment.image_tags.id,
                  );
                  if (!existingTag) {
                    tagsByTrek[img.trek_id].push({
                      id: assignment.image_tags.id,
                      name: assignment.image_tags.name,
                      color: assignment.image_tags.color,
                    });
                  }
                }
              });
            });
          }
        }
      }

      return tagsByTrek;
    } catch (error) {
      console.error("Error fetching trek tags:", error);
      return {};
    }
  }, []);

  const fetchTreks = useCallback(
    async (page: number = 1, append: boolean = false) => {
      const isInitialLoad = page === 1 && !append;
      if (isInitialLoad) setLoading(true);
      else setLoadingMore(true);

      try {
        const from = (page - 1) * ITEMS_PER_PAGE;
        const to = from + ITEMS_PER_PAGE - 1;

        // Get current filter values to avoid dependency issues
        const currentSearchTerm = searchTerm;
        const currentDifficultyFilter = difficultyFilter;
        const currentSortBy = sortBy;

        // Build query for treks (public access - no auth required)
        let query = supabase
          .from("trek_events")
          .select(
            "trek_id, name, description, location, start_datetime, difficulty, max_participants, base_price",
          )
          .lt("start_datetime", new Date().toISOString());

        // Apply search filter
        if (currentSearchTerm.trim()) {
          query = query.ilike("name", `%${currentSearchTerm.trim()}%`);
        }

        // Apply difficulty filter
        if (currentDifficultyFilter !== "all") {
          query = query.eq("difficulty", currentDifficultyFilter);
        }

        // Apply sorting
        if (currentSortBy === "name") {
          query = query.order("name", { ascending: true });
        } else {
          query = query.order("start_datetime", { ascending: false });
        }

        // Apply pagination
        query = query.range(from, to);

        const { data: treks, error } = await query;
        if (error) throw error;

        // If no more results, set hasMore to false
        if (!treks || treks.length < ITEMS_PER_PAGE) {
          setHasMore(false);
        }

        const trekIds = (treks ?? []).map((t) => t.trek_id);

        // Fetch official images
        let imagesByTrek: Record<number, string[]> = {};
        if (trekIds.length) {
          const { data: imgs, error: imgErr } = await supabase
            .from("trek_event_images")
            .select("trek_id, image_url, position")
            .in("trek_id", trekIds)
            .order("position", { ascending: true });
          if (imgErr) throw imgErr;
          imagesByTrek = (imgs ?? []).reduce(
            (acc, it) => {
              if (!acc[it.trek_id]) acc[it.trek_id] = [];
              acc[it.trek_id].push(it.image_url);
              return acc;
            },
            {} as Record<number, string[]>,
          );
        }

        // Fetch videos
        let videosByTrek: Record<number, any> = {};
        if (trekIds.length) {
          const { data: videos, error: videoErr } = await supabase
            .from("trek_event_videos")
            .select("id, trek_id, video_url, thumbnail_url, duration_seconds")
            .in("trek_id", trekIds);
          if (videoErr) throw videoErr;
          videosByTrek = (videos ?? []).reduce(
            (acc, video) => {
              acc[video.trek_id] = video;
              return acc;
            },
            {} as Record<number, any>,
          );
        }

        // Fetch user-contributed approved images (public access)
        let userContributionsByTrek: Record<
          number,
          Array<{
            id: number;
            image_url: string;
            caption: string | null;
            uploader_name: string;
          }>
        > = {};

        if (trekIds.length) {
          // First get the user images
          const { data: userImgs, error: userImgErr } = (await supabase
            .from("user_trek_images")
            .select("id, trek_id, image_url, caption, uploaded_by")
            .in("trek_id", trekIds)
            .eq("status", "approved")) as { data: any[] | null; error: any };

          if (userImgErr) throw userImgErr;

          if (userImgs && userImgs.length > 0) {
            // Get unique user IDs
            const userIds = [
              ...new Set(userImgs.map((img) => img.uploaded_by)),
            ];

            // Fetch user names
            const { data: users, error: usersErr } = (await supabase
              .from("users")
              .select("user_id, full_name")
              .in("user_id", userIds)) as { data: any[] | null; error: any };

            if (usersErr) throw usersErr;

            // Create user name mapping
            const userNames: Record<string, string> = {};
            (users || []).forEach((user) => {
              userNames[user.user_id] = user.full_name || "Anonymous";
            });

            // Combine the data
            userContributionsByTrek = (userImgs ?? []).reduce(
              (acc, img) => {
                if (!acc[img.trek_id]) acc[img.trek_id] = [];
                acc[img.trek_id].push({
                  id: img.id,
                  image_url: img.image_url,
                  caption: img.caption,
                  uploader_name: userNames[img.uploaded_by] || "Anonymous",
                });
                return acc;
              },
              {} as Record<
                number,
                Array<{
                  id: number;
                  image_url: string;
                  caption: string | null;
                  uploader_name: string;
                }>
              >,
            );
          }
        }

        // Fetch tags for all treks
        const tagsByTrek = await fetchTrekTags(trekIds);

        const merged = (treks ?? []).map((t) => ({
          trek_id: t.trek_id,
          name: t.name,
          description: t.description ?? null,
          location: t.location ?? null,
          start_datetime: t.start_datetime,
          difficulty: t.difficulty ?? null,
          max_participants: t.max_participants ?? null,
          images: imagesByTrek[t.trek_id] ?? [],
          video: videosByTrek[t.trek_id] ?? null,
          user_contributions: userContributionsByTrek[t.trek_id] ?? [],
          tags: tagsByTrek[t.trek_id] ?? [],
          base_price: t.base_price ?? 0,
        }));

        if (append) {
          setItems((prev) => [...prev, ...merged]);
        } else {
          setItems(merged);
        }
      } catch (e) {
        console.error("Public Gallery fetch error:", e);
        if (!append) setItems([]);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    // Removed dependencies to prevent infinite loop - using current values inside function
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  useEffect(() => {
    setCurrentPage(1);
    setHasMore(true);
    fetchTreks(1, false);
    fetchTags();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  useEffect(() => {
    (async () => {
      const url = await getHomeBackground();
      setCurrentBg(url);
    })();
  }, []);

  // Handle trek card click
  const handleTrekClick = useCallback((trek: PastTrek) => {
    setSelectedTrek(trek);
    setCurrentImageIndex(0);
    setIsDetailOpen(true);
  }, []);

  // Handle image navigation in carousel
  const handleNextImage = useCallback(() => {
    if (!selectedTrek) return;
    const allMedia = getAllMedia(selectedTrek);
    setCurrentImageIndex((prev) => (prev + 1) % allMedia.length);
  }, [selectedTrek]);

  const handlePrevImage = useCallback(() => {
    if (!selectedTrek) return;
    const allMedia = getAllMedia(selectedTrek);
    setCurrentImageIndex(
      (prev) => (prev - 1 + allMedia.length) % allMedia.length,
    );
  }, [selectedTrek]);

  // Handle load more
  const handleLoadMore = useCallback(() => {
    if (hasMore && !loadingMore) {
      setCurrentPage((prev) => prev + 1);
      fetchTreks(currentPage + 1, true);
    }
  }, [hasMore, loadingMore, currentPage, fetchTreks]);

  // Get all media for current trek (images + video + user contributions)
  const getAllMedia = useCallback((trek: PastTrek) => {
    const media: Array<{ type: "image" | "video"; url: string; id?: number }> =
      [];

    // Add official images
    trek.images.forEach((url) => media.push({ type: "image", url }));

    // Add video if exists
    if (trek.video) {
      media.push({
        type: "video",
        url: trek.video.video_url,
        id: trek.video.id,
      });
    }

    // Add user contributions
    trek.user_contributions?.forEach((contrib) =>
      media.push({ type: "image", url: contrib.image_url, id: contrib.id }),
    );

    return media;
  }, []);

  // Get current media info
  const getCurrentMediaInfo = useCallback(() => {
    if (!selectedTrek) return null;

    const allMedia = getAllMedia(selectedTrek);
    const currentMedia = allMedia[currentImageIndex];

    if (!currentMedia) return null;

    return {
      ...currentMedia,
      index: currentImageIndex + 1,
      total: allMedia.length,
    };
  }, [selectedTrek, currentImageIndex, getAllMedia]);

  // Filter and sort items for display
  const filteredItems = useMemo(() => {
    let filtered = items.filter(Boolean); // Remove undefined/null items first

    // Apply search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(
        (item) =>
          item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.location?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Apply difficulty filter
    if (difficultyFilter !== "all") {
      filtered = filtered.filter(
        (item) => item.difficulty === difficultyFilter,
      );
    }

    // Apply tag filter
    if (selectedTags.length > 0) {
      filtered = filtered.filter((item) =>
        item.tags?.some((tag) => selectedTags.includes(tag.id)),
      );
    }

    // Apply sorting
    if (sortBy === "name") {
      filtered = [...filtered].sort((a, b) => a.name?.localeCompare(b.name || "") || 0);
    } else {
      filtered = [...filtered].sort(
        (a, b) =>
          new Date(b.start_datetime || "").getTime() -
          new Date(a.start_datetime || "").getTime(),
      );
    }

    return filtered;
  }, [items, searchTerm, difficultyFilter, selectedTags, sortBy]);

  // Watch for filter changes - direct fetch without intermediate function
  useEffect(() => {
    // Reset pagination and fetch when filters change
    setCurrentPage(1);
    setHasMore(true);
    fetchTreks(1, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, difficultyFilter, selectedTags.length, sortBy]); // Use selectedTags.length instead of array

  // Toggle tag filter
  const toggleTagFilter = useCallback((tagId: number) => {
    setSelectedTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId],
    );
  }, []);

  // Clear all tag filters
  const clearTagFilters = useCallback(() => {
    setSelectedTags([]);
  }, []);

  const onToggleBackground = async (url: string, checked: boolean) => {
    // Remove admin-only functionality for public gallery
    console.log("Background toggle not available in public gallery");
  };

  return (
    <MobilePage>
      <MobileSection title="Our Past Adventures">
        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search treks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex gap-2">
              <Select
                value={difficultyFilter}
                onValueChange={setDifficultyFilter}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="Easy">Easy</SelectItem>
                  <SelectItem value="Moderate">Moderate</SelectItem>
                  <SelectItem value="Hard">Hard</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={sortBy}
                onValueChange={(value: "date" | "name") => setSortBy(value)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Newest First</SelectItem>
                  <SelectItem value="name">Name A-Z</SelectItem>
                </SelectContent>
              </Select>

              {(searchTerm ||
                difficultyFilter !== "all" ||
                sortBy !== "date") && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchTerm("");
                    setDifficultyFilter("all");
                    setSortBy("date");
                  }}
                >
                  <X className="w-4 h-4 mr-1" />
                  Clear
                </Button>
              )}
            </div>
          </div>

          {/* Tag filters */}
          {availableTags.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Filter by tags:</span>
                {selectedTags.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearTagFilters}
                    className="text-xs"
                  >
                    Clear all
                  </Button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {availableTags.slice(0, 8).map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() => toggleTagFilter(tag.id)}
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-colors ${
                      selectedTags.includes(tag.id)
                        ? "bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600"
                        : "hover:bg-gray-50 dark:hover:bg-gray-800"
                    }`}
                    style={{
                      backgroundColor: selectedTags.includes(tag.id)
                        ? tag.color + "20"
                        : undefined,
                      borderColor: tag.color,
                      color: tag.color,
                    }}
                  >
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: tag.color }}
                    />
                    {tag.name}
                    {selectedTags.includes(tag.id) && <X className="w-3 h-3" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Results count */}
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {filteredItems.length} trek{filteredItems.length !== 1 ? "s" : ""}{" "}
              found
              {selectedTags.length > 0 && (
                <span className="ml-2 text-xs">
                  (filtered by {selectedTags.length} tag
                  {selectedTags.length !== 1 ? "s" : ""})
                </span>
              )}
            </p>
          </div>
        </div>

        {loading ? (
          <MobileGrid>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div key={n} className="mobile-skeleton h-64 rounded-2xl" />
            ))}
          </MobileGrid>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <Mountain className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="mobile-body text-gray-500 dark:text-gray-400">
              {searchTerm || difficultyFilter !== "all"
                ? "No treks match your filters."
                : "No past treks yet."}
            </p>
          </div>
        ) : (
          <>
            <MobileGrid>
              {filteredItems.map((trek) => (
                <GalleryCard
                  key={trek.trek_id}
                  trek={{
                    trek_id: trek.trek_id,
                    name: trek.name,
                    description: trek.description,
                    location: trek.location,
                    start_datetime: trek.start_datetime,
                    images: trek.images,
                  }}
                  onClick={() => handleTrekClick(trek)}
                />
              ))}
            </MobileGrid>

            {/* Load More Button */}
            {hasMore && !loading && (
              <div className="text-center mt-6">
                <Button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  variant="outline"
                >
                  {loadingMore && (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  )}
                  Load More Treks
                </Button>
              </div>
            )}
          </>
        )}
      </MobileSection>

      {/* Trek Detail Modal */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden mx-4">
          {selectedTrek && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Mountain className="w-5 h-5" />
                  {selectedTrek.name}
                </DialogTitle>
              </DialogHeader>

              <div className="flex flex-col lg:flex-row gap-6 overflow-y-auto">
                {/* Media Carousel */}
                <div className="flex-1">
                  {getAllMedia(selectedTrek).length > 0 ? (
                    <div className="relative">
                      <div className="aspect-video rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                        {(() => {
                          const mediaInfo = getCurrentMediaInfo();
                          if (!mediaInfo) return null;

                          return (
                            <>
                              {mediaInfo.type === "video" ? (
                                <video
                                  src={mediaInfo.url}
                                  controls
                                  className="w-full h-full object-cover"
                                  poster={selectedTrek.video?.thumbnail_url}
                                >
                                  Your browser does not support the video tag.
                                </video>
                              ) : (
                                <img
                                  src={mediaInfo.url}
                                  alt={selectedTrek.name}
                                  className="w-full h-full object-cover"
                                />
                              )}

                              {/* Navigation arrows */}
                              {getAllMedia(selectedTrek).length > 1 && (
                                <>
                                  <Button
                                    variant="secondary"
                                    size="sm"
                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white border-0 rounded-full w-10 h-10 p-0"
                                    onClick={handlePrevImage}
                                  >
                                    <ChevronLeft className="w-5 h-5" />
                                  </Button>
                                  <Button
                                    variant="secondary"
                                    size="sm"
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white border-0 rounded-full w-10 h-10 p-0"
                                    onClick={handleNextImage}
                                  >
                                    <ChevronRight className="w-5 h-5" />
                                  </Button>
                                </>
                              )}

                              {/* Media counter */}
                              <div className="absolute bottom-3 right-3">
                                <Badge
                                  variant="secondary"
                                  className="bg-black/60 text-white border-0"
                                >
                                  {mediaInfo.index} / {mediaInfo.total}
                                </Badge>
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  ) : (
                    <div className="aspect-video rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                      <Mountain className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Trek Details */}
                <div className="flex-1 space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Trek Details</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>
                          {new Date(
                            selectedTrek.start_datetime,
                          ).toLocaleDateString("en-IN", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </span>
                      </div>

                      {selectedTrek.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span>{selectedTrek.location}</span>
                        </div>
                      )}

                      {selectedTrek.difficulty && (
                        <div className="flex items-center gap-2">
                          <Mountain className="w-4 h-4 text-gray-400" />
                          <Badge variant="outline">
                            {selectedTrek.difficulty}
                          </Badge>
                        </div>
                      )}

                      {selectedTrek.max_participants && (
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span>
                            Max {selectedTrek.max_participants} participants
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {selectedTrek.description && (
                    <div>
                      <h3 className="font-semibold mb-2">Description</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {selectedTrek.description}
                      </p>
                    </div>
                  )}

                  {/* Community contributions */}
                  {selectedTrek.user_contributions &&
                    selectedTrek.user_contributions.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-2">Community Photos</h3>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {selectedTrek.user_contributions.length} photo
                          {selectedTrek.user_contributions.length !== 1
                            ? "s"
                            : ""}{" "}
                          shared by our community
                        </div>
                      </div>
                    )}

                  {/* Video info */}
                  {selectedTrek.video && (
                    <div>
                      <h3 className="font-semibold mb-2">Video</h3>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Watch highlights from this trek
                      </div>
                    </div>
                  )}

                  {/* Tags */}
                  {selectedTrek.tags && selectedTrek.tags.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2">Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedTrek.tags.map((tag) => (
                          <Badge
                            key={tag.id}
                            variant="outline"
                            className="text-xs"
                            style={{
                              borderColor: tag.color,
                              color: tag.color,
                              backgroundColor: tag.color + "10",
                            }}
                          >
                            {tag.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </MobilePage>
  );
}
