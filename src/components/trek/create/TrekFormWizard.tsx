import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { EventType, TentInventory } from "@/types/trek";
import { useTrekForm } from "./useTrekForm";
import { EventTypeStep } from "./EventTypeStep";
import { BasicDetailsStep } from "./BasicDetailsStep";
import { PackingListStep } from "./PackingListStep";
import { CostsStep } from "./CostsStep";
import { CampingDetailsStep } from "./CampingDetailsStep";
import { ReviewStep } from "./ReviewStep";
import { AdminTrekEvent, FormSubmissionData } from "./types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

interface TrekFormWizardProps {
  trekToEdit?: AdminTrekEvent;
  onFormSubmit: (data: FormSubmissionData) => Promise<void>;
  onCancel: () => void;
  tentInventory?: TentInventory[];
}

export const TrekFormWizard: React.FC<TrekFormWizardProps> = ({
  trekToEdit,
  onFormSubmit,
  onCancel,
  tentInventory = [],
}) => {
  const {
    formData,
    errors,
    imagePreview,
    gpxFile,
    setFormData,
    handleImageChange,
    handleGpxChange,
    validateStep,
    resetForm,
  } = useTrekForm(trekToEdit);

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // Additional state for form steps
  const [selectedPackingItems, setSelectedPackingItems] = useState<Set<number>>(
    new Set(),
  );
  const [mandatoryPackingItems, setMandatoryPackingItems] = useState<
    Set<number>
  >(new Set());
  const [costs, setCosts] = useState<
    Array<{ description: string; amount: number; cost_type: string }>
  >([]);
  const [packingItems, setPackingItems] = useState<
    Array<{ id: number; name: string; category: string | null }>
  >([]);
  const [isLoadingExistingData, setIsLoadingExistingData] = useState(false);

  // Load existing data when editing
  useEffect(() => {
    if (trekToEdit?.trek_id) {
      loadExistingData();
    }
  }, [trekToEdit?.trek_id]);

  const loadExistingData = async () => {
    if (!trekToEdit?.trek_id) {
      return;
    }

    setIsLoadingExistingData(true);
    try {
      // Load existing packing list items
      const { data: packingData, error: packingError } = await supabase
        .from("trek_packing_list_assignments")
        .select("master_item_id, mandatory")
        .eq("trek_id", trekToEdit.trek_id);

      if (packingError) {
        console.error(
          "TrekFormWizard: Error loading packing list:",
          packingError,
        );
      } else {
        const selected = new Set(
          (packingData || []).map((item) => item.master_item_id),
        );
        const mandatory = new Set(
          (packingData || [])
            .filter((item) => item.mandatory)
            .map((item) => item.master_item_id),
        );
        // Set the selected and mandatory items
        setSelectedPackingItems(selected);
        setMandatoryPackingItems(mandatory);
      }

      // Load existing costs
      const { data: costsData, error: costsError } = await supabase
        .from("trek_costs")
        .select("*")
        .eq("trek_id", trekToEdit.trek_id);

      if (costsError) {
        console.error("Error loading costs:", costsError);
      } else {
        const formattedCosts = (costsData || []).map((cost) => ({
          description: cost.description || "",
          amount: cost.amount || 0,
          cost_type: cost.cost_type || "OTHER",
        }));
        setCosts(formattedCosts);
      }

      // Load master packing items for display
      const { data: masterItems, error: masterError } = await supabase
        .from("master_packing_items")
        .select("id, name, category");

      if (masterError) {
        console.error("Error loading master packing items:", masterError);
      } else {
        setPackingItems(masterItems || []);
      }
    } catch (error) {
      console.error("Error loading existing data:", error);
      toast({
        title: "Error",
        description: "Failed to load existing event data",
        variant: "destructive",
      });
    } finally {
      setIsLoadingExistingData(false);
    }
  };

  // Calculate total steps based on event type
  const getTotalSteps = () => {
    return formData.event_type === EventType.CAMPING ? 6 : 5;
  };

  // Get step names for progress indication
  const getStepName = (stepNumber: number) => {
    const steps = [
      "Event Type",
      "Basic Details",
      "Packing List",
      "Fixed Costs",
      formData.event_type === EventType.CAMPING ? "Camping Details" : "Review",
      formData.event_type === EventType.CAMPING ? "Review" : "",
    ].filter(Boolean);

    return steps[stepNumber - 1] || "";
  };

  // Navigation handlers
  const handleNext = () => {
    const validation = validateStep(step);
    if (validation.isValid && step < getTotalSteps()) {
      setStep(step + 1);
    }
  };

  const handlePrevious = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  // Handle packing list item toggle
  const handlePackingItemToggle = (itemId: number, isMandatory: boolean) => {
    if (isMandatory) {
      // Toggle mandatory status
      const newMandatory = new Set(mandatoryPackingItems);
      if (newMandatory.has(itemId)) {
        newMandatory.delete(itemId);
      } else {
        newMandatory.add(itemId);
      }
      setMandatoryPackingItems(newMandatory);
    } else {
      // Toggle selected status
      const newSelected = new Set(selectedPackingItems);
      if (newSelected.has(itemId)) {
        newSelected.delete(itemId);
        // Also remove from mandatory if it was mandatory
        const newMandatory = new Set(mandatoryPackingItems);
        newMandatory.delete(itemId);
        setMandatoryPackingItems(newMandatory);
      } else {
        newSelected.add(itemId);
      }
      setSelectedPackingItems(newSelected);
    }
  };

  // Form submission
  const handleSubmit = async () => {
    const validation = validateStep(step);
    if (!validation.isValid) {
      return;
    }

    setSubmitting(true);
    try {
      // Prepare packing list data
      const packingList = Array.from(selectedPackingItems).map((itemId) => ({
        master_item_id: itemId,
        mandatory: mandatoryPackingItems.has(itemId),
      }));

      // Preparing submission data

      const submissionData: FormSubmissionData = {
        trekData: formData,
        packingList,
        costs,
        tentInventory:
          formData.event_type === EventType.CAMPING ? tentInventory : undefined,
      };

      console.log(
        "TrekFormWizard: Calling onFormSubmit with data:",
        submissionData,
      );
      await onFormSubmit(submissionData);
      resetForm();
    } catch (error) {
      console.error("TrekFormWizard: Form submission error:", error);
    } finally {
      setSubmitting(false);
    }
  };

  // Render current step
  const renderStep = () => {
    const stepProps = {
      formData,
      setFormData,
      errors,
    };

    switch (step) {
      case 1:
        return <EventTypeStep {...stepProps} isEdit={!!trekToEdit} />;

      case 2:
        return (
          <BasicDetailsStep
            {...stepProps}
            imagePreview={imagePreview}
            handleImageChange={handleImageChange}
            gpxFile={gpxFile}
            handleGpxChange={handleGpxChange}
          />
        );

      case 3:
        return (
          <PackingListStep
            {...stepProps}
            selectedItems={selectedPackingItems}
            mandatoryItems={mandatoryPackingItems}
            onItemToggle={handlePackingItemToggle}
            isLoadingExistingData={isLoadingExistingData}
          />
        );

      case 4:
        return (
          <CostsStep
            {...stepProps}
            costs={costs}
            onCostsChange={setCosts}
            isLoadingExistingData={isLoadingExistingData}
          />
        );

      case 5:
        // For Trek: Review Step, For Camping: Camping Details Step
        if (formData.event_type === EventType.CAMPING) {
          return (
            <CampingDetailsStep
              {...stepProps}
              isLoadingExistingData={isLoadingExistingData}
            />
          );
        } else {
          return (
            <ReviewStep
              {...stepProps}
              costs={costs}
              selectedPackingItems={selectedPackingItems}
              mandatoryPackingItems={mandatoryPackingItems}
              packingItems={packingItems}
              imagePreview={imagePreview}
              gpxFile={gpxFile}
            />
          );
        }

      case 6:
        // Only for Camping: Review Step
        return (
          <ReviewStep
            {...stepProps}
            costs={costs}
            selectedPackingItems={selectedPackingItems}
            mandatoryPackingItems={mandatoryPackingItems}
            packingItems={packingItems}
            imagePreview={imagePreview}
            gpxFile={gpxFile}
          />
        );

      default:
        return (
          <div className="text-center py-8">
            <h3 className="text-lg font-semibold">Invalid Step</h3>
            <p className="text-muted-foreground">
              Something went wrong with the form navigation
            </p>
          </div>
        );
    }
  };

  const totalSteps = getTotalSteps();
  const progress = (step / totalSteps) * 100;
  const canGoNext = step < totalSteps;
  const canGoPrevious = step > 1;
  const isLastStep = step === totalSteps;

  return (
    <Dialog open onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {trekToEdit ? "Edit Event" : "Create New Event"}
          </DialogTitle>
        </DialogHeader>

        {/* Progress Indicator */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>
              Step {step} of {totalSteps}
            </span>
            <span>{getStepName(step)}</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Content */}
        <div className="min-h-[400px]">{renderStep()}</div>

        {/* Navigation */}
        <div className="flex justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={!canGoPrevious || submitting}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>

          <div className="flex gap-2">
            <Button variant="ghost" onClick={onCancel} disabled={submitting}>
              Cancel
            </Button>

            {isLastStep ? (
              <Button
                onClick={handleSubmit}
                disabled={submitting || isLoadingExistingData}
              >
                {submitting
                  ? trekToEdit
                    ? "Updating..."
                    : "Creating..."
                  : trekToEdit
                    ? "Update Event"
                    : `Create ${formData.event_type === EventType.CAMPING ? "Camping Event" : "Trek"}`}
              </Button>
            ) : (
              <Button onClick={handleNext} disabled={!canGoNext || submitting}>
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
