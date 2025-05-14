import React, { useCallback, useEffect, useState } from 'react';
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

interface FetchedAssignment {
    id: number;
    mandatory: boolean;
    master_item_id: number;
    item_order?: number; // Include if needed for sorting
}

interface FetchedMasterItem {
    id: number;
    name: string;
    category: string | null;
}

// Props interface to accept trekId
interface TrekPackingListProps {
  trekId: string | undefined;
}

const TrekPackingList: React.FC<TrekPackingListProps> = ({ trekId }) => {
  const [packingList, setPackingList] = useState<PackingListItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPackingList = useCallback(async () => {
    if (!trekId) return;
    
    const numericTrekId = parseInt(trekId, 10);
    if (isNaN(numericTrekId)) {
        setError("Invalid Trek ID");
        return;
    }

    setLoading(true);
    setError(null);
    try {
      // Step 1: Fetch assignments
      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from('trek_packing_list_assignments')
        .select('id, mandatory, master_item_id, item_order')
        .eq('trek_id', numericTrekId)
        .order('item_order', { ascending: true });

      if (assignmentsError) throw assignmentsError;
      if (!assignmentsData || assignmentsData.length === 0) {
          setPackingList([]);
          setLoading(false);
          return;
      }

      // Step 2: Extract master item IDs
      const masterItemIds = assignmentsData.map((a: FetchedAssignment) => a.master_item_id);
      if (masterItemIds.length === 0) {
          setPackingList([]); // Should not happen if assignmentsData exists, but good practice
          setLoading(false);
          return;
      }
      
      // Step 3: Fetch corresponding master items
      const { data: masterItemsData, error: masterItemsError } = await supabase
        .from('master_packing_items')
        .select('id, name, category')
        .in('id', masterItemIds);

      if (masterItemsError) throw masterItemsError;

      // Step 4: Create a map for easy lookup
      const masterItemsMap = (masterItemsData || []).reduce((acc, item: FetchedMasterItem) => {
        acc[item.id] = item;
        return acc;
      }, {} as Record<number, FetchedMasterItem>);

      // Step 5: Combine data into the desired PackingListItem structure
      const combinedList = assignmentsData.map((assignment: FetchedAssignment): PackingListItem => {
        const masterItem = masterItemsMap[assignment.master_item_id];
        return {
            id: assignment.id,
            mandatory: assignment.mandatory,
            master_item_id: assignment.master_item_id,
            master_packing_items: masterItem ? { // Keep nested structure
                name: masterItem.name,
                category: masterItem.category,
            } : null, 
        };
      });
      
      setPackingList(combinedList);

    } catch (err: any) {
      console.error('Error fetching packing list:', err);
      setError(`Error fetching packing list: ${err.message || 'Unknown error'}`);
      setPackingList([]);
    } finally {
      setLoading(false);
    }
  }, [trekId, supabase]); // Dependency array includes trekId and supabase

  // Fetch data when component mounts or trekId changes
  useEffect(() => {
      fetchPackingList();
  }, [fetchPackingList]);

  // --- Render Logic --- 
  // (Add your rendering logic based on packingList, loading, error state)
  if (loading) return <div>Loading Packing List...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;
  if (packingList.length === 0) return <div>No packing list items found for this trek.</div>;

  return (
    <div className="mt-4">
        <h4 className="font-semibold mb-2">Packing List</h4>
        <ul className="list-disc pl-5 space-y-1">
            {packingList.map((item) => (
                <li key={item.id} className={item.mandatory ? 'font-bold' : ''}>
                   {item.master_packing_items?.name || 'Item not found'} 
                   {item.mandatory && <span className="text-red-500 ml-1">*</span>}
                   {item.master_packing_items?.category && 
                     <span className="text-xs text-gray-500 ml-2">({item.master_packing_items.category})</span>}
                </li>
            ))}
        </ul>
        <p className="text-xs text-red-500 mt-2">* Mandatory item</p>
    </div>
  );
};

export default TrekPackingList; 