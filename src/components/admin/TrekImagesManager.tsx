import React, { useState, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import { Upload, Trash2, Plus, Loader2, Video, Tag, X, Check, ChevronDown, GripVertical } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface ExistingImage {
  id: number;
  image_url: string;
  position: number;
}

interface ExistingVideo {
  id: number;
  video_url: string;
}

interface TrekImagesManagerProps {
  trekId: number;
  trekName: string;
  existingImages: ExistingImage[];
  existingVideo?: ExistingVideo | null;
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

export function TrekImagesManager({
  trekId,
  trekName,
  existingImages,
  existingVideo,
  isOpen,
  onClose,
  onRefresh
}: TrekImagesManagerProps) {
  const [images, setImages] = useState<((File | string) | null)[]>([null, null, null, null, null]);
  const [video, setVideo] = useState<File | null>(null);
  const [currentExistingVideo, setCurrentExistingVideo] = useState<{id: number; video_url: string} | null>(null);
  const [uploading, setUploading] = useState(false);
  const [deletingImages, setDeletingImages] = useState<Set<number>>(new Set());
  const [deletingVideo, setDeletingVideo] = useState(false);

  // Tag management state
  const [availableTags, setAvailableTags] = useState<Array<{id: number; name: string; color: string}>>([]);
  const [selectedTags, setSelectedTags] = useState<Record<string, number[]>>({});
  const [tagSearch, setTagSearch] = useState('');
  const [showTagSelector, setShowTagSelector] = useState<string | null>(null);

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Drag and drop handler
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      // Update the images array with new order
      const oldIndex = parseInt(active.id.toString()) - 1;
      const newIndex = parseInt(over!.id.toString()) - 1;

      setImages(prev => arrayMove(prev, oldIndex, newIndex));

      // Update existing images order if they exist
      if (existingImages.length > 0) {
        const reorderedImages = arrayMove(existingImages, oldIndex, newIndex);
        // Update positions in reorderedImages
        reorderedImages.forEach((img, idx) => {
          img.position = idx + 1;
        });
      }
    }
  }, [existingImages]);

  // Initialize images array with existing images and video
  React.useEffect(() => {
    const newImages = [null, null, null, null, null] as ((File | string) | null)[];
    existingImages.forEach(img => {
      if (img.position <= 5) {
        newImages[img.position - 1] = img.image_url; // Existing URL as string
      }
    });
    setImages(newImages);
    setCurrentExistingVideo(existingVideo || null);
  }, [existingImages, existingVideo]);

  // Fetch available tags
  const fetchTags = useCallback(async () => {
    try {
      const { data, error } = await supabase.rpc('get_all_image_tags');
      if (error) throw error;
      setAvailableTags(data || []);
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  }, []);

  // Fetch existing tags for images and videos
  const fetchExistingTags = useCallback(async () => {
    if (existingImages.length === 0 && !existingVideo) return;

    try {
      const tagPromises = [];

      // Fetch tags for existing images
      existingImages.forEach(img => {
        tagPromises.push(
          supabase.rpc('get_image_tags', { p_image_id: img.id, p_image_type: 'official_image' })
        );
      });

      // Fetch tags for existing video
      if (existingVideo) {
        tagPromises.push(
          supabase.rpc('get_image_tags', { p_image_id: existingVideo.id, p_image_type: 'official_video' })
        );
      }

      const results = await Promise.all(tagPromises);

      const newSelectedTags: Record<string, number[]> = {};

      // Process image tags
      existingImages.forEach((img, index) => {
        const tags = results[index]?.data || [];
        newSelectedTags[`image_${img.id}`] = tags.map((tag: any) => tag.tag_id);
      });

      // Process video tags
      if (existingVideo) {
        const videoIndex = existingImages.length;
        const tags = results[videoIndex]?.data || [];
        newSelectedTags[`video_${existingVideo.id}`] = tags.map((tag: any) => tag.tag_id);
      }

      setSelectedTags(newSelectedTags);
    } catch (error) {
      console.error('Error fetching existing tags:', error);
    }
  }, [existingImages, existingVideo]);

  // Initialize tags data
  React.useEffect(() => {
    fetchTags();
    fetchExistingTags();
  }, [fetchTags, fetchExistingTags]);

  // Assign tags to media
  const assignTags = useCallback(async (mediaKey: string, mediaType: 'image' | 'video', tagIds: number[]) => {
    try {
      const imageType = mediaType === 'image' ? 'official_image' : 'official_video';

      // Extract the numeric ID from mediaKey (e.g., "image_123" -> 123)
      const mediaIdMatch = mediaKey.match(/\d+$/);
      if (!mediaIdMatch) {
        throw new Error('Invalid media key format');
      }
      const imageId = parseInt(mediaIdMatch[0]);

      // Only assign tags if we have valid IDs and tagIds
      if (imageId && tagIds.length > 0) {
        const { data, error } = await supabase.rpc('assign_image_tags', {
          p_image_id: imageId,
          p_image_type: imageType,
          p_tag_ids: tagIds
        });

        if (error) throw error;

        toast({
          title: 'Tags Updated',
          description: 'Tags have been successfully assigned.',
        });

        // Refresh existing tags
        fetchExistingTags();
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to assign tags';
      console.error('Tag assignment error:', message);
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    }
  }, [fetchExistingTags]);

  // Get filtered tags for search
  const filteredTags = useMemo(() => {
    if (!tagSearch.trim()) return availableTags;
    return availableTags.filter(tag =>
      tag.name.toLowerCase().includes(tagSearch.toLowerCase())
    );
  }, [availableTags, tagSearch]);

  // Toggle tag selection
  const toggleTagSelection = useCallback((mediaKey: string, tagId: number) => {
    setSelectedTags(prev => {
      const currentTags = prev[mediaKey] || [];
      const newTags = currentTags.includes(tagId)
        ? currentTags.filter(id => id !== tagId)
        : [...currentTags, tagId];

      // Auto-assign tags when selection changes
      if (newTags.length > 0) {
        assignTags(mediaKey, mediaKey.startsWith('image_') ? 'image' : 'video', newTags);
      }

      return {
        ...prev,
        [mediaKey]: newTags
      };
    });
  }, [assignTags]);

  // Tag selector component with improved UX
  const TagSelector = ({ mediaKey, mediaType }: { mediaKey: string; mediaType: 'image' | 'video' }) => {
    const currentTags = selectedTags[mediaKey] || [];
    const [isOpen, setIsOpen] = React.useState(false);

    return (
      <div className="space-y-3">
        {/* Current tags - horizontal scrollable badges */}
        <div className="flex flex-wrap gap-2 min-h-[32px]">
          {currentTags.length > 0 ? (
            currentTags.map(tagId => {
              const tag = availableTags.find(t => t.id === tagId);
              if (!tag) return null;
              return (
                <Badge
                  key={tagId}
                  variant="secondary"
                  className="cursor-pointer hover:opacity-80 transition-opacity px-3 py-1"
                  style={{ backgroundColor: tag.color + '30', color: tag.color, borderColor: tag.color }}
                  onClick={() => toggleTagSelection(mediaKey, tagId)}
                >
                  {tag.name}
                  <X className="w-3 h-3 ml-2" />
                </Badge>
              );
            })
          ) : (
            <span className="text-sm text-gray-400 italic">No tags selected</span>
          )}
        </div>

        {/* Collapsible tag picker */}
        <div className="border rounded-lg">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors rounded-t-lg"
            type="button"
          >
            <span className="font-medium">
              {isOpen ? 'Hide' : 'Add/Remove'} Tags
            </span>
            <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>

          {isOpen && (
            <div className="border-t p-3 space-y-2">
              {/* Search input */}
              <Input
                placeholder="Search tags..."
                value={tagSearch}
                onChange={(e) => setTagSearch(e.target.value)}
                className="h-8"
              />

              {/* Tag list - single column with better spacing */}
              <div className="max-h-48 overflow-y-auto space-y-1">
                {filteredTags.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">No tags found</p>
                ) : (
                  filteredTags.map(tag => {
                    const isSelected = currentTags.includes(tag.id);
                    return (
                      <button
                        key={tag.id}
                        onClick={() => toggleTagSelection(mediaKey, tag.id)}
                        type="button"
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all ${
                          isSelected
                            ? 'bg-gray-100 dark:bg-gray-800 border-2 border-gray-400 dark:border-gray-600 shadow-sm'
                            : 'hover:bg-gray-50 dark:hover:bg-gray-800 border border-transparent'
                        }`}
                      >
                        {/* Checkbox indicator */}
                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                          isSelected 
                            ? 'bg-blue-500 border-blue-500' 
                            : 'border-gray-300 dark:border-gray-600'
                        }`}>
                          {isSelected && <Check className="w-3 h-3 text-white" />}
                        </div>

                        {/* Color indicator */}
                        <div
                          className="w-4 h-4 rounded-full border-2 border-white shadow-sm flex-shrink-0"
                          style={{ backgroundColor: tag.color }}
                        />

                        {/* Tag name */}
                        <span className="flex-1 text-left font-medium">{tag.name}</span>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const handleImageSelect = useCallback((index: number, file: File | null) => {
    setImages(prev => {
      const next = [...prev];
      next[index] = file;
      return next;
    });
  }, []);

  const handleDeleteImage = useCallback(async (imageId: number, position: number) => {
    if (!confirm('Are you sure you want to delete this image?')) return;

    setDeletingImages(prev => new Set([...prev, imageId]));
    try {
      // Handle special IDs for main trek images
      if (imageId === -1) {
        // This is the main image_url from trek_events table - we can't delete it directly
        // Instead, we'll just remove it from the local state
        setImages(prev => {
          const next = [...prev];
          next[position - 1] = null;
          return next;
        });
      } else if (imageId === -2) {
        // This is the image column from trek_events table - we can't delete it directly
        setImages(prev => {
          const next = [...prev];
          next[position - 1] = null;
          return next;
        });
      } else {
        // Delete from trek_event_images table
        const { error } = await supabase
          .from('trek_event_images')
          .delete()
          .eq('id', imageId);

        if (error) throw error;

        // Update local state
        setImages(prev => {
          const next = [...prev];
          next[position - 1] = null;
          return next;
        });
      }

      toast({
        title: 'Image Deleted',
        description: 'The image has been successfully removed.',
      });

      onRefresh();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to delete image';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setDeletingImages(prev => {
        const next = new Set(prev);
        next.delete(imageId);
        return next;
      });
    }
  }, [onRefresh]);

  const uploadMedia = useCallback(async (file: File, position?: number): Promise<{url: string, type: 'image' | 'video'}> => {
    const fileExt = file.name.split('.').pop();
    const isVideo = file.type.startsWith('video/');
    const timestamp = Date.now();
    const filePath = isVideo
      ? `treks/${trekId}/videos/${timestamp}.${fileExt}`
      : `treks/${trekId}/${timestamp}_${position || 1}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('trek-images')
      .upload(filePath, file, { upsert: true, cacheControl: '3600' });

    if (uploadError) throw uploadError;

    const { data: publicUrlData } = supabase.storage
      .from('trek-images')
      .getPublicUrl(filePath);

    return {
      url: publicUrlData.publicUrl,
      type: isVideo ? 'video' : 'image'
    };
  }, [trekId]);

  const handleVideoSelect = useCallback((file: File | null) => {
    if (file) {
      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: 'File Too Large',
          description: 'Video must be smaller than 10MB.',
          variant: 'destructive',
        });
        return;
      }
      setVideo(file);
    } else {
      setVideo(null);
    }
  }, []);

  const handleDeleteVideo = useCallback(async () => {
    if (!currentExistingVideo) return;

    if (!confirm('Are you sure you want to delete this video?')) return;

    setDeletingVideo(true);
    try {
      const { error } = await supabase
        .from('trek_event_videos')
        .delete()
        .eq('id', currentExistingVideo.id);

      if (error) throw error;

      setCurrentExistingVideo(null);
      toast({
        title: 'Video Deleted',
        description: 'The video has been successfully removed.',
      });

      onRefresh();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to delete video';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setDeletingVideo(false);
    }
  }, [currentExistingVideo, onRefresh]);

  const handleUpload = useCallback(async () => {
    if (images.every(img => img === null) && !video) {
      toast({
        title: 'No Media Selected',
        description: 'Please select at least one image or video to upload.',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);
    try {
      // Delete existing video if being replaced
      if (currentExistingVideo && !video) {
        await supabase.from('trek_event_videos').delete().eq('id', currentExistingVideo.id);
      }

      // Delete existing images that are being replaced
      for (let i = 0; i < 5; i++) {
        if (images[i] === null) {
          const existingImage = existingImages.find(img => img.position === i + 1);
          if (existingImage) {
            await supabase.from('trek_event_images').delete().eq('id', existingImage.id);
          }
        }
      }

      // Upload video if selected
      if (video) {
        const { url } = await uploadMedia(video);

        if (currentExistingVideo) {
          // Update existing video
          await supabase
            .from('trek_event_videos')
            .update({
              video_url: url,
              file_size_mb: (video.size / (1024 * 1024)).toFixed(2)
            })
            .eq('id', currentExistingVideo.id);
        } else {
          // Insert new video
          await supabase
            .from('trek_event_videos')
            .insert({
              trek_id: trekId,
              video_url: url,
              file_size_mb: (video.size / (1024 * 1024)).toFixed(2)
            });
        }
      }

      // Upload new images - handle position reordering
      const uploads = images
        .map((file, index) => ({ file, position: index + 1 }))
        .filter(({ file }) => file !== null && file instanceof File);

      for (const { file, position } of uploads) {
        if (file instanceof File) {
          const { url } = await uploadMedia(file, position);

          // Check if position already exists (considering reordering)
          const existingImage = existingImages.find(img => img.position === position);

          if (existingImage) {
            // Handle special IDs for main trek images
            if (existingImage.id === -1 || existingImage.id === -2) {
              // These are main trek images - we can't update them directly in trek_events table
              // For now, just skip updating them
              console.log('Cannot update main trek image through this interface');
            } else {
              // Update existing record in trek_event_images table
              await supabase
                .from('trek_event_images')
                .update({ image_url: url })
                .eq('id', existingImage.id);
            }
          } else {
            // Insert new record
            await supabase
              .from('trek_event_images')
              .insert({
                trek_id: trekId,
                image_url: url,
                position: position,
              });
          }
        }
      }

      // Handle position updates for existing images that were reordered
      for (const existingImage of existingImages) {
        if (existingImage.id > 0) { // Only update real trek_event_images records
          // Find the current position in the images array
          const currentIndex = images.findIndex(img => typeof img === 'string' && img === existingImage.image_url);
          if (currentIndex !== -1) {
            const newPosition = currentIndex + 1;
            if (newPosition !== existingImage.position) {
              await supabase
                .from('trek_event_images')
                .update({ position: newPosition })
                .eq('id', existingImage.id);
            }
          }
        }
      }

      toast({
        title: 'Media Updated',
        description: 'Trek media has been successfully updated.',
      });

      onRefresh();
      onClose();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to upload media';
      toast({
        title: 'Upload Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  }, [images, video, existingImages, currentExistingVideo, trekId, onRefresh, onClose, uploadMedia]);

  const SortableImageSlot = ({ position }: { position: number }) => {
    const index = position - 1;
    const image = images[index];
    const existingImage = existingImages.find(img => img.position === position);

    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: position });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
    };

    return (
      <Card ref={setNodeRef} style={style} className={`relative ${isDragging ? 'z-10' : ''}`}>
        <CardContent className="p-4">
          {/* Drag handle */}
          <div
            {...attributes}
            {...listeners}
            className="absolute top-2 right-2 z-10 bg-white dark:bg-gray-800 rounded-full p-1 shadow-md cursor-grab active:cursor-grabbing opacity-60 hover:opacity-100"
          >
            <GripVertical className="w-4 h-4" />
          </div>

          {/* 1. Image preview at top */}
          <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden mb-4">
            {image ? (
              image instanceof File ? (
                <img
                  src={URL.createObjectURL(image)}
                  alt={`Upload slot ${position}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src={image}
                  alt={`Current image ${position}`}
                  className="w-full h-full object-cover"
                />
              )
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <Upload className="w-8 h-8 mx-auto mb-2" />
                  <span className="text-sm">Click to upload</span>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-3">
            {/* 2. Position label */}
            <div className="text-center">
              <span className="text-sm font-medium bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                Position {position}
              </span>
            </div>

            {/* 3. Add and delete buttons */}
            <div className="flex justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = 'image/*';
                  input.onchange = (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (file) handleImageSelect(index, file);
                  };
                  input.click();
                }}
              >
                <Plus className="w-4 h-4" />
              </Button>

              {existingImage && (
                <Button
                  variant="outline"
                  size="sm"
                  disabled={deletingImages.has(existingImage.id)}
                  onClick={() => handleDeleteImage(existingImage.id, position)}
                >
                  {deletingImages.has(existingImage.id) ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </Button>
              )}
            </div>

            {/* 4. Tag management below */}
            {existingImage && (
              <div className="border-t pt-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Tags</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowTagSelector(showTagSelector === `image_${existingImage.id}` ? null : `image_${existingImage.id}`)}
                  >
                    <Tag className="w-3 h-3 mr-1" />
                    Manage
                  </Button>
                </div>

                {/* Current tags display */}
                {(selectedTags[`image_${existingImage.id}`] || []).length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {(selectedTags[`image_${existingImage.id}`] || []).map(tagId => {
                      const tag = availableTags.find(t => t.id === tagId);
                      if (!tag) return null;
                      return (
                        <Badge
                          key={tagId}
                          variant="outline"
                          className="text-xs"
                          style={{ borderColor: tag.color, color: tag.color }}
                        >
                          {tag.name}
                        </Badge>
                      );
                    })}
                  </div>
                )}

                {/* Tag selector */}
                {showTagSelector === `image_${existingImage.id}` && (
                  <TagSelector mediaKey={`image_${existingImage.id}`} mediaType="image" />
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Images for "{trekName}"</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Upload up to 5 images for this trek. Images will be displayed in the gallery and on trek cards.
              <br />
              <strong>Drag and drop</strong> the grip handles to reorder image positions.
            </p>

            <div className="space-y-6">
              {/* Images Section */}
              <div>
                <h3 className="text-lg font-medium mb-3">Images (up to 5)</h3>
                <SortableContext items={[1, 2, 3, 4, 5]} strategy={rectSortingStrategy}>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                    {[1, 2, 3, 4, 5].map(position => (
                      <SortableImageSlot key={position} position={position} />
                    ))}
                  </div>
                </SortableContext>
              </div>

            {/* Video Section */}
            <div>
              <h3 className="text-lg font-medium mb-3">Video (optional, max 1)</h3>
              <Card className="max-w-md">
                <CardContent className="p-4">
                  <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden mb-3">
                    {currentExistingVideo ? (
                      <video
                        src={currentExistingVideo.video_url}
                        className="w-full h-full object-cover"
                        controls
                      />
                    ) : video ? (
                      <video
                        src={URL.createObjectURL(video)}
                        className="w-full h-full object-cover"
                        controls
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <div className="text-center">
                          <Video className="w-8 h-8 mx-auto mb-2" />
                          <span className="text-sm">Click to upload video</span>
                          <p className="text-xs mt-1">MP4, WebM up to 10MB</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Trek Video</span>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const input = document.createElement('input');
                            input.type = 'file';
                            input.accept = 'video/*';
                            input.onchange = (e) => {
                              const file = (e.target as HTMLInputElement).files?.[0];
                              if (file) handleVideoSelect(file);
                            };
                            input.click();
                          }}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>

                        {currentExistingVideo && (
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={deletingVideo}
                            onClick={handleDeleteVideo}
                          >
                            {deletingVideo ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Tag management for existing video */}
                    {currentExistingVideo && (
                      <div className="border-t pt-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Tags</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowTagSelector(showTagSelector === `video_${currentExistingVideo.id}` ? null : `video_${currentExistingVideo.id}`)}
                          >
                            <Tag className="w-3 h-3 mr-1" />
                            Manage
                          </Button>
                        </div>

                        {/* Current tags display */}
                        {(selectedTags[`video_${currentExistingVideo.id}`] || []).length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {(selectedTags[`video_${currentExistingVideo.id}`] || []).map(tagId => {
                              const tag = availableTags.find(t => t.id === tagId);
                              if (!tag) return null;
                              return (
                                <Badge
                                  key={tagId}
                                  variant="outline"
                                  className="text-xs"
                                  style={{ borderColor: tag.color, color: tag.color }}
                                >
                                  {tag.name}
                                </Badge>
                              );
                            })}
                          </div>
                        )}

                        {/* Tag selector */}
                        {showTagSelector === `video_${currentExistingVideo.id}` && (
                          <TagSelector mediaKey={`video_${currentExistingVideo.id}`} mediaType="video" />
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={uploading || images.every(img => img === null)}
            >
              {uploading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              {uploading ? 'Uploading...' : 'Save Images'}
            </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DndContext>
  );
}
