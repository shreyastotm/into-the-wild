import { Camera, Search, UserPlus, Users, X } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

import { useAuth } from "@/components/auth/AuthProvider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useFriendSuggestions,
  useImageTagging,
  useSocialFeatures,
  useSocialSearch,
} from "@/hooks/useSocialFeatures";
import { cn } from "@/lib/utils";

interface TaggedUser {
  id: string;
  name: string;
  avatar?: string;
  x: number;
  y: number;
  tagId?: string;
}

interface FriendTaggingOverlayProps {
  imageUrl: string;
  imageId: string;
  existingTags?: TaggedUser[];
  onClose: () => void;
  onTagAdded?: (tag: TaggedUser) => void;
  onTagRemoved?: (tagId: string) => void;
  isVisible: boolean;
}

export const FriendTaggingOverlay: React.FC<FriendTaggingOverlayProps> = ({
  imageUrl,
  imageId,
  existingTags = [],
  onClose,
  onTagAdded,
  onTagRemoved,
  isVisible,
}) => {
  const { user } = useAuth();
  const { connections, sendFriendRequest } = useSocialFeatures();
  const { suggestions } = useFriendSuggestions(user?.id || "", 10);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUsers, setSelectedUsers] =
    useState<TaggedUser[]>(existingTags);
  const [showSearch, setShowSearch] = useState(false);
  const [taggingMode, setTaggingMode] = useState(false);
  const [clickPosition, setClickPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  const { results: searchResults } = useSocialSearch(searchQuery);
  const { addTag } = useImageTagging(imageId);

  useEffect(() => {
    setSelectedUsers(existingTags);
  }, [existingTags]);

  const handleImageClick = (e: React.MouseEvent) => {
    if (!taggingMode || !imageRef.current) return;

    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setClickPosition({ x, y });
    setShowSearch(true);
  };

  const handleUserSelect = async (selectedUser: any) => {
    if (!clickPosition || !user?.id) return;

    // Check if user is already tagged
    const alreadyTagged = selectedUsers.some(
      (u) => u.id === selectedUser.user_id,
    );
    if (alreadyTagged) return;

    // Check if user can be tagged (must be friends)
    const isConnected = connections.some(
      (c) =>
        c.status === "accepted" &&
        ((c.requester_id === user.id &&
          c.addressee_id === selectedUser.user_id) ||
          (c.requester_id === selectedUser.user_id &&
            c.addressee_id === user.id)),
    );

    if (!isConnected) {
      // Send friend request
      try {
        sendFriendRequest(selectedUser.user_id);
        return;
      } catch (error) {
        console.error("Failed to send friend request:", error);
        return;
      }
    }

    // Add tag to image
    try {
      await addTag({
        tagged_user_id: selectedUser.user_id,
        x_position: clickPosition.x,
        y_position: clickPosition.y,
        tag_type: "person",
      });

      const newTag: TaggedUser = {
        id: selectedUser.user_id,
        name: selectedUser.full_name || "Unknown User",
        avatar: selectedUser.avatar_url,
        x: clickPosition.x,
        y: clickPosition.y,
      };

      setSelectedUsers((prev) => [...prev, newTag]);
      onTagAdded?.(newTag);
    } catch (error) {
      console.error("Failed to add tag:", error);
    }

    setShowSearch(false);
    setClickPosition(null);
  };

  const handleRemoveTag = (tagId: string) => {
    setSelectedUsers((prev) => prev.filter((t) => t.tagId !== tagId));
    onTagRemoved?.(tagId);
  };

  const getFilteredSuggestions = () => {
    const connectedIds = connections
      .filter((c) => c.status === "accepted")
      .flatMap((c) => [c.requester_id, c.addressee_id])
      .filter((id) => id !== user?.id);

    return suggestions.filter((s) => !connectedIds.includes(s.user_id));
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative max-w-4xl w-full max-h-[90vh] bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h3 className="text-lg font-semibold text-white">
            Tag Friends in Photo
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white hover:bg-white/20"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex h-[60vh]">
          {/* Image Section */}
          <div className="flex-1 relative bg-black">
            <div
              ref={imageRef}
              className="relative w-full h-full cursor-crosshair"
              onClick={handleImageClick}
            >
              <img
                src={imageUrl}
                alt="Tagging"
                className="w-full h-full object-contain"
              />

              {/* Existing tags */}
              {selectedUsers.map((tag, index) => (
                <div
                  key={`${tag.id}-${index}`}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2"
                  style={{
                    left: `${tag.x}%`,
                    top: `${tag.y}%`,
                  }}
                >
                  <div className="relative">
                    <Avatar className="w-8 h-8 border-2 border-white shadow-lg">
                      <AvatarImage src={tag.avatar} />
                      <AvatarFallback className="bg-primary text-white text-xs">
                        {tag.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="absolute -top-1 -right-1 w-4 h-4 p-0 rounded-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveTag(tag.tagId || `temp-${index}`);
                      }}
                    >
                      <X className="w-2 h-2" />
                    </Button>
                  </div>
                </div>
              ))}

              {/* Click indicator */}
              {clickPosition && (
                <div
                  className="absolute w-4 h-4 bg-primary rounded-full border-2 border-white transform -translate-x-1/2 -translate-y-1/2 animate-pulse"
                  style={{
                    left: `${clickPosition.x}%`,
                    top: `${clickPosition.y}%`,
                  }}
                />
              )}

              {/* Mode indicator */}
              <div className="absolute top-4 left-4">
                <Badge
                  variant={taggingMode ? "default" : "secondary"}
                  className="backdrop-blur-md bg-black/40 text-white border-white/20"
                >
                  {taggingMode ? "Click to tag" : "View mode"}
                </Badge>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-80 bg-white/5 backdrop-blur-md border-l border-white/10 flex flex-col">
            {/* Search Panel */}
            {showSearch ? (
              <div className="p-4 border-b border-white/10">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Search className="w-4 h-4 text-white/70" />
                    <Input
                      placeholder="Search friends..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    />
                  </div>

                  {/* Search Results */}
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {searchQuery.length >= 2 &&
                      searchResults.map((result) => (
                        <div
                          key={result.user_id}
                          className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/10 cursor-pointer"
                          onClick={() => handleUserSelect(result)}
                        >
                          <Avatar className="w-6 h-6">
                            <AvatarImage src={result.avatar_url} />
                            <AvatarFallback className="bg-primary text-white text-xs">
                              {result.full_name?.charAt(0) || "?"}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-white">
                            {result.full_name}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            ) : (
              /* Friends Panel */
              <div className="p-4 border-b border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-white">Friends</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setTaggingMode(!taggingMode)}
                    className={cn(
                      "text-white hover:bg-white/20",
                      taggingMode && "bg-primary/20",
                    )}
                  >
                    <UserPlus className="w-4 h-4 mr-1" />
                    {taggingMode ? "Cancel" : "Tag"}
                  </Button>
                </div>

                {/* Connected Friends */}
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {connections
                    .filter((c) => c.status === "accepted")
                    .slice(0, 5)
                    .map((connection) => {
                      const friendId =
                        connection.requester_id === user?.id
                          ? connection.addressee_id
                          : connection.requester_id;

                      return (
                        <div
                          key={connection.connection_id}
                          className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/10 cursor-pointer"
                          onClick={() => {
                            if (taggingMode && clickPosition) {
                              handleUserSelect({
                                user_id: friendId,
                                full_name: "Friend",
                              });
                            }
                          }}
                        >
                          <Avatar className="w-6 h-6">
                            <AvatarFallback className="bg-primary text-white text-xs">
                              F
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-white">
                            Friend {friendId.slice(-4)}
                          </span>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* Suggestions Panel */}
            <div className="p-4 flex-1">
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-4 h-4 text-white/70" />
                <h4 className="font-medium text-white">Suggestions</h4>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto">
                {getFilteredSuggestions()
                  .slice(0, 8)
                  .map((suggestion) => (
                    <div
                      key={suggestion.user_id}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-white/10"
                    >
                      <div className="flex items-center gap-2">
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={suggestion.avatar_url} />
                          <AvatarFallback className="bg-primary text-white text-xs">
                            {suggestion.full_name?.charAt(0) || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-sm text-white">
                            {suggestion.full_name}
                          </div>
                          <div className="text-xs text-white/60">
                            {suggestion.mutualTreks} mutual treks
                          </div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => sendFriendRequest(suggestion.user_id)}
                        className="text-xs border-white/20 text-white hover:bg-white/20"
                      >
                        Connect
                      </Button>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-white/10">
          <div className="flex items-center gap-2 text-sm text-white/70">
            <Camera className="w-4 h-4" />
            <span>{selectedUsers.length} friends tagged</span>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="border-white/20 text-white hover:bg-white/20"
            >
              Cancel
            </Button>
            <Button
              onClick={onClose}
              className="bg-primary hover:bg-primary/90 text-white"
            >
              Done
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
