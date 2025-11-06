import { useCallback, useState } from "react";

import { AdminTrekEvent, FormValidationResult } from "./types";

import { EventType } from "@/types/trek";

export const useTrekForm = (initialData?: AdminTrekEvent) => {
  // Format dates for datetime-local input
  const formatDateForInput = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16); // Format: YYYY-MM-DDTHH:mm
  };

  const processedInitialData = initialData
    ? {
        ...initialData,
        start_datetime: formatDateForInput(initialData.start_datetime),
        end_datetime: formatDateForInput(initialData.end_datetime),
      }
    : undefined;

  // Debug logging removed for production

  const [formData, setFormData] = useState<AdminTrekEvent>({
    event_type: EventType.TREK,
    status: "Draft", // Use TrekEventStatus.DRAFT value
    ...processedInitialData,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imagePreviews, setImagePreviews] = useState<(string | null)[]>(
    Array(5).fill(null),
  );
  const [gpxFile, setGpxFile] = useState<File | null>(null);

  // Handle single image upload (for backward compatibility)
  const handleImageChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const result = event.target?.result as string;
          // Update first image slot
          setImagePreviews((prev) => {
            const newPreviews = [...prev];
            newPreviews[0] = result;
            return newPreviews;
          });
          setFormData((prev) => {
            const images = prev.images || [];
            images[0] = result;
            return { ...prev, image: result, images };
          });
        };
        reader.readAsDataURL(file);
      }
    },
    [],
  );

  // Handle multiple image uploads
  const handleImageChangeAtIndex = useCallback(
    (index: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const result = event.target?.result as string;
          setImagePreviews((prev) => {
            const newPreviews = [...prev];
            newPreviews[index] = result;
            return newPreviews;
          });
          setFormData((prev) => {
            const images = prev.images || Array(5).fill(null);
            images[index] = result;
            // Also set first image for backward compatibility
            const image = index === 0 ? result : prev.image;
            return { ...prev, image, images };
          });
        };
        reader.readAsDataURL(file);
      }
    },
    [],
  );

  // Remove image at index
  const removeImageAtIndex = useCallback((index: number) => {
    setImagePreviews((prev) => {
      const newPreviews = [...prev];
      newPreviews[index] = null;
      return newPreviews;
    });
    setFormData((prev) => {
      const images = prev.images || Array(5).fill(null);
      images[index] = undefined;
      // Also clear first image if removing index 0
      const image = index === 0 ? undefined : prev.image;
      return { ...prev, image, images };
    });
  }, []);

  // Handle GPX file upload
  const handleGpxChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && file.name.endsWith(".gpx")) {
        setGpxFile(file);
        // You could read the file content here if needed
        setFormData((prev) => ({ ...prev, gpx_file: file.name }));
      }
    },
    [],
  );

  // Validation functions
  const validateStep = useCallback(
    (step: number): FormValidationResult => {
      const newErrors: Record<string, string> = {};

      switch (step) {
        case 1: // Event Type Step
          if (!formData.event_type) {
            newErrors.event_type = "Please select an event type.";
          }
          break;

        case 2: // Basic Details Step
          if (!formData.name?.trim()) {
            newErrors.name = "Event name is required.";
          }
          if (!formData.start_datetime) {
            newErrors.start_datetime = "Start date and time is required.";
          }
          if (
            formData.base_price === undefined ||
            formData.base_price === null
          ) {
            newErrors.base_price =
              "Registration fee is required. Enter 0 for free events.";
          } else if (formData.base_price < 0) {
            newErrors.base_price =
              "Registration fee cannot be negative. Enter 0 for free events.";
          }
          if (
            formData.max_participants === undefined ||
            formData.max_participants === null ||
            formData.max_participants < 1
          ) {
            newErrors.max_participants =
              "Maximum participants must be at least 1.";
          }
          // Validate end date is after start date
          if (
            formData.start_datetime &&
            formData.end_datetime &&
            formData.end_datetime <= formData.start_datetime
          ) {
            newErrors.end_datetime = "End date must be after start date.";
          }
          break;

        // Final validation before submission (used for all remaining steps)
        default:
          // Ensure all required fields are filled
          if (!formData.name?.trim()) {
            newErrors.name = "Event name is required.";
          }
          if (!formData.event_type) {
            newErrors.event_type = "Event type is required.";
          }
          if (!formData.start_datetime) {
            newErrors.start_datetime = "Start date and time is required.";
          }
          if (
            formData.base_price === undefined ||
            formData.base_price === null
          ) {
            newErrors.base_price =
              "Registration fee is required. Enter 0 for free events.";
          } else if (formData.base_price < 0) {
            newErrors.base_price =
              "Registration fee cannot be negative. Enter 0 for free events.";
          }
          if (
            formData.max_participants === undefined ||
            formData.max_participants === null ||
            formData.max_participants < 1
          ) {
            newErrors.max_participants =
              "Maximum participants must be at least 1.";
          }
          break;
      }

      setErrors(newErrors);
      return {
        isValid: Object.keys(newErrors).length === 0,
        errors: newErrors,
      };
    },
    [formData],
  );

  // Clear specific error
  const clearError = useCallback((field: string) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  // Reset form
  const resetForm = useCallback(() => {
    setFormData({
      event_type: EventType.TREK,
      status: "Draft",
    });
    setErrors({});
    setImagePreviews(Array(5).fill(null));
    setGpxFile(null);
  }, []);

  // Update form data with validation
  const updateFormData = useCallback(
    (updater: (prev: AdminTrekEvent) => AdminTrekEvent) => {
      setFormData(updater);
      // Clear related errors when data changes
      setErrors((prev) => {
        const newErrors = { ...prev };
        // Clear general errors when any field changes
        delete newErrors.general;
        return newErrors;
      });
    },
    [],
  );

  return {
    // State
    formData,
    errors,
    imagePreview: imagePreviews[0], // For backward compatibility
    imagePreviews, // New: array of all image previews
    gpxFile,

    // Actions
    setFormData: updateFormData,
    handleImageChange, // For backward compatibility
    handleImageChangeAtIndex, // New: handle image at specific index
    removeImageAtIndex, // New: remove image at index
    handleGpxChange,
    validateStep,
    clearError,
    resetForm,
  };
};
