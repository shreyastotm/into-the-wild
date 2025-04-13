
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { FilterOptions } from '../TrekFilters';

interface ActiveFiltersProps {
  options: FilterOptions;
  onFilterChange: (key: keyof FilterOptions, value: string) => void;
  onReset: () => void;
}

export const ActiveFilters: React.FC<ActiveFiltersProps> = ({
  options,
  onFilterChange,
  onReset
}) => {
  // Define the reference data
  const priceRanges = [
    { label: 'Any Price', value: '' },
    { label: 'Under ₹1,000', value: '0-1000' },
    { label: '₹1,000 - ₹2,500', value: '1000-2500' },
    { label: '₹2,500 - ₹5,000', value: '2500-5000' },
    { label: 'Over ₹5,000', value: '5000-999999' },
  ];

  const timeFrames = [
    { label: 'Any Time', value: '' },
    { label: 'This Week', value: 'this-week' },
    { label: 'This Month', value: 'this-month' },
    { label: 'Next 3 Months', value: 'next-3-months' },
  ];

  // Check if there are any active filters
  const activeFilterCount = [
    options.category,
    options.priceRange,
    options.timeFrame
  ].filter(Boolean).length;

  if (activeFilterCount === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2 items-center text-sm">
      <span className="text-muted-foreground">Active filters:</span>
      {options.category && (
        <Badge 
          variant="outline" 
          className={cn("rounded-full px-2 py-1 cursor-pointer hover:bg-muted/80")}
          onClick={() => onFilterChange('category', '')}
        >
          Category: {options.category} ×
        </Badge>
      )}
      {options.priceRange && (
        <Badge 
          variant="outline" 
          className={cn("rounded-full px-2 py-1 cursor-pointer hover:bg-muted/80")}
          onClick={() => onFilterChange('priceRange', '')}
        >
          Price: {priceRanges.find(r => r.value === options.priceRange)?.label || options.priceRange} ×
        </Badge>
      )}
      {options.timeFrame && (
        <Badge 
          variant="outline" 
          className={cn("rounded-full px-2 py-1 cursor-pointer hover:bg-muted/80")}
          onClick={() => onFilterChange('timeFrame', '')}
        >
          Time: {timeFrames.find(t => t.value === options.timeFrame)?.label || options.timeFrame} ×
        </Badge>
      )}
      <Button variant="ghost" size="sm" onClick={onReset} className="h-auto p-1">
        Clear all
      </Button>
    </div>
  );
};
