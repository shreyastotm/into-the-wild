import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2 } from 'lucide-react';

export interface LoadingCardProps {
  title?: string;
  description?: string;
  showHeader?: boolean;
  showContent?: boolean;
  showFooter?: boolean;
  rows?: number;
  className?: string;
  variant?: 'skeleton' | 'spinner' | 'pulse' | 'dots';
  size?: 'sm' | 'md' | 'lg';
  message?: string;
}

const LoadingCard: React.FC<LoadingCardProps> = ({
  title,
  description,
  showHeader = true,
  showContent = true,
  showFooter = false,
  rows = 3,
  className = '',
  variant = 'skeleton',
  size = 'md',
  message = 'Loading...'
}) => {
  const sizeClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  const renderSkeletonContent = () => (
    <div className="space-y-4">
      {[...Array(rows)].map((_, index) => (
        <div key={index} className="space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      ))}
    </div>
  );

  const renderSpinnerContent = () => (
    <div className="flex flex-col items-center justify-center py-8">
      <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );

  const renderPulseContent = () => (
    <div className="space-y-4">
      {[...Array(rows)].map((_, index) => (
        <div key={index} className="animate-pulse">
          <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-muted rounded w-1/2"></div>
        </div>
      ))}
    </div>
  );

  const renderDotsContent = () => (
    <div className="flex flex-col items-center justify-center py-8">
      <div className="flex space-x-1 mb-4">
        <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-2 h-2 bg-secondary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-2 h-2 bg-accent rounded-full animate-bounce"></div>
      </div>
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );

  const renderContent = () => {
    switch (variant) {
      case 'spinner':
        return renderSpinnerContent();
      case 'pulse':
        return renderPulseContent();
      case 'dots':
        return renderDotsContent();
      default:
        return renderSkeletonContent();
    }
  };

  return (
    <Card className={className}>
      {showHeader && (
        <CardHeader className={sizeClasses[size]}>
          {title && <Skeleton className="h-6 w-1/3" />}
          {description && <Skeleton className="h-4 w-1/2 mt-2" />}
        </CardHeader>
      )}
      
      {showContent && (
        <CardContent className={sizeClasses[size]}>
          {renderContent()}
        </CardContent>
      )}
      
      {showFooter && (
        <div className={`px-6 py-4 border-t ${sizeClasses[size]}`}>
          <div className="flex justify-end space-x-2">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-20" />
          </div>
        </div>
      )}
    </Card>
  );
};

// Specialized loading components for common use cases
export const LoadingTable: React.FC<{ rows?: number; columns?: number }> = ({ 
  rows = 5, 
  columns = 4 
}) => (
  <div className="space-y-4">
    {[...Array(rows)].map((_, rowIndex) => (
      <div key={rowIndex} className="flex items-center space-x-4">
        {[...Array(columns)].map((_, colIndex) => (
          <Skeleton key={colIndex} className="h-4 flex-1" />
        ))}
      </div>
    ))}
  </div>
);

export const LoadingList: React.FC<{ items?: number }> = ({ items = 5 }) => (
  <div className="space-y-3">
    {[...Array(items)].map((_, index) => (
      <div key={index} className="flex items-center space-x-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
    ))}
  </div>
);

export const LoadingGrid: React.FC<{ 
  items?: number; 
  columns?: number; 
  showImage?: boolean;
}> = ({ 
  items = 6, 
  columns = 3,
  showImage = true 
}) => (
  <div className={`grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-${columns}`}>
    {[...Array(items)].map((_, index) => (
      <Card key={index}>
        <CardContent className="p-4">
          <div className="space-y-3">
            {showImage && <Skeleton className="h-32 w-full rounded" />}
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <div className="flex justify-between items-center">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-6 w-16" />
            </div>
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

export default LoadingCard;
