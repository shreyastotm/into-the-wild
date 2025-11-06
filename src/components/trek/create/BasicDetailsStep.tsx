import React, { useState } from "react";

import { StepProps } from "./types";

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
import { EventType } from "@/types/trek";

interface BasicDetailsStepProps extends StepProps {
  imagePreview: string | null; // For backward compatibility
  imagePreviews?: (string | null)[]; // New: array of image previews
  handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void; // For backward compatibility
  handleImageChangeAtIndex?: (
    index: number,
  ) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeImageAtIndex?: (index: number) => void;
  gpxFile: File | null;
  handleGpxChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const BasicDetailsStep: React.FC<BasicDetailsStepProps> = ({
  formData,
  setFormData,
  imagePreview,
  imagePreviews = [],
  handleImageChange,
  handleImageChangeAtIndex,
  removeImageAtIndex,
  gpxFile,
  handleGpxChange,
  errors,
}) => {
  const [imgErrors, setImgErrors] = useState<Record<number, string>>({});

  const handleImageInputChange =
    (index: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setImgErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[index];
        return newErrors;
      });
      const file = e.target.files?.[0];
      if (!file) {
        if (handleImageChangeAtIndex) {
          handleImageChangeAtIndex(index)(e);
        } else if (index === 0) {
          handleImageChange(e);
        }
        return;
      }

      const validTypes = ["image/jpeg", "image/png", "image/webp"];
      if (!validTypes.includes(file.type)) {
        setImgErrors((prev) => ({
          ...prev,
          [index]: "Only JPG, PNG, or WEBP images are allowed.",
        }));
        return;
      }

      if (file.size > 2 * 1024 * 1024) {
        setImgErrors((prev) => ({
          ...prev,
          [index]: "Image must be less than 2MB.",
        }));
        return;
      }

