
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
      
      // Calculate total paid using raw query
      const paidQuery = await supabase
        .from('expense_sharing')
        .select('amount')
        .eq('payer_id', numericUserId);
        
      if (paidQuery.error) throw paidQuery.error;
      
      // Use explicit type assertion and manual calculation
      let totalPaid = 0;
      const paidData = paidQuery.data as any[] || [];
      
      for (let i = 0; i < paidData.length; i++) {
        const item = paidData[i];
        if (item && item.amount != null) {
          totalPaid += Number(item.amount);
        }
      }
      
      // Calculate total owed using raw query
      const owedQuery = await supabase
        .from('expense_sharing')
        .select('amount')
        .eq('user_id', numericUserId)
        .neq('payer_id', numericUserId);
        
      if (owedQuery.error) throw owedQuery.error;
      
      // Use explicit type assertion and manual calculation
      let totalOwed = 0;
      const owedData = owedQuery.data as any[] || [];
      
      for (let i = 0; i < owedData.length; i++) {
        const item = owedData[i];
        if (item && item.amount != null) {
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
