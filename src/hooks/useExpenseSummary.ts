
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { userIdToNumber } from '@/utils/dbTypeConversions';

export interface ExpenseSummary {
  totalPaid: number;
  totalOwed: number;
  netBalance: number;
}

// Define a simple type for the raw amount data we receive
type RawAmount = { amount: number | null };

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
      
      // Get total paid expenses
      const { data: paidData, error: paidError } = await supabase
        .from('expense_sharing')
        .select('amount')
        .eq('payer_id', numericUserId);
        
      if (paidError) throw paidError;
      
      // Calculate total paid
      let totalPaid = 0;
      if (paidData) {
        // Use a simple approach to sum amounts
        paidData.forEach((item: any) => {
          if (item && typeof item.amount === 'number') {
            totalPaid += item.amount;
          } else if (item && item.amount !== null) {
            totalPaid += Number(item.amount);
          }
        });
      }
      
      // Get total owed expenses
      const { data: owedData, error: owedError } = await supabase
        .from('expense_sharing')
        .select('amount')
        .eq('user_id', numericUserId)
        .neq('payer_id', numericUserId);
        
      if (owedError) throw owedError;
      
      // Calculate total owed
      let totalOwed = 0;
      if (owedData) {
        // Use a simple approach to sum amounts
        owedData.forEach((item: any) => {
          if (item && typeof item.amount === 'number') {
            totalOwed += item.amount;
          } else if (item && item.amount !== null) {
            totalOwed += Number(item.amount);
          }
        });
      }
      
      // Update summary with calculated values
      setSummary({
        totalPaid,
        totalOwed,
        netBalance: totalPaid - totalOwed
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
