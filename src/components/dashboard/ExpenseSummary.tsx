
import React, { useEffect, useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from '@/components/ui/use-toast';
import { formatCurrency } from '@/lib/utils';
import { ArrowDownRight, ArrowUpRight, Wallet } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { userIdToNumber } from '@/utils/dbTypeConversions';

interface ExpenseSummary {
  totalPaid: number;
  totalOwed: number;
  netBalance: number;
}

export const ExpenseSummary = () => {
  const [summary, setSummary] = useState<ExpenseSummary>({
    totalPaid: 0,
    totalOwed: 0,
    netBalance: 0
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchExpenseSummary();
    }
  }, [user]);

  const fetchExpenseSummary = async () => {
    try {
      setLoading(true);
      
      const userId = user?.id ? userIdToNumber(user.id) : 0;
      
      // Get total amount paid by the user
      const { data: paidData, error: paidError } = await supabase
        .from('expense_sharing')
        .select('amount')
        .eq('payer_id', userId);
      
      if (paidError) throw paidError;
      
      // Get total amount owed by the user (this is simplified - in a real app you'd have a more complex split calculation)
      const { data: owedData, error: owedError } = await supabase
        .from('expense_sharing')
        .select('amount')
        .neq('payer_id', userId)
        .eq('trek_id', 'ANY(SELECT trek_id FROM registrations WHERE user_id = $1)')
        .eq('user_id', userId);
      
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <Wallet className="mr-2 h-5 w-5" />
          Expense Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-muted-foreground mb-1">Total Paid</div>
            <div className="text-2xl font-bold">{formatCurrency(summary.totalPaid)}</div>
            <div className="flex items-center text-green-600 text-sm mt-2">
              <ArrowUpRight className="h-4 w-4 mr-1" />
              <span>You paid</span>
            </div>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-muted-foreground mb-1">Total Owed</div>
            <div className="text-2xl font-bold">{formatCurrency(summary.totalOwed)}</div>
            <div className="flex items-center text-red-600 text-sm mt-2">
              <ArrowDownRight className="h-4 w-4 mr-1" />
              <span>You owe</span>
            </div>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-muted-foreground mb-1">Net Balance</div>
            <div className="text-2xl font-bold">{formatCurrency(summary.netBalance)}</div>
            <div className={`flex items-center text-sm mt-2 ${summary.netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {summary.netBalance >= 0 ? (
                <>
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                  <span>You're owed</span>
                </>
              ) : (
                <>
                  <ArrowDownRight className="h-4 w-4 mr-1" />
                  <span>You owe</span>
                </>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
