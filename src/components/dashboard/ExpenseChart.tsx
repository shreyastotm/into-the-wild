import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  TooltipProps,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/components/auth/AuthProvider";
import { formatCurrency } from "@/lib/utils";

interface ExpenseData {
  name: string;
  total: number;
}

export const ExpenseChart = () => {
  const [chartData, setChartData] = useState<ExpenseData[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user?.id) {
      fetchExpenses(user.id);
    }
  }, [user?.id]);

  const fetchExpenses = async (userId: string) => {
    setLoading(true);
    try {
      // Step 1: Fetch all expenses created by the user from the consolidated table
      const { data: expensesData, error: expensesError } = await supabase
        .from("trek_expenses") // Use consolidated table
        .select("trek_id, amount") // Select trek_id and amount
        .eq("creator_id", userId); // Use creator_id

      if (expensesError) throw expensesError;
      if (!expensesData || expensesData.length === 0) {
        setChartData([]);
        setLoading(false);
        return;
      }

      // Step 2: Aggregate expenses by trek_id
      const expensesByTrek = expensesData.reduce(
        (acc, expense) => {
          acc[expense.trek_id] = (acc[expense.trek_id] || 0) + expense.amount;
          return acc;
        },
        {} as Record<number, number>,
      );

      const trekIds = Object.keys(expensesByTrek).map(Number);

      if (trekIds.length === 0) {
        setChartData([]);
        setLoading(false);
        return;
      }

      // Step 3: Fetch trek names for the involved trek_ids
      const { data: trekNamesData, error: trekNamesError } = await supabase
        .from("trek_events")
        .select("trek_id, name") // Select name
        .in("trek_id", trekIds);

      if (trekNamesError) throw trekNamesError;

      const trekIdToName: Record<number, string> = {};
      (trekNamesData || []).forEach((trek) => {
        trekIdToName[trek.trek_id] = trek.name || "Unnamed Trek"; // Use name, provide fallback
      });

      // Step 4: Format data for the chart
      const formattedChartData = Object.entries(expensesByTrek).map(
        ([trekIdStr, total]) => {
          const trekId = parseInt(trekIdStr, 10);
          return {
            name: trekIdToName[trekId] || `Trek #${trekId}`, // Use fetched name or fallback
            total: total,
          };
        },
      );

      setChartData(formattedChartData);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      console.error("Error fetching expense data for chart:", error);
      toast({
        title: "Error loading expense chart",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border rounded shadow text-sm" data-testid="expensechart">
          <p className="font-semibold">{payload[0].name}</p>
          <p className="text-gray-700">
            {formatCurrency(payload[0].value ?? 0, "INR")}
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <Card className="w-full h-[320px] flex items-center justify-center">
        <div className="animate-pulse" data-testid="expensechart">
          <div className="h-48 w-48 bg-gray-200 rounded-full" data-testid="expensechart"></div>
        </div>
      </Card>
    );
  }

  if (chartData.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg">Expense Distribution</CardTitle>
        </CardHeader>
        <CardContent className="h-[250px] flex items-center justify-center">
          <p className="text-muted-foreground text-center">
            No expense data available. Start adding expenses to see a breakdown.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">Expense Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]" data-testid="expensechart">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="bg-primary"
                dataKey="total"
                nameKey="name"
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={`#${(index * 50).toString(16)}`}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
