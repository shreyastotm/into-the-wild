
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
      
      // Step 1: Calculate total paid by the user (simple query)
      const { data: paidExpenses, error: paidError } = await supabase
        .from('expense_sharing')
        .select('amount')
        .eq('payer_id', numericUserId);
      
      if (paidError) throw paidError;
      
      const totalPaid = paidExpenses?.reduce((sum, item) => 
        sum + (Number(item.amount) || 0), 0) || 0;
      
      // Step 2: Get user's trek IDs (simple query)
      const { data: userTreks, error: trekError } = await supabase
        .from('registrations')
        .select('trek_id')
        .eq('user_id', numericUserId);
      
      if (trekError) throw trekError;
      
      // Step 3: Calculate what user owes
      let totalOwed = 0;
      
      if (userTreks && userTreks.length > 0) {
        // We'll execute simple queries one at a time
        for (const trek of userTreks) {
          // For each trek, get expenses where user is not the payer
          const { data, error: expenseError } = await supabase
            .from('expense_sharing')
            .select('amount')
            .eq('trek_id', trek.trek_id)
            .eq('user_id', numericUserId)
            .neq('payer_id', numericUserId);
          
          if (expenseError) {
            console.error(`Error getting expenses for trek ${trek.trek_id}:`, expenseError);
            continue; // Skip this trek if there's an error
          }
          
          // Add up the expenses for this trek
          if (data && data.length > 0) {
            const trekOwed = data.reduce((sum, item) => 
              sum + (Number(item.amount) || 0), 0);
            totalOwed += trekOwed;
          }
        }
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
