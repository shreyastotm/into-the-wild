
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
      
      // Step 1: Calculate total paid by the user using simple approach
      let totalPaid = 0;
      const { data: paidExpenses, error: paidError } = await supabase
        .from('expense_sharing')
        .select('amount')
        .eq('payer_id', numericUserId);
      
      if (paidError) throw paidError;
      
      // Manual calculation to avoid complex type inference
      if (paidExpenses && paidExpenses.length > 0) {
        for (const expense of paidExpenses) {
          totalPaid += Number(expense.amount) || 0;
        }
      }
      
      // Step 2: Get user's trek IDs
      let trekIds: number[] = [];
      const { data: userTreks, error: trekError } = await supabase
        .from('registrations')
        .select('trek_id')
        .eq('user_id', numericUserId);
      
      if (trekError) throw trekError;
      
      if (userTreks && userTreks.length > 0) {
        trekIds = userTreks.map(trek => trek.trek_id);
      }
      
      // Step 3: Calculate what user owes
      let totalOwed = 0;
      
      // Process each trek individually to avoid deep type chains
      for (let i = 0; i < trekIds.length; i++) {
        const trekId = trekIds[i];
        
        // Simple approach to avoid complex type inference
        const { data: expenses } = await supabase
          .rpc('get_expenses_for_trek', { 
            trek_id_param: trekId,
            user_id_param: numericUserId
          })
          .catch(err => {
            console.error(`Error with RPC call for trek ${trekId}:`, err);
            return { data: null };
          });
          
        // If RPC doesn't exist, fallback to direct query
        if (!expenses) {
          const { data: expensesData, error: expenseError } = await supabase
            .from('expense_sharing')
            .select('amount')
            .eq('trek_id', trekId)
            .eq('user_id', numericUserId)
            .neq('payer_id', numericUserId);
            
          if (!expenseError && expensesData) {
            for (const expense of expensesData) {
              totalOwed += Number(expense.amount) || 0;
            }
          } else if (expenseError) {
            console.error(`Error fetching expenses for trek ${trekId}:`, expenseError);
          }
        } else {
          // Process RPC results
          for (const expense of expenses) {
            totalOwed += Number(expense.amount) || 0;
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
