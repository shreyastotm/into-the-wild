import {
  Clock,
  MapPin,
  Moon,
  Package,
  Target,
  Tent,
  UserCircle,
  Wind,
} from "lucide-react";
import React from "react";

import { StepProps } from "./types";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface JamYardDetailsStepProps extends StepProps {
  isLoadingExistingData?: boolean;
}

export const JamYardDetailsStep: React.FC<JamYardDetailsStepProps> = ({
  formData,
  setFormData,
  errors,
  isLoadingExistingData = false,
}) => {
  const jamYardData = formData.jam_yard_details || {};

  const updateJamYardField = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      jam_yard_details: {
        ...prev.jam_yard_details,
        [field]: value,
      },
    }));
  };

  if (isLoadingExistingData) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
        <span className="ml-2">Loading jam yard details...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold">Jam Yard Event Details</h3>
        <p className="text-sm text-muted-foreground">
          Provide details specific to your outdoor activity session
        </p>
      </div>

      {/* Activity Focus */}
      <div>
        <Label htmlFor="activity_focus" className="flex items-center gap-2">
          <Target className="h-4 w-4" />
          Activity Focus *
        </Label>
        <Select
          value={jamYardData.activity_focus || ""}
          onValueChange={(value) => updateJamYardField("activity_focus", value)}
        >
          <SelectTrigger id="activity_focus">
            <SelectValue placeholder="Select activity type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="yoga">Yoga</SelectItem>
            <SelectItem value="parkour">Parkour</SelectItem>
            <SelectItem value="dance">Dance</SelectItem>
            <SelectItem value="fitness">Fitness Training</SelectItem>
            <SelectItem value="martial_arts">Martial Arts</SelectItem>
            <SelectItem value="meditation">Meditation</SelectItem>
            <SelectItem value="climbing">Climbing</SelectItem>
            <SelectItem value="kayaking">Kayaking</SelectItem>
            <SelectItem value="surfing">Surfing</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Instructor Name */}
      <div>
        <Label htmlFor="instructor_name" className="flex items-center gap-2">
          <UserCircle className="h-4 w-4" />
          Instructor Name *
        </Label>
        <Input
          id="instructor_name"
          value={jamYardData.instructor_name || ""}
          onChange={(e) =>
            updateJamYardField("instructor_name", e.target.value)
          }
          placeholder="Instructor's full name"
        />
      </div>

      {/* Instructor Bio */}
      <div>
        <Label htmlFor="instructor_bio">Instructor Bio</Label>
        <Textarea
          id="instructor_bio"
          value={jamYardData.instructor_bio || ""}
          onChange={(e) => updateJamYardField("instructor_bio", e.target.value)}
          placeholder="Brief background about the instructor (qualifications, experience, etc.)"
          rows={3}
        />
      </div>

      {/* Venue Type */}
      <div>
        <Label htmlFor="venue_type" className="flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          Venue Type
        </Label>
        <Select
          value={jamYardData.venue_type || ""}
          onValueChange={(value) => updateJamYardField("venue_type", value)}
        >
          <SelectTrigger id="venue_type">
            <SelectValue placeholder="Select venue type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="outdoor_beach">Outdoor - Beach</SelectItem>
            <SelectItem value="outdoor_park">Outdoor - Park</SelectItem>
            <SelectItem value="outdoor_campsite">Outdoor - Campsite</SelectItem>
            <SelectItem value="outdoor_mountain">Outdoor - Mountain</SelectItem>
            <SelectItem value="indoor_studio">Indoor - Studio</SelectItem>
            <SelectItem value="hybrid">Hybrid (Indoor + Outdoor)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Venue Details */}
      <div>
        <Label htmlFor="venue_details">Venue Details</Label>
        <Textarea
          id="venue_details"
          value={jamYardData.venue_details || ""}
          onChange={(e) => updateJamYardField("venue_details", e.target.value)}
          placeholder="Describe the location and facilities (e.g., Beachside yoga at Marina Beach with mats provided)"
          rows={2}
        />
      </div>

      {/* Target Audience */}
      <div>
        <Label htmlFor="target_audience" className="flex items-center gap-2">
          <Target className="h-4 w-4" />
          Target Audience
        </Label>
        <Select
          value={jamYardData.target_audience || ""}
          onValueChange={(value) =>
            updateJamYardField("target_audience", value)
          }
        >
          <SelectTrigger id="target_audience">
            <SelectValue placeholder="Select target audience" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Ages</SelectItem>
            <SelectItem value="adults">Adults 18+</SelectItem>
            <SelectItem value="teens">Teens 13-17</SelectItem>
            <SelectItem value="seniors">Seniors 50+</SelectItem>
            <SelectItem value="women_only">Women Only</SelectItem>
            <SelectItem value="families">Families with Kids</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Session Duration */}
      <div>
        <Label htmlFor="session_duration" className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Session Duration (minutes) *
        </Label>
        <Input
          id="session_duration"
          type="number"
          value={jamYardData.session_duration || ""}
          onChange={(e) =>
            updateJamYardField(
              "session_duration",
              parseInt(e.target.value) || 0,
            )
          }
          placeholder="e.g., 60"
        />
      </div>

      {/* Skill Level */}
      <div>
        <Label htmlFor="skill_level">Skill Level</Label>
        <Select
          value={jamYardData.skill_level || ""}
          onValueChange={(value) => updateJamYardField("skill_level", value)}
        >
          <SelectTrigger id="skill_level">
            <SelectValue placeholder="Select skill level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="beginner">Beginner</SelectItem>
            <SelectItem value="intermediate">Intermediate</SelectItem>
            <SelectItem value="advanced">Advanced</SelectItem>
            <SelectItem value="all">All Levels</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Equipment Provided */}
      <div>
        <Label htmlFor="equipment_provided" className="flex items-center gap-2">
          <Package className="h-4 w-4" />
          Equipment Provided
        </Label>
        <Textarea
          id="equipment_provided"
          value={jamYardData.equipment_provided?.join(", ") || ""}
          onChange={(e) => {
            const items = e.target.value
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean);
            updateJamYardField("equipment_provided", items);
          }}
          placeholder="Comma-separated list (e.g., Yoga mats, water bottles, resistance bands)"
          rows={2}
        />
        <p className="text-xs text-muted-foreground mt-1">
          Enter items separated by commas
        </p>
      </div>

      {/* Additional Requirements */}
      <div>
        <Label htmlFor="additional_requirements">
          What Participants Need to Bring
        </Label>
        <Textarea
          id="additional_requirements"
          value={jamYardData.additional_requirements || ""}
          onChange={(e) =>
            updateJamYardField("additional_requirements", e.target.value)
          }
          placeholder="What should participants bring? (e.g., Comfortable clothing, water bottle, towel)"
          rows={2}
        />
      </div>

      {/* Weather Dependency */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="weather_dependency"
          checked={jamYardData.weather_dependency || false}
          onCheckedChange={(checked) =>
            updateJamYardField("weather_dependency", checked)
          }
        />
        <Label
          htmlFor="weather_dependency"
          className="flex items-center gap-2 cursor-pointer"
        >
          <Wind className="h-4 w-4" />
          Weather Dependent Activity
        </Label>
      </div>

      {/* Complement Options */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">
            Can This Activity Complement Other Events?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="can_complement_camping"
              checked={jamYardData.can_complement_camping || false}
              onCheckedChange={(checked) =>
                updateJamYardField("can_complement_camping", checked)
              }
            />
            <Label
              htmlFor="can_complement_camping"
              className="flex items-center gap-2 cursor-pointer"
            >
              <Tent className="h-4 w-4" />
              Can be offered during camping events
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="can_complement_trek"
              checked={jamYardData.can_complement_trek || false}
              onCheckedChange={(checked) =>
                updateJamYardField("can_complement_trek", checked)
              }
            />
            <Label
              htmlFor="can_complement_trek"
              className="flex items-center gap-2 cursor-pointer"
            >
              <Moon className="h-4 w-4" />
              Can be offered alongside trek events
            </Label>
          </div>
        </CardContent>
      </Card>

      {errors.jam_yard_details && (
        <p className="text-sm text-red-600" role="alert">
          {errors.jam_yard_details}
        </p>
      )}
    </div>
  );
};
