import React, { useCallback } from 'react';
import { supabase } from '../integrations/supabase/client';

interface PackingListItem {
  id: number;
  mandatory: boolean;
  master_item_id: number; // Keep this if needed internally, or remove if only using joined data
  master_packing_items: { // Adjusted to match the join result
    name: string;
    category: string | null;
  } | null; // Allow null if the join might fail (though FK should prevent this)
}

const TrekPackingList: React.FC = () => {
  const [trekId, setTrekId] = React.useState<number | null>(null);
  const [packingList, setPackingList] = React.useState<PackingListItem[]>([]);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);

  const fetchPackingList = useCallback(async () => {
    if (!trekId) return;
    setLoading(true);
    setError(null);
    try {
      // Corrected query: Use trek_packing_list_assignments and join master_packing_items
      const { data, error: fetchError } = await supabase
        .from('trek_packing_list_assignments') // Corrected table name
        .select(`
          id,
          mandatory,
          master_item_id,
          master_packing_items!inner ( name, category )
        `) // Use explicit !inner join
        .eq('trek_id', trekId)
        .order('item_order', { ascending: true }); // Assuming you still want ordering

      if (fetchError) {
        throw fetchError;
      }

      // Ensure data structure matches the PackingListItem interface if needed
      // The fetched data structure should now be closer to:
      // { id, mandatory, master_item_id, master_packing_items: { name, category } }
      setPackingList(data as PackingListItem[] || []); // Type assertion might need adjustment based on actual data/interface

    } catch (err: any) {
      console.error('Error fetching packing list:', err);
      setError(`Error fetching packing list: ${err.message || 'Unknown error'}`);
      setPackingList([]);
    } finally {
      setLoading(false);
    }
  }, [trekId, supabase]);

  return (
    <div>
      {/* Render your component content here */}
    </div>
  );
};

export default TrekPackingList; 