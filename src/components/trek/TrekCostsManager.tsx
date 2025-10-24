import { calculateGSTPrice } from '@/utils/indianStandards';
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { formatCurrency } from "@/lib/utils";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { TrekCost, TrekCostType } from "@/integrations/supabase/types";
import { useCallback } from "react";

interface TrekCostsManagerProps {
  trekId: number;
  isAdmin: boolean;
}

type NewTrekCost = Omit<TrekCost, "id" | "created_at" | "updated_at">;

export default function TrekCostsManager({
  trekId,
  isAdmin,
}: TrekCostsManagerProps) {
  const [costs, setCosts] = useState<TrekCost[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newCost, setNewCost] = useState<NewTrekCost>({
    trek_id: trekId,
    cost_type: "ACCOMMODATION",
    amount: 0,
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const fetchCosts = useCallback(async () => {
    try {
      const { datatrek_costs } = await supabase
        .from('"*"')
        .select($3)
        .eq("trek_id", trekId)
        .order("created_at", { ascending: true }) as any;

      if (error) throw error;
      setCosts(data || []);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      toast({
        title: "Error fetching costs",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [trekId]);

  useEffect(() => {
    fetchCosts();
  }, [trekId, fetchCosts]);

  const handleAddCost = async () => {
    if (!newCost.amount || newCost.amount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount greater than 0",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      let fileUrl = "";
      if (selectedFile && newCost.cost_type === "TICKETS") {
        const { data, error: uploadError } = await supabase.storage
        .from("trek-assets")
        .upload(
            `tickets/${trekId}/${Date.now()}_${selectedFile.name}`,
            selectedFile,
          );

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
        .from("trek-assets")
        .getPublicUrl(data.path) as any;

        fileUrl = urlData.publicUrl;
      }

      const { data, error } = await supabase
        .from("trek_costs")
        .insert([
          {
            ...newCost,
            file_url: fileUrl || undefined,
          },
        ])
        .select()
        .single() as any;

      if (error) throw error;
      if (!data) throw new Error("No data returned from insert");

      setCosts([...costs, data]);
      setNewCost({
        trek_id: trekId,
        cost_type: "ACCOMMODATION",
        amount: 0,
      });
      setSelectedFile(null);

      toast({
        title: "Cost added",
        description: "The cost has been added successfully.",
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      toast({
        title: "Error adding cost",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCost = async (costId: number) => {
    try {
      const { error } = await supabase
        .from("trek_costs")
        .delete()
        .eq("id", costId) as any;

      if (error) throw error;

      setCosts(costs.filter((c) => c.id !== costId));
      toast({
        title: "Cost deleted",
        description: "The cost has been removed successfully.",
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      toast({
        title: "Error deleting cost",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trek Fixed Costs</CardTitle>
        <CardDescription>
          Manage fixed costs associated with this trek
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Existing Costs */}
        {costs.length > 0 ? (
          <div className="space-y-4 mb-6">
            {costs.map((cost) => (
              <div
                key={cost.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex-1">
                  <div className="font-medium">
                    {cost.cost_type.replace("_", " ")}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {cost.description && <div>{cost.description}</div>}
                    {cost.url && (
                      <a
                        href={cost.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        View Link
                      </a>
                    )}
                    {cost.file_url && (
                      <a
                        href={cost.file_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        View File
                      </a>
                    )}
                  </div>
                  <div className="font-semibold">
                    {formatCurrency(cost.amount, "INR")}
                  </div>
                </div>
                {isAdmin && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteCost(cost.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            No fixed costs added yet.
          </div>
        )}

        {/* Add New Cost Form */}
        {isAdmin && (
          <div className="space-y-4 border-t pt-4">
            <div className="grid gap-4">
              <div>
                <Label htmlFor="cost-type">Cost Type</Label>
                <Select
                  value={newCost.cost_type}
                  onValueChange={(value: TrekCostType) =>
                    setNewCost({ ...newCost, cost_type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select cost type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACCOMMODATION">Accommodation</SelectItem>
                    <SelectItem value="TICKETS">Tickets</SelectItem>
                    <SelectItem value="LOCAL_VEHICLE">Local Vehicle</SelectItem>
                    <SelectItem value="GUIDE">Guide</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="amount">Amount (₹)</Label>
                <Input
                  id="amount"
                  type="number"
                  value={newCost.amount}
                  onChange={(e) =>
                    setNewCost({
                      ...newCost,
                      amount: parseFloat(e.target.value) || 0,
                    })
                  }
                  placeholder="Enter amount"
                />
              </div>

              {newCost.cost_type === "ACCOMMODATION" && (
                <div>
                  <Label htmlFor="url">Accommodation Link</Label>
                  <Input
                    id="url"
                    type="url"
                    value={newCost.url || ""}
                    onChange={(e) =>
                      setNewCost({ ...newCost, url: e.target.value })
                    }
                    placeholder="Enter accommodation URL"
                  />
                </div>
              )}

              {newCost.cost_type === "TICKETS" && (
                <div>
                  <Label htmlFor="file">Upload Ticket</Label>
                  <Input
                    id="file"
                    type="file"
                    onChange={(e) =>
                      setSelectedFile(e.target.files?.[0] || null)
                    }
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                </div>
              )}

              {newCost.cost_type === "OTHER" && (
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={newCost.description || ""}
                    onChange={(e) =>
                      setNewCost({ ...newCost, description: e.target.value })
                    }
                    placeholder="Enter cost description"
                  />
                </div>
              )}
            </div>

            <Button
              onClick={handleAddCost}
              disabled={saving}
              className="w-full"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Cost
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
