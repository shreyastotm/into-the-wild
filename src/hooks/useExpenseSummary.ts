
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { userIdToNumber } from '@/utils/dbTypeConversions';

export interface ExpenseSummary {
  totalPaid: number;
  totalOwed: number;
  netBalance: number;
}

// Define explicit interface for expense records from database
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
      
      // Calculate total paid with explicit typing
      const { data: rawPaidData, error: paidError } = await supabase
        .from('expense_sharing')
        .select('amount')
        .eq('payer_id', numericUserId);
        
      if (paidError) throw paidError;
      
      // Cast the data to our explicit type
      const paidData = (rawPaidData || []) as ExpenseRecord[];
      
      // Calculate sum with explicit null checks
      let totalPaid = 0;
      for (const item of paidData) {
        if (item && item.amount !== null) {
          totalPaid += Number(item.amount);
        }
      }
      
      // Calculate total owed with explicit typing
      const { data: rawOwedData, error: owedError } = await supabase
        .from('expense_sharing')
        .select('amount')
        .eq('user_id', numericUserId)
        .neq('payer_id', numericUserId);
        
      if (owedError) throw owedError;
      
      // Cast the data to our explicit type
      const owedData = (rawOwedData || []) as ExpenseRecord[];
      
      // Calculate sum with explicit null checks
      let totalOwed = 0;
      for (const item of owedData) {
        if (item && item.amount !== null) {
          totalOwed += Number(item.amount);
        }
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
