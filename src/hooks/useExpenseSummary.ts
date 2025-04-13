
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
      
      // Fetch expenses where user is the payer
      const { data: paidData, error: paidError } = await supabase
        .from('expense_sharing')
        .select('amount')
        .eq('payer_id', numericUserId);
        
      if (paidError) throw paidError;
      
      // Fetch expenses where user owes money
      const { data: owedData, error: owedError } = await supabase
        .from('expense_sharing')
        .select('amount')
        .eq('user_id', numericUserId)
        .neq('payer_id', numericUserId);
        
      if (owedError) throw owedError;
      
      // Calculate totals using simple summation to avoid deep type inference
      let totalPaid = 0;
      let totalOwed = 0;
      
      if (paidData) {
        for (let i = 0; i < paidData.length; i++) {
          totalPaid += Number(paidData[i]?.amount || 0);
        }
      }
      
      if (owedData) {
        for (let i = 0; i < owedData.length; i++) {
          totalOwed += Number(owedData[i]?.amount || 0);
        }
      }
      
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
