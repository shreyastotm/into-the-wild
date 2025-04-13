import React from 'react';
import { Search, Filter, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

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
  const priceRanges = [
    { label: 'Any Price', value: '' },
    { label: 'Under ₹1,000', value: '0-1000' },
    { label: '₹1,000 - ₹2,500', value: '1000-2500' },
    { label: '₹2,500 - ₹5,000', value: '2500-5000' },
    { label: 'Over ₹5,000', value: '5000-999999' },
  ];

  const sortOptions = [
    { label: 'Date: Soonest', value: 'date-asc' },
    { label: 'Date: Latest', value: 'date-desc' },
    { label: 'Price: Low to High', value: 'price-asc' },
    { label: 'Price: High to Low', value: 'price-desc' },
    { label: 'Name: A to Z', value: 'name-asc' },
    { label: 'Name: Z to A', value: 'name-desc' },
  ];

  const timeFrames = [
    { label: 'Any Time', value: '' },
    { label: 'This Week', value: 'this-week' },
    { label: 'This Month', value: 'this-month' },
    { label: 'Next 3 Months', value: 'next-3-months' },
  ];

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
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-1">
                <Filter className="h-4 w-4" />
                <span className="hidden sm:inline">Filters</span>
                {activeFilterCount > 0 && (
                  <span className="ml-1 bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-4" align="end">
              <div className="space-y-4">
                <h3 className="font-medium text-sm">Filter Treks</h3>
                
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Category</label>
                  <Select 
                    value={options.category} 
                    onValueChange={(value) => onFilterChange('category', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Any Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any Category</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Price Range</label>
                  <Select 
                    value={options.priceRange} 
                    onValueChange={(value) => onFilterChange('priceRange', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Any Price" />
                    </SelectTrigger>
                    <SelectContent>
                      {priceRanges.map((range) => (
                        <SelectItem key={range.value} value={range.value}>{range.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Time Frame</label>
                  <Select 
                    value={options.timeFrame} 
                    onValueChange={(value) => onFilterChange('timeFrame', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Any Time" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeFrames.map((time) => (
                        <SelectItem key={time.value} value={time.value}>{time.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <Separator />
                
                <Button variant="ghost" size="sm" onClick={onReset} className="w-full">
                  Reset Filters
                </Button>
              </div>
            </PopoverContent>
          </Popover>
          
          <Select 
            value={options.sortBy} 
            onValueChange={(value) => onFilterChange('sortBy', value)}
          >
            <SelectTrigger className="min-w-[100px] sm:min-w-[160px] inline-flex">
              <span className="flex items-center gap-1">
                <ChevronDown className="h-4 w-4" />
                <span className="hidden sm:inline">Sort</span>
              </span>
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {activeFilterCount > 0 && (
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
      )}
    </div>
  );
};
