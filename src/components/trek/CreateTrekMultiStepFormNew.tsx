import React from "react";

import { TrekFormWizard } from "./create/TrekFormWizard";
import { AdminTrekEvent, FormSubmissionData } from "./create/types";

import { TentInventory } from "@/types/trek";

interface CreateTrekMultiStepFormProps {
  trekToEdit?: AdminTrekEvent;
  onFormSubmit: (data: FormSubmissionData) => Promise<void>;
  onCancel: () => void;
  tentInventory?: TentInventory[];
}

/**
 * Refactored CreateTrekMultiStepForm component
 *
 * This is a clean, modular replacement for the original 954-line component.
 * Key improvements:
 * - Separated concerns into smaller, focused components
 * - Custom hooks for form state management
 * - Better TypeScript types
 * - Improved validation and error handling
 * - More maintainable code structure
 */
export const CreateTrekMultiStepFormNew: React.FC<
  CreateTrekMultiStepFormProps
> = ({ trekToEdit, onFormSubmit, onCancel, tentInventory = [] }) => {
  // Validate required props
  if (!onFormSubmit || !onCancel) {
    console.error("CreateTrekMultiStepFormNew: Missing required props");
    return null;
  }

  return (
    <TrekFormWizard
      trekToEdit={trekToEdit}
      onFormSubmit={onFormSubmit}
      onCancel={onCancel}
      tentInventory={tentInventory}
    />
  );
};

// Export the component as default for backward compatibility
export default CreateTrekMultiStepFormNew;
