import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface AddExpenseModalProps {
  open: boolean;
  onClose: () => void;
}

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({ open, onClose }) => {
  const handleClose = () => onClose();
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg w-full" aria-describedby="add-expense-modal-desc">
        <div id="add-expense-modal-desc" className="sr-only">
          // --- EXPENSE LOGIC REMOVED ---
        </div>
        <DialogHeader>
          <DialogTitle>// --- EXPENSE LOGIC REMOVED ---</DialogTitle>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={handleClose} variant="outline">Cancel</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
