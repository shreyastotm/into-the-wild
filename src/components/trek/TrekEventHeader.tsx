import React from 'react';
import { CardTitle, CardDescription } from '@/components/ui/card';
import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

interface TrekEventHeaderProps {
  trekName: string;
  category: string | null;
  startDatetime: string;
  imageUrl?: string | null;
  cost?: number;
  description?: string | null;
  maxParticipants?: number;
  participantCount?: number;
}

export const TrekEventHeader: React.FC<TrekEventHeaderProps> = ({
  trekName,
  category,
  startDatetime,
  imageUrl,
  cost,
  description,
  maxParticipants,
  participantCount
}) => {
  // Convert to Indian Standard Time
  const indianTime = toZonedTime(new Date(startDatetime), 'Asia/Kolkata');
  
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
          {format(indianTime, 'dd MMM yyyy')} at {format(indianTime, 'h:mm a')} IST
        </span>
        {typeof participantCount === 'number' && typeof maxParticipants === 'number' && (
          <span className="ml-4 text-gray-700 font-medium">
            {participantCount}/{maxParticipants} participants
          </span>
        )}
        {cost !== undefined && (
          <span className="ml-4 text-green-700 font-semibold">
            ₹{cost}
          </span>
        )}
      </CardDescription>
      {imageUrl && (
        <img src={imageUrl} alt={trekName} className="w-full h-64 object-cover rounded-lg my-4" />
      )}
      {description && (
        <p className="mt-2 text-gray-600 text-base">{description}</p>
      )}
    </>
  );
};
