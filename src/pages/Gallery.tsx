import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { setHomeBackground, getHomeBackground } from '@/lib/siteSettings';
import { toast } from '@/components/ui/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { MobilePage, MobileSection, MobileCard, MobileGrid } from '@/components/mobile/MobilePage';
import { HorizontalTrekScroll } from '@/components/trek/HorizontalTrekScroll';
import { useMediaQuery } from '@/hooks/useMediaQuery';
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
  Eye,
  Camera
} from 'lucide-react';
import { UserImageUpload } from '@/components/user/UserImageUpload';

type PastTrek = {
  trek_id: number;
  name: string;
  description: string | null;
  location: string | null;
  start_datetime: string;
  difficulty?: string | null;
  max_participants?: number | null;
  images: string[];
  user_contributions?: Array<{
    id: number;
    image_url: string;
    caption: string | null;
    uploader_name: string;
  }>;
};

export default function Gallery() {
  const [items, setItems] = useState<PastTrek[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentBg, setCurrentBg] = useState<string | null>(null);
  const [selectedTrek, setSelectedTrek] = useState<PastTrek | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'name'>('date');
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  const { userProfile } = useAuth();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const navigate = useNavigate();

  const isAdmin = useMemo(() => userProfile?.user_type === 'admin', [userProfile]);

  const ITEMS_PER_PAGE = 12;

  const fetchTreks = useCallback(async (page: number = 1, append: boolean = false) => {
    const isInitialLoad = page === 1 && !append;
    if (isInitialLoad) setLoading(true);
    else setLoadingMore(true);

    try {
      const from = (page - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      // Build query for treks
      let query = supabase
        .from('trek_events')
        .select('trek_id, name, description, location, start_datetime, difficulty, max_participants')
        .lt('start_datetime', new Date().toISOString());

      // Apply search filter
      if (searchTerm.trim()) {
        query = query.ilike('name', `%${searchTerm.trim()}%`);
      }

      // Apply difficulty filter
      if (difficultyFilter !== 'all') {
        query = query.eq('difficulty', difficultyFilter);
      }

      // Apply sorting
      if (sortBy === 'name') {
        query = query.order('name', { ascending: true });
      } else {
        query = query.order('start_datetime', { ascending: false });
      }

      // Apply pagination
      query = query.range(from, to);

      const { data: treks, error } = await query;
      if (error) throw error;

      // If no more results, set hasMore to false
      if (!treks || treks.length < ITEMS_PER_PAGE) {
        setHasMore(false);
      }

      const trekIds = (treks ?? []).map(t => t.trek_id);

      // Fetch official images
      let imagesByTrek: Record<number, string[]> = {};
      if (trekIds.length) {
        const { data: imgs, error: imgErr } = await supabase
          .from('trek_event_images')
          .select('trek_id, image_url, position')
          .in('trek_id', trekIds)
          .order('position', { ascending: true });
        if (imgErr) throw imgErr;
        imagesByTrek = (imgs ?? []).reduce((acc, it) => {
          if (!acc[it.trek_id]) acc[it.trek_id] = [];
          acc[it.trek_id].push(it.image_url);
          return acc;
        }, {} as Record<number, string[]>);
      }

      // Fetch user-contributed approved images
      let userContributionsByTrek: Record<number, Array<{
        id: number;
        image_url: string;
        caption: string | null;
        uploader_name: string;
      }>> = {};

      if (trekIds.length) {
        const { data: userImgs, error: userImgErr } = await supabase
          .from('user_trek_images')
          .select(`
            id,
            trek_id,
            image_url,
            caption,
            users!user_trek_images_uploaded_by_fkey(full_name)
          `)
          .in('trek_id', trekIds)
          .eq('status', 'approved');

        if (userImgErr) throw userImgErr;

        userContributionsByTrek = (userImgs ?? []).reduce((acc, img) => {
          if (!acc[img.trek_id]) acc[img.trek_id] = [];
          acc[img.trek_id].push({
            id: img.id,
            image_url: img.image_url,
            caption: img.caption,
            uploader_name: img.users?.full_name || 'Anonymous',
          });
          return acc;
        }, {} as Record<number, Array<{
          id: number;
          image_url: string;
          caption: string | null;
          uploader_name: string;
        }>>);
      }

      const merged = (treks ?? []).map(t => ({
        trek_id: t.trek_id,
        name: t.name,
        description: t.description ?? null,
        location: t.location ?? null,
        start_datetime: t.start_datetime,
        difficulty: t.difficulty ?? null,
        max_participants: t.max_participants ?? null,
        images: imagesByTrek[t.trek_id] ?? [],
        user_contributions: userContributionsByTrek[t.trek_id] ?? [],
      }));

      if (append) {
        setItems(prev => [...prev, ...merged]);
      } else {
        setItems(merged);
      }

    } catch (e) {
      console.error('Gallery fetch error:', e);
      if (!append) setItems([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [searchTerm, difficultyFilter, sortBy]);

  useEffect(() => {
    setCurrentPage(1);
    setHasMore(true);
    fetchTreks(1, false);
  }, [fetchTreks]);

  useEffect(() => {
    (async () => {
      const url = await getHomeBackground();
      setCurrentBg(url);
    })();
  }, []);

  // Handle trek card click
  const handleTrekClick = useCallback((trek: PastTrek) => {
    if (!userProfile) {
      toast({
        title: "Sign in to view gallery",
        description: "Create an account or sign in to view trek photos and details",
        variant: "default",
        action: (
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/auth')}
          >
            Sign In
          </Button>
        ),
      });
      return;
    }

    setSelectedTrek(trek);
    setCurrentImageIndex(0);
    setIsDetailOpen(true);
  }, [userProfile, navigate]);

  // Handle image navigation in carousel
  const handleNextImage = useCallback(() => {
    if (!selectedTrek) return;
    const allImages = [...selectedTrek.images, ...(selectedTrek.user_contributions?.map(c => c.image_url) || [])];
    setCurrentImageIndex(prev => (prev + 1) % allImages.length);
  }, [selectedTrek]);

  const handlePrevImage = useCallback(() => {
    if (!selectedTrek) return;
    const allImages = [...selectedTrek.images, ...(selectedTrek.user_contributions?.map(c => c.image_url) || [])];
    setCurrentImageIndex(prev => (prev - 1 + allImages.length) % allImages.length);
  }, [selectedTrek]);

  // Handle load more
  const handleLoadMore = useCallback(() => {
    if (hasMore && !loadingMore) {
      setCurrentPage(prev => prev + 1);
      fetchTreks(currentPage + 1, true);
    }
  }, [hasMore, loadingMore, currentPage, fetchTreks]);

  // Handle filter changes
  const handleFiltersChange = useCallback(() => {
    setCurrentPage(1);
    setHasMore(true);
    fetchTreks(1, false);
  }, [fetchTreks]);

  // Watch for filter changes
  useEffect(() => {
    handleFiltersChange();
  }, [handleFiltersChange]);

  // Get all images for current trek (official + user contributions)
  const getAllImages = useCallback((trek: PastTrek) => {
    return [
      ...trek.images,
      ...(trek.user_contributions?.map(c => c.image_url) || [])
    ];
  }, []);

  // Get current image info
  const getCurrentImageInfo = useCallback(() => {
    if (!selectedTrek) return null;

    const allImages = getAllImages(selectedTrek);
    const currentImage = allImages[currentImageIndex];

    if (!currentImage) return null;

    // Check if it's an official image or user contribution
    if (currentImageIndex < selectedTrek.images.length) {
      return { type: 'official', image: currentImage, index: currentImageIndex + 1, total: allImages.length };
    } else {
      const contributionIndex = currentImageIndex - selectedTrek.images.length;
      const contribution = selectedTrek.user_contributions?.[contributionIndex];
      return {
        type: 'user',
        image: currentImage,
        contribution,
        index: currentImageIndex + 1,
        total: allImages.length
      };
    }
  }, [selectedTrek, currentImageIndex, getAllImages]);

  // Filter and sort items for display
  const filteredItems = useMemo(() => {
    let filtered = items;

    // Apply search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.location?.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply difficulty filter
    if (difficultyFilter !== 'all') {
      filtered = filtered.filter(item => item.difficulty === difficultyFilter);
    }

    // Apply sorting
    if (sortBy === 'name') {
      filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
    } else {
      filtered = [...filtered].sort((a, b) => new Date(b.start_datetime).getTime() - new Date(a.start_datetime).getTime());
    }

    return filtered;
  }, [items, searchTerm, difficultyFilter, sortBy]);

  const onToggleBackground = async (url: string, checked: boolean) => {
    if (!isAdmin) return;
    try {
      setSaving(true);
      await setHomeBackground(checked ? url : '');
      setCurrentBg(checked ? url : null);
    } catch (err) {
      console.error('Failed to set background', err);
    } finally {
      setSaving(false);
    }
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
              <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
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

              <Select value={sortBy} onValueChange={(value: 'date' | 'name') => setSortBy(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Newest First</SelectItem>
                  <SelectItem value="name">Name A-Z</SelectItem>
                </SelectContent>
              </Select>

              {(searchTerm || difficultyFilter !== 'all' || sortBy !== 'date') && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchTerm('');
                    setDifficultyFilter('all');
                    setSortBy('date');
                  }}
                >
                  <X className="w-4 h-4 mr-1" />
                  Clear
                </Button>
              )}
            </div>
          </div>

          {/* Results count and user upload button */}
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {filteredItems.length} trek{filteredItems.length !== 1 ? 's' : ''} found
            </p>

            {userProfile && (
              <UserImageUpload
                trekId={0} // We'll need to modify this component to work without specific trek ID
                trekName="Gallery"
                onUploadSuccess={() => fetchTreks(currentPage, false)}
              />
            )}
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
              {searchTerm || difficultyFilter !== 'all'
                ? 'No treks match your filters.'
                : 'No past treks yet.'}
            </p>
          </div>
        ) : (
          <>
            {/* Mobile: Horizontal scroll */}
            {isMobile ? (
              <HorizontalTrekScroll
                treks={filteredItems}
                onTrekClick={handleTrekClick}
                showProgress={false}
                type="gallery"
              />
            ) : (
              /* Desktop: Grid layout */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredItems.map(trek => (
                  <div
                    key={trek.trek_id}
                    className="bg-card rounded-xl border border-border overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-200"
                    onClick={() => handleTrekClick(trek)}
                  >
                    <div className="relative">
                      {trek.images && trek.images.length > 0 ? (
                        <div className="relative h-56 w-full overflow-hidden">
                          <img
                            src={trek.images[0]}
                            alt={trek.name}
                            className="w-full h-full object-cover"
                          />
                          {/* Image count badge */}
                          <div className="absolute top-2 right-2">
                            <Badge variant="secondary" className="bg-black/50 text-white">
                              <Eye className="w-3 h-3 mr-1" />
                              {getAllImages(trek).length}
                            </Badge>
                          </div>
                        </div>
                      ) : trek.user_contributions && trek.user_contributions.length > 0 ? (
                        <div className="relative h-56 w-full overflow-hidden">
                          <img
                            src={trek.user_contributions[0].image_url}
                            alt={trek.name}
                            className="w-full h-full object-cover"
                          />
                          {/* Image count badge */}
                          <div className="absolute top-2 right-2">
                            <Badge variant="secondary" className="bg-black/50 text-white">
                              <Eye className="w-3 h-3 mr-1" />
                              {getAllImages(trek).length}
                            </Badge>
                          </div>
                        </div>
                      ) : (
                        <div className="h-56 w-full bg-muted flex items-center justify-center">
                          <Mountain className="w-12 h-12 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    <div className="p-4">
                      <h2 className="text-lg font-semibold text-foreground line-clamp-2 mb-2">
                        {trek.name}
                      </h2>

                      <div className="text-sm text-muted-foreground mb-3">
                        <div className="flex items-center gap-1">
                          {trek.location && (
                            <>
                              <MapPin className="w-3 h-3" />
                              {trek.location} •
                            </>
                          )}
                          <Calendar className="w-3 h-3 ml-1" />
                          {new Date(trek.start_datetime).toLocaleDateString('en-IN')}
                        </div>
                      </div>

                      {trek.difficulty && (
                        <Badge variant="outline" className="mb-2">
                          {trek.difficulty}
                        </Badge>
                      )}

                      {trek.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                          {trek.description}
                        </p>
                      )}

                      {/* User contributions indicator */}
                      {trek.user_contributions && trek.user_contributions.length > 0 && (
                        <div className="mb-3 flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400">
                          <Camera className="w-3 h-3" />
                          {trek.user_contributions.length} community photo{trek.user_contributions.length !== 1 ? 's' : ''}
                        </div>
                      )}

                      {/* Thumbnail grid for multiple images */}
                      {getAllImages(trek).length > 1 && (
                        <div className="mb-3 grid grid-cols-3 gap-1">
                          {getAllImages(trek).slice(1, 4).map((url, idx) => (
                            <img
                              key={idx}
                              src={url}
                              alt=""
                              className="w-full aspect-square object-cover rounded"
                            />
                          ))}
                          {getAllImages(trek).length > 4 && (
                            <div className="w-full aspect-square bg-muted rounded flex items-center justify-center">
                              <span className="text-xs text-muted-foreground">+{getAllImages(trek).length - 3}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Admin background toggle */}
                      {isAdmin && trek.images && trek.images.length > 0 && (
                        <div className="pt-3 border-t border-border flex items-center gap-2">
                          <Checkbox
                            id={`bg-${trek.trek_id}`}
                            checked={currentBg === trek.images[0]}
                            onCheckedChange={(val) => onToggleBackground(trek.images[0], Boolean(val))}
                            disabled={saving}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <label
                            htmlFor={`bg-${trek.trek_id}`}
                            className="text-sm select-none cursor-pointer"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Set as page background
                          </label>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Load More Button */}
            {hasMore && !loading && (
              <div className="text-center mt-6">
                <Button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  variant="outline"
                >
                  {loadingMore && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                  Load More Treks
                </Button>
              </div>
            )}
          </>
        )}
      </MobileSection>

      {/* Trek Detail Modal */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          {selectedTrek && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Mountain className="w-5 h-5" />
                  {selectedTrek.name}
                </DialogTitle>
              </DialogHeader>

              <div className="flex flex-col lg:flex-row gap-6 overflow-y-auto">
                {/* Image Carousel */}
                <div className="flex-1">
                  {getAllImages(selectedTrek).length > 0 ? (
                    <div className="relative">
                      <div className="aspect-video rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                        {(() => {
                          const imageInfo = getCurrentImageInfo();
                          if (!imageInfo) return null;

                          return (
                            <>
                              <img
                                src={imageInfo.image}
                                alt={selectedTrek.name}
                                className="w-full h-full object-cover"
                              />

                              {/* Image type indicator */}
                              <div className="absolute top-2 left-2">
                                <Badge
                                  variant={imageInfo.type === 'official' ? 'default' : 'secondary'}
                                  className={
                                    imageInfo.type === 'official'
                                      ? 'bg-blue-100 text-blue-800'
                                      : 'bg-green-100 text-green-800'
                                  }
                                >
                                  {imageInfo.type === 'official' ? 'Official' : 'Community'}
                                  {imageInfo.type === 'user' && imageInfo.contribution && (
                                    <span className="ml-1">• {imageInfo.contribution.uploader_name}</span>
                                  )}
                                </Badge>
                              </div>

                              {/* Navigation arrows */}
                              {getAllImages(selectedTrek).length > 1 && (
                                <>
                                  <Button
                                    variant="secondary"
                                    size="sm"
                                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white border-0"
                                    onClick={handlePrevImage}
                                  >
                                    <ChevronLeft className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="secondary"
                                    size="sm"
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white border-0"
                                    onClick={handleNextImage}
                                  >
                                    <ChevronRight className="w-4 h-4" />
                                  </Button>
                                </>
                              )}

                              {/* Image counter */}
                              <div className="absolute bottom-2 right-2">
                                <Badge variant="secondary" className="bg-black/50 text-white">
                                  {imageInfo.index} / {imageInfo.total}
                                </Badge>
                              </div>
                            </>
                          );
                        })()}
                      </div>

                      {/* Thumbnail strip */}
                      {getAllImages(selectedTrek).length > 1 && (
                        <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
                          {getAllImages(selectedTrek).map((url, idx) => (
                            <button
                              key={idx}
                              onClick={() => setCurrentImageIndex(idx)}
                              className={`flex-shrink-0 w-16 h-16 rounded border-2 overflow-hidden ${
                                idx === currentImageIndex
                                  ? 'border-primary'
                                  : 'border-gray-200 dark:border-gray-700'
                              }`}
                            >
                              <img
                                src={url}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            </button>
                          ))}
                        </div>
                      )}
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
                        <span>{new Date(selectedTrek.start_datetime).toLocaleDateString('en-IN', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}</span>
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
                          <Badge variant="outline">{selectedTrek.difficulty}</Badge>
                        </div>
                      )}

                      {selectedTrek.max_participants && (
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span>Max {selectedTrek.max_participants} participants</span>
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
                  {selectedTrek.user_contributions && selectedTrek.user_contributions.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2">Community Photos</h3>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {selectedTrek.user_contributions.length} photo{selectedTrek.user_contributions.length !== 1 ? 's' : ''} shared by our community
                      </div>
                    </div>
                  )}

                  {/* Share button for users */}
                  {userProfile && (
                    <div className="pt-4 border-t">
                      <UserImageUpload
                        trekId={selectedTrek.trek_id}
                        trekName={selectedTrek.name}
                        onUploadSuccess={() => {
                          fetchTreks(currentPage, false);
                          // Refresh the selected trek data
                          const updatedTrek = items.find(t => t.trek_id === selectedTrek.trek_id);
                          if (updatedTrek) setSelectedTrek(updatedTrek);
                        }}
                      />
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


