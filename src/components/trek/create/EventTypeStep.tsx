import React from "react";

import { StepProps } from "./types";

import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAuth } from "@/components/auth/AuthProvider";
import { EventType } from "@/types/trek";

export const EventTypeStep: React.FC<StepProps & { isEdit?: boolean }> = ({
  formData,
  setFormData,
  errors,
  isEdit,
}) => {
  const { userProfile } = useAuth();
  const isPartnerOrAdmin = userProfile?.user_type === "micro_community" || 
                          userProfile?.user_type === "admin";
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold">Choose Event Type</h3>
        <p className="text-sm text-muted-foreground">
          {isEdit
            ? "Select the type of event you want to Edit"
            : "Select the type of event you want to create"}
        </p>
      </div>

      <RadioGroup
        value={formData.event_type}
        onValueChange={(value) =>
          setFormData((prev) => ({ ...prev, event_type: value as EventType }))
        }
        className="space-y-4"
      >
        <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-start space-x-3">
            <RadioGroupItem value={EventType.TREK} id="trek" className="mt-1" />
            <div className="flex-1">
              <Label
                htmlFor="trek"
                className="text-base font-medium cursor-pointer"
              >
                🥾 Trek Event
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Traditional hiking and trekking adventures. Perfect for outdoor
                enthusiasts looking for nature experiences.
              </p>
              <ul className="text-xs text-muted-foreground mt-2 space-y-1">
                <li>• Hiking trails and mountain expeditions</li>
                <li>• Day treks or multi-day adventures</li>
                <li>• Focus on exploration and fitness</li>
              </ul>
            </div>
          </div>
        </Card>

        <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-start space-x-3">
            <RadioGroupItem
              value={EventType.CAMPING}
              id="camping"
              className="mt-1"
            />
            <div className="flex-1">
              <Label
                htmlFor="camping"
                className="text-base font-medium cursor-pointer"
              >
                🏕️ Camping Event
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Comprehensive camping experiences with multiple activities,
                volunteers, and detailed planning.
              </p>
              <ul className="text-xs text-muted-foreground mt-2 space-y-1">
                <li>• Multi-activity camping with itinerary</li>
                <li>• Volunteer coordination and group activities</li>
                <li>• Tent rentals, BBQ, bonfire, nature walks</li>
                <li>• Kids activities and experience centers</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Jam Yard card - only shown for partners and admins */}
        {isPartnerOrAdmin && (
          <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer border-orange-200">
            <div className="flex items-start space-x-3">
              <RadioGroupItem
                value={EventType.JAM_YARD}
                id="jam_yard"
                className="mt-1"
              />
              <div className="flex-1">
                <Label
                  htmlFor="jam_yard"
                  className="text-base font-medium cursor-pointer"
                >
                  🏃 Jam Yard Event
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Partner-led outdoor activities: yoga, parkour, dance, fitness 
                  workshops. Can complement treks and camping events.
                </p>
                <ul className="text-xs text-muted-foreground mt-2 space-y-1">
                  <li>• Outdoor/indoor partner collaboration activities</li>
                  <li>• Can complement treks and camping events</li>
                  <li>• Instructor-led sessions with specialized activities</li>
                  <li>• Single or recurring session formats</li>
                </ul>
                <div className="mt-2 px-2 py-1 bg-orange-100 dark:bg-orange-900 rounded-md text-xs text-orange-800 dark:text-orange-200">
                  Partner or Admin Only
                </div>
              </div>
            </div>
          </Card>
        )}
      </RadioGroup>

      {errors.event_type && (
        <p className="text-sm text-red-600 text-center" role="alert">
          {errors.event_type}
        </p>
      )}
    </div>
  );
};
