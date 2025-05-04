import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client'; // Corrected path
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClipboardList, AlertCircle, Loader2 } from 'lucide-react';

interface TrekPackingListProps {
  trekId: string | undefined;
}

interface PackingListItem {
  item_id: number;
  name: string; // From joined trek_packing_items
  category: string | null; // From joined trek_packing_items
  mandatory: boolean;
  // item_order: number; // Can add later if needed
}

export function TrekPackingList({ trekId }: TrekPackingListProps) {
  const [packingList, setPackingList] = useState<PackingListItem[]>([]);
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
        
        // Fetch items associated with this trek_id from trek_packing_lists
        // Join with trek_packing_items to get item details (name, category)
        const { data, error: fetchError } = await supabase
          .from('trek_packing_lists')
          .select(`
            mandatory,
            item_id,
            trek_packing_items (
              name,
              category
            )
          `)
          .eq('trek_id', trekIdNumber)
          // .order('item_order', { ascending: true }); // Add later if using item_order

        if (fetchError) {
          throw fetchError;
        }

        // Transform data to match PackingListItem interface
        const formattedList = data?.map(item => ({
            item_id: item.item_id,
            // @ts-ignore - Supabase TS inference might need help here
            name: item.trek_packing_items?.name || 'Unknown Item',
            // @ts-ignore
            category: item.trek_packing_items?.category || null,
            mandatory: item.mandatory,
        })) || [];

        setPackingList(formattedList);

      } catch (err: any) {
        console.error('Error fetching packing list:', err);
        setError('Failed to load packing list. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchPackingList();
  }, [trekId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Loading Packing List...</span>
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

  if (packingList.length === 0) {
    return (
       <Alert>
        <ClipboardList className="h-4 w-4" />
        <AlertTitle>Packing Checklist</AlertTitle>
        <AlertDescription>
          No packing list available for this trek yet. An administrator can add one via the trek management panel.
        </AlertDescription>
      </Alert>
    );
  }

  // Group items by category
  const groupedItems = packingList.reduce((acc, item) => {
    const category = item.category || 'Miscellaneous';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, PackingListItem[]>);


  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <ClipboardList className="mr-2 h-5 w-5" />
          Packing Checklist
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
         {Object.entries(groupedItems).map(([category, items]) => (
           <div key={category}>
             <h3 className="text-lg font-semibold mb-3 border-b pb-1">{category}</h3>
             <ul className="space-y-3">
               {items.map((item) => (
                 <li key={item.item_id} className="flex items-center space-x-3">
                   <Checkbox id={`item-${item.item_id}`} />
                   <Label htmlFor={`item-${item.item_id}`} className="flex-grow">
                     {item.name}
                     {item.mandatory && <span className="ml-2 text-xs font-medium text-red-600">(Mandatory)</span>}
                   </Label>
                 </li>
               ))}
             </ul>
           </div>
         ))}
      </CardContent>
    </Card>
  );
} 