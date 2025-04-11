
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';

interface AddExpenseFormProps {
  trekId: number;
  onExpenseAdded: () => void;
  participants?: { user_id: string; full_name: string }[];
}

export const AddExpenseForm: React.FC<AddExpenseFormProps> = ({ 
  trekId, 
  onExpenseAdded,
  participants = [] 
}) => {
  const { user, userProfile } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    amount: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to add expenses",
        variant: "destructive",
      });
      return;
    }

    if (!formData.description || !formData.amount) {
      toast({
        title: "Missing information",
        description: "Please provide a description and amount",
        variant: "destructive",
      });
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount greater than zero",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);
      
      // Default split details - equal split among participants
      const splitDetails = participants.length > 0 
        ? participants.map(p => ({
            user_id: p.user_id,
            name: p.full_name,
            amount: (amount / (participants.length + 1)).toFixed(2)
          }))
        : [];
      
      const { error } = await supabase
        .from('expense_sharing')
        .insert({
          trek_id: trekId,
          payer_id: user.id,
          amount,
          description: formData.description,
          settlement_status: 'Pending',
          split_details: splitDetails.length > 0 ? splitDetails : null
        });
      
      if (error) throw error;
      
      toast({
        title: "Expense added",
        description: "Your expense has been added successfully",
      });
      
      setFormData({
        description: '',
        amount: ''
      });
      
      onExpenseAdded();
    } catch (error: any) {
      toast({
        title: "Error adding expense",
        description: error.message || "Failed to add expense",
        variant: "destructive",
      });
      console.error("Error adding expense:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="e.g., Shared taxi fare, Camping equipment"
          required
        />
      </div>
      
      <div>
        <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
          Amount (₹)
        </label>
        <Input
          id="amount"
          name="amount"
          type="number"
          step="0.01"
          min="0"
          value={formData.amount}
          onChange={handleChange}
          placeholder="0.00"
          required
        />
      </div>
      
      <Button 
        type="submit" 
        className="w-full"
        disabled={submitting}
      >
        {submitting ? 'Adding...' : 'Add Expense'}
      </Button>
    </form>
  );
};
