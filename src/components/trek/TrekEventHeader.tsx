
import React from 'react';
import { CardTitle, CardDescription } from '@/components/ui/card';

interface TrekEventHeaderProps {
  trekName: string;
  category: string | null;
  startDatetime: string;
}

export const TrekEventHeader: React.FC<TrekEventHeaderProps> = ({
  trekName,
  category,
  startDatetime
}) => {
  return (
    <>
      <CardTitle className="text-3xl">{trekName}</CardTitle>
      <CardDescription>
        {category && (
          <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm mr-2">
            {category}
          </span>
        )}
        <span className="text-gray-500">
          {new Date(startDatetime).toLocaleDateString()} at {new Date(startDatetime).toLocaleTimeString()}
        </span>
      </CardDescription>
    </>
  );
};
