import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Loading skeleton for TrekCard component
 * Displays animated placeholder while trek data is being fetched
 */
export const TrekCardSkeleton: React.FC = () => {
  return (
    <Card className="overflow-hidden">
      {/* Image Skeleton */}
      <Skeleton className="h-56 w-full rounded-t-xl rounded-b-none" />
      
      {/* Content */}
      <CardContent className="p-6 space-y-4">
        {/* Title Skeleton */}
        <Skeleton className="h-6 w-3/4" />
        
        {/* Description Skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
        
        {/* Meta Info Row 1 */}
        <div className="flex items-center gap-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-24" />
        </div>
        
        {/* Meta Info Row 2 */}
        <div className="flex items-center gap-4">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-20" />
        </div>
        
        {/* Footer - Price and Button */}
        <div className="flex items-center justify-between pt-2">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-9 w-28" />
        </div>
      </CardContent>
    </Card>
  );
};
