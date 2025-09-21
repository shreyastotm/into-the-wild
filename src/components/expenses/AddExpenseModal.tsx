import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { AddExpenseForm } from './AddExpenseForm';
import { useTrekCommunity } from '@/hooks/useTrekCommunity';
import { CreateExpenseInput, ExpenseCategory } from '@/hooks/useExpenseSplitting';
import { Loader2 } from 'lucide-react';

interface AddExpenseModalProps {
  open: boolean;
  onClose: () => void;
  trekId: number;
  categories: ExpenseCategory[];
  createExpense: (data: CreateExpenseInput) => Promise<boolean>;
}

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({ open, onClose, trekId, categories, createExpense }) => {
  const { participants, loading } = useTrekCommunity(String(trekId));

  const formParticipants = participants.map(p => ({
    user_id: p.id,
    full_name: p.name,
  }));
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg w-full">
        <DialogHeader>
          <DialogTitle>Add a New Shared Expense</DialogTitle>
          <DialogDescription>
            First, describe the expense, then choose how to split it among participants.
          </DialogDescription>
        </DialogHeader>
        {loading ? (
          <div className="flex items-center justify-center h-24">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2">Loading participants...</span>
          </div>
        ) : (
          <AddExpenseForm
            trekId={trekId}
            participants={formParticipants}
            categories={categories}
            createExpense={createExpense}
            onSuccess={onClose}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};
