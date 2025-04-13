
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export const TrekCardSkeleton = () => {
  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="p-4 space-y-3">
        <div className="flex justify-between">
          <Skeleton className="h-7 w-3/4" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        
        <div className="flex justify-between pt-2">
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="space-y-2 flex flex-col items-end">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      </div>
    </div>
  );
};

export const TrekCardsLoadingGrid = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <TrekCardSkeleton key={i} />
      ))}
    </div>
  );
};
