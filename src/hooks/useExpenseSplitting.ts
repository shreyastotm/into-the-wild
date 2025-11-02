import { useCallback, useEffect, useState } from "react";

import { useAuth } from "@/components/auth/AuthProvider";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export interface ExpenseCategory {
  id: number;
  name: string;
  icon: string | null;
}

export interface Expense {
  id: number;
  trek_id: number;
  creator_id: string;
  creator_name: string | null;
  category_id: number | null;
  category_name: string | null;
  category_icon: string | null;
  amount: number;
  description: string;
  expense_date: string;
  receipt_url: string | null;
  shares: ExpenseShare[];
}

export interface ExpenseShare {
  id: number;
  expense_id: number;
  user_id: string;
  user_name: string | null;
  amount: number;
  status: "pending" | "paid" | "rejected";
  payment_method: string | null;
  payment_date: string | null;
}

export interface ExpenseSummary {
  owedToMe: number;
  iOwe: number;
  myExpenses: number;
  myShares: number;
}

export interface CreateExpenseInput {
  trekId: number;
  categoryId: number;
  amount: number;
  description: string;
  expenseDate: string;
  receipt?: File | null;
  shareWithUsers: {
    userId: string;
    amount: number;
  }[];
}

export function useExpenseSplitting(trekId: string | undefined) {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [myExpenses, setMyExpenses] = useState<Expense[]>([]);
  const [expensesSharedWithMe, setExpensesSharedWithMe] = useState<Expense[]>(
    [],
  );
  const [expenseCategories, setExpenseCategories] = useState<ExpenseCategory[]>(
    [],
  );
  const [summary, setSummary] = useState<ExpenseSummary>({
    owedToMe: 0,
    iOwe: 0,
    myExpenses: 0,
    myShares: 0,
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchExpenses = useCallback(async () => {
    if (!user || !trekId) return;

    setLoading(true);
    try {
      const trekIdNumber = parseInt(trekId);
      if (isNaN(trekIdNumber)) throw new Error("Invalid trek ID");

      // --- Fetch expenses (Phase 1: Raw data WITHOUT category join) ---
      const { data: rawExpenses, error: expensesError } = (await supabase
        .from("trek_expenses")
        .select(
          "id, trek_id, creator_id, category_id, amount, description, expense_date, receipt_url, expense_shares(*)",
        )
        .eq("trek_id", trekIdNumber)) as any;

      if (expensesError) throw expensesError;
      if (!rawExpenses || rawExpenses.length === 0) {
        // Check length explicitly
        setMyExpenses([]);
        setExpensesSharedWithMe([]);
        setExpenses([]);
        setLoading(false);
        return;
      }

      // --- Fetch Categories (Phase 2) ---
      const categoryIds = [
        ...new Set(rawExpenses.map((e) => e.category_id).filter(Boolean)),
      ]; // Get unique category IDs
      const categoryMap: Record<number, ExpenseCategory> = {};
      if (categoryIds.length > 0) {
        const { data: categoriesData, error: categoriesError } = (await supabase
          .from("trek_expense_categories")
          .select("id, name, icon")
          .in("id", categoryIds)) as any;

        if (categoriesError)
          console.error("Error fetching expense categories:", categoriesError);
        else {
          categoriesData?.forEach((cat) => {
            categoryMap[cat.id] = cat;
          });
        }
      }

      // --- Prepare for User Lookups (Phase 3) ---
      const allCreatorIds = rawExpenses
        .map((e) => e.creator_id)
        .filter(Boolean) as any;
      const allShareUserIds = rawExpenses
        .flatMap(
          (e) =>
            e.expense_shares?.map(
              (s: Record<string, unknown>) => s.user_id as string,
            ) || [],
        )
        .filter(Boolean) as any;
      const uniqueUserIds = [
        ...new Set([...allCreatorIds, ...allShareUserIds, user.id]),
      ];

      // --- Fetch User Details (Phase 4) ---
      const userMap: Record<string, { name: string | null }> = {};
      if (uniqueUserIds.length > 0) {
        const { data: usersData, error: usersError } = (await supabase
          .from("users")
          .select("user_id, name")
          .in("user_id", uniqueUserIds)) as any;
        if (usersError)
          console.error(
            "Error fetching user details for expenses:",
            usersError,
          );
        else {
          usersData?.forEach((u) => {
            userMap[u.user_id] = { name: u.name || null };
          });
        }
      }

      // --- Process and Combine Data (Phase 5) ---
      const processedExpenses = rawExpenses.map((expense) => {
        const creatorName = userMap[expense.creator_id]?.name || null;
        const categoryDetails = expense.category_id
          ? categoryMap[expense.category_id]
          : null; // Look up category
        const processedShares = (expense.expense_shares || []).map(
          (share: Record<string, unknown>) => ({
            id: share.id,
            expense_id: expense.id,
            user_id: share.user_id,
            user_name: userMap[share.user_id]?.name || null,
            amount: share.amount,
            status: share.status,
            payment_method: share.payment_method,
            payment_date: share.payment_date,
          }),
        );

        return {
          id: expense.id,
          trek_id: expense.trek_id,
          creator_id: expense.creator_id,
          creator_name: creatorName,
          category_id: expense.category_id,
          category_name: categoryDetails?.name || "Uncategorized",
          category_icon: categoryDetails?.icon || null,
          amount: expense.amount,
          description: expense.description,
          expense_date: expense.expense_date,
          receipt_url: expense.receipt_url,
          shares: processedShares,
        };
      });

      // Filter for state updates
      const userExpenses = processedExpenses.filter(
        (e) => e.creator_id === user.id,
      );
      const sharedWithUserExpenses = processedExpenses.filter((e) =>
        e.shares.some((s) => s.user_id === user.id && e.creator_id !== user.id),
      );

      setMyExpenses(userExpenses);
      setExpensesSharedWithMe(sharedWithUserExpenses);
      setExpenses(processedExpenses); // Set the full list including user's own expenses and shared ones
    } catch (error) {
      console.error("Error fetching expenses:", error);
      toast({
        title: "Error fetching expenses",
        description: "Unable to load expense data",
        variant: "destructive",
      });
      // Clear states on error
      setMyExpenses([]);
      setExpensesSharedWithMe([]);
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  }, [user, trekId]);

  const calculateSummary = useCallback(() => {
    if (!user) return;

    let owedToMe = 0;
    let iOwe = 0;
    let myTotalExpenses = 0;
    let myTotalShares = 0;

    // Calculate money owed to me
    myExpenses.forEach((expense) => {
      myTotalExpenses += expense.amount;

      expense.shares.forEach((share) => {
        if (share.user_id !== user.id && share.status === "pending") {
          owedToMe += share.amount;
        }
      });
    });

    // Calculate money I owe to others
    expensesSharedWithMe.forEach((expense) => {
      expense.shares.forEach((share) => {
        if (share.user_id === user.id) {
          myTotalShares += share.amount;
          if (share.status === "pending") {
            iOwe += share.amount;
          }
        }
      });
    });

    setSummary({
      owedToMe,
      iOwe,
      myExpenses: myTotalExpenses,
      myShares: myTotalShares,
    });
  }, [user, myExpenses, expensesSharedWithMe]);

  useEffect(() => {
    console.log("🔍 useExpenseSplitting: useEffect triggered", {
      trekId,
      hasUser: !!user,
    });
    if (trekId && user) {
      fetchExpenseCategories();
      fetchExpenses();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trekId, user]);

  useEffect(() => {
    console.log("🔍 useExpenseSplitting: calculateSummary triggered");
    calculateSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myExpenses, expensesSharedWithMe]);

  const createExpense = async (
    expenseData: CreateExpenseInput,
  ): Promise<boolean> => {
    if (!user || !trekId) return false;

    setSubmitting(true);
    try {
      let receiptUrl = null;

      // Upload receipt if provided
      if (expenseData.receipt) {
        const fileName = `${user.id}/${Date.now()}-${expenseData.receipt.name}`;
        const { data: uploadData, error: uploadError } = (await supabase.storage
          .from("expense_receipts")
          .upload(fileName, expenseData.receipt)) as any;

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("expense_receipts")
          .getPublicUrl(fileName) as any;

        receiptUrl = urlData.publicUrl;
      }

      // Create expense record
      const { data: expenseRecord, error: expenseError } = (await supabase
        .from("trek_expenses")
        .insert({
          trek_id: expenseData.trekId,
          creator_id: user.id,
          category_id: expenseData.categoryId,
          amount: expenseData.amount,
          description: expenseData.description,
          expense_date: expenseData.expenseDate,
          receipt_url: receiptUrl,
        })
        .select()
        .single()) as any;

      if (expenseError) throw expenseError;

      // Create expense shares
      const sharesToInsert = expenseData.shareWithUsers.map((share) => ({
        expense_id: expenseRecord.id,
        user_id: share.userId,
        amount: share.amount,
        status: "pending",
      }));

      const { error: sharesError } = (await supabase
        .from("expense_shares")
        .insert(sharesToInsert)) as any;

      if (sharesError) throw sharesError;

      toast({
        title: "Expense created",
        description: "Your expense has been added successfully",
        variant: "default",
      });

      await fetchExpenses();
      return true;
    } catch (error) {
      console.error("Error creating expense:", error);
      toast({
        title: "Error creating expense",
        description: "Unable to add expense. Please try again",
        variant: "destructive",
      });
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const updateExpenseShareStatus = async (
    shareId: number,
    status: "paid" | "rejected",
    paymentMethod?: string,
  ): Promise<boolean> => {
    if (!user) return false;

    setSubmitting(true);
    try {
      const updateData: Record<string, unknown> = {
        status,
      };

      if (status === "paid") {
        updateData.payment_method = paymentMethod || "Other";
        updateData.payment_date = new Date().toISOString();
      }

      const { error } = (await supabase
        .from("expense_shares")
        .update(updateData)
        .eq("id", shareId)
        .eq("user_id", user.id)) as any;

      if (error) throw error;

      toast({
        title: status === "paid" ? "Payment marked as paid" : "Share rejected",
        description:
          status === "paid"
            ? "The expense share has been marked as paid"
            : "You have rejected this expense share",
        variant: "default",
      });

      await fetchExpenses();
      return true;
    } catch (error) {
      console.error("Error updating expense share:", error);
      toast({
        title: "Error updating share",
        description: "Unable to update expense share status",
        variant: "destructive",
      });
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const deleteExpense = async (expenseId: number): Promise<boolean> => {
    if (!user) return false;

    setSubmitting(true);
    try {
      // Check if user is the creator of the expense
      const expense = expenses.find((e) => e.id === expenseId);
      if (!expense || expense.creator_id !== user.id) {
        toast({
          title: "Permission denied",
          description: "You can only delete expenses you created",
          variant: "destructive",
        });
        return false;
      }

      // Delete expense (shares will be deleted via cascading constraints)
      const { error } = (await supabase
        .from("trek_expenses")
        .delete()
        .eq("id", expenseId)
        .eq("creator_id", user.id)) as any;

      if (error) throw error;

      toast({
        title: "Expense deleted",
        description: "The expense has been removed",
        variant: "default",
      });

      await fetchExpenses();
      return true;
    } catch (error) {
      console.error("Error deleting expense:", error);
      toast({
        title: "Error deleting expense",
        description: "Unable to delete expense",
        variant: "destructive",
      });
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const fetchExpenseCategories = async () => {
    try {
      const { data, error } = (await supabase
        .from("avatar_catalog")
        .select("*")
        .order("name")) as any;

      if (error) throw error;
      const datatrek_expense_categories = data;
      setExpenseCategories(data || []);
    } catch (error) {
      console.error("Error fetching expense categories:", error);
      toast({
        title: "Error loading categories",
        description: "Could not load expense categories",
        variant: "destructive",
      });
      setExpenseCategories([]);
    }
  };

  return {
    expenses,
    myExpenses,
    expensesSharedWithMe,
    expenseCategories,
    summary,
    loading,
    submitting,
    createExpense,
    updateExpenseShareStatus,
    deleteExpense,
    refreshExpenses: fetchExpenses,
  };
}
