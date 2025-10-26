import { AlertCircle, Calendar, Tent, Users } from "lucide-react";
import React, { useCallback, useEffect , useState } from "react";

import { useAuth } from "@/components/auth/AuthProvider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { TentInventory, TentRequest, TentType } from "@/types/trek";
import { calculateGSTPrice } from '@/utils/indianStandards';

interface TentRentalProps {
  eventId: number;
  eventStartDate: string;
  eventEndDate?: string;
  isRegistered: boolean;
}

export const TentRental: React.FC<TentRentalProps> = ({
  eventId,
  eventStartDate,
  eventEndDate,
  isRegistered,
}) => {
  const { user } = useAuth();
  const [tentInventory, setTentInventory] = useState<TentInventory[]>([]);
  const [existingRequests, setExistingRequests] = useState<TentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [selectedTents, setSelectedTents] = useState<
    Record<
      number,
      {
        quantity: number;
        nights: number;
        notes: string;
      }
    >
  >({});

  const fetchTentData = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      setHasError(false);

      // First check if tent tables exist by trying to query tent_types
      const { data: tentTypesData, error: tentTypesError } = await supabase
        .from("tent_types")
        .select("id")
        .limit(1);

      // If tent_types table doesn't exist, show setup message
      if (tentTypesError && tentTypesError.code === "PGRST116") {
        setHasError(true);
        return;
      }

      if (tentTypesError) throw tentTypesError;

      // Fetch tent inventory for this event
      const { data: inventoryData, error: inventoryError } = await supabase
        .from("tent_inventory")
        .select(
          `
          *,
          tent_type:tent_types(*)
        `,
        )
        .eq("event_id", eventId);

      if (inventoryError) throw inventoryError;

      // Fetch existing requests for this user and event
      const { data: requestsData, error: requestsError } = await supabase
        .from("tent_requests")
        .select(
          `
          *,
          tent_type:tent_types(*)
        `,
        )
        .eq("event_id", eventId)
        .eq("user_id", user.id);

      if (requestsError) throw requestsError;

      setTentInventory(inventoryData || []);
      setExistingRequests(requestsData || []);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to load tent rental information.";
      console.error("Error fetching tent data:", error);
      setHasError(true);

      // Don't show toast for missing tables - just show the error state
      if (
        !errorMessage.includes("relation") &&
        !errorMessage.includes("does not exist")
      ) {
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  }, [eventId, user]);

  useEffect(() => {
    if (user && isRegistered) {
      fetchTentData();
    }
  }, [user, isRegistered, fetchTentData]);

  const calculateNights = () => {
    const start = new Date(eventStartDate);
    const end = eventEndDate
      ? new Date(eventEndDate)
      : new Date(start.getTime() + 24 * 60 * 60 * 1000);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const defaultNights = calculateNights();

  const updateTentSelection = (
    tentTypeId: number,
    field: string,
    value: number | string,
  ) => {
    setSelectedTents((prev) => ({
      ...prev,
      [tentTypeId]: {
        quantity:
          field === "quantity"
            ? Number(value)
            : prev[tentTypeId]?.quantity || 0,
        nights:
          field === "nights"
            ? Number(value)
            : prev[tentTypeId]?.nights || defaultNights,
        notes:
          field === "notes" ? String(value) : prev[tentTypeId]?.notes || "",
      },
    }));
  };

  const calculateCost = (
    tentType: TentType,
    quantity: number,
    nights: number,
  ) => {
    return tentType.rental_price_per_night * quantity * nights;
  };

  const getAvailableQuantity = (tentInventory: TentInventory) => {
    return Math.max(
      0,
      tentInventory.total_available - tentInventory.reserved_count,
    );
  };

  const handleSubmitRequest = async (tentTypeId: number) => {
    if (!user || !selectedTents[tentTypeId]) return;

    const selection = selectedTents[tentTypeId];
    const tentType = tentInventory.find(
      (t) => t.tent_type_id === tentTypeId,
    )?.tent_type;

    if (!tentType || selection.quantity <= 0) return;

    try {
      setSubmitting(true);

      const totalCost = calculateGSTPrice(calculateCost(tentType, selection.quantity, selection.nights));

      const { error } = await supabase.from("tent_requests").upsert(
        {
          event_id: eventId,
          user_id: user.id,
          tent_type_id: tentTypeId,
          quantity_requested: selection.quantity,
          nights: selection.nights,
          total_cost: totalCost,
          request_notes: selection.notes || null,
          status: "pending",
        },
        {
          onConflict: "event_id,user_id,tent_type_id",
        },
      );

      if (error) throw error;

      toast({
        title: "Request Submitted",
        description: `Your tent rental request has been submitted for admin approval.`,
      });

      // Refresh data
      await fetchTentData();

      // Clear selection
      setSelectedTents((prev) => {
        const newSelection = { ...prev };
        delete newSelection[tentTypeId];
        return newSelection;
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to submit tent request";
      console.error("Error submitting tent request:", error);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelRequest = async (requestId: number) => {
    try {
      setSubmitting(true);

      const { error } = await supabase
        .from("tent_requests")
        .update({ status: "cancelled" })
        .eq("id", requestId);

      if (error) throw error;

      toast({
        title: "Request Cancelled",
        description: "Your tent rental request has been cancelled.",
      });

      await fetchTentData();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to cancel tent request";
      console.error("Error cancelling tent request:", error);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!isRegistered) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tent className="h-5 w-5" />
            Tent Rentals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You must be registered for this event to request tent rentals.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tent className="h-5 w-5" />
            Tent Rentals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Loading tent options...</div>
        </CardContent>
      </Card>
    );
  }

  if (hasError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tent className="h-5 w-5" />
            Tent Rentals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-3">
                <p className="font-medium">
                  Tent rental feature is not yet set up for this event.
                </p>
                <div className="text-sm">
                  <p className="mb-2">
                    To enable tent rentals, the admin needs to:
                  </p>
                  <ol className="list-decimal list-inside space-y-1 ml-2">
                    <li>Run the tent rental database migration</li>
                    <li>Add tent inventory for this camping event</li>
                    <li>Configure tent types and pricing</li>
                  </ol>
                </div>
                <div className="mt-3 p-3 bg-muted rounded-lg text-xs">
                  <p className="font-medium mb-1">For Developers:</p>
                  <p>
                    Run:{" "}
                    <code className="bg-background px-1 rounded">
                      supabase db push
                    </code>{" "}
                    to apply tent rental migrations
                  </p>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (tentInventory.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tent className="h-5 w-5" />
            Tent Rentals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No tent rentals are available for this camping event.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tent className="h-5 w-5" />
            Tent Rentals Available
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Rent tents for your camping experience. All requests require admin
            approval.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {tentInventory.map((inventory) => {
            const tentType = inventory.tent_type!;
            const availableQty = getAvailableQuantity(inventory);
            const existingRequest = existingRequests.find(
              (r) => r.tent_type_id === tentType.id,
            );
            const selection = selectedTents[tentType.id] || {
              quantity: 0,
              nights: defaultNights,
              notes: "",
            };

            return (
              <div
                key={tentType.id}
                className="border rounded-lg p-4 space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{tentType.name}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {tentType.capacity} people
                      </span>
                      <span>₹{tentType.rental_price_per_night}/night</span>
                      <span>{availableQty} available</span>
                    </div>
                    {tentType.description && (
                      <p className="text-sm text-muted-foreground mt-2">
                        {tentType.description}
                      </p>
                    )}
                  </div>
                </div>

                {existingRequest ? (
                  <div className="bg-muted p-3 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Existing Request</p>
                        <p className="text-sm text-muted-foreground">
                          {existingRequest.quantity_requested} tent(s) for{" "}
                          {existingRequest.nights} night(s)
                        </p>
                        <p className="text-sm font-medium">
                          Total: ₹{existingRequest.total_cost}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            existingRequest.status === "approved"
                              ? "default"
                              : existingRequest.status === "rejected"
                                ? "destructive"
                                : existingRequest.status === "cancelled"
                                  ? "secondary"
                                  : "secondary"
                          }
                        >
                          {existingRequest.status}
                        </Badge>
                        {existingRequest.status === "pending" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleCancelRequest(existingRequest.id!)
                            }
                            disabled={submitting}
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                    </div>
                    {existingRequest.admin_notes && (
                      <div className="mt-2 p-2 bg-background rounded text-sm">
                        <strong>Admin Notes:</strong>{" "}
                        {existingRequest.admin_notes}
                      </div>
                    )}
                  </div>
                ) : availableQty > 0 ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`quantity-${tentType.id}`}>
                          Quantity
                        </Label>
                        <Input
                          id={`quantity-${tentType.id}`}
                          type="number"
                          min="1"
                          max={availableQty}
                          value={selection.quantity}
                          onChange={(e) =>
                            updateTentSelection(
                              tentType.id,
                              "quantity",
                              e.target.value,
                            )
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor={`nights-${tentType.id}`}>Nights</Label>
                        <Input
                          id={`nights-${tentType.id}`}
                          type="number"
                          min="1"
                          value={selection.nights}
                          onChange={(e) =>
                            updateTentSelection(
                              tentType.id,
                              "nights",
                              e.target.value,
                            )
                          }
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor={`notes-${tentType.id}`}>
                        Special Requests (Optional)
                      </Label>
                      <Textarea
                        id={`notes-${tentType.id}`}
                        placeholder="Any special requirements or notes..."
                        value={selection.notes}
                        onChange={(e) =>
                          updateTentSelection(
                            tentType.id,
                            "notes",
                            e.target.value,
                          )
                        }
                        rows={2}
                      />
                    </div>

                    {selection.quantity > 0 && (
                      <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div className="text-sm">
                          <span className="font-medium">Total Cost: </span>₹
                          {calculateCost(
                            tentType,
                            selection.quantity,
                            selection.nights,
                          )}
                          <span className="text-muted-foreground ml-2">
                            ({selection.quantity} × {selection.nights} nights ×
                            ₹{tentType.rental_price_per_night})
                          </span>
                        </div>
                        <Button
                          onClick={() => handleSubmitRequest(tentType.id)}
                          disabled={submitting || selection.quantity <= 0}
                        >
                          Request Rental
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      This tent type is currently out of stock for this event.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
};
