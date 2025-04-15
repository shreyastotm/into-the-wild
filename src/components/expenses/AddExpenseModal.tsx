import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AddExpenseForm } from './AddExpenseForm';

interface AddExpenseModalProps {
  open: boolean;
  onClose: () => void;
  trekId: number;
  participants: { user_id: string; full_name: string }[];
  onExpenseAdded: () => void;
}

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({ open, onClose, trekId, participants, onExpenseAdded }) => {
  // Step state: 0 = details, 1 = participants, 2 = review
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<any>(null);

  const handleNext = (data?: any) => {
    if (step === 0 && data) setFormData(data);
    setStep((s) => s + 1);
  };
  const handleBack = () => setStep((s) => s - 1);
  const handleClose = () => {
    setStep(0);
    setFormData(null);
    onClose();
  };
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg w-full">
        <DialogHeader>
          <DialogTitle>Add Expense</DialogTitle>
        </DialogHeader>
        {step === 0 && (
          <AddExpenseForm
            trekId={trekId}
            participants={participants}
            onExpenseAdded={() => {
              handleNext();
            }}
          />
        )}
        {step === 1 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Select Participants</h3>
            {/* Participant selection UI goes here */}
            <Button onClick={handleNext} className="mt-4 w-full">Next</Button>
            <Button onClick={handleBack} variant="secondary" className="mt-2 w-full">Back</Button>
          </div>
        )}
        {step === 2 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Review & Submit</h3>
            {/* Summary UI goes here */}
            <Button onClick={handleClose} className="mt-4 w-full">Done</Button>
          </div>
        )}
        <DialogFooter>
          <Button onClick={handleClose} variant="outline">Cancel</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
