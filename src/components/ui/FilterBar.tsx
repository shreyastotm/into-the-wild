import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Filter, X } from 'lucide-react';

export interface FilterOption {
  key: string;
  label: string;
  type: 'select' | 'input' | 'range';
  options?: Array<{ value: string; label: string }>;
  placeholder?: string;
  value?: string;
}

export interface SortOption {
  key: string;
  label: string;
  value: string;
}

export interface FilterBarProps {
  // Search functionality
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  
  // Filter options
  filters: FilterOption[];
  onFilterChange: (key: string, value: string) => void;
  
  // Sort functionality
  sortValue: string;
  onSortChange: (value: string) => void;
  sortOptions: SortOption[];
  
  // Reset functionality
  onReset: () => void;
  
  // UI customization
  className?: string;
  showResetButton?: boolean;
  showSortInBar?: boolean; // Show sort in main bar or only in popup
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search...",
  filters,
  onFilterChange,
  sortValue,
  onSortChange,
  sortOptions,
  onReset,
  className = "",
  showResetButton = true,
  showSortInBar = true,
}) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Check if any filters are active
  const hasActiveFilters = filters.some(filter => 
    filter.value && filter.value !== "" && filter.value !== "all"
  );

  // Render filter input based on type
  const renderFilterInput = (filter: FilterOption) => {
    switch (filter.type) {
      case 'select':
        return (
          <div key={filter.key}>
            <label className="block text-sm font-medium mb-2">{filter.label}</label>
            <Select
              value={filter.value || "all"}
              onValueChange={(value) => onFilterChange(filter.key, value === "all" ? "" : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder={filter.placeholder || `Select ${filter.label}`} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All {filter.label}</SelectItem>
                {filter.options?.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
      
      case 'input':
        return (
          <div key={filter.key}>
            <label className="block text-sm font-medium mb-2">{filter.label}</label>
            <Input
              placeholder={filter.placeholder || `Enter ${filter.label.toLowerCase()}`}
              value={filter.value || ""}
              onChange={(e) => onFilterChange(filter.key, e.target.value)}
            />
          </div>
        );
      
      case 'range':
        return (
          <div key={filter.key}>
            <label className="block text-sm font-medium mb-2">{filter.label}</label>
            <Select
              value={filter.value || "all"}
              onValueChange={(value) => onFilterChange(filter.key, value === "all" ? "" : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder={filter.placeholder || `Select ${filter.label}`} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any {filter.label}</SelectItem>
                {filter.options?.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
      
      default:
        return null;
    }
  };

  // Main compact layout
  const CompactLayout = () => (
    <div className={`flex gap-2 items-center ${className}`}>
      {/* Search - Always prominent */}
      <div className="flex-1">
        <Input
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full"
        />
      </div>
      
      {/* Quick Sort - Show in bar if enabled */}
      {showSortInBar && (
        <Select value={sortValue} onValueChange={onSortChange}>
          <SelectTrigger className="w-40 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
            {sortOptions.map(option => (
              <SelectItem 
                key={option.value} 
                value={option.value}
                className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      
      {/* Filter Button - Opens popup */}
      <Button variant="outline" onClick={() => setIsFilterOpen(true)}>
        <Filter className="h-4 w-4 mr-2" />
        Filters
      </Button>
      
      {/* Reset Button - Only show if filters are active and enabled */}
      {showResetButton && hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={onReset}>
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );

  // Filter popup content
  const FilterPopupContent = () => (
    <div className="space-y-4">
      {/* Render all filters */}
      {filters.map(renderFilterInput)}
      
      {/* Sort option in popup if not shown in bar */}
      {!showSortInBar && (
        <div>
          <label className="block text-sm font-medium mb-2">Sort By</label>
          <Select value={sortValue} onValueChange={onSortChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2 pt-4">
        <Button variant="outline" onClick={onReset} className="flex-1">
          Reset All
        </Button>
        <Button onClick={() => setIsFilterOpen(false)} className="flex-1">
          Apply Filters
        </Button>
      </div>
    </div>
  );

  return (
    <div className="mb-6">
      <CompactLayout />
      
      {/* Universal Filter Popup */}
      <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <SheetContent side="right" className="w-full sm:w-96">
          <SheetHeader>
            <SheetTitle>Filter & Sort</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <FilterPopupContent />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default FilterBar;
