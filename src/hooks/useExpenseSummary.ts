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
      
      // Fetch ad-hoc expenses paid by the user
      const { data: paidExpenses, error: paidError } = await supabase
        .from('trek_ad_hoc_expenses')
        .select('amount, payer_id')
        .eq('payer_id', numericUserId);
      if (paidError) throw paidError;
      const totalPaid = (paidExpenses || []).reduce((sum, exp) => sum + (typeof exp.amount === 'number' ? exp.amount : 0), 0);
      setSummary({ totalPaid, totalOwed: 0, netBalance: totalPaid });
      setError(null);
    } catch (err: any) {
      setSummary({ totalPaid: 0, totalOwed: 0, netBalance: 0 });
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return { summary, loading, error, refreshSummary: fetchExpenseSummary };
};
