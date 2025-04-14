
import React from 'react';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { AdHocExpense, ExpenseShare, FixedExpense } from '@/hooks/useExpenses';
import { useAuth } from '@/components/auth/AuthProvider';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';

interface ExpenseTableProps {
  fixedExpenses: FixedExpense[];
  adHocExpenses: AdHocExpense[];
  expenseShares: ExpenseShare[];
  participants: { user_id: string; full_name: string }[];
}

export const ExpenseTable: React.FC<ExpenseTableProps> = ({
  fixedExpenses,
  adHocExpenses,
  expenseShares,
  participants
}) => {
  const { user } = useAuth();
  
  // Helper to get participant name from ID
  const getParticipantName = (payerId: number) => {
    const participant = participants.find(p => Number(p.user_id) === payerId);
    return participant ? participant.full_name : 'Unknown';
  };
  
  // Get expense share status for the current user
  const getUserShareStatus = (expenseId: string) => {
    if (!user) return null;
    
    const share = expenseShares.find(
      share => share.expense_id === expenseId && share.user_id === Number(user.id)
    );
    
    return share ? share.status : null;
  };

  return (
    <div className="space-y-8">
      {fixedExpenses.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Fixed Expenses</h3>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fixedExpenses.map((expense) => (
                  <TableRow key={expense.expense_id}>
                    <TableCell className="font-medium">{expense.expense_type}</TableCell>
                    <TableCell>{expense.description || 'No description'}</TableCell>
                    <TableCell className="text-right">{formatCurrency(expense.amount)}</TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={2} className="font-semibold">Total Fixed Expenses</TableCell>
                  <TableCell className="text-right font-semibold">
                    {formatCurrency(fixedExpenses.reduce((sum, exp) => sum + exp.amount, 0))}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
      )}
      
      {adHocExpenses.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Ad-Hoc Expenses</h3>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Paid By</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  {user && <TableHead className="text-right">Your Status</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {adHocExpenses.map((expense) => (
                  <TableRow key={expense.expense_id}>
                    <TableCell className="font-medium">{expense.category}</TableCell>
                    <TableCell>{expense.description || 'No description'}</TableCell>
                    <TableCell>
                      {Number(user?.id) === expense.payer_id ? 'You' : getParticipantName(expense.payer_id)}
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(expense.amount)}</TableCell>
                    {user && (
                      <TableCell className="text-right">
                        {Number(user.id) === expense.payer_id ? (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            You paid
                          </Badge>
                        ) : (
                          getUserShareStatus(expense.expense_id) ? (
                            <Badge 
                              variant={
                                getUserShareStatus(expense.expense_id) === 'Pending' ? 'secondary' : 
                                getUserShareStatus(expense.expense_id) === 'Accepted' ? 'default' : 
                                'destructive'
                              }
                            >
                              {getUserShareStatus(expense.expense_id)}
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-gray-50">
                              Not shared with you
                            </Badge>
                          )
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={user ? 3 : 2} className="font-semibold">Total Ad-Hoc Expenses</TableCell>
                  <TableCell className="text-right font-semibold" colSpan={user ? 2 : 1}>
                    {formatCurrency(adHocExpenses.reduce((sum, exp) => sum + exp.amount, 0))}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
      )}
      
      {fixedExpenses.length === 0 && adHocExpenses.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No expenses have been added for this trek yet.
        </div>
      )}
    </div>
  );
};
