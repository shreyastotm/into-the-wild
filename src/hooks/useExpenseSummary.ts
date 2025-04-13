
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
      
      // Calculate total paid - Use the most basic approach possible
      const paidResponse = await supabase
        .from('expense_sharing')
        .select('amount')
        .eq('payer_id', numericUserId);
        
      if (paidResponse.error) throw paidResponse.error;
      
      // Manual summation without any complex type handling
      let totalPaid = 0;
      if (paidResponse.data) {
        const dataArray = paidResponse.data;
        for (let i = 0; i < dataArray.length; i++) {
          const item = dataArray[i];
          if (item && typeof item === 'object' && 'amount' in item) {
            const amount = item.amount;
            if (amount !== null && amount !== undefined) {
              totalPaid += Number(amount);
            }
          }
        }
      }
      
      // Calculate total owed - Use the most basic approach possible
      const owedResponse = await supabase
        .from('expense_sharing')
        .select('amount')
        .eq('user_id', numericUserId)
        .neq('payer_id', numericUserId);
        
      if (owedResponse.error) throw owedResponse.error;
      
      // Manual summation without any complex type handling
      let totalOwed = 0;
      if (owedResponse.data) {
        const dataArray = owedResponse.data;
        for (let i = 0; i < dataArray.length; i++) {
          const item = dataArray[i];
          if (item && typeof item === 'object' && 'amount' in item) {
            const amount = item.amount;
            if (amount !== null && amount !== undefined) {
              totalOwed += Number(amount);
            }
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
