
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { userIdToNumber } from '@/utils/dbTypeConversions';

export interface ExpenseSummary {
  totalPaid: number;
  totalOwed: number;
  netBalance: number;
}

// Using a simple primitive type instead of an interface to avoid deep type inference
type ExpenseAmountRecord = { amount: number | null };

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
      
      // Calculate total paid - Using explicit any to avoid type inference issues
      const paidResponse = await supabase
        .from('expense_sharing')
        .select('amount')
        .eq('payer_id', numericUserId);
        
      if (paidResponse.error) throw paidResponse.error;
      
      // Use simple primitive-based approach to sum amounts
      let totalPaid = 0;
      if (paidResponse.data) {
        // Cast to a simple array without complex type inference
        const data = paidResponse.data as any[];
        for (let i = 0; i < data.length; i++) {
          if (data[i] && data[i].amount != null) {
            totalPaid += Number(data[i].amount);
          }
        }
      }
      
      // Calculate total owed - Using explicit any to avoid type inference issues
      const owedResponse = await supabase
        .from('expense_sharing')
        .select('amount')
        .eq('user_id', numericUserId)
        .neq('payer_id', numericUserId);
        
      if (owedResponse.error) throw owedResponse.error;
      
      // Use simple primitive-based approach to sum amounts
      let totalOwed = 0;
      if (owedResponse.data) {
        // Cast to a simple array without complex type inference
        const data = owedResponse.data as any[];
        for (let i = 0; i < data.length; i++) {
          if (data[i] && data[i].amount != null) {
            totalOwed += Number(data[i].amount);
          }
        }
      }
      
      // Update summary with calculated values
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
