
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from '@/components/ui/use-toast';
import { formatCurrency } from '@/lib/utils';
import { ArrowDownRight, ArrowUpRight, Wallet } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useExpenseSummary } from '@/hooks/useExpenseSummary';

export const ExpenseSummary = () => {
  const { user } = useAuth();
  const { summary, loading, error } = useExpenseSummary(user?.id);

  if (error) {
    toast({
      variant: "destructive",
      title: "Error fetching expense data",
      description: "There was an error loading your expense summary."
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <Wallet className="mr-2 h-5 w-5" />
          Expense Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 bg-gray-50 rounded-lg animate-pulse">
                <div className="h-4 w-24 bg-gray-200 rounded mb-2"></div>
                <div className="h-6 w-32 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 w-20 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : (
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
        )}
      </CardContent>
    </Card>
  );
};
