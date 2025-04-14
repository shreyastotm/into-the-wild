
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { useExpenses } from '@/hooks/useExpenses';
import { Badge } from '@/components/ui/badge';

interface ExpenseListProps {
  trekId: number;
}

export const ExpenseList: React.FC<ExpenseListProps> = ({ trekId }) => {
  const { fixedExpenses, adHocExpenses, expenseShares, loading } = useExpenses(trekId);

  if (loading) {
    return <div>Loading expenses...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Fixed Expenses Section */}
      <Card>
        <CardHeader>
          <CardTitle>Fixed Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          {fixedExpenses.length === 0 ? (
            <p>No fixed expenses for this trek</p>
          ) : (
            <div className="space-y-2">
              {fixedExpenses.map(expense => (
                <div key={expense.expense_id} className="flex justify-between items-center">
                  <div>
                    <span>{expense.expense_type}</span>
                    <span className="text-muted-foreground ml-2">{expense.description}</span>
                  </div>
                  <span className="font-bold">{formatCurrency(expense.amount)}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ad-Hoc Expenses Section */}
      <Card>
        <CardHeader>
          <CardTitle>Ad-Hoc Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          {adHocExpenses.length === 0 ? (
            <p>No ad-hoc expenses for this trek</p>
          ) : (
            <div className="space-y-2">
              {adHocExpenses.map(expense => (
                <div key={expense.expense_id} className="flex justify-between items-center">
                  <div>
                    <span>{expense.category}</span>
                    <span className="text-muted-foreground ml-2">{expense.description}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold">{formatCurrency(expense.amount)}</span>
                    {/* Expense Share Status */}
                    {expenseShares.filter(share => share.expense_id === expense.expense_id).map(share => (
                      <Badge 
                        key={share.share_id} 
                        variant={
                          share.status === 'Pending' ? 'secondary' : 
                          share.status === 'Accepted' ? 'default' : 
                          'destructive'
                        }
                      >
                        {share.status}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
