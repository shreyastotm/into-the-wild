import { useEffect, useState } from "react";

import { supabase } from "@/integrations/supabase/client";

export interface ExpenseSummary {
  totalPaid: number;
  totalOwed: number;
  netBalance: number;
}

// --- EXPENSE LOGIC REMOVED ---

export const useExpenseSummary = (userId: string | undefined) => {
  const [summary, setSummary] = useState<ExpenseSummary>({
    totalPaid: 0,
    totalOwed: 0,
    netBalance: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setSummary({ totalPaid: 0, totalOwed: 0, netBalance: 0 });
    setLoading(false);
  }, []);

  const fetchExpenseSummary = async () => {
    setSummary({ totalPaid: 0, totalOwed: 0, netBalance: 0 });
    setLoading(false);
  };

  return { summary, loading, error, refreshSummary: fetchExpenseSummary };
};
