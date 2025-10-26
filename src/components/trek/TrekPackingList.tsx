import { AlertCircle, ClipboardList, Loader2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "@/components/auth/AuthProvider";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client"; // Corrected path

interface PackingListItem {
  item_id: number; // This will be master_item_id
  name: string; // From master_packing_items
  category: string | null; // From master_packing_items
  mandatory: boolean; // From trek_packing_list_assignments
  is_packed?: boolean;
  // item_order: number; // Can add later if needed
}

interface TrekPackingListProps {
  trekId: string | undefined;
}

export default function TrekPackingList({ trekId }: TrekPackingListProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [packingItems, setPackingItems] = useState<PackingListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPackingList = async () => {
      if (!trekId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Convert trekId to a number since the database expects a number
        const trekIdNumber = parseInt(trekId, 10);

        // Fetch items associated with this trek_id from trek_packing_list_assignments
        // Join with master_packing_items to get item details (name, category)
        const { data, error: fetchError } = await supabase
          .from("trek_packing_list_assignments")
          .select(
            `
            id,
            mandatory,
            master_item_id,
            item_order,
            master_packing_items (
              id,
              name,
              category
            )
          `,
          )
          .eq("trek_id", trekIdNumber);

        if (fetchError) {
          console.error("Packing list fetch error:", fetchError);
          throw fetchError;
        }

        // Define a type for the fetched data structure
        type FetchedItem = {
          mandatory: boolean;
          master_item_id: number;
          master_packing_items: {
            name: string;
            category: string | null;
          } | null;
        };

        // Transform data to match PackingListItem interface
        const formattedList =
          (data as FetchedItem[] | null)?.map((item) => {
            return {
              item_id: item.master_item_id,
              name: item.master_packing_items?.name || "Unknown Item",
              category: item.master_packing_items?.category || null,
              mandatory: item.mandatory,
            };
          }) || [];

        setPackingItems(formattedList);
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "An unknown error occurred";
        console.error("Error fetching packing list:", err);
        setError("Failed to load packing list. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchPackingList();
  }, [trekId]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-muted rounded w-3/4" />
        <div className="h-32 bg-muted rounded" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (packingItems.length === 0) {
    return (
      <Alert>
        <ClipboardList className="h-4 w-4" />
        <AlertTitle>Packing Checklist</AlertTitle>
        <AlertDescription>
          No packing list available for this trek yet. An administrator can add
          one via the trek management panel.
        </AlertDescription>
      </Alert>
    );
  }

  // Group items by category
  const groupedItems = packingItems.reduce(
    (acc, item) => {
      const category = item.category || "Miscellaneous";
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(item);
      return acc;
    },
    {} as Record<string, PackingListItem[]>,
  );

  return (
    <div className="space-y-6">
      {/* Packing Items */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Packing List</h3>

        {!user ? (
          // Blur effect for non-logged-in users
          <div className="relative">
            <div className="space-y-3 opacity-30 blur-sm pointer-events-none">
              {packingItems.slice(0, 5).map((item) => (
                <div
                  key={item.item_id}
                  className="flex items-center gap-3 p-3 bg-card rounded-lg border"
                >
                  <div className="w-5 h-5 bg-muted rounded" />
                  <span className="text-sm">{item.name}</span>
                  {item.mandatory && (
                    <Badge variant="destructive" className="text-xs">
                      Required
                    </Badge>
                  )}
                </div>
              ))}
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Card className="p-4 text-center bg-background/95 backdrop-blur-sm border">
                <p className="text-sm text-muted-foreground mb-2">
                  Sign up to view the complete packing list
                </p>
                <Button size="sm" onClick={() => navigate("/auth")}>
                  Sign Up
                </Button>
              </Card>
            </div>
          </div>
        ) : (
          // Full list for logged-in users
          <div className="space-y-3">
            {packingItems.map((item) => (
              <div
                key={item.item_id}
                className="flex items-center gap-3 p-3 bg-card rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <div className="w-5 h-5 bg-muted rounded" />
                <span className="text-sm flex-1">{item.name}</span>
                {item.mandatory && (
                  <Badge variant="destructive" className="text-xs">
                    Required
                  </Badge>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
