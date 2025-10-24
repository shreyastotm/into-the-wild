import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import CreateTrekMultiStepFormNew from "@/components/trek/CreateTrekMultiStepFormNew";
import {
  AdminTrekEvent,
  FormSubmissionData,
} from "@/components/trek/create/types";
import { TentInventory } from "@/types/trek";

export default function CreateTrekEvent() {
  const navigate = useNavigate();
  const [tentInventory, setTentInventory] = useState<TentInventory[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch tent inventory for camping events
  useEffect(() => {
    const fetchTentInventory = async () => {
      try {
        const { datatent_inventory } = await supabase
        .from('"*"')
        .select($3)
        .order("tent_type") as any;

        if (error) {
          console.error("Error fetching tent inventory:", error);
          return;
        }

        setTentInventory(data || []);
      } catch (error) {
        console.error("Error fetching tent inventory:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTentInventory();
  }, []);

  const handleFormSubmit = async (data: FormSubmissionData) => {
    try {
      const { trekData, packingList, costs, tentInventory: tentData } = data;

      // Validate required fields
      if (
        !trekData.name ||
        !trekData.start_datetime ||
        !trekData.base_price ||
        !trekData.max_participants
      ) {
        throw new Error("Please fill in all required fields.");
      }

      // Sanitize trek data
      const sanitizedTrekData = {
        ...trekData,
        start_datetime: new Date(trekData.start_datetime).toISOString(),
        end_datetime: trekData.end_datetime
          ? new Date(trekData.end_datetime).toISOString()
          : null,
        base_price: Number(trekData.base_price),
        max_participants: Number(trekData.max_participants),
        status: "Draft" as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Step 1: Create the main trek event
      const { data: newTrek, error: trekError } = await supabase
        .from("trek_events")
        .insert(sanitizedTrekData)
        .select("trek_id")
        .single() as any;

      if (trekError) {
        throw new Error(`Failed to create trek: ${trekError.message}`);
      }

      const trekId = newTrek.trek_id;

      // Step 2: Handle packing list assignments
      if (packingList && packingList.length > 0) {
        const assignments = packingList.map((item) => ({
          trek_id: trekId,
          master_item_id: item.master_item_id,
          mandatory: item.is_mandatory,
        }));

        const { error: assignmentError } = await supabase
        .from("trek_packing_list_assignments")
        .insert(assignments) as any;

        if (assignmentError) {
          throw new Error(
            `Failed to assign packing list: ${assignmentError.message}`,
          );
        }
      }

      // Step 3: Handle fixed costs
      if (costs && costs.length > 0) {
        const costData = costs.map((cost) => ({
          trek_id: trekId,
          cost_type: cost.cost_type,
          amount: Number(cost.amount),
          description: cost.description || null,
          is_mandatory: cost.is_mandatory || false,
        }));

        const { error: costError } = await supabase
        .from("trek_costs")
        .insert(costData) as any;

        if (costError) {
          throw new Error(`Failed to add costs: ${costError.message}`);
        }
      }

      // Step 4: Handle tent inventory for camping events
      if (
        tentData &&
        tentData.length > 0 &&
        trekData.event_type === "camping"
      ) {
        const tentAssignments = tentData.map((tent) => ({
          trek_id: trekId,
          tent_type: tent.tent_type,
          quantity_available: Number(tent.quantity_available),
          price_per_night: Number(tent.price_per_night) || 0,
        }));

        const { error: tentError } = await supabase
        .from("trek_tent_assignments")
        .insert(tentAssignments) as any;

        if (tentError) {
          throw new Error(
            `Failed to assign tent inventory: ${tentError.message}`,
          );
        }
      }

      toast({
        title: "Event Created Successfully",
        description:
          "Your trek event has been created and is now in draft status.",
        variant: "default",
      });

      // Navigate to the created event
      navigate(`/events/${trekId}`);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create trek event";
      toast({
        title: "Creation Failed",
        description: errorMessage,
        variant: "destructive",
      });
      console.error("Error creating trek event:", error);
    }
  };

  const handleCancel = () => {
    navigate("/events");
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="animate-pulse">
          <div className="h-12 bg-gray-200 rounded mb-6"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <CreateTrekMultiStepFormNew
        onFormSubmit={handleFormSubmit}
        onCancel={handleCancel}
        tentInventory={tentInventory}
      />
    </div>
  );
}
