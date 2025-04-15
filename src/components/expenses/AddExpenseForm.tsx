import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { z } from "zod";
import { useExpenses } from '@/hooks/useExpenses';

const expenseSchema = z.object({
  description: z.string().min(1, "Description is required"),
  amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Amount must be a number greater than zero",
  }),
  category: z.enum([
    "Fuel",
    "Toll",
    "Parking",
    "Snacks",
    "Meals",
    "Water",
    "Local Transport",
    "Medical Supplies",
    "Other",
  ]),
});

interface AddExpenseFormProps {
  trekId: number;
  onExpenseAdded: (formData: any) => void;
  participants?: { user_id: string; full_name: string }[];
}

// AddExpenseForm now supports multi-step via AddExpenseModal
// Only Step 1 (details) is handled here. Participant selection and review are handled in the modal.

export const AddExpenseForm: React.FC<AddExpenseFormProps> = ({ 
  trekId, 
  onExpenseAdded,
  participants = [] 
}) => {
  const { user, userProfile } = useAuth();
  const { addAdHocExpense, shareExpense } = useExpenses();
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: 'Other' as 'Fuel' | 'Toll' | 'Parking' | 'Snacks' | 'Meals' | 'Water' | 'Local Transport' | 'Medical Supplies' | 'Other',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCategoryChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      category: value as typeof formData.category
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = expenseSchema.safeParse(formData);
    if (!result.success) {
      toast({
        title: "Validation Error",
        description: result.error.errors.map((e) => e.message).join(", "),
        variant: "destructive",
      });
      return false;
    }
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to add expenses",
        variant: "destructive",
      });
      return false;
    }
    setSubmitting(true);
    // Pass formData to parent/modal for next step
    onExpenseAdded(formData);
    setSubmitting(false);
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
      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
          Category
        </label>
        <Select 
          value={formData.category} 
          onValueChange={handleCategoryChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Fuel">Fuel</SelectItem>
            <SelectItem value="Toll">Toll</SelectItem>
            <SelectItem value="Parking">Parking</SelectItem>
            <SelectItem value="Snacks">Snacks</SelectItem>
            <SelectItem value="Meals">Meals</SelectItem>
            <SelectItem value="Water">Water</SelectItem>
            <SelectItem value="Local Transport">Local Transport</SelectItem>
            <SelectItem value="Medical Supplies">Medical Supplies</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" disabled={submitting} className="w-full">
        {submitting ? 'Next' : 'Next'}
      </Button>
    </form>
  );
};
