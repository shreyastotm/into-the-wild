import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  AdminTrekEvent,
  FormSubmissionData,
} from "@/components/trek/create/types";
import CreateTrekMultiStepFormNew from "@/components/trek/CreateTrekMultiStepFormNew";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { EventType, TentInventory } from "@/types/trek";

export default function CreateTrekEvent() {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const [tentInventory, setTentInventory] = useState<TentInventory[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch tent inventory for camping events
  useEffect(() => {
    const fetchTentInventory = async () => {
      try {
        const { data, error } = await supabase
        .from("tent_inventory")
        .select("*")
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

      // ✅ VALIDATION: Restrict Jam Yard creation to partners/admins
      if (trekData.event_type === EventType.JAM_YARD) {
        if (!userProfile) {
          throw new Error("You must be logged in to create Jam Yard events");
        }
        
        // Allow if user is admin OR micro_community (partner)
        const isPartner = userProfile.user_type === "micro_community";
        const isAdmin = userProfile.user_type === "admin";
        
        if (!isPartner && !isAdmin) {
          throw new Error(
            "Only partners and admins can create Jam Yard events. " +
            "Please contact support to become a partner."
          );
        }
      }

      // Validate required fields
      if (
        !trekData.name ||
        !trekData.start_datetime ||
        !trekData.base_price ||
        !trekData.max_participants
      ) {
        throw new Error("Please fill in all required fields.");
      }

      // Determine event creator type and partner ID
      const isPartner = userProfile?.user_type === "micro_community";
      const isAdmin = userProfile?.user_type === "admin";

      // Sanitize trek data
      const sanitizedTrekData = {
        name: trekData.name,
        description: trekData.description,
        category: trekData.category,
        difficulty: trekData.difficulty,
        start_datetime: new Date(trekData.start_datetime).toISOString(),
        end_datetime: trekData.end_datetime
          ? new Date(trekData.end_datetime).toISOString()
          : null,
        base_price: Number(trekData.base_price),
        max_participants: Number(trekData.max_participants),
        location: trekData.location,
        event_type: trekData.event_type,
        event_creator_type: isPartner ? "external" : "internal",
        partner_id: isPartner ? userProfile.user_id : null,
        created_by: userProfile?.user_id || null,
        status: "Draft" as const,
        jam_yard_details: trekData.event_type === EventType.JAM_YARD
          ? trekData.jam_yard_details
          : undefined,
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
          mandatory: item.mandatory,
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
          tent_type_id: tent.tent_type_id,
          total_available: Number(tent.total_available),
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

      const eventTypeDisplay = trekData.event_type === EventType.JAM_YARD
        ? "Jam Yard event"
        : trekData.event_type === EventType.CAMPING
        ? "camping event"
        : "trek event";

      toast({
        title: "Event Created Successfully",
        description: `Your ${eventTypeDisplay} has been created and is now in draft status.`,
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
          <div className="h-12 bg-gray-200 rounded mb-6" />
          <div className="h-64 bg-gray-200 rounded" />
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
