import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client'; // Corrected path
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClipboardList, AlertCircle, Loader2 } from 'lucide-react';

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
        
        // Fetch items associated with this trek_id from trek_packing_list_assignments
        // Join with master_packing_items to get item details (name, category)
        console.log('Fetching packing list for trek:', trekIdNumber);
        const { data, error: fetchError } = await supabase
          .from('trek_packing_list_assignments')
          .select(`
            id,
            mandatory,
            master_item_id,
            item_order,
            master_packing_items (
              id,
              name,
              category
            )
          `)
          .eq('trek_id', trekIdNumber);

        console.log('Packing list query result:', { data, error: fetchError });

        if (fetchError) {
          console.error('Packing list fetch error:', fetchError);
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
        const formattedList = (data as FetchedItem[] | null)?.map(item => {
          console.log('Processing item:', item);
          return {
            item_id: item.master_item_id,
            name: item.master_packing_items?.name || 'Unknown Item',
            category: item.master_packing_items?.category || null,
            mandatory: item.mandatory,
          };
        }) || [];

        console.log('Formatted packing list:', formattedList);

        console.log('TrekPackingList: Loaded packing list for trek', trekIdNumber, ':', formattedList);
        setPackingList(formattedList);

      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
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