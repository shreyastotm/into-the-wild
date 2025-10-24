import React, { useState } from "react";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { AdHocExpense, ExpenseShare, FixedExpense } from "@/hooks/useExpenses";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ExpenseTableProps {
  fixedExpenses: FixedExpense[];
  adHocExpenses: AdHocExpense[];
  expenseShares: ExpenseShare[];
  participants: { user_id: string; full_name: string }[];
}

export const ExpenseTable: React.FC<ExpenseTableProps> = ({
  fixedExpenses,
  adHocExpenses,
  expenseShares,
  participants,
}) => {
  const { user } = useAuth();

  // Helper to get participant name from ID
  const getParticipantName = (payerId: string) => {
    const participant = participants.find((p) => p.user_id === payerId);
    return participant ? participant.full_name : "Unknown";
  };

  // Get expense share status for the current user
  const getUserShareStatus = (expenseId: string) => {
    if (!user) return null;

    const share = expenseShares.find(
      (share) =>
        String(share.expense_id) === String(expenseId) &&
        String(share.user_id) === String(user.id),
    );

    return share ? share.status : null;
  };

  // Action for accepting, disputing, or marking as paid
  const handleShareAction = async (
    expenseId: string,
    action: "Accepted" | "Disputed" | "Paid",
  ) => {
    try {
      const { error } = await supabase
        .from("ad_hoc_expense_shares")
        .update({ status: action })
        .eq("expense_id", expenseId)
        .eq("user_id", user?.id);
      if (error) throw error;
      toast({
        title: `Expense ${action}`,
        description: `You have marked this expense as ${action}.`,
      });
      // Optionally trigger a refresh if available
      // refreshExpenses && refreshExpenses();
    } catch (e: unknown) {
      const errorMessage =
        e instanceof Error ? e.message : "Failed to update expense status";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  // Activity log state
  const [expandedExpenseId, setExpandedExpenseId] = useState<string | null>(
    null,
  );

  // Activity log data - currently not implemented in the database
  // This would need to be implemented as a separate table to track expense changes
  const getExpenseActivityLog = (expenseId: string) => {
    // Return empty array until activity logging is implemented
    return [];
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {fixedExpenses.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Fixed Expenses</h3>

          {/* Mobile Card Layout */}
          <div className="block md:hidden space-y-3">
            {fixedExpenses.map((expense) => (
              <div
                key={expense.expense_id}
                className="border rounded-lg p-4 bg-white shadow-sm"
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-sm">
                    {expense.expense_type}
                  </h4>
                  <span className="font-semibold text-sm">
                    {formatCurrency(expense.amount, "INR")}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {expense.description || "No description"}
                </p>
              </div>
            ))}
            <div className="border rounded-lg p-4 bg-gray-50 font-semibold">
              <div className="flex justify-between items-center">
                <span className="text-sm">Total Fixed Expenses</span>
                <span className="text-sm">
                  {formatCurrency(
                    fixedExpenses.reduce((sum, exp) => sum + exp.amount, 0),
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Desktop Table Layout */}
          <div className="hidden md:block rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fixedExpenses.map((expense) => (
                  <TableRow key={expense.expense_id}>
                    <TableCell className="font-medium">
                      {expense.expense_type}
                    </TableCell>
                    <TableCell>
                      {expense.description || "No description"}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(expense.amount, "INR")}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={2} className="font-semibold">
                    Total Fixed Expenses
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {formatCurrency(
                      fixedExpenses.reduce((sum, exp) => sum + exp.amount, 0),
                    )}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
      )}
      {adHocExpenses.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Ad-Hoc Expenses</h3>

          {/* Mobile Card Layout */}
          <div className="block md:hidden space-y-3">
            {adHocExpenses.map((expense) => {
              const isPayer = user?.id === expense.payer_id;
              const userShare = expenseShares.find(
                (share) =>
                  String(share.expense_id) === String(expense.expense_id) &&
                  String(share.user_id) === String(user?.id),
              );
              return (
                <div
                  key={expense.expense_id}
                  className="border rounded-lg p-4 bg-white shadow-sm"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-sm">{expense.category}</h4>
                    <span className="font-semibold text-sm">
                      {formatCurrency(expense.amount, "INR")}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">
                    {expense.description || "No description"}
                  </p>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Paid by:</span>
                      <span>
                        {isPayer ? "You" : getParticipantName(expense.payer_id)}
                      </span>
                    </div>

                    {user && (
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">
                          Your status:
                        </span>
                        <div>
                          {isPayer ? (
                            <Badge
                              variant="outline"
                              className="bg-green-50 text-green-700 border-green-200 text-xs"
                            >
                              You paid
                            </Badge>
                          ) : userShare ? (
                            <Badge
                              variant={
                                userShare.status === "Pending"
                                  ? "secondary"
                                  : userShare.status === "Accepted"
                                    ? "default"
                                    : "destructive"
                              }
                              className="text-xs"
                            >
                              {userShare.status}
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="bg-gray-50 text-xs"
                            >
                              Not shared
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {user &&
                    !isPayer &&
                    userShare &&
                    userShare.status === "Pending" && (
                      <div className="flex gap-2 mt-3">
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() =>
                            handleShareAction(expense.expense_id, "Accepted")
                          }
                          className="flex-1 text-xs"
                        >
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() =>
                            handleShareAction(expense.expense_id, "Disputed")
                          }
                          className="flex-1 text-xs"
                        >
                          Dispute
                        </Button>
                      </div>
                    )}

                  {user &&
                    !isPayer &&
                    userShare &&
                    userShare.status === "Accepted" && (
                      <div className="mt-3">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleShareAction(expense.expense_id, "Paid")
                          }
                          className="w-full text-xs"
                        >
                          Mark as Paid
                        </Button>
                      </div>
                    )}

                  <div className="mt-3 pt-3 border-t">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        setExpandedExpenseId(
                          expandedExpenseId === expense.expense_id
                            ? null
                            : expense.expense_id,
                        )
                      }
                      className="w-full text-xs"
                    >
                      {expandedExpenseId === expense.expense_id
                        ? "Hide Log"
                        : "Show Log"}
                    </Button>

                    {expandedExpenseId === expense.expense_id && (
                      <div className="mt-3 p-3 bg-gray-50 rounded">
                        <div className="font-semibold mb-2 text-xs">
                          Activity Log
                        </div>
                        <ul className="space-y-1 text-xs">
                          {getExpenseActivityLog(expense.expense_id).map(
                            (log, idx) => (
                              <li key={idx} className="flex gap-2 items-center">
                                <span className="text-gray-500">
                                  {log.timestamp}
                                </span>
                                <span className="font-bold">{log.user}</span>
                                <span>{log.action}</span>
                                <Badge
                                  variant={
                                    log.status === "Paid"
                                      ? "default"
                                      : log.status === "Accepted"
                                        ? "secondary"
                                        : "outline"
                                  }
                                  className="text-xs"
                                >
                                  {log.status}
                                </Badge>
                              </li>
                            ),
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            <div className="border rounded-lg p-4 bg-gray-50 font-semibold">
              <div className="flex justify-between items-center">
                <span className="text-sm">Total Ad-Hoc Expenses</span>
                <span className="text-sm">
                  {formatCurrency(
                    adHocExpenses.reduce((sum, exp) => sum + exp.amount, 0),
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Desktop Table Layout */}
          <div className="hidden md:block rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Paid By</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  {user && (
                    <TableHead className="text-right">Your Status</TableHead>
                  )}
                  {user && (
                    <TableHead className="text-right">Actions</TableHead>
                  )}
                  <TableHead className="text-right">Log</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {adHocExpenses.map((expense) => {
                  const isPayer = user?.id === expense.payer_id;
                  const userShare = expenseShares.find(
                    (share) =>
                      String(share.expense_id) === String(expense.expense_id) &&
                      String(share.user_id) === String(user?.id),
                  );
                  return (
                    <>
                      <TableRow key={expense.expense_id}>
                        <TableCell className="font-medium">
                          {expense.category}
                        </TableCell>
                        <TableCell>
                          {expense.description || "No description"}
                        </TableCell>
                        <TableCell>
                          {isPayer
                            ? "You"
                            : getParticipantName(expense.payer_id)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(expense.amount, "INR")}
                        </TableCell>
                        {user && (
                          <TableCell className="text-right">
                            {isPayer ? (
                              <Badge
                                variant="outline"
                                className="bg-green-50 text-green-700 border-green-200"
                              >
                                You paid
                              </Badge>
                            ) : userShare ? (
                              <Badge
                                variant={
                                  userShare.status === "Pending"
                                    ? "secondary"
                                    : userShare.status === "Accepted"
                                      ? "default"
                                      : "destructive"
                                }
                              >
                                {userShare.status}
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-gray-50">
                                Not shared with you
                              </Badge>
                            )}
                          </TableCell>
                        )}
                        {user && (
                          <TableCell className="text-right">
                            {!isPayer &&
                              userShare &&
                              userShare.status === "Pending" && (
                                <div className="flex gap-2 justify-end">
                                  <Button
                                    size="sm"
                                    variant="default"
                                    onClick={() =>
                                      handleShareAction(
                                        expense.expense_id,
                                        "Accepted",
                                      )
                                    }
                                  >
                                    Accept
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() =>
                                      handleShareAction(
                                        expense.expense_id,
                                        "Disputed",
                                      )
                                    }
                                  >
                                    Dispute
                                  </Button>
                                </div>
                              )}
                            {!isPayer &&
                              userShare &&
                              userShare.status === "Accepted" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    handleShareAction(
                                      expense.expense_id,
                                      "Paid",
                                    )
                                  }
                                >
                                  Mark as Paid
                                </Button>
                              )}
                          </TableCell>
                        )}
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              setExpandedExpenseId(
                                expandedExpenseId === expense.expense_id
                                  ? null
                                  : expense.expense_id,
                              )
                            }
                          >
                            {expandedExpenseId === expense.expense_id
                              ? "Hide Log"
                              : "Show Log"}
                          </Button>
                        </TableCell>
                      </TableRow>
                      {expandedExpenseId === expense.expense_id && (
                        <TableRow>
                          <TableCell colSpan={8} className="bg-gray-50 p-0">
                            <div className="p-4">
                              <div className="font-semibold mb-2">
                                Activity Log
                              </div>
                              <ul className="space-y-1 text-xs">
                                {getExpenseActivityLog(expense.expense_id).map(
                                  (log, idx) => (
                                    <li
                                      key={idx}
                                      className="flex gap-3 items-center"
                                    >
                                      <span className="text-gray-500">
                                        {log.timestamp}
                                      </span>
                                      <span className="font-bold">
                                        {log.user}
                                      </span>
                                      <span className="">{log.action}</span>
                                      <Badge
                                        variant={
                                          log.status === "Paid"
                                            ? "default"
                                            : log.status === "Accepted"
                                              ? "secondary"
                                              : "outline"
                                        }
                                      >
                                        {log.status}
                                      </Badge>
                                    </li>
                                  ),
                                )}
                              </ul>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  );
                })}
                <TableRow>
                  <TableCell colSpan={user ? 6 : 4} className="font-semibold">
                    Total Ad-Hoc Expenses
                  </TableCell>
                  <TableCell
                    className="text-right font-semibold"
                    colSpan={user ? 2 : 1}
                  >
                    {formatCurrency(
                      adHocExpenses.reduce((sum, exp) => sum + exp.amount, 0),
                    )}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
      )}
      {fixedExpenses.length === 0 && adHocExpenses.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No expenses have been added for this trek yet.
        </div>
      )}
    </div>
  );
};
