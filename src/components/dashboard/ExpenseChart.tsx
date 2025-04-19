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
      
      const userId = user?.id ? (typeof user.id === 'string' ? user.id : String(user.id)) : '';
      
      // Get trek IDs the user is registered for
      const { data: registrations, error: regError } = await supabase
        .from('registrations')
        .select('trek_id')
        .eq('user_id', userId);
        
      if (regError) throw regError;
      
      if (!registrations || registrations.length === 0) {
        setExpenses([]);
        return;
      }
      
      // Extract trek IDs from registrations
      const trekIds = registrations.map(reg => reg.trek_id);
      if (trekIds.length === 0) {
        setExpenses([]);
        return;
      }

      // Fetch expenses from ad_hoc_expense_shares and trek_ad_hoc_expenses (NOT expense_sharing)
      // Fetch ad-hoc expenses for these treks
      const { data: adHocExpenses, error: adHocError } = await supabase
        .from('trek_ad_hoc_expenses')
        .select('expense_id, trek_id, amount, category, description')
        .in('trek_id', trekIds);
      if (adHocError) throw adHocError;

      // Group by trek name (fetch trek names)
      const { data: trekData, error: trekError } = await supabase
        .from('trek_events')
        .select('trek_id, trek_name')
        .in('trek_id', trekIds);
      if (trekError) throw trekError;

      const trekIdToName: Record<number, string> = {};
      (trekData || []).forEach(trek => {
        trekIdToName[trek.trek_id] = trek.trek_name;
      });

      // Sum up expenses by trek
      const expensesByTrek: Record<string, number> = {};
      (adHocExpenses || []).forEach(exp => {
        const trekName = trekIdToName[exp.trek_id] || `Trek ${exp.trek_id}`;
        expensesByTrek[trekName] = (expensesByTrek[trekName] || 0) + Number(exp.amount);
      });

      // Create chart data with colors
      const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe', '#00C49F', '#FFBB28'];
      const chartData: ExpenseData[] = Object.entries(expensesByTrek).map(([name, value], index) => ({
        name,
        value,
        color: colors[index % colors.length]
      }));
      setExpenses(chartData);
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
