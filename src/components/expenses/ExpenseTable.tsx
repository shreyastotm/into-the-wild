import React, { useState } from 'react';
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
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

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

  // Action for accepting, disputing, or marking as paid
  const handleShareAction = async (expenseId: string, action: 'Accepted' | 'Disputed' | 'Paid') => {
    try {
      const { error } = await supabase
        .from('ad_hoc_expense_shares')
        .update({ status: action })
        .eq('expense_id', expenseId)
        .eq('user_id', Number(user?.id));
      if (error) throw error;
      toast({
        title: `Expense ${action}`,
        description: `You have marked this expense as ${action}.`,
      });
      // Optionally trigger a refresh if available
      // refreshExpenses && refreshExpenses();
    } catch (e: any) {
      toast({
        title: 'Error',
        description: e.message || 'Failed to update expense status',
        variant: 'destructive',
      });
    }
  };

  // Activity log state
  const [expandedExpenseId, setExpandedExpenseId] = useState<string | null>(null);

  // Dummy activity log data for demonstration (replace with real data from DB if available)
  const getExpenseActivityLog = (expenseId: string) => [
    { timestamp: '2025-04-15 10:00', user: 'Amit', action: 'Created', status: 'Pending' },
    { timestamp: '2025-04-15 12:00', user: 'Priya', action: 'Accepted', status: 'Accepted' },
    { timestamp: '2025-04-15 14:00', user: 'Amit', action: 'Marked as Paid', status: 'Paid' },
  ];

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
                  {user && <TableHead className="text-right">Actions</TableHead>}
                  <TableHead className="text-right">Log</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {adHocExpenses.map((expense) => {
                  const isPayer = Number(user?.id) === expense.payer_id;
                  const userShare = expenseShares.find(
                    share => share.expense_id === expense.expense_id && share.user_id === Number(user?.id)
                  );
                  return (
                    <>
                      <TableRow key={expense.expense_id}>
                        <TableCell className="font-medium">{expense.category}</TableCell>
                        <TableCell>{expense.description || 'No description'}</TableCell>
                        <TableCell>
                          {isPayer ? 'You' : getParticipantName(expense.payer_id)}
                        </TableCell>
                        <TableCell className="text-right">{formatCurrency(expense.amount)}</TableCell>
                        {user && (
                          <TableCell className="text-right">
                            {isPayer ? (
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                You paid
                              </Badge>
                            ) : userShare ? (
                              <Badge 
                                variant={
                                  userShare.status === 'Pending' ? 'secondary' : 
                                  userShare.status === 'Accepted' ? 'default' : 
                                  'destructive'
                                }
                              >
                                {userShare.status}
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-gray-50">
                                Not shared with you
                              </Badge>
                            )}
                          </TableCell>
                        )}
                        {user && (
                          <TableCell className="text-right">
                            {!isPayer && userShare && userShare.status === 'Pending' && (
                              <div className="flex gap-2 justify-end">
                                <Button size="sm" variant="default" onClick={() => handleShareAction(expense.expense_id, 'Accepted')}>Accept</Button>
                                <Button size="sm" variant="destructive" onClick={() => handleShareAction(expense.expense_id, 'Disputed')}>Dispute</Button>
                              </div>
                            )}
                            {!isPayer && userShare && userShare.status === 'Accepted' && (
                              <Button size="sm" variant="outline" onClick={() => handleShareAction(expense.expense_id, 'Paid')}>Mark as Paid</Button>
                            )}
                          </TableCell>
                        )}
                        <TableCell className="text-right">
                          <Button size="sm" variant="ghost" onClick={() => setExpandedExpenseId(expandedExpenseId === expense.expense_id ? null : expense.expense_id)}>
                            {expandedExpenseId === expense.expense_id ? 'Hide Log' : 'Show Log'}
                          </Button>
                        </TableCell>
                      </TableRow>
                      {expandedExpenseId === expense.expense_id && (
                        <TableRow>
                          <TableCell colSpan={8} className="bg-gray-50 p-0">
                            <div className="p-4">
                              <div className="font-semibold mb-2">Activity Log</div>
                              <ul className="space-y-1 text-xs">
                                {getExpenseActivityLog(expense.expense_id).map((log, idx) => (
                                  <li key={idx} className="flex gap-3 items-center">
                                    <span className="text-gray-500">{log.timestamp}</span>
                                    <span className="font-bold">{log.user}</span>
                                    <span className="">{log.action}</span>
                                    <Badge variant={log.status === 'Paid' ? 'default' : log.status === 'Accepted' ? 'secondary' : 'outline'}>{log.status}</Badge>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  );
                })}
                <TableRow>
                  <TableCell colSpan={user ? 6 : 4} className="font-semibold">Total Ad-Hoc Expenses</TableCell>
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
