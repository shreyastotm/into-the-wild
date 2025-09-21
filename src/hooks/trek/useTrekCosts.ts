import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { TrekCost } from '@/types/trek';

export function useTrekCosts(trekId: string | number | undefined) {
  const [costs, setCosts] = useState<TrekCost[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!trekId) {
      setLoading(false);
      return;
    }

    const fetchCosts = async () => {
      setLoading(true);
      try {
        const numericTrekId = typeof trekId === 'string' ? parseInt(trekId, 10) : trekId;
        if (isNaN(numericTrekId)) {
          throw new Error("Invalid Trek ID provided.");
        }
        
        const { data, error } = await supabase
          .from('trek_costs')
          .select('*')
          .eq('trek_id', numericTrekId);

        if (error) {
          throw error;
        }

        setCosts(data || []);
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Could not load the fixed expenses for this trek.";
        console.error("Error fetching trek costs:", error);
        toast({
          title: "Error fetching costs",
          description: errorMessage,
          variant: "destructive",
        });
        setCosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCosts();
  }, [trekId]);

  return { costs, loading };
} 