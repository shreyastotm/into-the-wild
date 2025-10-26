import { Filter } from "lucide-react";
import React, { Component } from "react";

import { FilterOptions } from "../TrekFilters";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

interface FilterPopoverProps {
  options: FilterOptions;
  onFilterChange: (key: keyof FilterOptions, value: string) => void;
  onReset: () => void;
  categories: string[];
  activeFilterCount: number;
}

export const FilterPopover: React.FC<FilterPopoverProps> = ({
  options,
  onFilterChange,
  onReset,
  categories,
  activeFilterCount,
}) => {
  // Debug logging removed for production

  const priceRanges = [
    { label: "Any Price", value: "" },
    { label: "Under ₹1,000", value: "0-1000" },
    { label: "₹1,000 - ₹2,500", value: "1000-2500" },
    { label: "₹2,500 - ₹5,000", value: "2500-5000" },
    { label: "Over ₹5,000", value: "5000-999999" },
  ];

  const timeFrames = [
    { label: "Any Time", value: "" },
    { label: "This Week", value: "this-week" },
    { label: "This Month", value: "this-month" },
    { label: "Next 3 Months", value: "next-3-months" },
  ];

  // FILTERS REMOVED FOR DEBUGGING - return null
  return null;
  // Old filter UI and logic commented out below
  /*
  return (
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
              onValueChange={(value) => onFilterChange('category', value === 'any' ? '' : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Any Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any Category</SelectItem>
                {categories.filter(c => typeof c === 'string' && !!c && c.trim() !== '').map((category) => (
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
                {priceRanges.filter(r => typeof r.value === 'string').map((range) => (
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
                {timeFrames.filter(t => typeof t.value === 'string').map((time) => (
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
  );
  */
};
