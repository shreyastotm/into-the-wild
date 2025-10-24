import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { AdHocExpense, FixedExpense } from "@/hooks/useExpenses";
import { useAuth } from "@/components/auth/AuthProvider";
import { Wallet, ArrowDownRight, ArrowUpRight } from "lucide-react";

interface ExpenseSummaryProps {
  fixedExpenses: FixedExpense[];
  adHocExpenses: AdHocExpense[];
  userContributions?: {
    userId: string;
    amount: number;
    paid: boolean;
  }[];
}

export const ExpenseSummary: React.FC<ExpenseSummaryProps> = ({
  fixedExpenses = [],
  adHocExpenses = [],
  userContributions = [],
}) => {
  const { user } = useAuth();

  // Calculate total expenses
  const totalFixed = fixedExpenses.reduce(
    (sum, expense) => sum + expense.amount,
    0,
  );
  const totalAdHoc = adHocExpenses.reduce(
    (sum, expense) => sum + expense.amount,
    0,
  );
  const grandTotal = totalFixed + totalAdHoc;

  // Calculate per person cost
  const numberOfParticipants = userContributions.length || 1;
  const costPerPerson = grandTotal / numberOfParticipants;

  // Calculate what current user has paid vs what they owe
  const userPaid = adHocExpenses
    .filter((expense) => expense.payer_id === Number(user?.id))
    .reduce((sum, expense) => sum + expense.amount, 0);

  // Calculate what others owe the current user (simplified)
  const userIsOwed = userPaid - (userPaid > 0 ? costPerPerson : 0);

  // Calculate what the user owes to others (simplified)
  const userOwes = userPaid > 0 ? 0 : costPerPerson;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Wallet className="mr-2 h-5 w-5" />
          Expense Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-muted-foreground mb-1">
              Total Expenses
            </div>
            <div className="text-2xl font-bold">
              {formatCurrency(grandTotal, "INR")}
            </div>
            <div className="text-sm text-muted-foreground mt-2">
              Fixed: {formatCurrency(totalFixed, "INR")} / Ad-hoc:{" "}
              {formatCurrency(totalAdHoc, "INR")}
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-muted-foreground mb-1">
              Per Person (approx)
            </div>
            <div className="text-2xl font-bold">
              {formatCurrency(costPerPerson, "INR")}
            </div>
            <div className="text-sm text-muted-foreground mt-2">
              Based on {numberOfParticipants} participant
              {numberOfParticipants !== 1 ? "s" : ""}
            </div>
          </div>

          {user && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">
                Your Balance
              </div>
              <div className="text-2xl font-bold">
                {userIsOwed > 0
                  ? formatCurrency(userIsOwed, "INR")
                  : userOwes > 0
                    ? `-${formatCurrency(userOwes, "INR")}`
                    : formatCurrency(0, "INR")}
              </div>
              <div
                className={`flex items-center text-sm mt-2 ${userIsOwed > 0 ? "text-green-600" : userOwes > 0 ? "text-red-600" : "text-gray-600"}`}
              >
                {userIsOwed > 0 ? (
                  <>
                    <ArrowUpRight className="h-4 w-4 mr-1" />
                    <span>You're owed</span>
                  </>
                ) : userOwes > 0 ? (
                  <>
                    <ArrowDownRight className="h-4 w-4 mr-1" />
                    <span>You owe</span>
                  </>
                ) : (
                  <span>You're all settled</span>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
