import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Search, Check, Loader2, Sparkles } from 'lucide-react';

interface AvatarOption {
  key: string;
  name: string;
  category: 'animal' | 'bird' | 'insect';
  image_url: string;
  sort_order: number;
}

interface AvatarPickerProps {
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const AvatarPicker: React.FC<AvatarPickerProps> = ({
  trigger,
  open,
  onOpenChange
}) => {
  const { user, userProfile, fetchUserProfile } = useAuth();
  const { toast } = useToast();
  const [avatars, setAvatars] = useState<AvatarOption[]>([]);
  const [filteredAvatars, setFilteredAvatars] = useState<AvatarOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'animal' | 'bird' | 'insect'>('all');
  const [saving, setSaving] = useState<string | null>(null);
  const [internalOpen, setInternalOpen] = useState(false);
  const [imageLoadStatus, setImageLoadStatus] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchAvatars();
  }, []);

  useEffect(() => {
    filterAvatars();
  }, [avatars, searchQuery, selectedCategory, imageLoadStatus]);

  // Helper function to check if image exists
  const checkImageExists = (imageUrl: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = imageUrl;
    });
  };

  const fetchAvatars = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('get_avatar_catalog');

      if (error) {
        console.error('Error fetching avatars:', error);
        // For now, use fallback avatar data if database isn't available
        const fallbackAvatars: AvatarOption[] = [
          {
            key: 'bengal_tiger',
            name: 'Bengal Tiger',
            category: 'animal',
            image_url: '/avatars/animals/bengal_tiger.svg',
            sort_order: 1
          },
          {
            key: 'indian_elephant',
            name: 'Indian Elephant',
            category: 'animal',
            image_url: '/avatars/animals/indian_elephant.svg',
            sort_order: 2
          },
          {
            key: 'indian_peacock',
            name: 'Indian Peacock',
            category: 'bird',
            image_url: '/avatars/birds/indian_peacock.svg',
            sort_order: 1
          },
          {
            key: 'atlas_moth',
            name: 'Atlas Moth',
            category: 'insect',
            image_url: '/avatars/insects/atlas_moth.svg',
            sort_order: 1
          }
        ];
        
        // Check which fallback images actually exist
        const validAvatars: AvatarOption[] = [];
        for (const avatar of fallbackAvatars) {
          const exists = await checkImageExists(avatar.image_url);
          if (exists) {
            validAvatars.push(avatar);
          }
        }
        setAvatars(validAvatars);
        return;
      }

      // For database avatars, check image existence
      const validAvatars: AvatarOption[] = [];
      for (const avatar of data || []) {
        const exists = await checkImageExists(avatar.image_url);
        if (exists) {
          validAvatars.push(avatar);
        }
      }
      setAvatars(validAvatars);
    } catch (error) {
      console.error('Error fetching avatars:', error);
      // Use only working fallback avatars
      const fallbackAvatars: AvatarOption[] = [
        {
          key: 'bengal_tiger',
          name: 'Bengal Tiger',
          category: 'animal',
          image_url: '/avatars/animals/bengal_tiger.svg',
          sort_order: 1
        },
        {
          key: 'indian_elephant',
          name: 'Indian Elephant',
          category: 'animal',
          image_url: '/avatars/animals/indian_elephant.svg',
          sort_order: 2
        },
        {
          key: 'indian_peacock',
          name: 'Indian Peacock',
          category: 'bird',
          image_url: '/avatars/birds/indian_peacock.svg',
          sort_order: 1
        },
        {
          key: 'atlas_moth',
          name: 'Atlas Moth',
          category: 'insect',
          image_url: '/avatars/insects/atlas_moth.svg',
          sort_order: 1
        }
      ];
      
      // Check which fallback images actually exist
      const validAvatars: AvatarOption[] = [];
      for (const avatar of fallbackAvatars) {
        const exists = await checkImageExists(avatar.image_url);
        if (exists) {
          validAvatars.push(avatar);
        }
      }
      setAvatars(validAvatars);
    } finally {
      setLoading(false);
    }
  };

  const filterAvatars = () => {
    let filtered = avatars.filter(avatar => {
      // Only show avatars with loaded images or not yet attempted
      return imageLoadStatus[avatar.key] !== false;
    });

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(avatar => avatar.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(avatar =>
        avatar.name.toLowerCase().includes(query) ||
        avatar.key.toLowerCase().includes(query)
      );
    }

    // Sort by category, then sort_order, then name
    filtered.sort((a, b) => {
      if (a.category !== b.category) {
        const categoryOrder = { animal: 0, bird: 1, insect: 2 };
        return categoryOrder[a.category] - categoryOrder[b.category];
      }
      if (a.sort_order !== b.sort_order) {
        return a.sort_order - b.sort_order;
      }
      return a.name.localeCompare(b.name);
    });

    setFilteredAvatars(filtered);
  };

  const handleAvatarSelect = async (avatarKey: string) => {
    if (!user) return;

    try {
      setSaving(avatarKey as string);
      const { data, error } = await supabase.rpc('set_user_avatar', {
        p_avatar_key: avatarKey
      });

      if (error) {
        console.error('Error setting avatar:', error);
        toast({
          title: "Error",
          description: "Could not update avatar. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // Refresh user profile to get updated avatar_url
      await fetchUserProfile();

      toast({
        title: "Avatar Updated",
        description: "Your avatar has been updated successfully!",
        variant: "default",
      });
    } catch (error) {
      console.error('Error setting avatar:', error);
      toast({
        title: "Error",
        description: "Could not update avatar. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(null);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'animal': return '🦁';
      case 'bird': return '🐦';
      case 'insect': return '🦋';
      default: return '❓';
    }
  };

  const getCategoryBadgeVariant = (category: string) => {
    switch (category) {
      case 'animal': return 'default';
      case 'bird': return 'secondary';
      case 'insect': return 'outline';
      default: return 'default';
    }
  };

  // Handle open state (controlled or uncontrolled)
  const isOpen = open !== undefined ? open : internalOpen;
  const setIsOpen = onOpenChange || setInternalOpen;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Loading avatars...</span>
      </div>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {trigger && (
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
      )}
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader className="pb-2">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-4 w-4" />
            Choose Avatar
          </DialogTitle>
        </DialogHeader>

        <div className="mt-2">
          <Tabs value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as any)} className="w-full">
            <TabsList className="grid w-full grid-cols-4 h-8">
              <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
              <TabsTrigger value="animal" className="text-xs">Animals</TabsTrigger>
              <TabsTrigger value="bird" className="text-xs">Birds</TabsTrigger>
              <TabsTrigger value="insect" className="text-xs">Insects</TabsTrigger>
            </TabsList>

            <TabsContent value={selectedCategory} className="mt-4">
              {filteredAvatars.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No avatars found.
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                  {filteredAvatars.map((avatar) => (
                    <div key={avatar.key} className="flex flex-col items-center space-y-1">
                      <div className="relative">
                        <Avatar className="h-16 w-16 cursor-pointer hover:ring-2 hover:ring-primary transition-all">
                          <AvatarImage
                            src={avatar.image_url}
                            alt={avatar.name}
                            onLoad={() => {
                              setImageLoadStatus(prev => ({ ...prev, [avatar.key]: true }));
                            }}
                            onError={() => {
                              setImageLoadStatus(prev => ({ ...prev, [avatar.key]: false }));
                            }}
                          />
                          <AvatarFallback className="text-lg">
                            {getCategoryIcon(avatar.category)}
                          </AvatarFallback>
                        </Avatar>

                        {userProfile?.avatar_url === avatar.image_url && (
                          <div className="absolute -top-1 -right-1 bg-success rounded-full p-0.5">
                            <Check className="h-2.5 w-2.5 text-white" />
                          </div>
                        )}

                        {saving === avatar.key && (
                          <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                            <Loader2 className="h-3 w-3 animate-spin text-white" />
                          </div>
                        )}
                      </div>

                      <Button
                        size="sm"
                        variant={userProfile?.avatar_url === avatar.image_url ? "default" : "outline"}
                        disabled={saving === avatar.key}
                        onClick={() => handleAvatarSelect(avatar.key)}
                        className="h-7 px-2 text-xs w-full"
                      >
                        {saving === avatar.key ? (
                          <Loader2 className="h-2.5 w-2.5 animate-spin mr-1" />
                        ) : userProfile?.avatar_url === avatar.image_url ? (
                          'Current'
                        ) : (
                          'Select'
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};