      if (handleImageChangeAtIndex) {
        handleImageChangeAtIndex(index)(e);
      } else if (index === 0) {
        handleImageChange(e);
      }
    };

  const eventTypeLabel =
    formData.event_type === EventType.CAMPING ? "Camping Event" : "Trek";

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold">Basic Details</h3>
        <p className="text-sm text-muted-foreground">
          Provide the essential information for your{" "}
          {eventTypeLabel.toLowerCase()}
        </p>
      </div>

      <div className="space-y-4">
        {/* Event Name */}
        <div className="space-y-2">
          <Label htmlFor="name">{eventTypeLabel} Name *</Label>
          <Input
            id="name"
            name="name"
            value={formData.name || ""}
            onChange={(e) =>
              setFormData((f) => ({ ...f, name: e.target.value }))
            }
            required
            placeholder={`Enter your ${eventTypeLabel.toLowerCase()} name`}
            className={errors.name ? "border-red-500" : ""}
          />
          {errors.name && (
            <div className="text-red-500 text-xs">{errors.name}</div>
          )}
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            value={formData.description || ""}
            onChange={(e) =>
              setFormData((f) => ({ ...f, description: e.target.value }))
            }
            rows={3}
            placeholder={
              formData.event_type === EventType.CAMPING
                ? "Describe your camping event, activities, and what participants can expect."
                : "Share a short, catchy description for your trek."
            }
          />
        </div>

        {/* Event Images - Up to 5 images */}
        <div className="space-y-4">
          <Label>Event Images (up to 5)</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 5 }).map((_, index) => {
              const preview =
                imagePreviews[index] || (index === 0 ? imagePreview : null);
              return (
                <div key={index} className="space-y-2">
                  <Label htmlFor={`trek-image-${index}`} className="text-sm">
                    Image {index + 1} {index === 0 && "(Primary)"}
                  </Label>
                  <Input
                    id={`trek-image-${index}`}
                    type="file"
                    accept="image/*"
                    onChange={handleImageInputChange(index)}
                  />
                  {imgErrors[index] && (
                    <div className="text-red-500 text-xs">
                      {imgErrors[index]}
                    </div>
                  )}
                  {preview && (
                    <div className="relative mt-2">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border"
                      />
                      {removeImageAtIndex && (
                        <button
                          type="button"
                          onClick={() => removeImageAtIndex(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                          aria-label={`Remove image ${index + 1}`}
                        >
                          ×
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div className="text-gray-500 text-xs">
            Upload up to 5 high-quality images (JPG, PNG, or WEBP, max 2MB
            each). The first image will be used as the primary image.
          </div>
        </div>

        {/* Date and Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="start_datetime">Start Date & Time *</Label>
            <Input
              id="start_datetime"
              name="start_datetime"
              type="datetime-local"
              value={formData.start_datetime || ""}
              onChange={(e) =>
                setFormData((f) => ({ ...f, start_datetime: e.target.value }))
              }
              required
              className={errors.start_datetime ? "border-red-500" : ""}
            />
            {errors.start_datetime && (
              <div className="text-red-500 text-xs">
                {errors.start_datetime}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="end_datetime">End Date & Time</Label>
            <Input
              id="end_datetime"
              name="end_datetime"
              type="datetime-local"
              value={formData.end_datetime || ""}
              onChange={(e) =>
                setFormData((f) => ({ ...f, end_datetime: e.target.value }))
              }
            />
          </div>
        </div>

        {/* Location */}
        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            name="location"
            value={formData.location || ""}
            onChange={(e) =>
              setFormData((f) => ({ ...f, location: e.target.value }))
            }
            placeholder="Enter the location or starting point"
          />
        </div>

        {/* Category and Difficulty (for Trek events) */}
        {formData.event_type === EventType.TREK && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                name="category"
                value={formData.category || ""}
                onChange={(e) =>
                  setFormData((f) => ({ ...f, category: e.target.value }))
                }
                placeholder="E.g., Mountain Trek, Forest Walk"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty Level</Label>
              <Select
                value={formData.difficulty || ""}
                onValueChange={(value) =>
                  setFormData((f) => ({ ...f, difficulty: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Easy">Easy</SelectItem>
                  <SelectItem value="Moderate">Moderate</SelectItem>
                  <SelectItem value="Difficult">Difficult</SelectItem>
                  <SelectItem value="Expert">Expert</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Pricing and Capacity */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="base_price">Registration Fee (₹) *</Label>
            <Input
              id="base_price"
              name="base_price"
              type="number"
              min="0"
              step="0.01"
              value={
                formData.base_price === undefined ||
                formData.base_price === null
                  ? ""
                  : formData.base_price
              }
              onChange={(e) => {
                const val = e.target.value;
                // Allow empty string, 0, or any positive number
                const numValue = val === "" ? undefined : parseFloat(val);
                setFormData((f) => ({
                  ...f,
                  base_price: numValue,
                }));
              }}
              required
              placeholder="0"
              className={errors.base_price ? "border-red-500" : ""}
            />
            {errors.base_price && (
              <div className="text-red-500 text-xs">{errors.base_price}</div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="max_participants">Max Participants *</Label>
            <Input
              id="max_participants"
              name="max_participants"
              type="number"
              min="1"
              value={
                formData.max_participants === undefined ||
                formData.max_participants === null
                  ? ""
                  : formData.max_participants
              }
              onChange={(e) => {
                const val = e.target.value;
                setFormData((f) => ({
                  ...f,
                  max_participants: val === "" ? undefined : parseInt(val, 10),
                }));
              }}
              required
              placeholder="0"
              className={errors.max_participants ? "border-red-500" : ""}
            />
            {errors.max_participants && (
              <div className="text-red-500 text-xs">
                {errors.max_participants}
              </div>
            )}
          </div>
        </div>

        {/* Government ID Requirement */}
        <div className="space-y-2">
          <div className="flex items-start space-x-2">
            <input
              type="checkbox"
              id="government_id_required"
              checked={formData.government_id_required || false}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  government_id_required: e.target.checked,
                }))
              }
              className="mt-1 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <div className="flex-1">
              <Label
                htmlFor="government_id_required"
                className="text-sm font-medium cursor-pointer"
              >
                Requires Government ID Verification
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Check this if participants need to verify their government ID
                (Aadhaar/Passport) for ticket booking, permits, or official
                documentation. This is common for treks requiring forest permits
                or train tickets.
              </p>
            </div>
          </div>
        </div>

        {/* GPX File (for Trek events) */}
        {formData.event_type === EventType.TREK && (
          <div className="space-y-2">
            <Label htmlFor="gpx-file">GPX Route File</Label>
            <Input
              id="gpx-file"
              type="file"
              accept=".gpx"
              onChange={handleGpxChange}
            />
            {gpxFile && (
              <div className="text-sm text-green-600">
                ✓ {gpxFile.name} uploaded
              </div>
            )}
            <div className="text-gray-500 text-xs">
              Upload a GPX file containing the route information (optional)
            </div>
          </div>
        )}

        {/* Status - Removed from form, managed only from admin table */}
      </div>
    </div>
  );
};
