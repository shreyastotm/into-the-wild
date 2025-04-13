
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { userIdToNumber } from '@/utils/dbTypeConversions';

export interface ExpenseSummary {
  totalPaid: number;
  totalOwed: number;
  netBalance: number;
}

export const useExpenseSummary = (userId: string | undefined) => {
  const [summary, setSummary] = useState<ExpenseSummary>({
    totalPaid: 0,
    totalOwed: 0,
    netBalance: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (userId) {
      fetchExpenseSummary();
    }
  }, [userId]);

  const fetchExpenseSummary = async () => {
    try {
      setLoading(true);
      
      if (!userId) {
        setSummary({ totalPaid: 0, totalOwed: 0, netBalance: 0 });
        return;
      }
      
      const numericUserId = userIdToNumber(userId);
      
      // Use aggregate queries instead of fetching all records and summing in JavaScript
      // This avoids deep type instantiation by letting the database do the work
      const { data: paidData, error: paidError } = await supabase
        .from('expense_sharing')
        .select('SUM(amount)')
        .eq('payer_id', numericUserId)
        .single();
        
      if (paidError) throw paidError;
      
      // Use aggregate queries for owed amounts as well
      const { data: owedData, error: owedError } = await supabase
        .from('expense_sharing')
        .select('SUM(amount)')
        .eq('user_id', numericUserId)
        .neq('payer_id', numericUserId)
        .single();
        
      if (owedError) throw owedError;
      
      // Extract values safely - the sum might come as null if no records exist
      const totalPaid = paidData?.sum || 0;
      const totalOwed = owedData?.sum || 0;
      
      // Update summary with calculated values
      setSummary({
        totalPaid: Number(totalPaid),
        totalOwed: Number(totalOwed),
        netBalance: Number(totalPaid) - Number(totalOwed)
      });
      
    } catch (err: any) {
      console.error("Error fetching expense summary:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return { summary, loading, error };
};
