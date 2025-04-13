
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

interface ExpenseCardProps {
  description: string;
  amount: number;
  paidBy: string;
  date: string;
  status: string;
}

export const ExpenseCard: React.FC<ExpenseCardProps> = ({
  description,
  amount,
  paidBy,
  date,
  status
}) => {
  const statusColor = status === 'Settled' 
    ? 'bg-green-100 text-green-800' 
    : 'bg-yellow-100 text-yellow-800';
    
  // Convert to Indian Standard Time
  const indianTime = toZonedTime(new Date(date), 'Asia/Kolkata');

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-medium">{description}</CardTitle>
          <span className={`text-sm px-2 py-1 rounded-full ${statusColor}`}>
            {status}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Amount</p>
            <p className="font-semibold text-base">{formatCurrency(amount)}</p>
          </div>
          <div>
            <p className="text-gray-500">Paid by</p>
            <p>{paidBy}</p>
          </div>
          <div>
            <p className="text-gray-500">Date</p>
            <p>{format(indianTime, 'dd MMM yyyy')}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
