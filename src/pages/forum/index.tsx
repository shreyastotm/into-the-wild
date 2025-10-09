import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageSquare, Users, Clock, Pin, Lock, Plus, Loader2, Tag as TagIcon, X } from 'lucide-react';

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

export default function ForumHome() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [threads, setThreads] = useState<ForumThread[]>([]);
  const [tags, setTags] = useState<ForumTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
  const [newThreadTitle, setNewThreadTitle] = useState('');
  const [newThreadContent, setNewThreadContent] = useState('');
  const [creatingThread, setCreatingThread] = useState(false);

  useEffect(() => {
    fetchForumData();
  }, []);

  const fetchForumData = async () => {
    try {
      setLoading(true);

      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('forum_categories')
        .select('*')
        .order('sort_order');

      if (categoriesError) {
        console.error('Error fetching categories:', categoriesError);
        toast({
          title: "Error",
          description: "Could not load forum categories.",
          variant: "destructive",
        });
        return;
      }

      // Fetch tags
      const { data: tagsData, error: tagsError } = await supabase.rpc('get_forum_tags');

      if (tagsError) {
        console.error('Error fetching tags:', tagsError);
      }

      // Fetch recent threads with author info
      const { data: threadsData, error: threadsError } = await supabase
        .from('forum_threads')
        .select(`
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
        `)
        .order('pinned', { ascending: false })
        .order('updated_at', { ascending: false })
        .limit(20);

      if (threadsError) {
        console.error('Error fetching threads:', threadsError);
        toast({
          title: "Error",
          description: "Could not load forum threads.",
          variant: "destructive",
        });
        return;
      }

      // Fetch tags for each thread
      const threadsWithTags = await Promise.all(
        (threadsData || []).map(async (thread) => {
          const { data: threadTags } = await supabase
            .from('forum_thread_tags')
            .select(`
              forum_tags (
                id,
                name,
                slug,
                color,
                sort_order
              )
            `)
            .eq('thread_id', thread.id);

          return {
            ...thread,
            author_name: thread.users?.full_name || 'Unknown User',
            author_avatar: thread.users?.avatar_url || null,
            tags: threadTags?.map((tt: any) => tt.forum_tags).filter(Boolean) || []
          };
        })
      );

      setCategories(categoriesData || []);
      setTags(tagsData || []);
      setThreads(threadsWithTags);
    } catch (error) {
      console.error('Error fetching forum data:', error);
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
    if (!user || !selectedCategoryId || !newThreadTitle.trim() || !newThreadContent.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }

    if (selectedTagIds.length === 0) {
      toast({
        title: "Missing Tags",
        description: "Please select at least one tag for your thread.",
        variant: "destructive",
      });
      return;
    }

    try {
      setCreatingThread(true);
      const { data, error } = await supabase.rpc('create_forum_thread_with_tags', {
        p_category_id: selectedCategoryId,
        p_title: newThreadTitle.trim(),
        p_content: newThreadContent.trim(),
        p_tag_ids: selectedTagIds,
      });

      if (error) {
        if (error.message.includes('rate limit')) {
          toast({
            title: "Rate Limit Exceeded",
            description: "Please wait before creating another thread.",
            variant: "destructive",
          });
        } else {
          throw error;
        }
        return;
      }

      toast({
        title: "Success",
        description: "Thread created successfully!",
      });

      setShowCreateDialog(false);
      setNewThreadTitle('');
      setNewThreadContent('');
      setSelectedCategoryId(null);
      setSelectedTagIds([]);
      
      // Refresh forum data or navigate to new thread
      if (data?.id) {
        navigate(`/forum/t/${data.id}`);
      } else {
        fetchForumData();
      }
    } catch (error) {
      console.error('Error creating thread:', error);
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
    setSelectedTagIds(prev => {
      if (prev.includes(tagId)) {
        return prev.filter(id => id !== tagId);
      } else {
        return [...prev, tagId];
      }
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="text-lg">Loading forum...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Community Forum</h1>
          <p className="text-gray-600">
            Connect with fellow trekkers, share experiences, and get advice from the community.
          </p>
        </div>
        
        {user && (
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Thread
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Thread</DialogTitle>
                <DialogDescription>
                  Start a new discussion in the community forum.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={selectedCategoryId?.toString()}
                    onValueChange={(value) => setSelectedCategoryId(parseInt(value))}
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id.toString()}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Tags (Select at least one)</Label>
                  <div className="flex flex-wrap gap-2 p-3 border rounded-md max-h-48 overflow-y-auto">
                    {tags.map((tag) => (
                      <Badge
                        key={tag.id}
                        variant={selectedTagIds.includes(tag.id) ? "default" : "outline"}
                        className="cursor-pointer hover:opacity-80 transition-opacity"
                        style={{
                          backgroundColor: selectedTagIds.includes(tag.id) ? tag.color : 'transparent',
                          borderColor: tag.color,
                          color: selectedTagIds.includes(tag.id) ? 'white' : tag.color
                        }}
                        onClick={() => toggleTag(tag.id)}
                      >
                        <TagIcon className="h-3 w-3 mr-1" />
                        {tag.name}
                        {selectedTagIds.includes(tag.id) && (
                          <X className="h-3 w-3 ml-1" />
                        )}
                      </Badge>
                    ))}
                  </div>
                  {selectedTagIds.length > 0 && (
                    <p className="text-xs text-gray-500">
                      {selectedTagIds.length} tag{selectedTagIds.length > 1 ? 's' : ''} selected
                    </p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="title">Thread Title</Label>
                  <Input
                    id="title"
                    placeholder="Enter thread title..."
                    value={newThreadTitle}
                    onChange={(e) => setNewThreadTitle(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="content">Initial Post</Label>
                  <Textarea
                    id="content"
                    placeholder="Write your message..."
                    value={newThreadContent}
                    onChange={(e) => setNewThreadContent(e.target.value)}
                    rows={6}
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowCreateDialog(false)}
                  disabled={creatingThread}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateThread}
                  disabled={creatingThread || !selectedCategoryId || selectedTagIds.length === 0 || !newThreadTitle.trim() || !newThreadContent.trim()}
                >
                  {creatingThread ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Thread
                    </>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Categories */}
      <div className="grid gap-6 mb-8">
        {categories.map((category) => {
          const categoryThreads = threads.filter(thread => thread.category_id === category.id);

          return (
            <Card key={category.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Link
                        to={`/forum/c/${category.slug}`}
                        className="hover:text-primary transition-colors"
                      >
                        {category.name}
                      </Link>
                    </CardTitle>
                    {category.description && (
                      <CardDescription>{category.description}</CardDescription>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <MessageSquare className="h-4 w-4" />
                      {categoryThreads.length} threads
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                {categoryThreads.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No threads in this category yet.</p>
                    <Button asChild className="mt-4">
                      <Link to={`/forum/c/${category.slug}`}>
                        Start a Discussion
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {categoryThreads.slice(0, 3).map((thread) => (
                      <div key={thread.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={thread.author_avatar || undefined} />
                          <AvatarFallback>
                            {thread.author_name?.charAt(0)?.toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {thread.pinned && (
                              <Badge variant="secondary" className="text-xs">
                                <Pin className="h-3 w-3 mr-1" />
                                Pinned
                              </Badge>
                            )}
                            {thread.locked && (
                              <Badge variant="outline" className="text-xs">
                                <Lock className="h-3 w-3 mr-1" />
                                Locked
                              </Badge>
                            )}
                          </div>

                          <Link
                            to={`/forum/t/${thread.id}`}
                            className="font-medium text-sm hover:text-primary transition-colors block truncate"
                          >
                            {thread.title}
                          </Link>

                          {thread.tags && thread.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {thread.tags.slice(0, 3).map((tag) => (
                                <Badge
                                  key={tag.id}
                                  variant="outline"
                                  className="text-xs px-1.5 py-0"
                                  style={{
                                    borderColor: tag.color,
                                    color: tag.color
                                  }}
                                >
                                  {tag.name}
                                </Badge>
                              ))}
                              {thread.tags.length > 3 && (
                                <Badge variant="outline" className="text-xs px-1.5 py-0">
                                  +{thread.tags.length - 3}
                                </Badge>
                              )}
                            </div>
                          )}

                          <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                            <span>by {thread.author_name}</span>
                            <span>•</span>
                            <span>{formatDate(thread.created_at)}</span>
                          </div>
                        </div>
                      </div>
                    ))}

                    {categoryThreads.length > 3 && (
                      <div className="text-center pt-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/forum/c/${category.slug}`}>
                            View All Threads ({categoryThreads.length})
                          </Link>
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions for non-authenticated users */}
      {!user && (
        <div className="text-center">
          <p className="text-gray-600 mb-4">
            Sign in to start discussions and join the conversation.
          </p>
          <Button asChild>
            <Link to="/login">
              Sign In
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
