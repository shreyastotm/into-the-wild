import { FilterBar, FilterOption, SortOption } from "@/components/ui/FilterBar";

import React, { Component } from "react";

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
  categories: string[];
}

export const TrekFilters: React.FC<TrekFiltersProps> = ({
  options,
  onFilterChange,
  onReset,
  categories = [],
}) => {
  // Define filter options for the FilterBar
  const filterOptions: FilterOption[] = [
    {
      key: "category",
      label: "Category",
      type: "select",
      value: options.category,
      options: categories
        .filter((cat) => cat && cat.trim() !== "")
        .map((cat) => ({
          value: cat,
          label: cat,
        })),
    },
    {
      key: "eventType",
      label: "Event Type",
      type: "select",
      value: options.eventType,
      options: [
        { value: "trek", label: "Trek Events" },
        { value: "camping", label: "Camping Events" },
      ],
    },
    {
      key: "priceRange",
      label: "Price Range",
      type: "range",
      value: options.priceRange,
      options: [
        { value: "0-1000", label: "Under ₹1,000" },
        { value: "1000-3000", label: "₹1,000 - ₹3,000" },
        { value: "3000-5000", label: "₹3,000 - ₹5,000" },
        { value: "5000-10000", label: "₹5,000 - ₹10,000" },
        { value: "10000-999999", label: "Above ₹10,000" },
      ],
    },
    {
      key: "timeFrame",
      label: "Time Frame",
      type: "select",
      value: options.timeFrame,
      options: [
        { value: "this-week", label: "This Week" },
        { value: "this-month", label: "This Month" },
        { value: "next-month", label: "Next Month" },
        { value: "next-3-months", label: "Next 3 Months" },
      ],
    },
  ];

  // Define sort options
  const sortOptions: SortOption[] = [
    { key: "date-asc", label: "Date ↑", value: "date-asc" },
    { key: "date-desc", label: "Date ↓", value: "date-desc" },
    { key: "price-asc", label: "Price ↑", value: "price-asc" },
    { key: "price-desc", label: "Price ↓", value: "price-desc" },
    { key: "name-asc", label: "Name A-Z", value: "name-asc" },
    { key: "name-desc", label: "Name Z-A", value: "name-desc" },
  ];

  return (
    <FilterBar
      searchValue={options.search}
      onSearchChange={(value) => onFilterChange("search", value)}
      searchPlaceholder="Search events..."
      filters={filterOptions}
      onFilterChange={(key, value) =>
        onFilterChange(key as keyof FilterOptions, value)
      }
      sortValue={options.sortBy}
      onSortChange={(value) => onFilterChange("sortBy", value)}
      sortOptions={sortOptions}
      onReset={onReset}
      showResetButton={true}
      showSortInBar={true}
    />
  );
};

// Keep FilterOptions export if it's used elsewhere, otherwise it could be removed.
// export type FilterOptions = Record<string, any>; // This was the old one, replaced above
