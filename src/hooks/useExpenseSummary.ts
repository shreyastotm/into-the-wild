
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { userIdToNumber } from '@/utils/dbTypeConversions';

export interface ExpenseSummary {
  totalPaid: number;
  totalOwed: number;
  netBalance: number;
}

// Define explicit types for our expense data
interface ExpenseAmount {
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
      
      // Calculate total paid by the user - avoiding complex type inference by using manual typing
      let totalPaid = 0;
      const paidResult = await supabase
        .from('expense_sharing')
        .select('amount')
        .eq('payer_id', numericUserId);
      
      if (paidResult.error) throw paidResult.error;
      
      if (paidResult.data) {
        totalPaid = paidResult.data.reduce((sum, expense) => {
          return sum + (typeof expense.amount === 'number' ? expense.amount : 0);
        }, 0);
      }
      
      // Calculate total owed by the user - avoiding complex type inference
      let totalOwed = 0;
      const owedResult = await supabase
        .from('expense_sharing')
        .select('amount')
        .eq('user_id', numericUserId)
        .neq('payer_id', numericUserId);
      
      if (owedResult.error) throw owedResult.error;
      
      if (owedResult.data) {
        totalOwed = owedResult.data.reduce((sum, expense) => {
          return sum + (typeof expense.amount === 'number' ? expense.amount : 0);
        }, 0);
      }
      
      // Update the summary state
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
