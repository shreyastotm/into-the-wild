
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { userIdToNumber } from '@/utils/dbTypeConversions';

export interface ExpenseSummary {
  totalPaid: number;
  totalOwed: number;
  netBalance: number;
}

// Define a simple interface for expense amounts
interface ExpenseRecord {
  amount: number | null;
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
      
      // Get total paid by user (simpler approach without deep type inference)
      let totalPaid = 0;
      const { data: paidRawData, error: paidError } = await supabase
        .from('expense_sharing')
        .select('amount')
        .eq('payer_id', numericUserId);
      
      if (paidError) throw paidError;
      
      if (paidRawData && Array.isArray(paidRawData)) {
        // Use explicit array iteration instead of reduce to avoid deep type inference
        for (const item of paidRawData) {
          if (item && typeof item.amount !== 'undefined' && item.amount !== null) {
            totalPaid += Number(item.amount);
          }
        }
      }
      
      // Get total owed by user (simpler approach without deep type inference)
      let totalOwed = 0;
      const { data: owedRawData, error: owedError } = await supabase
        .from('expense_sharing')
        .select('amount')
        .eq('user_id', numericUserId)
        .neq('payer_id', numericUserId);
      
      if (owedError) throw owedError;
      
      if (owedRawData && Array.isArray(owedRawData)) {
        // Use explicit array iteration instead of reduce to avoid deep type inference
        for (const item of owedRawData) {
          if (item && typeof item.amount !== 'undefined' && item.amount !== null) {
            totalOwed += Number(item.amount);
          }
        }
      }
      
      // Update the summary state with calculated values
      setSummary({
        totalPaid,
        totalOwed,
        netBalance: totalPaid - totalOwed
      });
      
    } catch (error: any) {
      console.error("Error fetching expense summary:", error);
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  return { summary, loading, error };
};
