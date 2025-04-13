
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
      
      // Calculate total paid
      const { data: paidData, error: paidError } = await supabase
        .from('expense_sharing')
        .select('amount')
        .eq('payer_id', numericUserId);
        
      if (paidError) throw paidError;
      
      // Manually calculate sum without complex typing
      let totalPaid = 0;
      if (paidData && Array.isArray(paidData)) {
        for (let i = 0; i < paidData.length; i++) {
          if (paidData[i] && typeof paidData[i].amount !== 'undefined' && paidData[i].amount !== null) {
            totalPaid += Number(paidData[i].amount);
          }
        }
      }
      
      // Calculate total owed
      const { data: owedData, error: owedError } = await supabase
        .from('expense_sharing')
        .select('amount')
        .eq('user_id', numericUserId)
        .neq('payer_id', numericUserId);
        
      if (owedError) throw owedError;
      
      // Manually calculate sum without complex typing
      let totalOwed = 0;
      if (owedData && Array.isArray(owedData)) {
        for (let i = 0; i < owedData.length; i++) {
          if (owedData[i] && typeof owedData[i].amount !== 'undefined' && owedData[i].amount !== null) {
            totalOwed += Number(owedData[i].amount);
          }
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
