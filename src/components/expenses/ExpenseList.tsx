import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ExpenseListProps {
  trekId: number;
  participants: { user_id: string; full_name: string }[];
}

export const ExpenseList: React.FC<ExpenseListProps> = ({ trekId, participants }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Expenses</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-6">
          <p className="text-muted-foreground">No expenses have been added for this trek yet.</p>
          <p className="text-sm mt-2">Add an expense using the form above to get started.</p>
        </div>
      </CardContent>
    </Card>
  );
};
