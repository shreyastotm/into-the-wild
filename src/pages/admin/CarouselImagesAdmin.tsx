import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Trash2, Plus, Upload, Image as ImageIcon, Loader2 } from 'lucide-react';
import { getHomeHeroImages, setHomeHeroImages } from '@/lib/siteSettings';

interface UploadedImage {
  id: number;
  image_url: string;
  trek_id: number;
  trek_name: string;
}

interface CarouselImage {
  url: string;
  order: number;
  id?: number;
}

export default function CarouselImagesAdmin() {
  const { toast } = useToast();
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [carouselImages, setCarouselImages] = useState<CarouselImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState('');
  const [selectedImagePosition, setSelectedImagePosition] = useState<number>(1);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch uploaded images from trek events
      const { data: imagesData, error: imagesError } = await supabase
        .from('trek_events')
        .select(`
          trek_id,
          image_url,
          name
        `)
        .not('image_url', 'is', null)
        .order('name', { ascending: true });

      if (imagesError) {
        console.error('Error fetching images:', imagesError);
        throw imagesError;
      }

      console.log('Images data:', imagesData);

      const formattedImages: UploadedImage[] = (imagesData || []).map(img => ({
        id: img.trek_id,
        image_url: img.image_url || '',
        trek_id: img.trek_id,
        trek_name: img.name || 'Unknown Trek'
      }));

      setUploadedImages(formattedImages);

      // Fetch current carousel images
      const heroImages = await getHomeHeroImages();
      const carouselImagesWithOrder = heroImages.map((url, index) => ({
        url,
        order: index + 1
      }));

      setCarouselImages(carouselImagesWithOrder);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load carousel images data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddImage = () => {
    if (!selectedImageUrl) {
      toast({
        title: "Error",
        description: "Please select an image.",
        variant: "destructive",
      });
      return;
    }

    const newImage: CarouselImage = {
      url: selectedImageUrl,
      order: selectedImagePosition
    };

    setCarouselImages(prev => {
      const filtered = prev.filter(img => img.order !== selectedImagePosition);
      return [...filtered, newImage].sort((a, b) => a.order - b.order);
    });

    setShowAddDialog(false);
    setSelectedImageUrl('');
    setSelectedImagePosition(1);
  };

  const handleRemoveImage = (order: number) => {
    setCarouselImages(prev => prev.filter(img => img.order !== order));
  };

  const handleReorder = (fromOrder: number, toOrder: number) => {
    setCarouselImages(prev => {
      const newImages = [...prev];
      const fromIndex = newImages.findIndex(img => img.order === fromOrder);
      const toIndex = newImages.findIndex(img => img.order === toOrder);

      if (fromIndex !== -1 && toIndex !== -1) {
        [newImages[fromIndex], newImages[toIndex]] = [newImages[toIndex], newImages[fromIndex]];
      }

      return newImages.map((img, index) => ({ ...img, order: index + 1 }));
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const imageUrls = carouselImages.map(img => img.url);
      await setHomeHeroImages(imageUrls);

      toast({
        title: "Success",
        description: "Carousel images updated successfully!",
      });
    } catch (error) {
      console.error('Error saving carousel images:', error);
      toast({
        title: "Error",
        description: "Failed to save carousel images.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Home Hero Images</h1>
          <p className="text-gray-600">
            Manage the 5 images that appear in the mobile home carousel.
          </p>
        </div>

        <div className="flex gap-2">
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Image
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add Carousel Image</DialogTitle>
                <DialogDescription>
                  Select an image from uploaded event photos to add to the home carousel.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="image-select">Select Image</Label>
                  <Select value={selectedImageUrl} onValueChange={setSelectedImageUrl}>
                    <SelectTrigger id="image-select">
                      <SelectValue placeholder="Choose an image..." />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {uploadedImages.map((image) => (
                        <SelectItem key={image.id} value={image.image_url}>
                          <div className="flex items-center gap-2">
                            <img
                              src={image.image_url}
                              alt=""
                              className="w-8 h-8 object-cover rounded"
                            />
                            <span className="truncate">{image.trek_name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="position">Position (1-5)</Label>
                  <Select value={selectedImagePosition.toString()} onValueChange={(value) => setSelectedImagePosition(parseInt(value))}>
                    <SelectTrigger id="position">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map((pos) => (
                        <SelectItem key={pos} value={pos.toString()}>
                          Position {pos}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddImage}>
                  Add Image
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      </div>

      {/* Current Carousel Images */}
      <Card>
        <CardHeader>
          <CardTitle>Current Carousel Images</CardTitle>
          <CardDescription>
            These images will appear in the mobile home carousel (5 maximum).
          </CardDescription>
        </CardHeader>
        <CardContent>
          {carouselImages.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No carousel images configured.</p>
              <p className="text-sm">Add images from uploaded event photos above.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {carouselImages.map((image, index) => (
                <div key={index} className="relative group">
                  <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={image.url}
                      alt={`Carousel image ${image.order}`}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="absolute top-2 left-2">
                    <Badge variant="secondary">
                      #{image.order}
                    </Badge>
                  </div>

                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRemoveImage(image.order)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Available Images */}
      <Card>
        <CardHeader>
          <CardTitle>Available Event Images</CardTitle>
          <CardDescription>
            Images uploaded to events that can be used in the carousel.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {uploadedImages.length === 0 ? (
            <div className="text-center py-8">
              <ImageIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600 mb-2">No images available</p>
              <p className="text-sm text-gray-500">
                Upload images to your events first to make them available for the carousel.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {uploadedImages.slice(0, 12).map((image) => (
                  <div key={image.id} className="relative group cursor-pointer" onClick={() => {
                    setSelectedImageUrl(image.image_url);
                    setSelectedImagePosition(carouselImages.length + 1);
                    setShowAddDialog(true);
                  }}>
                    <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
                      <img
                        src={image.image_url}
                        alt={image.trek_name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        onError={(e) => {
                          console.error('Image failed to load:', image.image_url);
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>

                    <div className="mt-2">
                      <p className="text-sm font-medium truncate">{image.trek_name}</p>
                    </div>
                  </div>
                ))}
              </div>

              {uploadedImages.length > 12 && (
                <div className="text-center mt-4">
                  <p className="text-sm text-gray-500">
                    Showing 12 of {uploadedImages.length} available images
                  </p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
