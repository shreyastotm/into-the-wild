import { useState, useCallback } from "react";
import { EventType } from "@/types/trek";
import { AdminTrekEvent, FormValidationResult } from "./types";

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
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [gpxFile, setGpxFile] = useState<File | null>(null);

  // Handle image upload
  const handleImageChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const result = event.target?.result as string;
          setImagePreview(result);
          setFormData((prev) => ({ ...prev, image: result }));
        };
        reader.readAsDataURL(file);
      }
    },
    [],
  );

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
            formData.base_price === null ||
            formData.base_price < 0
          ) {
            newErrors.base_price =
              "Registration fee must be a valid positive number.";
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
            formData.base_price === null ||
            formData.base_price < 0
          ) {
            newErrors.base_price =
              "Registration fee is required and must be positive.";
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
    setImagePreview(null);
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
    imagePreview,
    gpxFile,

    // Actions
    setFormData: updateFormData,
    handleImageChange,
    handleGpxChange,
    validateStep,
    clearError,
    resetForm,
  };
};
