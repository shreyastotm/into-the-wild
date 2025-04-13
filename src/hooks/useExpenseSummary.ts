
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";

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
    } else {
      setSummary({ totalPaid: 0, totalOwed: 0, netBalance: 0 });
      setLoading(false);
    }
  }, [userId]);

  const fetchExpenseSummary = async () => {
    if (!userId) {
      setSummary({ totalPaid: 0, totalOwed: 0, netBalance: 0 });
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Query for expenses paid by the user - use userId directly without type conversion
      const { data: paidExpenses, error: paidError } = await supabase
        .from('expense_sharing')
        .select('amount')
        .eq('payer_id', userId);
      
      if (paidError) throw paidError;
      
      // Query for expenses owed by the user - use userId directly without type conversion
      const { data: owedExpenses, error: owedError } = await supabase
        .from('expense_sharing')
        .select('amount')
        .eq('user_id', userId)
        .neq('payer_id', userId);
      
      if (owedError) throw owedError;
      
      // Calculate totals with safe type handling
      const totalPaid = paidExpenses?.reduce((sum, item) => {
        const amount = item.amount ? parseFloat(String(item.amount)) : 0;
        return sum + (isNaN(amount) ? 0 : amount);
      }, 0) || 0;
      
      const totalOwed = owedExpenses?.reduce((sum, item) => {
        const amount = item.amount ? parseFloat(String(item.amount)) : 0;
        return sum + (isNaN(amount) ? 0 : amount);
      }, 0) || 0;
      
      setSummary({
        totalPaid,
        totalOwed,
        netBalance: totalPaid - totalOwed
      });
      
    } catch (err: any) {
      console.error("Error fetching expense summary:", err);
      setError(err);
      
      // Set default zero values if there's an error
      setSummary({ totalPaid: 0, totalOwed: 0, netBalance: 0 });
    } finally {
      setLoading(false);
    }
  };

  return { summary, loading, error };
};
