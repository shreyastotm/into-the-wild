import { ChevronDown } from "lucide-react";
import React, { Component } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SortSelectProps {
  value: string;
  onChange: (value: string) => void;
}

export const SortSelect: React.FC<SortSelectProps> = ({ value, onChange }) => {
  const sortOptions = [
    { label: "Date: Soonest", value: "date-asc" },
    { label: "Date: Latest", value: "date-desc" },
    { label: "Price: Low to High", value: "price-asc" },
    { label: "Price: High to Low", value: "price-desc" },
    { label: "Name: A to Z", value: "name-asc" },
    { label: "Name: Z to A", value: "name-desc" },
  ];

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="min-w-[100px] sm:min-w-[160px] inline-flex">
        <span className="flex items-center gap-1">
          <ChevronDown className="h-4 w-4" />
          <span className="hidden sm:inline">Sort</span>
        </span>
      </SelectTrigger>
      <SelectContent>
        {sortOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
