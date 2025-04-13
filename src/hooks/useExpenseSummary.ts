
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { userIdToNumber } from '@/utils/dbTypeConversions';

export interface ExpenseSummary {
  totalPaid: number;
  totalOwed: number;
  netBalance: number;
}

// Define simple type for expense records
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
      
      // Completely bypass TypeScript type system by using raw query approach
      // Fetch paid expenses with explicit any typing
      let paidExpenses: ExpenseRecord[] = [];
      const paidQuery = await supabase
        .from('expense_sharing')
        .select('amount');
        
      if (paidQuery.error) throw paidQuery.error;
      
      // Manual type conversion to avoid deep type inference
      if (paidQuery.data) {
        paidExpenses = paidQuery.data.map((item: any) => ({ 
          amount: item.amount 
        }));
      }
      
      // Fetch owed expenses with explicit any typing
      let owedExpenses: ExpenseRecord[] = [];
      const owedQuery = await supabase
        .from('expense_sharing')
        .select('amount')
        .eq('user_id', numericUserId)
        .neq('payer_id', numericUserId);
        
      if (owedQuery.error) throw owedQuery.error;
      
      // Manual type conversion to avoid deep type inference
      if (owedQuery.data) {
        owedExpenses = owedQuery.data.map((item: any) => ({ 
          amount: item.amount 
        }));
      }
      
      // Calculate totals with simplified type handling
      const totalPaid = calculateTotal(paidExpenses);
      const totalOwed = calculateTotal(owedExpenses);
      
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
  
  // Helper function to calculate totals with safe type handling
  const calculateTotal = (expenses: ExpenseRecord[]): number => {
    return expenses.reduce((sum, item) => {
      // If amount is null or undefined, don't add anything
      if (item.amount === null || item.amount === undefined) return sum;
      
      // Convert to number safely
      const amount = typeof item.amount === 'number' 
        ? item.amount 
        : Number(item.amount);
        
      // Add to sum, treating NaN as 0
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);
  };

  return { summary, loading, error };
};
