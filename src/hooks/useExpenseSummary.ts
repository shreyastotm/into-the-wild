
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
      
      const numericUserId = userId ? userIdToNumber(userId) : 0;
      
      // Get total amount paid by the user (expenses they created)
      const { data: paidData, error: paidError } = await supabase
        .from('expense_sharing')
        .select('amount')
        .eq('payer_id', numericUserId);
      
      if (paidError) throw paidError;
      
      // Calculate total paid by the user
      const totalPaid = paidData?.reduce((sum, item) => sum + (Number(item.amount) || 0), 0) || 0;
      
      // Get user's registrations to find their treks
      const { data: registrations, error: regError } = await supabase
        .from('registrations')
        .select('trek_id')
        .eq('user_id', numericUserId);
      
      if (regError) throw regError;
      
      // If user has no registrations, return early with zeroes
      if (!registrations || registrations.length === 0) {
        setSummary({
          totalPaid,
          totalOwed: 0,
          netBalance: totalPaid
        });
        setLoading(false);
        return;
      }
      
      // Extract trek IDs as an array
      const trekIds = registrations.map(reg => reg.trek_id);
      
      // Calculate what the user owes - simplify query to avoid deep type nesting
      let totalOwed = 0;
      
      // Use a simpler query structure to avoid excessive type instantiation
      for (const trekId of trekIds) {
        const { data: trekExpenses, error: trekError } = await supabase
          .from('expense_sharing')
          .select('amount')
          .eq('trek_id', trekId)
          .eq('user_id', numericUserId)
          .neq('payer_id', numericUserId);
        
        if (trekError) throw trekError;
        
        if (trekExpenses && trekExpenses.length > 0) {
          totalOwed += trekExpenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
        }
      }
      
      // Set the summary
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
