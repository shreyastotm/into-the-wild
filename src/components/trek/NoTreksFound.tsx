
import React from 'react';
import { Button } from '@/components/ui/button';
import { FilterOptions } from './TrekFilters';

interface NoTreksFoundProps {
  filterOptions: FilterOptions;
  onReset: () => void;
}

export const NoTreksFound: React.FC<NoTreksFoundProps> = ({ filterOptions, onReset }) => {
  const hasActiveFilters = filterOptions.search || filterOptions.category || 
    filterOptions.priceRange || filterOptions.timeFrame;
  
  return (
    <div className="text-center py-10">
      {hasActiveFilters ? (
        <>
          <p className="text-lg text-gray-600 mb-4">No treks match your filters</p>
          <Button variant="outline" onClick={onReset}>Clear Filters</Button>
        </>
      ) : (
        <p className="text-lg text-gray-600">No trek events available</p>
      )}
    </div>
  );
};
