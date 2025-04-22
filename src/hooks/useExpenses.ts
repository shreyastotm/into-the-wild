import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from '@/components/auth/AuthProvider';
import { toast } from '@/components/ui/use-toast';

// Types for different expense categories
export interface FixedExpense {
  expense_id: string;
  trek_id: number;
  expense_type: 'Tickets' | 'Forest Fees' | 'Stay' | 'Camping Equipment' | 'Bonfire' | 'Bird Watching Guide' | 'Cooking Stove Rental' | 'Other';
  amount: number;
  description?: string;
}

export interface AdHocExpense {
  expense_id: string;
  trek_id: number;
  payer_id: number;
  category: 'Fuel' | 'Toll' | 'Parking' | 'Snacks' | 'Meals' | 'Water' | 'Local Transport' | 'Medical Supplies' | 'Other';
  amount: number;
  description?: string;
}

export interface ExpenseShare {
  share_id: string;
  expense_id: string;
  user_id: number;
  status: 'Pending' | 'Accepted' | 'Rejected';
  rejection_reason?: string;
  share_amount: number;
}

export const useExpenses = (trekId?: number) => {
  const { user } = useAuth();
  const [fixedExpenses, setFixedExpenses] = useState<FixedExpense[]>([]);
  const [adHocExpenses, setAdHocExpenses] = useState<AdHocExpense[]>([]);
  const [expenseShares, setExpenseShares] = useState<ExpenseShare[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (trekId && user) {
      fetchExpenses();
    }
  }, [trekId, user]);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      
      // Fetch fixed expenses for the trek
      const { data: fixedData, error: fixedError } = await supabase
        .from('trek_fixed_expenses')
        .select('*')
        .eq('trek_id', trekId);

      if (fixedError) {
        console.error("Error fetching fixed expenses:", fixedError);
      }

      // Fetch ad-hoc expenses for the trek
      const { data: adHocData, error: adHocError } = await supabase
        .from('trek_ad_hoc_expenses')
        .select('*')
        .eq('trek_id', trekId);

      if (adHocError) {
        console.error("Error fetching ad-hoc expenses:", adHocError);
      }

      // Fetch expense shares for ad-hoc expenses if we have ad-hoc expenses
      let shareData = [];
      let shareError = null;
      
      if (adHocData && adHocData.length > 0) {
        const expenseIds = adHocData.map(exp => exp.expense_id).filter(Boolean);
        if (expenseIds.length > 0) {
          const result = await supabase
            .from('trek_ad_hoc_expense_shares')
            .select('*')
            .in('expense_id', expenseIds);
          
          shareData = result.data || [];
          shareError = result.error;
          
          if (shareError) {
            console.error("Error fetching expense shares:", shareError);
          }
        } else {
          shareData = [];
        }
      } else {
        shareData = [];
      }

      // If all three requests failed, throw an error
      if (fixedError && adHocError && shareError) {
        throw new Error("Failed to fetch expense data");
      }

      // Type casting to ensure data matches our interfaces
      setFixedExpenses(fixedData?.map(item => ({
        ...item,
        expense_type: item.expense_type as FixedExpense['expense_type']
      })) || []);
      
      setAdHocExpenses(adHocData?.map(item => ({
        ...item,
        category: item.category as AdHocExpense['category']
      })) || []);
      
      setExpenseShares(shareData?.map(item => ({
        ...item,
        status: item.status as ExpenseShare['status']
      })) || []);
    } catch (error) {
      toast({
        title: 'Error fetching expenses',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const addAdHocExpense = async (expense: Omit<AdHocExpense, 'expense_id'>) => {
    try {
      const { data, error } = await supabase
        .from('trek_ad_hoc_expenses')
        .insert(expense)
        .select();

      if (error) throw error;

      // Automatically refresh expenses after adding
      await fetchExpenses();

      toast({
        title: 'Expense Added',
        description: 'Ad-hoc expense has been successfully added'
      });

      return data;
    } catch (error) {
      toast({
        title: 'Error adding expense',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive'
      });
      return null;
    }
  };

  const shareExpense = async (share: Omit<ExpenseShare, 'share_id'>) => {
    try {
      const { data, error } = await supabase
        .from('trek_ad_hoc_expense_shares')
        .insert(share)
        .select();

      if (error) throw error;

      // Automatically refresh expenses after sharing
      await fetchExpenses();

      toast({
        title: 'Expense Shared',
        description: 'Expense has been shared with selected participants'
      });

      return data;
    } catch (error) {
      toast({
        title: 'Error sharing expense',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive'
      });
      return null;
    }
  };

  const updateExpenseShareStatus = async (shareId: string, status: 'Accepted' | 'Rejected', rejectionReason?: string) => {
    try {
      const { data, error } = await supabase
        .from('trek_ad_hoc_expense_shares')
        .update({ 
          status, 
          rejection_reason: status === 'Rejected' ? rejectionReason : null,
          responded_at: new Date().toISOString()
        })
        .eq('share_id', shareId)
        .select();

      if (error) throw error;

      // Automatically refresh expenses after updating
      await fetchExpenses();

      toast({
        title: 'Expense Share Updated',
        description: `Expense share has been ${status.toLowerCase()}`
      });

      return data;
    } catch (error) {
      toast({
        title: 'Error updating expense share',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive'
      });
      return null;
    }
  };

  // Settle an ad-hoc or fixed expense by marking it as settled (only update settled_at)
  const settleExpense = async (expenseId: string, type: 'ad-hoc' | 'fixed') => {
    try {
      const table: "trek_ad_hoc_expenses" | "trek_fixed_expenses" =
        type === "ad-hoc" ? "trek_ad_hoc_expenses" : "trek_fixed_expenses";
      const { data, error } = await supabase
        .from(table)
        .update({ settled_at: new Date().toISOString() })
        .eq('expense_id', expenseId)
        .select();
      if (error) throw error;
      await fetchExpenses();
      toast({
        title: 'Expense Settled',
        description: 'Expense has been marked as settled.'
      });
      return data;
    } catch (error) {
      toast({
        title: 'Error settling expense',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive'
      });
      return null;
    }
  };

  return {
    fixedExpenses,
    adHocExpenses,
    expenseShares,
    loading,
    addAdHocExpense,
    shareExpense,
    updateExpenseShareStatus,
    settleExpense,
    refreshExpenses: fetchExpenses
  };
};
