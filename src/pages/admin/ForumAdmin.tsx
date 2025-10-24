import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  Edit,
  Trash2,
  Pin,
  Lock,
  Users,
  MessageSquare,
  Loader2,
  Settings,
} from "lucide-react";

interface ForumCategory {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  sort_order: number;
  created_at: string;
  thread_count?: number;
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
  category_name?: string;
  post_count?: number;
}

export default function ForumAdmin() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [threads, setThreads] = useState<ForumThread[]>([]);
  const [loading, setLoading] = useState(true);

  // Category form state
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ForumCategory | null>(
    null,
  );
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    slug: "",
    description: "",
    sort_order: 0,
  });

  // Thread actions state
  const [togglingPin, setTogglingPin] = useState<number | null>(null);
  const [togglingLock, setTogglingLock] = useState<number | null>(null);
  const [deletingPost, setDeletingPost] = useState<number | null>(null);
  const [deletingThread, setDeletingThread] = useState<number | null>(null);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);

      // Fetch categories with thread counts
      const { data: categoriesData, error: categoriesError } = await supabase
        .from("forum_categories")
        .select(
          `
          *,
          forum_threads(count)
        `,
        )
        .order("sort_order");

      if (categoriesError) {
        console.error("Error fetching categories:", categoriesError);
        toast({
          title: "Error",
          description: "Could not load categories.",
          variant: "destructive",
        });
        return;
      }

      // Fetch recent threads
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
          forum_categories!forum_threads_category_id_fkey (
            name
          ),
          users!forum_threads_author_id_fkey (
            full_name
          )
        `,
        )
        .order("updated_at", { ascending: false })
        .limit(50);

      if (threadsError) {
        console.error("Error fetching threads:", threadsError);
        toast({
          title: "Error",
          description: "Could not load threads.",
          variant: "destructive",
        });
        return;
      }

      // Transform data
      const transformedCategories =
        categoriesData?.map((cat) => ({
          ...cat,
          thread_count: cat.forum_threads?.[0]?.count || 0,
        })) || [];

      const transformedThreads =
        threadsData?.map((thread) => ({
          ...thread,
          category_name: thread.forum_categories?.name || "Unknown",
          author_name: thread.users?.full_name || "Unknown User",
        })) || [];

      setCategories(transformedCategories);
      setThreads(transformedThreads);
    } catch (error) {
      console.error("Error fetching admin data:", error);
      toast({
        title: "Error",
        description: "Could not load admin data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async () => {
    try {
      const { data, error } = await supabase.rpc("create_forum_category", {
        p_name: categoryForm.name.trim(),
        p_slug: categoryForm.slug.trim(),
        p_description: categoryForm.description.trim() || null,
        p_sort_order: categoryForm.sort_order,
      });

      if (error) {
        console.error("Error creating category:", error);
        toast({
          title: "Error",
          description: "Could not create category. Please try again.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Category Created",
        description: "Forum category has been created successfully!",
        variant: "default",
      });

      setShowCategoryDialog(false);
      setCategoryForm({ name: "", slug: "", description: "", sort_order: 0 });
      fetchAdminData();
    } catch (error) {
      console.error("Error creating category:", error);
      toast({
        title: "Error",
        description: "Could not create category. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory) return;

    try {
      const { data, error } = await supabase.rpc("update_forum_category", {
        p_id: editingCategory.id,
        p_name: categoryForm.name.trim() || null,
        p_slug: categoryForm.slug.trim() || null,
        p_description: categoryForm.description.trim() || null,
        p_sort_order: categoryForm.sort_order || null,
      });

      if (error) {
        console.error("Error updating category:", error);
        toast({
          title: "Error",
          description: "Could not update category. Please try again.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Category Updated",
        description: "Forum category has been updated successfully!",
        variant: "default",
      });

      setShowCategoryDialog(false);
      setEditingCategory(null);
      setCategoryForm({ name: "", slug: "", description: "", sort_order: 0 });
      fetchAdminData();
    } catch (error) {
      console.error("Error updating category:", error);
      toast({
        title: "Error",
        description: "Could not update category. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCategory = async (categoryId: number) => {
    try {
      const { error } = await supabase.rpc("delete_forum_category", {
        p_id: categoryId,
      });

      if (error) {
        console.error("Error deleting category:", error);
        toast({
          title: "Error",
          description: "Could not delete category. Please try again.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Category Deleted",
        description: "Forum category has been deleted successfully!",
        variant: "default",
      });

      fetchAdminData();
    } catch (error) {
      console.error("Error deleting category:", error);
      toast({
        title: "Error",
        description: "Could not delete category. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleTogglePin = async (
    threadId: number,
    currentPinState: boolean,
  ) => {
    try {
      setTogglingPin(threadId);
      const { error } = await supabase.rpc("toggle_thread_pin", {
        p_thread_id: threadId,
        p_pin: !currentPinState,
      });

      if (error) {
        console.error("Error toggling pin:", error);
        toast({
          title: "Error",
          description: "Could not update thread. Please try again.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Thread Updated",
        description: `Thread has been ${!currentPinState ? "pinned" : "unpinned"} successfully!`,
        variant: "default",
      });

      fetchAdminData();
    } catch (error) {
      console.error("Error toggling pin:", error);
      toast({
        title: "Error",
        description: "Could not update thread. Please try again.",
        variant: "destructive",
      });
    } finally {
      setTogglingPin(null);
    }
  };

  const handleToggleLock = async (
    threadId: number,
    currentLockState: boolean,
  ) => {
    try {
      setTogglingLock(threadId);
      const { error } = await supabase.rpc("toggle_thread_lock", {
        p_thread_id: threadId,
        p_lock: !currentLockState,
      });

      if (error) {
        console.error("Error toggling lock:", error);
        toast({
          title: "Error",
          description: "Could not update thread. Please try again.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Thread Updated",
        description: `Thread has been ${!currentLockState ? "locked" : "unlocked"} successfully!`,
        variant: "default",
      });

      fetchAdminData();
    } catch (error) {
      console.error("Error toggling lock:", error);
      toast({
        title: "Error",
        description: "Could not update thread. Please try again.",
        variant: "destructive",
      });
    } finally {
      setTogglingLock(null);
    }
  };

  const handleDeletePost = async (postId: number) => {
    try {
      setDeletingPost(postId);
      const { error } = await supabase.rpc("admin_delete_post", {
        p_post_id: postId,
      });

      if (error) {
        console.error("Error deleting post:", error);
        toast({
          title: "Error",
          description: "Could not delete post. Please try again.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Post Deleted",
        description: "Post has been deleted successfully!",
        variant: "default",
      });

      fetchAdminData();
    } catch (error) {
      console.error("Error deleting post:", error);
      toast({
        title: "Error",
        description: "Could not delete post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeletingPost(null);
    }
  };

  const handleDeleteThread = async (threadId: number) => {
    try {
      setDeletingThread(threadId);
      const { error } = await supabase.rpc("admin_delete_thread", {
        p_thread_id: threadId,
      });

      if (error) {
        console.error("Error deleting thread:", error);
        toast({
          title: "Error",
          description: "Could not delete thread. Please try again.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Thread Deleted",
        description: "Thread and all its posts have been deleted successfully!",
        variant: "default",
      });

      fetchAdminData();
    } catch (error) {
      console.error("Error deleting thread:", error);
      toast({
        title: "Error",
        description: "Could not delete thread. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeletingThread(null);
    }
  };

  const openCategoryDialog = (category?: ForumCategory) => {
    if (category) {
      setEditingCategory(category);
      setCategoryForm({
        name: category.name,
        slug: category.slug,
        description: category.description || "",
        sort_order: category.sort_order,
      });
    } else {
      setEditingCategory(null);
      setCategoryForm({ name: "", slug: "", description: "", sort_order: 0 });
    }
    setShowCategoryDialog(true);
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
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading admin data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Forum Administration</h1>
          <p className="text-muted-foreground">
            Manage forum categories and moderate threads
          </p>
        </div>
      </div>

      <Tabs defaultValue="categories" className="w-full">
        <TabsList>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="threads">Recent Threads</TabsTrigger>
        </TabsList>

        <TabsContent value="categories" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Forum Categories</h2>
            <Dialog
              open={showCategoryDialog}
              onOpenChange={setShowCategoryDialog}
            >
              <DialogTrigger asChild>
                <Button onClick={() => openCategoryDialog()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Category
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingCategory ? "Edit Category" : "Create Category"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingCategory
                      ? "Update the forum category details."
                      : "Add a new category to organize forum discussions."}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Category Name *
                    </label>
                    <Input
                      value={categoryForm.name}
                      onChange={(e) =>
                        setCategoryForm((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      placeholder="e.g., Trek Planning"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      URL Slug *
                    </label>
                    <Input
                      value={categoryForm.slug}
                      onChange={(e) =>
                        setCategoryForm((prev) => ({
                          ...prev,
                          slug: e.target.value,
                        }))
                      }
                      placeholder="e.g., trek-planning"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Description
                    </label>
                    <Textarea
                      value={categoryForm.description}
                      onChange={(e) =>
                        setCategoryForm((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      placeholder="Brief description of this category"
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Sort Order
                    </label>
                    <Input
                      type="number"
                      value={categoryForm.sort_order}
                      onChange={(e) =>
                        setCategoryForm((prev) => ({
                          ...prev,
                          sort_order: parseInt(e.target.value) || 0,
                        }))
                      }
                      placeholder="0"
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowCategoryDialog(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={
                        editingCategory
                          ? handleUpdateCategory
                          : handleCreateCategory
                      }
                      disabled={
                        !categoryForm.name.trim() || !categoryForm.slug.trim()
                      }
                    >
                      {editingCategory ? "Update" : "Create"} Category
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>All Categories</CardTitle>
              <CardDescription>
                Manage forum categories and their organization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Threads</TableHead>
                    <TableHead>Sort Order</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell className="font-medium">
                        {category.name}
                      </TableCell>
                      <TableCell>{category.slug}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {category.description || "-"}
                      </TableCell>
                      <TableCell>{category.thread_count || 0}</TableCell>
                      <TableCell>{category.sort_order}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openCategoryDialog(category)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Delete Category
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "
                                  {category.name}"? This action cannot be undone
                                  and will also delete all threads in this
                                  category.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() =>
                                    handleDeleteCategory(category.id)
                                  }
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="threads" className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Recent Threads</h2>
            <p className="text-muted-foreground mb-6">
              Moderate threads by pinning important discussions or locking
              inappropriate content.
            </p>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {threads.map((thread) => (
                    <TableRow key={thread.id}>
                      <TableCell className="font-medium max-w-md">
                        <div className="truncate">{thread.title}</div>
                      </TableCell>
                      <TableCell>{thread.category_name}</TableCell>
                      <TableCell>{thread.author_name}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
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
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(thread.created_at)}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleTogglePin(thread.id, thread.pinned)
                            }
                            disabled={togglingPin === thread.id}
                          >
                            {togglingPin === thread.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Pin className="h-3 w-3" />
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleToggleLock(thread.id, thread.locked)
                            }
                            disabled={togglingLock === thread.id}
                          >
                            {togglingLock === thread.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Lock className="h-3 w-3" />
                            )}
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Delete Thread
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this thread?
                                  This action cannot be undone and will also
                                  delete all posts in this thread.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteThread(thread.id)}
                                  disabled={deletingThread === thread.id}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  {deletingThread === thread.id ? (
                                    <>
                                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                      Deleting...
                                    </>
                                  ) : (
                                    "Delete Thread"
                                  )}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
