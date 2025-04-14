
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useExpenses } from '@/hooks/useExpenses';
import { ExpenseTable } from './ExpenseTable';

interface ExpenseListProps {
  trekId: number;
  participants: { user_id: string; full_name: string }[];
}

export const ExpenseList: React.FC<ExpenseListProps> = ({ trekId, participants }) => {
  const { fixedExpenses, adHocExpenses, expenseShares, loading } = useExpenses(trekId);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/4"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Expense Details</CardTitle>
      </CardHeader>
      <CardContent>
        <ExpenseTable 
          fixedExpenses={fixedExpenses}
          adHocExpenses={adHocExpenses}
          expenseShares={expenseShares}
          participants={participants}
        />
      </CardContent>
    </Card>
  );
};
