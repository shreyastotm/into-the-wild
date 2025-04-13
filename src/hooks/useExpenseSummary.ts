
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
      
      // Calculate total paid by user
      let totalPaid = 0;
      const paidResult = await supabase
        .from('expense_sharing')
        .select('amount')
        .eq('payer_id', numericUserId);
        
      if (paidResult.error) throw paidResult.error;
      
      // Process data array directly without type inference
      if (paidResult.data) {
        for (let i = 0; i < paidResult.data.length; i++) {
          const item = paidResult.data[i];
          if (item && item.amount !== null) {
            totalPaid += Number(item.amount);
          }
        }
      }
      
      // Calculate total owed by user
      let totalOwed = 0;
      const owedResult = await supabase
        .from('expense_sharing')
        .select('amount')
        .eq('user_id', numericUserId)
        .neq('payer_id', numericUserId);
        
      if (owedResult.error) throw owedResult.error;
      
      // Process data array directly without type inference
      if (owedResult.data) {
        for (let i = 0; i < owedResult.data.length; i++) {
          const item = owedResult.data[i];
          if (item && item.amount !== null) {
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
