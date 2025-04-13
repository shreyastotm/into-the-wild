
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";

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
      
      // Using RPC calls to avoid TypeScript type recursion issues
      const { data: paidTotal, error: paidError } = await supabase.rpc('get_user_paid_total', { 
        user_id_param: userId 
      });
      
      if (paidError) throw paidError;
      
      const { data: owedTotal, error: owedError } = await supabase.rpc('get_user_owed_total', { 
        user_id_param: userId 
      });
      
      if (owedError) throw owedError;
      
      // Set summary with values from database stored procedures
      setSummary({
        totalPaid: paidTotal || 0,
        totalOwed: owedTotal || 0,
        netBalance: (paidTotal || 0) - (owedTotal || 0)
      });
      
    } catch (err: any) {
      console.error("Error fetching expense summary:", err);
      
      // Fallback to direct query if RPC fails (maybe functions don't exist yet)
      try {
        await fetchExpenseSummaryFallback(userId);
      } catch (fallbackErr) {
        setError(err);
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Direct query fallback that avoids TypeScript recursion issues
  const fetchExpenseSummaryFallback = async (uid: string) => {
    try {
      // Convert to number only for the query to avoid type issues
      const numericId = typeof uid === 'string' ? parseInt(uid) : uid;
      
      // For expenses paid by user - use string templates to avoid type recursion
      const paidQuery = `
        SELECT amount FROM expense_sharing 
        WHERE payer_id = ${numericId}
      `;
      const { data: paidData, error: paidError } = await supabase.rpc('run_sql', { sql_query: paidQuery });
      
      if (paidError) {
        // Final fallback - simplest possible direct query
        const { data: simplePaidData, error: simplePaidError } = await supabase
          .from('expense_sharing')
          .select('amount')
          .eq('payer_id', numericId);
          
        if (simplePaidError) throw simplePaidError;
        
        let totalPaid = 0;
        if (simplePaidData) {
          totalPaid = simplePaidData.reduce((sum, record) => sum + (Number(record.amount) || 0), 0);
        }
        
        // For expenses owed by user
        const { data: simpleOwedData, error: simpleOwedError } = await supabase
          .from('expense_sharing')
          .select('amount')
          .eq('user_id', numericId)
          .neq('payer_id', numericId);
          
        if (simpleOwedError) throw simpleOwedError;
        
        let totalOwed = 0;
        if (simpleOwedData) {
          totalOwed = simpleOwedData.reduce((sum, record) => sum + (Number(record.amount) || 0), 0);
        }
        
        setSummary({
          totalPaid,
          totalOwed,
          netBalance: totalPaid - totalOwed
        });
        
        return;
      }
      
      // For expenses owed by user
      const owedQuery = `
        SELECT amount FROM expense_sharing 
        WHERE user_id = ${numericId} AND payer_id != ${numericId}
      `;
      const { data: owedData, error: owedError } = await supabase.rpc('run_sql', { sql_query: owedQuery });
      
      if (owedError) throw owedError;
      
      // Calculate totals from raw query results
      const totalPaid = paidData 
        ? paidData.reduce((sum: number, record: any) => sum + (Number(record.amount) || 0), 0) 
        : 0;
        
      const totalOwed = owedData 
        ? owedData.reduce((sum: number, record: any) => sum + (Number(record.amount) || 0), 0)
        : 0;
      
      setSummary({
        totalPaid,
        totalOwed,
        netBalance: totalPaid - totalOwed
      });
      
    } catch (fallbackErr: any) {
      // If all else fails, return zeros
      setSummary({ totalPaid: 0, totalOwed: 0, netBalance: 0 });
      console.error("Error in expense summary fallback:", fallbackErr);
      throw fallbackErr;
    }
  };

  return { summary, loading, error };
};
