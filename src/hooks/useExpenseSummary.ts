
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { userIdToNumber } from '@/utils/dbTypeConversions';

export interface ExpenseSummary {
  totalPaid: number;
  totalOwed: number;
  netBalance: number;
}

// Define explicit types to prevent excessive type inference
interface ExpenseRecord {
  expense_id?: number;
  amount: number;
  payer_id?: number;
  trek_id?: number;
  expense_date?: string;
}

// Define a specific type for split details to avoid deep inference
interface SplitDetail {
  userId?: number;
  user_id?: number;
  amount?: number;
}

// Use Record with string keys to avoid excessive type inference
type SplitDetailsObject = Record<string, number>;

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
      
      // Use any type to completely bypass TypeScript's deep type inference
      const { data: paidExpensesData, error: paidError } = await supabase
        .from('expense_sharing')
        .select('amount')
        .eq('payer_id', numericUserId) as { data: any[], error: any };
        
      if (paidError) throw paidError;
      
      const { data: owedExpensesData, error: owedError } = await supabase
        .from('expense_sharing')
        .select('amount, split_details, payer_id')
        .neq('payer_id', numericUserId) as { data: any[], error: any };
        
      if (owedError) throw owedError;
      
      // Use explicit type assertions to prevent deep inference
      const paidAmounts: number[] = (paidExpensesData || []).map(item => 
        typeof item.amount === 'number' ? item.amount : 0
      );
      
      const totalPaid = paidAmounts.reduce((sum, amount) => sum + amount, 0);
      
      let totalOwed = 0;
      
      // Process each expense record with clear type boundaries
      (owedExpensesData || []).forEach(item => {
        if (!item.split_details) return;
        
        try {
          // Handle split_details explicitly based on its structure
          const splitDetails = typeof item.split_details === 'string' 
            ? JSON.parse(item.split_details) as (SplitDetail[] | SplitDetailsObject)
            : item.split_details as (SplitDetail[] | SplitDetailsObject);
          
          let userShare = 0;
          
          // Use type guards to handle different possible structures
          if (Array.isArray(splitDetails)) {
            // If it's an array of split details
            const userEntry = splitDetails.find(entry => 
              entry.userId === numericUserId || 
              entry.user_id === numericUserId
            );
            userShare = userEntry && userEntry.amount ? Number(userEntry.amount) : 0;
          } else {
            // If it's an object with user IDs as keys
            const userIdStr = String(numericUserId);
            userShare = splitDetails[`user_${userIdStr}`] || 
                       splitDetails[userIdStr] || 0;
          }
          
          totalOwed += Number(userShare);
        } catch (err) {
          console.error("Error parsing split_details:", err);
        }
      });
      
      setSummary({
        totalPaid,
        totalOwed,
        netBalance: totalPaid - totalOwed
      });
      
    } catch (err: any) {
      console.error("Error fetching expense summary:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
      
      // Set default zero values if there's an error
      setSummary({ totalPaid: 0, totalOwed: 0, netBalance: 0 });
    } finally {
      setLoading(false);
    }
  };

  return { summary, loading, error, refreshSummary: fetchExpenseSummary };
};
