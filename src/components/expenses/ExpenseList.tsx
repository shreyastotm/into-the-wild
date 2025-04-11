
import React, { useEffect, useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from '@/components/ui/use-toast';
import { ExpenseCard } from './ExpenseCard';
import { AddExpenseForm } from './AddExpenseForm';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

interface Expense {
  expense_id: number;
  description: string;
  amount: number;
  expense_date: string;
  settlement_status: string;
  payer_id: string;  // Changed from number to string to match Supabase UUID format
  payer_name?: string;
}

interface ExpenseListProps {
  trekId: number;
  isRegistered: boolean;
}

export const ExpenseList: React.FC<ExpenseListProps> = ({ trekId, isRegistered }) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [participants, setParticipants] = useState<{ user_id: string; full_name: string }[]>([]);

  useEffect(() => {
    fetchExpenses();
    fetchParticipants();
  }, [trekId]);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('expense_sharing')
        .select(`
          expense_id,
          description,
          amount,
          expense_date,
          settlement_status,
          payer_id,
          payer:users(full_name)
        `)
        .eq('trek_id', trekId)
        .order('expense_date', { ascending: false });
      
      if (error) throw error;
      
      if (data) {
        // Transform the data to match our Expense interface
        const transformedData: Expense[] = data.map(item => ({
          expense_id: item.expense_id,
          description: item.description,
          amount: item.amount,
          expense_date: item.expense_date,
          settlement_status: item.settlement_status,
          payer_id: item.payer_id?.toString() || '', // Convert to string to match the interface
          payer_name: item.payer ? item.payer.full_name : 'Unknown' // Handle potential null safely
        }));
        
        setExpenses(transformedData);
      }
    } catch (error: any) {
      toast({
        title: "Error loading expenses",
        description: error.message || "Failed to load expenses",
        variant: "destructive",
      });
      console.error("Error fetching expenses:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchParticipants = async () => {
    try {
      const { data, error } = await supabase
        .from('registrations')
        .select(`
          user_id,
          users(full_name)
        `)
        .eq('trek_id', trekId)
        .eq('payment_status', 'Pending');
      
      if (error) throw error;
      
      if (data) {
        const participantsList = data
          .filter(item => item.users) // Filter out any null users
          .map(item => ({
            user_id: item.user_id?.toString() || '', // Convert to string to ensure type consistency
            full_name: item.users ? item.users.full_name : 'Unknown' // Handle potential null safely
          }));
        
        setParticipants(participantsList);
      }
    } catch (error) {
      console.error("Error fetching participants:", error);
    }
  };

  const handleExpenseAdded = () => {
    setShowAddForm(false);
    fetchExpenses();
  };

  if (loading && expenses.length === 0) {
    return <div className="py-4 text-center">Loading expenses...</div>;
  }

  return (
    <div className="space-y-4">
      {isRegistered && (
        <div className="mb-6">
          {showAddForm ? (
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h3 className="text-lg font-medium mb-4">Add New Expense</h3>
              <AddExpenseForm 
                trekId={trekId} 
                onExpenseAdded={handleExpenseAdded}
                participants={participants}
              />
              <Button 
                variant="ghost" 
                onClick={() => setShowAddForm(false)}
                className="mt-2 w-full"
              >
                Cancel
              </Button>
            </div>
          ) : (
            <Button 
              onClick={() => setShowAddForm(true)}
              className="w-full"
              variant="outline"
            >
              <PlusCircle className="mr-2 h-4 w-4" /> Add Expense
            </Button>
          )}
        </div>
      )}

      {expenses.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-gray-500">No expenses have been added yet</p>
        </div>
      ) : (
        <div>
          {expenses.map((expense) => (
            <ExpenseCard
              key={expense.expense_id}
              description={expense.description}
              amount={expense.amount}
              paidBy={expense.payer_name || 'Unknown'}
              date={expense.expense_date}
              status={expense.settlement_status}
            />
          ))}
        </div>
      )}
    </div>
  );
};
