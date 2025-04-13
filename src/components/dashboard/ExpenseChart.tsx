
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { supabase } from "@/integrations/supabase/client";
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/components/auth/AuthProvider';
import { formatCurrency } from '@/lib/utils';

interface ExpenseData {
  name: string;
  value: number;
  color: string;
}

export const ExpenseChart = () => {
  const [expenses, setExpenses] = useState<ExpenseData[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchExpenseData();
    }
  }, [user]);

  const fetchExpenseData = async () => {
    try {
      setLoading(true);
      
      // Get expense data grouped by category/purpose
      const { data, error } = await supabase
        .from('expense_sharing')
        .select(`
          description,
          amount,
          trek_id,
          trek_events(trek_name)
        `)
        .in('trek_id', 'SELECT trek_id FROM registrations WHERE user_id = $1')
        .match({ user_id: user?.id || '' });
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        // Group expenses by trek
        const expensesByTrek: Record<string, number> = {};
        
        data.forEach(expense => {
          const trekName = expense.trek_events?.trek_name || `Trek ${expense.trek_id}`;
          expensesByTrek[trekName] = (expensesByTrek[trekName] || 0) + expense.amount;
        });
        
        // Create chart data with colors
        const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe', '#00C49F', '#FFBB28'];
        const chartData: ExpenseData[] = Object.entries(expensesByTrek).map(([name, value], index) => ({
          name,
          value,
          color: colors[index % colors.length]
        }));
        
        setExpenses(chartData);
      } else {
        setExpenses([]);
      }
    } catch (error: any) {
      console.error("Error fetching expense data:", error);
    } finally {
      setLoading(false);
    }
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border rounded shadow text-sm">
          <p className="font-semibold">{payload[0].name}</p>
          <p className="text-gray-700">{formatCurrency(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <Card className="w-full h-[320px] flex items-center justify-center">
        <div className="animate-pulse">
          <div className="h-48 w-48 bg-gray-200 rounded-full"></div>
        </div>
      </Card>
    );
  }

  if (expenses.length === 0) {
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
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={expenses}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {expenses.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
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
