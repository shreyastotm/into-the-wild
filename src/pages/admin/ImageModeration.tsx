import {
  Calendar,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  Loader2,
  User,
  XCircle,
} from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";

import { useAuth } from "@/components/auth/AuthProvider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface UserImage {
  id: number;
  trek_id: number;
  trek_name: string;
  uploaded_by: string;
  uploader_name: string;
  image_url: string;
  caption: string | null;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  rejection_reason: string | null;
}

const ITEMS_PER_PAGE = 12;

export default function ImageModeration() {
  const { userProfile } = useAuth();
  const [images, setImages] = useState<UserImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<Set<number>>(new Set());
  const [selectedImage, setSelectedImage] = useState<UserImage | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [activeTab, setActiveTab] = useState("pending");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const isAdmin = userProfile?.user_type === "admin";

  const fetchImages = useCallback(async () => {
    if (!isAdmin) return;

    setLoading(true);
    try {
      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      // First get total count
      const { count } = await supabase
        .from("user_trek_images")
        .select("*", { count: "exact", head: true })
        .eq("status", activeTab);

      setTotalCount(count || 0);

      // Then get paginated results with trek and user details
      const { data, error } = await supabase
        .from("user_trek_images")
        .select(`
          *,
          trek_events(name),
          users!user_trek_images_uploaded_by_fkey(full_name)
        `)
        .eq("status", activeTab)
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) throw error;

      const formattedImages: UserImage[] = (data || []).map((img) => ({
        id: img.id,
        trek_id: img.trek_id,
        trek_name: img.trek_events?.name || "Unknown Trek",
        uploaded_by: img.uploaded_by,
        uploader_name: img.users?.full_name || "Unknown User",
        image_url: img.image_url,
        caption: img.caption,
        status: img.status,
        created_at: img.created_at,
        reviewed_by: img.reviewed_by,
        reviewed_at: img.reviewed_at,
        rejection_reason: img.rejection_reason,
      }));

      setImages(formattedImages);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to fetch images";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [isAdmin, activeTab, currentPage]);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  const handleApprove = useCallback(
    async (imageId: number) => {
      if (!userProfile) return;

      setActionLoading((prev) => new Set([...prev, imageId]));
      try {
        const { error } = await supabase
          .from("user_trek_images")
          .update({
            status: "approved",
            reviewed_by: userProfile.user_id,
            reviewed_at: new Date().toISOString(),
          })
          .eq("id", imageId);

        if (error) throw error;

        toast({
          title: "Image Approved",
          description:
            "The image has been approved and will now appear in the gallery.",
        });

        fetchImages();
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "Failed to approve image";
        toast({
          title: "Error",
          description: message,
          variant: "destructive",
        });
      } finally {
        setActionLoading((prev) => {
          const next = new Set(prev);
          next.delete(imageId);
          return next;
        });
      }
    },
    [userProfile, fetchImages],
  );

  const handleReject = useCallback(
    async (imageId: number) => {
      if (!userProfile || !rejectionReason.trim()) {
        toast({
          title: "Rejection Reason Required",
          description: "Please provide a reason for rejecting this image.",
          variant: "destructive",
        });
        return;
      }

      setActionLoading((prev) => new Set([...prev, imageId]));
      try {
        const { error } = await supabase
          .from("user_trek_images")
          .update({
            status: "rejected",
            reviewed_by: userProfile.user_id,
            reviewed_at: new Date().toISOString(),
            rejection_reason: rejectionReason.trim(),
          })
          .eq("id", imageId);

        if (error) throw error;

        toast({
          title: "Image Rejected",
          description:
            "The image has been rejected and the user has been notified.",
        });

        setRejectionReason("");
        setSelectedImage(null);
        fetchImages();
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "Failed to reject image";
        toast({
          title: "Error",
          description: message,
          variant: "destructive",
        });
      } finally {
        setActionLoading((prev) => {
          const next = new Set(prev);
          next.delete(imageId);
          return next;
        });
      }
    },
    [userProfile, rejectionReason, fetchImages],
  );

  const handlePromoteToOfficial = useCallback(
    async (imageId: number) => {
      if (!userProfile) return;

      setActionLoading((prev) => new Set([...prev, imageId]));
      try {
        // Call the database function to promote the image
        const { data, error } = await supabase.rpc(
          "promote_user_image_to_official",
          {
            p_user_image_id: imageId,
          },
        );

        if (error) throw error;

        if (data !== "Image promoted successfully") {
          throw new Error(data);
        }

        // Then approve the image
        await handleApprove(imageId);

        toast({
          title: "Image Promoted",
          description:
            "The image has been promoted to an official trek image and approved.",
        });

        fetchImages();
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "Failed to promote image";
        toast({
          title: "Error",
          description: message,
          variant: "destructive",
        });
      } finally {
        setActionLoading((prev) => {
          const next = new Set(prev);
          next.delete(imageId);
          return next;
        });
      }
    },
    [userProfile, handleApprove, fetchImages],
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case "approved":
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approved
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  if (!isAdmin) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-500">
              You don't have permission to access this page.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Image Moderation</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Review and moderate user-contributed photos for the gallery
        </p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Pending ({totalCount})
          </TabsTrigger>
          <TabsTrigger value="approved" className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Approved
          </TabsTrigger>
          <TabsTrigger value="rejected" className="flex items-center gap-2">
            <XCircle className="w-4 h-4" />
            Rejected
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-6">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg mb-3" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : images.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-500">
                  {activeTab === "pending"
                    ? "No images pending review."
                    : activeTab === "approved"
                      ? "No approved images."
                      : "No rejected images."}
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {images.map((image) => (
                  <Card key={image.id} className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="aspect-video relative">
                        <img
                          src={image.image_url}
                          alt={image.caption || "User contributed image"}
                          className="w-full h-full object-cover cursor-pointer"
                          onClick={() => setSelectedImage(image)}
                        />
                        <div className="absolute top-2 left-2">
                          {getStatusBadge(image.status)}
                        </div>
                      </div>

                      <div className="p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium truncate">
                            {image.uploader_name}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 mb-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600 dark:text-gray-400 truncate">
                            {image.trek_name}
                          </span>
                        </div>

                        {image.caption && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                            {image.caption}
                          </p>
                        )}

                        <div className="text-xs text-gray-500 mb-3">
                          {new Date(image.created_at).toLocaleDateString(
                            "en-IN",
                          )}
                        </div>

                        {activeTab === "pending" && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="flex-1"
                              onClick={() => handleApprove(image.id)}
                              disabled={actionLoading.has(image.id)}
                            >
                              {actionLoading.has(image.id) ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <>
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  Approve
                                </>
                              )}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={() => setSelectedImage(image)}
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        )}

                        {activeTab === "approved" && (
                          <Button
                            size="sm"
                            className="w-full"
                            onClick={() => handlePromoteToOfficial(image.id)}
                            disabled={actionLoading.has(image.id)}
                          >
                            {actionLoading.has(image.id) ? (
                              <Loader2 className="w-4 h-4 animate-spin mr-1" />
                            ) : (
                              <>
                                <Eye className="w-4 h-4 mr-1" />
                                Promote to Official
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-6">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </Button>

                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Page {currentPage} of {totalPages}
                  </span>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                    }
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Rejection Dialog */}
      {selectedImage && activeTab === "pending" && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-600" />
                Reject Image
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="aspect-video rounded-lg overflow-hidden">
                <img
                  src={selectedImage.image_url}
                  alt="Image to reject"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Reason for rejection (required)
                </label>
                <Textarea
                  placeholder="Please provide a reason for rejecting this image..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setSelectedImage(null);
                    setRejectionReason("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => handleReject(selectedImage.id)}
                  disabled={!rejectionReason.trim()}
                >
                  Reject Image
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
