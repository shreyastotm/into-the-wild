
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
      
      // Convert string userId to number for database compatibility
      const numericUserId = userIdToNumber(userId);
      
      // Query for expenses paid by the user
      const { data: paidExpenses, error: paidError } = await supabase
        .from('expense_sharing')
        .select('amount')
        .eq('payer_id', numericUserId);
      
      if (paidError) throw paidError;
      
      // Query for expenses owed by the user
      const { data: owedExpenses, error: owedError } = await supabase
        .from('expense_sharing')
        .select('amount')
        .eq('user_id', numericUserId)
        .neq('payer_id', numericUserId);
      
      if (owedError) throw owedError;
      
      // Calculate totals with explicitly typed arrays and items
      const totalPaid = paidExpenses ? paidExpenses.reduce((sum, item) => {
        // Safely handle the amount value with explicit type checking
        if (item.amount === null || item.amount === undefined) return sum;
        const numAmount = typeof item.amount === 'number' 
          ? item.amount 
          : parseFloat(String(item.amount));
        return sum + (isNaN(numAmount) ? 0 : numAmount);
      }, 0) : 0;
      
      const totalOwed = owedExpenses ? owedExpenses.reduce((sum, item) => {
        // Safely handle the amount value with explicit type checking
        if (item.amount === null || item.amount === undefined) return sum;
        const numAmount = typeof item.amount === 'number' 
          ? item.amount 
          : parseFloat(String(item.amount));
        return sum + (isNaN(numAmount) ? 0 : numAmount);
      }, 0) : 0;
      
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
