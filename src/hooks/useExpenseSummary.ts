
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { userIdToNumber } from '@/utils/dbTypeConversions';

export interface ExpenseSummary {
  totalPaid: number;
  totalOwed: number;
  netBalance: number;
}

// Define a simple interface for expense record with amount
interface ExpenseRecord {
  amount: number | null;
}

// Create a basic interface for raw response data to avoid deep inference
interface RawExpenseData {
  amount: number | null;
  [key: string]: any;
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
      
      // Calculate total paid amount with explicit typing to avoid deep inference
      const paidResponse = await supabase
        .from('expense_sharing')
        .select('amount')
        .eq('payer_id', numericUserId);
        
      // Handle errors
      if (paidResponse.error) throw paidResponse.error;
      
      // Calculate the total paid amount using a basic approach with explicit typing
      let totalPaid = 0;
      if (paidResponse.data) {
        // Force the type to avoid deep type inference
        const rawData = paidResponse.data as unknown as RawExpenseData[];
        for (let i = 0; i < rawData.length; i++) {
          if (rawData[i] && rawData[i].amount !== null) {
            totalPaid += Number(rawData[i].amount);
          }
        }
      }
      
      // Calculate total owed amount with explicit typing to avoid deep inference
      const owedResponse = await supabase
        .from('expense_sharing')
        .select('amount')
        .eq('user_id', numericUserId)
        .neq('payer_id', numericUserId);
        
      // Handle errors
      if (owedResponse.error) throw owedResponse.error;
      
      // Calculate the total owed amount using a basic approach with explicit typing
      let totalOwed = 0;
      if (owedResponse.data) {
        // Force the type to avoid deep type inference
        const rawData = owedResponse.data as unknown as RawExpenseData[];
        for (let i = 0; i < rawData.length; i++) {
          if (rawData[i] && rawData[i].amount !== null) {
            totalOwed += Number(rawData[i].amount);
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
