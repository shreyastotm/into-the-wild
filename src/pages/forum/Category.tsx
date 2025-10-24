import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  MessageSquare,
  Pin,
  Lock,
  Plus,
  ArrowLeft,
  Loader2,
  Tag as TagIcon,
  X,
} from "lucide-react";
import { Label } from "@/components/ui/label";

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
}

export default function ForumCategory() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [category, setCategory] = useState<ForumCategory | null>(null);
  const [threads, setThreads] = useState<ForumThread[]>([]);
  const [tags, setTags] = useState<ForumTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [creatingThread, setCreatingThread] = useState(false);
  const [newThreadTitle, setNewThreadTitle] = useState("");
  const [newThreadContent, setNewThreadContent] = useState("");
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchCategoryData();
    }
  }, [slug]);

  const fetchCategoryData = async () => {
    if (!slug) return;

    try {
      setLoading(true);

      // Fetch category
      const { data: categoryData, error: categoryError } = await supabase
        .from("forum_categories")
        .select("*")
        .eq("slug", slug)
        .single();

      if (categoryError) {
        console.error("Error fetching category:", categoryError);
        toast({
          title: "Error",
          description: "Category not found.",
          variant: "destructive",
        });
        navigate("/forum");
        return;
      }

      // Fetch tags
      const { data: tagsData, error: tagsError } =
        await supabase.rpc("get_forum_tags");
      if (tagsError) {
        console.error("Error fetching tags:", tagsError);
      }

      // Fetch threads in this category
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
        .eq("category_id", categoryData.id)
        .order("pinned", { ascending: false })
        .order("updated_at", { ascending: false });

      if (threadsError) {
        console.error("Error fetching threads:", threadsError);
        toast({
          title: "Error",
          description: "Could not load threads.",
          variant: "destructive",
        });
        return;
      }

      // Transform threads data
      const transformedThreads =
        threadsData?.map((thread) => ({
          ...thread,
          author_name: thread.users?.full_name || "Unknown User",
          author_avatar: thread.users?.avatar_url || null,
        })) || [];

      setCategory(categoryData);
      setTags(tagsData || []);
      setThreads(transformedThreads);
    } catch (error) {
      console.error("Error fetching category data:", error);
      toast({
        title: "Error",
        description: "Could not load category data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateThread = async () => {
    if (
      !user ||
      !category ||
      !newThreadTitle.trim() ||
      !newThreadContent.trim()
    ) {
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

      // Use the new rate-limited function with tags
      const { data: threadData, error: threadError } = await supabase.rpc(
        "create_forum_thread_with_tags",
        {
          p_category_id: category.id,
          p_title: newThreadTitle.trim(),
          p_content: newThreadContent.trim(),
          p_tag_ids: selectedTagIds,
        },
      );

      if (threadError) {
        console.error("Error creating thread:", threadError);
        if (threadError.message.includes("rate limit")) {
          toast({
            title: "Rate Limit Exceeded",
            description: "Please wait before creating another thread.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error",
            description:
              threadError.message ||
              "Could not create thread. Please try again.",
            variant: "destructive",
          });
        }
        return;
      }

      // Reset form and close dialog
      setNewThreadTitle("");
      setNewThreadContent("");
      setSelectedTagIds([]);
      setShowCreateDialog(false);

      toast({
        title: "Thread Created",
        description: "Your thread has been created successfully!",
        variant: "default",
      });

      // Navigate to new thread if available
      if (threadData?.id) {
        navigate(`/forum/t/${threadData.id}`);
      } else {
        // Refresh the page to show the new thread
        window.location.reload();
      }
    } catch (error) {
      console.error("Error creating thread:", error);
      toast({
        title: "Error",
        description: "Could not create thread. Please try again.",
        variant: "destructive",
      });
    } finally {
      setCreatingThread(false);
    }
  };

  const toggleTag = (tagId: number) => {
    setSelectedTagIds((prev) => {
      if (prev.includes(tagId)) {
        return prev.filter((id) => id !== tagId);
      } else {
        return [...prev, tagId];
      }
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <div className="text-lg">Loading category...</div>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="text-lg text-gray-500">Category not found.</div>
          <Button asChild className="mt-4">
            <Link to="/forum">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Forum
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="outline" size="sm" asChild>
            <Link to="/forum">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Forum
            </Link>
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">{category.name}</h1>
            {category.description && (
              <p className="text-gray-600">{category.description}</p>
            )}
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
                    Start a new discussion in {category.name}.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Tags (Select at least one)</Label>
                    <div className="flex flex-wrap gap-2 p-3 border rounded-md max-h-48 overflow-y-auto">
                      {tags.map((tag) => (
                        <Badge
                          key={tag.id}
                          variant={
                            selectedTagIds.includes(tag.id)
                              ? "default"
                              : "outline"
                          }
                          className="cursor-pointer hover:opacity-80 transition-opacity"
                          style={{
                            backgroundColor: selectedTagIds.includes(tag.id)
                              ? tag.color
                              : "transparent",
                            borderColor: tag.color,
                            color: selectedTagIds.includes(tag.id)
                              ? "white"
                              : tag.color,
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
                        {selectedTagIds.length} tag
                        {selectedTagIds.length > 1 ? "s" : ""} selected
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="title">Thread Title</Label>
                    <Input
                      id="title"
                      value={newThreadTitle}
                      onChange={(e) => setNewThreadTitle(e.target.value)}
                      placeholder="Enter thread title..."
                      maxLength={200}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="content">Initial Post</Label>
                    <Textarea
                      id="content"
                      value={newThreadContent}
                      onChange={(e) => setNewThreadContent(e.target.value)}
                      placeholder="Write your message..."
                      rows={6}
                      maxLength={5000}
                    />
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
                      disabled={
                        creatingThread ||
                        selectedTagIds.length === 0 ||
                        !newThreadTitle.trim() ||
                        !newThreadContent.trim()
                      }
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
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Threads */}
      {threads.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-50 text-gray-400" />
            <h3 className="text-lg font-semibold mb-2">No threads yet</h3>
            <p className="text-gray-600 mb-4">
              Be the first to start a discussion in this category!
            </p>
            {user && (
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Start the First Thread
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {threads.map((thread) => (
            <Card key={thread.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={thread.author_avatar || undefined} />
                    <AvatarFallback>
                      {thread.author_name?.charAt(0)?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
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

                    <Link to={`/forum/t/${thread.id}`} className="block group">
                      <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                        {thread.title}
                      </h3>
                    </Link>

                    <div className="flex items-center gap-4 text-sm text-gray-500 mt-2">
                      <span>by {thread.author_name}</span>
                      <span>•</span>
                      <span>{formatDate(thread.created_at)}</span>
                      {thread.updated_at !== thread.created_at && (
                        <>
                          <span>•</span>
                          <span>Updated {formatDate(thread.updated_at)}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
