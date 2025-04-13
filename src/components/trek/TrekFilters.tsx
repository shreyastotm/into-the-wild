
import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { FilterPopover } from './filters/FilterPopover';
import { SortSelect } from './filters/SortSelect';
import { ActiveFilters } from './filters/ActiveFilters';

export type FilterOptions = {
  search: string;
  category: string;
  priceRange: string;
  sortBy: string;
  timeFrame: string;
}

interface TrekFiltersProps {
  options: FilterOptions;
  onFilterChange: (key: keyof FilterOptions, value: string) => void;
  onReset: () => void;
  categories: string[];
}

export const TrekFilters: React.FC<TrekFiltersProps> = ({
  options,
  onFilterChange,
  onReset,
  categories
}) => {
  // Calculate the active filter count
  const activeFilterCount = [
    options.category,
    options.priceRange,
    options.timeFrame
  ].filter(Boolean).length;

  return (
    <div className="mb-6 space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search treks by name or description..."
            className="pl-9"
            value={options.search}
            onChange={(e) => onFilterChange('search', e.target.value)}
          />
        </div>
        
        <div className="flex gap-2">
          <FilterPopover 
            options={options}
            onFilterChange={onFilterChange}
            onReset={onReset}
            categories={categories}
            activeFilterCount={activeFilterCount}
          />
          
          <SortSelect 
            value={options.sortBy} 
            onChange={(value) => onFilterChange('sortBy', value)} 
          />
        </div>
      </div>
      
      <ActiveFilters 
        options={options}
        onFilterChange={onFilterChange}
        onReset={onReset}
      />
    </div>
  );
};
