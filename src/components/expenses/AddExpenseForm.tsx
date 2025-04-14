
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
    amount: '',
    category: 'Other' as 'Fuel' | 'Toll' | 'Parking' | 'Snacks' | 'Meals' | 'Water' | 'Local Transport' | 'Medical Supplies' | 'Other'
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
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to add expenses",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.description || !formData.amount) {
      toast({
        title: "Missing information",
        description: "Please provide a description and amount",
        variant: "destructive",
      });
      return false;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount greater than zero",
        variant: "destructive",
      });
      return false;
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
          payer_id: user.id, // This is already a UUID string
          amount,
          description: formData.description,
          settlement_status: 'Pending',
          split_details: splitDetails.length > 0 ? splitDetails : null,
          category: formData.category
        } as any); // Using 'as any' to bypass type checking for this operation
      
      if (error) throw error;
      
      toast({
        title: "Expense added",
        description: "Your expense has been added successfully",
      });
      
      setFormData({
        description: '',
        amount: '',
        category: 'Other'
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
      
      {participants.length > 0 && (
        <div className="pt-2 border-t mt-4">
          <p className="text-sm text-muted-foreground mb-2">
            This expense will be split equally between you and {participants.length} other participants.
          </p>
          <p className="text-sm text-muted-foreground">
            Each person will pay approximately ₹{participants.length > 0 
              ? (parseFloat(formData.amount || '0') / (participants.length + 1)).toFixed(2) 
              : '0.00'}
          </p>
        </div>
      )}
      
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
