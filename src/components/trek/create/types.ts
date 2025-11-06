import { EventType, TentInventory } from "@/types/trek";

// Form data interface for trek/camping event creation
export interface AdminTrekEvent {
  name?: string; // Required in validation but optional during form filling
  description?: string;
  event_type: EventType; // Required
  start_datetime?: string; // Required in validation but optional during form filling
  end_datetime?: string;
  location?: string;
  category?: string;
  difficulty?: string;
  base_price?: number; // Required in validation but optional during form filling
  max_participants?: number; // Required in validation but optional during form filling
  image?: string; // Legacy single image (for backward compatibility)
  images?: string[]; // Array of base64 image strings (up to 5)
  gpx_file?: string;
  status?: string;
  government_id_required?: boolean;
  itinerary?: {
    days?: Array<{
      title: string;
      accommodation?: string;
      activities?: string[];
    }>;
  };
  activity_schedule?: Record<string, unknown>;
  volunteer_roles?: {
    roles?: Array<{
      title: string;
      description?: string;
      requirements?: string;
      spots_needed: number;
    }>;
  };
  jam_yard_details?: {
    activity_focus?: string;
    instructor_name?: string;
    instructor_bio?: string;
    instructor_image?: string;
    venue_type?: string;
    venue_details?: string;
    target_audience?: string;
    session_duration?: number;
    equipment_provided?: string[];
    skill_level?: string;
    weather_dependency?: boolean;
    can_complement_camping?: boolean;
    can_complement_trek?: boolean;
  };
}

// Step component props interface
export interface StepProps {
  formData: AdminTrekEvent;
  setFormData: (updater: (prev: AdminTrekEvent) => AdminTrekEvent) => void;
  errors: Record<string, string>;
  [key: string]: unknown; // For additional props specific to each step
}

// Form submission data
export interface FormSubmissionData {
  trekData: AdminTrekEvent;
  packingList: Array<{ master_item_id: number; mandatory: boolean }>;
  costs: Array<{ description: string; amount: number; cost_type: string }>;
  tentInventory?: TentInventory[];
  tags?: number[]; // Array of tag IDs to assign to the trek
}

// Step navigation
export interface StepNavigation {
  currentStep: number;
  totalSteps: number;
  canGoNext: boolean;
  canGoPrevious: boolean;
  nextStep: () => void;
  previousStep: () => void;
}

// Form validation result
export interface FormValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}
