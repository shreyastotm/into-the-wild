
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
      
      // Get total amount paid by the user
      const { data: paidData, error: paidError } = await supabase
        .from('expense_sharing')
        .select('amount')
        .eq('payer_id', numericUserId);
      
      if (paidError) throw paidError;
      
      // Get registrations for the user to find their treks
      const { data: registrations, error: regError } = await supabase
        .from('registrations')
        .select('trek_id')
        .eq('user_id', numericUserId);
      
      if (regError) throw regError;
      
      if (!registrations || registrations.length === 0) {
        setSummary({
          totalPaid: 0,
          totalOwed: 0,
          netBalance: 0
        });
        setLoading(false);
        return;
      }
      
      // Extract trek IDs as an array of numbers
      const trekIds = registrations.map(reg => reg.trek_id);
      
      // Get expenses where the user is not the payer but is part of the trek
      const { data: owedData, error: owedError } = await supabase
        .from('expense_sharing')
        .select('amount')
        .neq('payer_id', numericUserId)
        .in('trek_id', trekIds)
        .eq('user_id', numericUserId);
      
      if (owedError) throw owedError;
      
      // Calculate totals
      const totalPaid = paidData?.reduce((sum, item) => sum + (Number(item.amount) || 0), 0) || 0;
      const totalOwed = owedData?.reduce((sum, item) => sum + (Number(item.amount) || 0), 0) / 2 || 0; // Simple approximation - divide by 2 assuming equal splits
      
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
