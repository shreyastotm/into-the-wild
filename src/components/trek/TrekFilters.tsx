import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export interface FilterOptions {
  search: string;
  category: string;
  priceRange: string;
  timeFrame: string;
  sortBy: string;
  eventType: string;
}

interface TrekFiltersProps {
  options: FilterOptions;
  onFilterChange: (key: keyof FilterOptions, value: string) => void;
  onReset: () => void;
  categories: string[]; // Add categories prop
}

export const TrekFilters: React.FC<TrekFiltersProps> = ({
  options,
  onFilterChange,
  onReset,
  categories = [], // Default to empty array
}) => {
  // Basic structure - Actual filtering logic is not implemented here yet
  // This is just to provide a non-placeholder component body
  return (
    <div className="mb-6 p-4 border rounded-lg bg-card shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 items-end">
        {/* Search Input */}
        <div className="lg:col-span-2">
          <label htmlFor="search" className="block text-sm font-medium text-muted-foreground mb-1">Search Events</label>
          <Input
            id="search"
            placeholder="Search by name or description..."
            value={options.search}
            onChange={(e) => onFilterChange('search', e.target.value)}
            className="w-full"
          />
        </div>

        {/* Category Select */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-muted-foreground mb-1">Category</label>
          <Select
            value={options.category || "all"}
            onValueChange={(value) => {
              onFilterChange('category', value === "all" ? "" : value);
            }}
          >
            <SelectTrigger id="category">
              <SelectValue placeholder="Select Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.filter(cat => cat && cat.trim() !== '').map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Event Type Select */}
        <div>
          <label htmlFor="eventType" className="block text-sm font-medium text-muted-foreground mb-1">Event Type</label>
          <Select
            value={options.eventType || "all"}
            onValueChange={(value) => {
              onFilterChange('eventType', value === "all" ? "" : value);
            }}
          >
            <SelectTrigger id="eventType">
              <SelectValue placeholder="All Events" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Events</SelectItem>
              <SelectItem value="trek">Trek Events</SelectItem>
              <SelectItem value="camping">Camping Events</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Sort By Select */}
        <div>
          <label htmlFor="sort" className="block text-sm font-medium text-muted-foreground mb-1">Sort By</label>
          <Select value={options.sortBy} onValueChange={(value) => onFilterChange('sortBy', value)}>
            <SelectTrigger id="sort">
              <SelectValue placeholder="Sort by..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date-asc">Date (Asc)</SelectItem>
              <SelectItem value="date-desc">Date (Desc)</SelectItem>
              <SelectItem value="price-asc">Price (Asc)</SelectItem>
              <SelectItem value="price-desc">Price (Desc)</SelectItem>
              <SelectItem value="name-asc">Name (A-Z)</SelectItem>
              <SelectItem value="name-desc">Name (Z-A)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Reset Button */}
        <div className="flex items-end">
           <Button variant="outline" onClick={onReset} className="w-full">
            Reset
          </Button>
        </div>

        {/* Price Range and TimeFrame placeholders (could be added here later) */}
        
      </div>
    </div>
  );
};

// Keep FilterOptions export if it's used elsewhere, otherwise it could be removed.
// export type FilterOptions = Record<string, any>; // This was the old one, replaced above
