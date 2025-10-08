import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { Receipt, Plus, Trash2, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/components/auth/AuthProvider';
import { useExpenseSplitting, Expense } from '@/hooks/useExpenseSplitting';
import { formatCurrency } from '@/lib/utils';
import { TrekCost } from '@/types/trek';
import { AddExpenseModal } from './AddExpenseModal';
import { Skeleton } from '@/components/ui/skeleton';

// --- INTERFACES ---
interface ExpenseSplittingProps {
  trekId?: string;
  fixedCosts?: TrekCost[];
}
interface ExpenseCardProps {
  expense: Expense;
  currentUserId: string;
  onPayExpense: (shareId: number, amount: number) => void;
  onRejectExpense: (shareId: number) => void;
  onDeleteExpense: (expenseId: number) => void;
}

// --- HELPER COMPONENTS ---
const SummaryCard = ({ title, value, variant }: { title: string, value: number, variant?: 'green' | 'red' }) => {
  const colorClass = variant === 'green' ? 'text-green-600' : variant === 'red' ? 'text-red-600' : '';
  return <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">{title}</CardTitle></CardHeader><CardContent><p className={`text-2xl font-bold ${colorClass}`}>{formatCurrency(value)}</p></CardContent></Card>;
};

const ExpenseCard: React.FC<ExpenseCardProps> = ({ expense, currentUserId, onPayExpense, onRejectExpense, onDeleteExpense }) => {
    const isCreator = expense.creator_id === currentUserId;
    const myShare = expense.shares.find(share => share.user_id === currentUserId);
    const getStatusBadge = (status: 'pending' | 'paid' | 'rejected') => {
        if (status === 'paid') return <Badge variant="default" className="bg-green-100 text-green-800">Paid</Badge>;
        if (status === 'rejected') return <Badge variant="destructive">Rejected</Badge>;
        return <Badge variant="secondary">Pending</Badge>;
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div className="flex items-start gap-3">
                        <Receipt className="h-8 w-8 text-primary" />
                        <div>
                            <CardTitle className="text-lg">{expense.description}</CardTitle>
                            <CardDescription>by {expense.creator_name} on {format(new Date(expense.expense_date), 'PPP')}</CardDescription>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-xl font-bold">{formatCurrency(expense.amount)}</p>
                        <p className="text-sm text-muted-foreground">{expense.category_name}</p>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <h4 className="text-sm font-semibold mb-2">Split Details</h4>
                <ul className="space-y-2">
                    {expense.shares.map(share => (
                        <li key={share.id} className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <Avatar className="h-6 w-6"><AvatarFallback>{share.user_name?.charAt(0)}</AvatarFallback></Avatar>
                                <span>{share.user_name}{share.user_id === currentUserId && " (You)"}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                {getStatusBadge(share.status)}
                                <span className="font-medium">{formatCurrency(share.amount)}</span>
                            </div>
                        </li>
                    ))}
                </ul>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
                {isCreator && <Button variant="destructive" size="sm" onClick={() => onDeleteExpense(expense.id)}><Trash2 className="mr-2 h-4 w-4" />Delete</Button>}
                {!isCreator && myShare && myShare.status === 'pending' && (
                    <>
                        <Button variant="outline" size="sm" onClick={() => onRejectExpense(myShare.id)}>Reject</Button>
                        <Button size="sm" onClick={() => onPayExpense(myShare.id, myShare.amount)}>Pay Share</Button>
                    </>
                )}
            </CardFooter>
        </Card>
    );
};

const ExpenseList: React.FC<{ expenses: Expense[] } & Omit<ExpenseCardProps, 'expense'>> = ({ expenses, ...props }) => {
  if (!expenses || expenses.length === 0) return <div className="text-center py-10"><p className="text-muted-foreground">No expenses here.</p></div>;
  return <div className="space-y-4">{expenses.map(expense => <ExpenseCard key={expense.id} expense={expense} {...props} />)}</div>;
};

const ExpenseSplittingSkeleton = () => (
  <div className="space-y-4">
    <div className="flex justify-between items-center"><Skeleton className="h-8 w-48" /><Skeleton className="h-10 w-32" /></div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"><Skeleton className="h-24 w-full" /><Skeleton className="h-24 w-full" /><Skeleton className="h-24 w-full" /><Skeleton className="h-24 w-full" /></div>
    <Skeleton className="h-10 w-full" />
    <Skeleton className="h-64 w-full" />
  </div>
);

// --- MAIN COMPONENT ---
export const ExpenseSplitting: React.FC<ExpenseSplittingProps> = ({ trekId: propTrekId, fixedCosts = [] }) => {
    const { id: routeTrekId } = useParams<{ id: string }>();
    const actualTrekId = propTrekId || routeTrekId;
    const { user } = useAuth();
    const { expenses, myExpenses, expensesSharedWithMe, summary, loading, updateExpenseShareStatus, deleteExpense, createExpense, expenseCategories } = useExpenseSplitting(actualTrekId);
    
    const [isAddModalOpen, setAddModalOpen] = useState(false);

    const handlePay = async (shareId: number, amount: number) => {
        const success = await updateExpenseShareStatus(shareId, 'paid');
        if(success) toast({ title: "Success", description: `Paid your share of ${formatCurrency(amount)}.` });
    };
    const handleReject = async (shareId: number) => {
        const success = await updateExpenseShareStatus(shareId, 'rejected');
        if(success) toast({ title: "Share Rejected", variant: 'destructive' });
    };
    const handleDelete = async (expenseId: number) => {
        const success = await deleteExpense(expenseId);
        if(success) toast({ title: "Expense Deleted" });
    };

    if (loading) return <ExpenseSplittingSkeleton />;
    if (!actualTrekId) return <p>Error: Trek ID is missing.</p>;

    return (
        <>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h3 className="text-xl font-semibold">Expense Splitting</h3>
                    <Button size="sm" onClick={() => setAddModalOpen(true)}><Plus className="h-4 w-4 mr-2" />Add Expense</Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <SummaryCard key="owedToMe" title="You are owed" value={summary.owedToMe} variant="green" />
                    <SummaryCard key="iOwe" title="You owe" value={summary.iOwe} variant="red" />
                    <SummaryCard key="myExpenses" title="Your expenses" value={summary.myExpenses} />
                    <SummaryCard key="myShares" title="Your shares" value={summary.myShares} />
                </div>

                <Tabs defaultValue="all" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-1">
                        <TabsTrigger value="all" className="text-xs sm:text-sm">
                            All ({expenses.length})
                        </TabsTrigger>
                        <TabsTrigger value="my-expenses" className="text-xs sm:text-sm">
                            <span className="hidden sm:inline">My Expenses</span>
                            <span className="sm:hidden">Mine</span> ({myExpenses.length})
                        </TabsTrigger>
                        <TabsTrigger value="shared-with-me" className="text-xs sm:text-sm">
                            <span className="hidden sm:inline">Shared</span>
                            <span className="sm:hidden">Shared</span> ({expensesSharedWithMe.length})
                        </TabsTrigger>
                        <TabsTrigger value="fixed-costs" className="text-xs sm:text-sm">
                            <span className="hidden sm:inline">Fixed Costs</span>
                            <span className="sm:hidden">Fixed</span> ({fixedCosts.length})
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="all" className="mt-4"><ExpenseList expenses={expenses} currentUserId={user!.id} onPayExpense={handlePay} onRejectExpense={handleReject} onDeleteExpense={handleDelete} /></TabsContent>
                    <TabsContent value="my-expenses" className="mt-4"><ExpenseList expenses={myExpenses} currentUserId={user!.id} onPayExpense={handlePay} onRejectExpense={handleReject} onDeleteExpense={handleDelete} /></TabsContent>
                    <TabsContent value="shared-with-me" className="mt-4"><ExpenseList expenses={expensesSharedWithMe} currentUserId={user!.id} onPayExpense={handlePay} onRejectExpense={handleReject} onDeleteExpense={handleDelete} /></TabsContent>
                    <TabsContent value="fixed-costs" className="mt-4">
                        {fixedCosts.length > 0 ? (
                            <ul className="space-y-2">{fixedCosts.map((cost, index) => (
                                <li key={`${cost.cost_id}-${index}`} className="flex justify-between p-3 bg-muted/50 rounded-md">
                                    <div><p className="font-medium">{cost.name}</p>{cost.description && <p className="text-sm text-muted-foreground">{cost.description}</p>}</div>
                                    <div className="text-right"><p className="font-semibold">{formatCurrency(cost.amount)}</p>{cost.type && <p className="text-xs capitalize text-muted-foreground">{cost.type.replace('_', ' ')}</p>}</div>
                                </li>))}
                            </ul>
                        ) : <div className="text-center py-8 text-muted-foreground"><p>No fixed costs for this trek.</p></div>}
                    </TabsContent>
                </Tabs>
            </div>
            <AddExpenseModal
                open={isAddModalOpen}
                onClose={() => setAddModalOpen(false)}
                trekId={parseInt(actualTrekId)}
                categories={expenseCategories}
                createExpense={createExpense}
            />
        </>
    );
};
