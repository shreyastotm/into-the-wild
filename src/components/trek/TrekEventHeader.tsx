import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { CalendarDays, IndianRupee, MapPin, Users } from "lucide-react";
import React, { Component } from "react";

import { Badge } from "@/components/ui/badge";
import { CardDescription, CardTitle } from "@/components/ui/card";
import { formatCurrency, getTrekStatusBadgeProps } from "@/lib/utils";
import { TrekEventStatus } from "@/types/trek";

interface TrekEventHeaderProps {
  trekName: string;
  category: string | null;
  difficulty?: string | null; // Add this
  status?: TrekEventStatus | string | null;
  startDatetime: string;
  imageUrl?: string | null;
  cost?: number;
  description?: string | null;
  maxParticipants?: number;
  participantCount?: number;
}

export const TrekEventHeader: React.FC<TrekEventHeaderProps> = ({
  trekName,
  category,
  difficulty, // Add this
  status,
  startDatetime,
  imageUrl,
  cost,
  maxParticipants,
  participantCount,
}) => {
  let indianTime: Date | null = null;
  try {
    indianTime = toZonedTime(new Date(startDatetime), "Asia/Kolkata");
    if (isNaN(indianTime.getTime())) throw new Error("Invalid date");
  } catch (e) {
    console.error("Error parsing startDatetime in header:", startDatetime, e);
    // Fallback: indianTime remains null
  }

  return (
    <div className="mb-6">
      {imageUrl && (
        <div className="mb-4 h-48 md:h-64 w-full overflow-hidden rounded-lg shadow-md">
          <img
            src={imageUrl}
            alt={trekName}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        </div>
      )}

      <div className="flex flex-col gap-3 mb-3">
        <CardTitle className="text-2xl sm:text-3xl font-bold tracking-tight">
          {trekName}
        </CardTitle>

        {/* Status, Category, and Difficulty badges */}
        <div className="flex flex-col sm:flex-row gap-2">
          {status &&
            (() => {
              const badgeProps = getTrekStatusBadgeProps(status);
              return (
                <Badge
                  variant={badgeProps.variant}
                  className={`text-sm capitalize whitespace-nowrap ${badgeProps.className}`}
                >
                  {status}
                </Badge>
              );
            })()}
          {category && (
            <Badge
              variant="outline"
              className="border-primary/50 text-primary bg-primary/10 text-sm capitalize"
            >
              {category}
            </Badge>
          )}
          {difficulty && (
            <Badge
              variant={getDifficultyVariant(difficulty)}
              className="text-sm capitalize"
            >
              {difficulty}
            </Badge>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
        {indianTime && (
          <div className="flex items-center">
            <CalendarDays className="h-4 w-4 mr-1.5" />
            <span>{format(indianTime, `EEE, d MMM yyyy 'at' h:mm a`)} IST</span>
          </div>
        )}
        {typeof participantCount === "number" &&
          typeof maxParticipants === "number" && (
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-1.5" />
              <span>
                {participantCount}/{maxParticipants} participants
              </span>
            </div>
          )}
        {cost !== undefined && (
          <div className="flex items-center">
            {cost === 0 ? (
              <Badge variant="secondary" className="font-medium">
                Free
              </Badge>
            ) : (
              <>
                <IndianRupee className="h-4 w-4 mr-1" />
                <span className="font-medium text-foreground">
                  {formatCurrency(cost, "INR")}
                </span>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

function getDifficultyVariant(
  difficulty: string,
): "default" | "easy" | "moderate" | "hard" | "expert" {
  switch (difficulty.toLowerCase()) {
    case "easy":
      return "easy";
    case "moderate":
      return "moderate";
    case "hard":
      return "hard";
    case "expert":
      return "expert";
    default:
      return "default";
  }
}
