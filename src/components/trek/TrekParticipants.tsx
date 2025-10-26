import { User } from "lucide-react";
import React, { Component } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Updated interface to match useTrekCommunity hook
export interface Participant {
  id: string;
  name: string | null;
  avatar: string | null;
  joinedAt: string;
  isEventCreator: boolean;
}

interface TrekParticipantsProps {
  participants: Participant[];
  maxParticipants: number;
  currentUser?: string | null; // User ID from useAuth
}

export const TrekParticipants: React.FC<TrekParticipantsProps> = ({
  participants,
  maxParticipants,
  currentUser,
}) => {
  // Sort participants: Creator first, then current user, then others (by name or join date)
  const sortedParticipants = [...participants].sort((a, b) => {
    if (a.isEventCreator && !b.isEventCreator) return -1;
    if (!a.isEventCreator && b.isEventCreator) return 1;
    if (a.id === currentUser && b.id !== currentUser) return -1;
    if (a.id !== currentUser && b.id === currentUser) return 1;
    // Fallback sort: by name if available, otherwise keep original order (or by ID)
    return (a.name || "").localeCompare(b.name || "");
  });

  const participantCount = participants.length; // Direct count of provided participants
  const remainingSpots = Math.max(0, maxParticipants - participantCount); // Ensure non-negative

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold flex items-center mb-4">
        <User className="h-5 w-5 mr-2 text-primary" />
        Participants ({participantCount} / {maxParticipants})
      </h3>

      {participantCount === 0 ? (
        <p className="text-muted-foreground text-sm">
          No participants have joined yet.
        </p>
      ) : (
        <div className="flex flex-wrap gap-4">
          <TooltipProvider delayDuration={100}>
            {sortedParticipants.map((participant) => (
              <Tooltip key={participant.id}>
                <TooltipTrigger asChild>
                  <div className="flex flex-col items-center text-center w-16">
                    <Avatar
                      className={`h-12 w-12 mb-1 ${participant.isEventCreator ? "ring-2 ring-primary ring-offset-2" : ""} ${participant.id === currentUser ? "ring-2 ring-blue-500 ring-offset-1" : ""}`}
                    >
                      <AvatarImage
                        src={participant.avatar || undefined}
                        alt={participant.name || "Anonymous User"}
                      />
                      <AvatarFallback className="bg-muted text-muted-foreground font-medium">
                        {(participant.name || "A")
                          .substring(0, 2)
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs font-medium line-clamp-1 break-all">
                      {participant.name || "User"}
                    </span>
                    {participant.isEventCreator && (
                      <span className="text-[10px] font-bold text-primary">
                        Organizer
                      </span>
                    )}
                    {participant.id === currentUser &&
                      !participant.isEventCreator && (
                        <span className="text-[10px] font-bold text-blue-600">
                          You
                        </span>
                      )}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p className="font-medium">
                    {participant.name || "Anonymous User"}
                  </p>
                  {participant.joinedAt && (
                    <p className="text-xs text-muted-foreground">
                      Joined:{" "}
                      {new Date(participant.joinedAt).toLocaleDateString()}
                    </p>
                  )}
                  {participant.isEventCreator && (
                    <p className="text-xs font-bold text-primary">
                      Event Organizer
                    </p>
                  )}
                </TooltipContent>
              </Tooltip>
            ))}

            {/* Placeholder spots visually capped */}
            {remainingSpots > 0 &&
              Array.from({ length: Math.min(remainingSpots, 8) }).map(
                (_, index) => (
                  <div
                    key={`empty-${index}`}
                    className="flex flex-col items-center text-center w-16"
                  >
                    <div className="h-12 w-12 rounded-full bg-gray-100 border border-dashed border-gray-300 flex items-center justify-center">
                      <User className="h-6 w-6 text-gray-300" />
                    </div>
                    <span className="text-xs text-muted-foreground mt-1">
                      Open Spot
                    </span>
                  </div>
                ),
              )}

            {/* Indicator if more spots exist beyond visual cap */}
            {remainingSpots > 8 && (
              <div className="flex flex-col items-center text-center w-16">
                <div className="h-12 w-12 rounded-full bg-gray-100 border border-dashed border-gray-300 flex items-center justify-center">
                  <span className="text-xs font-medium text-gray-500">
                    +{remainingSpots - 8}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground mt-1">More</span>
              </div>
            )}
          </TooltipProvider>
        </div>
      )}
    </div>
  );
};
