import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Package } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { StepProps } from './types';

interface PackingItem {
  id: number;
  name: string;
  category: string | null;
}

interface PackingListStepProps extends StepProps {
  selectedItems: Set<number>;
  mandatoryItems: Set<number>;
  onItemToggle: (itemId: number, mandatory: boolean) => void;
}

export const PackingListStep: React.FC<PackingListStepProps> = ({
  formData,
  setFormData,
  errors,
  selectedItems,
  mandatoryItems,
  onItemToggle
}) => {
  const [packingItems, setPackingItems] = useState<PackingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMasterPackingItems();
  }, []);

  const fetchMasterPackingItems = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('master_packing_items')
        .select('id, name, category')
        .order('category', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;
      setPackingItems(data || []);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load packing items';
      console.error('Error fetching packing items:', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Group items by category
  const groupedItems = packingItems.reduce((acc, item) => {
    const category = item.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, PackingItem[]>);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading packing items...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={fetchMasterPackingItems} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold">Packing List</h3>
        <p className="text-sm text-muted-foreground">
          Select items for this {formData.event_type?.toLowerCase()} and mark which ones are mandatory
        </p>
      </div>

      <ScrollArea className="h-96 w-full rounded-md border p-4">
        <div className="space-y-6">
          {Object.entries(groupedItems).map(([category, items]) => (
            <Card key={category}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center">
                  <Package className="h-4 w-4 mr-2" />
                  {category}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50">
                      <Checkbox
                        id={`item-${item.id}`}
                        checked={selectedItems.has(item.id)}
                        onCheckedChange={(checked) => onItemToggle(item.id, false)}
                      />
                      <Label htmlFor={`item-${item.id}`} className="flex-1 cursor-pointer">
                        {item.name}
                      </Label>
                      {selectedItems.has(item.id) && (
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`mandatory-${item.id}`}
                            checked={mandatoryItems.has(item.id)}
                            onCheckedChange={(checked) => onItemToggle(item.id, true)}
                          />
                          <Label htmlFor={`mandatory-${item.id}`} className="text-sm text-muted-foreground cursor-pointer">
                            Mandatory
                          </Label>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>

      <div className="text-center text-sm text-muted-foreground">
        {selectedItems.size} items selected, {mandatoryItems.size} mandatory
      </div>
    </div>
  );
};
