
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { AdHocExpense, FixedExpense } from '@/hooks/useExpenses';

interface ExpenseSummaryProps {
  fixedExpenses: FixedExpense[];
  adHocExpenses: AdHocExpense[];
  userContributions?: {
    userId: string;
    amount: number;
    paid: boolean;
  }[];
}

export const ExpenseSummary: React.FC<ExpenseSummaryProps> = ({ 
  fixedExpenses,
  adHocExpenses,
  userContributions = []
}) => {
  // Calculate total expenses
  const totalFixed = fixedExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const totalAdHoc = adHocExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const grandTotal = totalFixed + totalAdHoc;
  
  // Calculate per person cost (if we have user contributions)
  const numberOfParticipants = userContributions.length || 1;
  const costPerPerson = grandTotal / numberOfParticipants;
  
  // Calculate total outstanding (unpaid) amount
  const paidAmount = userContributions
    .filter(contribution => contribution.paid)
    .reduce((sum, contribution) => sum + contribution.amount, 0);
  
  const outstandingAmount = grandTotal - paidAmount;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Expense Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Fixed Expenses</p>
              <p className="text-lg font-semibold">{formatCurrency(totalFixed)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Ad-Hoc Expenses</p>
              <p className="text-lg font-semibold">{formatCurrency(totalAdHoc)}</p>
            </div>
          </div>
          
          <div className="pt-2 border-t">
            <div className="flex justify-between items-center">
              <p className="text-sm font-medium">Total Expenses</p>
              <p className="text-lg font-bold">{formatCurrency(grandTotal)}</p>
            </div>
            
            {userContributions.length > 0 && (
              <>
                <div className="flex justify-between items-center mt-2">
                  <p className="text-sm text-muted-foreground">Approximate Cost Per Person</p>
                  <p>{formatCurrency(costPerPerson)}</p>
                </div>
                
                <div className="flex justify-between items-center mt-2">
                  <p className="text-sm text-muted-foreground">Outstanding Balance</p>
                  <p>{formatCurrency(outstandingAmount)}</p>
                </div>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
