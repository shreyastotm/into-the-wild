import React, { useState } from "react";
import { FilterBar, FilterOption, SortOption } from "@/components/ui/FilterBar";

// Example: User Management Filter
export const UserFilterExample: React.FC = () => {
  const [searchValue, setSearchValue] = useState("");
  const [filters, setFilters] = useState({
    role: "",
    status: "",
    department: "",
    dateRange: "",
  });
  const [sortValue, setSortValue] = useState("name-asc");

  const filterOptions: FilterOption[] = [
    {
      key: "role",
      label: "Role",
      type: "select",
      value: filters.role,
      options: [
        { value: "admin", label: "Admin" },
        { value: "user", label: "User" },
        { value: "moderator", label: "Moderator" },
      ],
    },
    {
      key: "status",
      label: "Status",
      type: "select",
      value: filters.status,
      options: [
        { value: "active", label: "Active" },
        { value: "inactive", label: "Inactive" },
        { value: "pending", label: "Pending" },
      ],
    },
    {
      key: "department",
      label: "Department",
      type: "select",
      value: filters.department,
      options: [
        { value: "engineering", label: "Engineering" },
        { value: "marketing", label: "Marketing" },
        { value: "sales", label: "Sales" },
      ],
    },
    {
      key: "dateRange",
      label: "Date Range",
      type: "range",
      value: filters.dateRange,
      options: [
        { value: "last-week", label: "Last Week" },
        { value: "last-month", label: "Last Month" },
        { value: "last-year", label: "Last Year" },
      ],
    },
  ];

  const sortOptions: SortOption[] = [
    { key: "name-asc", label: "Name A-Z", value: "name-asc" },
    { key: "name-desc", label: "Name Z-A", value: "name-desc" },
    { key: "date-asc", label: "Date ↑", value: "date-asc" },
    { key: "date-desc", label: "Date ↓", value: "date-desc" },
  ];

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    setSearchValue("");
    setFilters({
      role: "",
      status: "",
      department: "",
      dateRange: "",
    });
    setSortValue("name-asc");
  };

  return (
    <div className="p-4" data-testid="filterbarexample">
      <h2 className="text-xl font-semibold mb-4">User Management</h2>
      <FilterBar
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        searchPlaceholder="Search users..."
        filters={filterOptions}
        onFilterChange={handleFilterChange}
        sortValue={sortValue}
        onSortChange={setSortValue}
        sortOptions={sortOptions}
        onReset={handleReset}
        showResetButton={true}
        showSortInBar={true}
      />
    </div>
  );
};

// Example: Product Catalog Filter
export const ProductFilterExample: React.FC = () => {
  const [searchValue, setSearchValue] = useState("");
  const [filters, setFilters] = useState({
    category: "",
    brand: "",
    priceRange: "",
    availability: "",
  });
  const [sortValue, setSortValue] = useState("name-asc");

  const filterOptions: FilterOption[] = [
    {
      key: "category",
      label: "Category",
      type: "select",
      value: filters.category,
      options: [
        { value: "electronics", label: "Electronics" },
        { value: "clothing", label: "Clothing" },
        { value: "books", label: "Books" },
      ],
    },
    {
      key: "brand",
      label: "Brand",
      type: "select",
      value: filters.brand,
      options: [
        { value: "apple", label: "Apple" },
        { value: "samsung", label: "Samsung" },
        { value: "nike", label: "Nike" },
      ],
    },
    {
      key: "priceRange",
      label: "Price Range",
      type: "range",
      value: filters.priceRange,
      options: [
        { value: "0-100", label: "Under ₹100" },
        { value: "100-500", label: "₹100 - ₹500" },
        { value: "500-1000", label: "₹500 - ₹1,000" },
        { value: "1000-9999", label: "Above ₹1,000" },
      ],
    },
    {
      key: "availability",
      label: "Availability",
      type: "select",
      value: filters.availability,
      options: [
        { value: "in-stock", label: "In Stock" },
        { value: "out-of-stock", label: "Out of Stock" },
        { value: "pre-order", label: "Pre-order" },
      ],
    },
  ];

  const sortOptions: SortOption[] = [
    { key: "name-asc", label: "Name A-Z", value: "name-asc" },
    { key: "name-desc", label: "Name Z-A", value: "name-desc" },
    { key: "price-asc", label: "Price ↑", value: "price-asc" },
    { key: "price-desc", label: "Price ↓", value: "price-desc" },
    { key: "rating-asc", label: "Rating ↑", value: "rating-asc" },
    { key: "rating-desc", label: "Rating ↓", value: "rating-desc" },
  ];

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    setSearchValue("");
    setFilters({
      category: "",
      brand: "",
      priceRange: "",
      availability: "",
    });
    setSortValue("name-asc");
  };

  return (
    <div className="p-4" data-testid="filterbarexample">
      <h2 className="text-xl font-semibold mb-4">Product Catalog</h2>
      <FilterBar
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        searchPlaceholder="Search products..."
        filters={filterOptions}
        onFilterChange={handleFilterChange}
        sortValue={sortValue}
        onSortChange={setSortValue}
        sortOptions={sortOptions}
        onReset={handleReset}
        showResetButton={true}
        showSortInBar={false} // Sort only in popup for this example
      />
    </div>
  );
};

export default FilterBarExample;
