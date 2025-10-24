# FilterBar Component

A reusable, mobile-first filter component that provides a clean, minimalist interface for filtering and sorting data across all screen sizes.

## Features

- **Mobile-First Design**: Optimized for mobile with popup filters
- **Universal Compatibility**: Works seamlessly on all screen sizes
- **Reusable**: Can be used across different pages and contexts
- **Flexible**: Supports multiple filter types (select, input, range)
- **Accessible**: Built with accessibility in mind
- **Indian Market Ready**: Includes proper currency formatting (₹)

## Usage

### Basic Implementation

```tsx
import { FilterBar, FilterOption, SortOption } from "@/components/ui/FilterBar";

const MyComponent = () => {
  const [searchValue, setSearchValue] = useState("");
  const [filters, setFilters] = useState({ category: "", status: "" });
  const [sortValue, setSortValue] = useState("name-asc");

  const filterOptions: FilterOption[] = [
    {
      key: "category",
      label: "Category",
      type: "select",
      value: filters.category,
      options: [
        { value: "trek", label: "Trek Events" },
        { value: "camping", label: "Camping Events" },
      ],
    },
  ];

  const sortOptions: SortOption[] = [
    { key: "name-asc", label: "Name A-Z", value: "name-asc" },
    { key: "name-desc", label: "Name Z-A", value: "name-desc" },
  ];

  return (
    <FilterBar
      searchValue={searchValue}
      onSearchChange={setSearchValue}
      searchPlaceholder="Search items..."
      filters={filterOptions}
      onFilterChange={(key, value) =>
        setFilters((prev) => ({ ...prev, [key]: value }))
      }
      sortValue={sortValue}
      onSortChange={setSortValue}
      sortOptions={sortOptions}
      onReset={() => {
        setSearchValue("");
        setFilters({ category: "", status: "" });
        setSortValue("name-asc");
      }}
    />
  );
};
```

## Props

### FilterBarProps

| Prop                | Type                                   | Required | Description                           |
| ------------------- | -------------------------------------- | -------- | ------------------------------------- |
| `searchValue`       | `string`                               | ✅       | Current search input value            |
| `onSearchChange`    | `(value: string) => void`              | ✅       | Search input change handler           |
| `searchPlaceholder` | `string`                               | ❌       | Placeholder text for search input     |
| `filters`           | `FilterOption[]`                       | ✅       | Array of filter configurations        |
| `onFilterChange`    | `(key: string, value: string) => void` | ✅       | Filter change handler                 |
| `sortValue`         | `string`                               | ✅       | Current sort value                    |
| `onSortChange`      | `(value: string) => void`              | ✅       | Sort change handler                   |
| `sortOptions`       | `SortOption[]`                         | ✅       | Available sort options                |
| `onReset`           | `() => void`                           | ✅       | Reset all filters handler             |
| `className`         | `string`                               | ❌       | Additional CSS classes                |
| `showResetButton`   | `boolean`                              | ❌       | Show reset button (default: true)     |
| `showSortInBar`     | `boolean`                              | ❌       | Show sort in main bar (default: true) |

### FilterOption

| Property      | Type                                    | Description                          |
| ------------- | --------------------------------------- | ------------------------------------ |
| `key`         | `string`                                | Unique identifier for the filter     |
| `label`       | `string`                                | Display label for the filter         |
| `type`        | `'select' \| 'input' \| 'range'`        | Filter input type                    |
| `value`       | `string`                                | Current filter value                 |
| `options`     | `Array<{value: string, label: string}>` | Available options (for select/range) |
| `placeholder` | `string`                                | Placeholder text                     |

### SortOption

| Property | Type     | Description       |
| -------- | -------- | ----------------- |
| `key`    | `string` | Unique identifier |
| `label`  | `string` | Display label     |
| `value`  | `string` | Sort value        |

## Filter Types

### Select Filter

```tsx
{
  key: 'category',
  label: 'Category',
  type: 'select',
  value: filters.category,
  options: [
    { value: 'trek', label: 'Trek Events' },
    { value: 'camping', label: 'Camping Events' }
  ]
}
```

### Input Filter

```tsx
{
  key: 'search',
  label: 'Search Term',
  type: 'input',
  value: filters.search,
  placeholder: 'Enter search term...'
}
```

### Range Filter

```tsx
{
  key: 'priceRange',
  label: 'Price Range',
  type: 'range',
  value: filters.priceRange,
  options: [
    { value: '0-1000', label: 'Under ₹1,000' },
    { value: '1000-3000', label: '₹1,000 - ₹3,000' }
  ]
}
```

## Mobile Behavior

- **Search Bar**: Always visible and prominent
- **Sort Dropdown**: Shown in main bar if `showSortInBar` is true
- **Filter Button**: Opens a slide-out sheet with all filters
- **Reset Button**: Only shown when filters are active

## Desktop Behavior

- **Search Bar**: Full width with flexible sizing
- **Sort Dropdown**: Shown inline if `showSortInBar` is true
- **Filter Button**: Opens a right-side sheet with all filters
- **Reset Button**: Shown when filters are active

## Examples

### Events Page (Current Implementation)

```tsx
// See src/components/trek/TrekFilters.tsx
```

### User Management

```tsx
// See src/components/examples/FilterBarExample.tsx - UserFilterExample
```

### Product Catalog

```tsx
// See src/components/examples/FilterBarExample.tsx - ProductFilterExample
```

## Styling

The component uses Tailwind CSS classes and follows the design system. Key classes:

- **Main Container**: `flex gap-2 items-center`
- **Search Input**: `flex-1` for responsive width
- **Filter Button**: `variant="outline"` with icon
- **Reset Button**: `variant="ghost"` with X icon
- **Popup**: Uses Sheet component with `side="right"`

## Accessibility

- Proper ARIA labels for screen readers
- Keyboard navigation support
- Focus management in popup
- Semantic HTML structure

## Performance

- Minimal re-renders with proper state management
- Lazy loading of filter options
- Efficient popup rendering
- Optimized for mobile performance

## Best Practices

1. **Keep filters relevant**: Only include filters that users actually need
2. **Use clear labels**: Make filter labels descriptive and user-friendly
3. **Provide good defaults**: Set sensible default sort options
4. **Handle empty states**: Show appropriate messages when no results
5. **Test on mobile**: Always test the mobile popup experience
6. **Use Indian formatting**: Include proper currency symbols (₹) for Indian market

## Migration from Old Components

If migrating from the old TrekFilters component:

1. Replace the old grid layout with FilterBar
2. Convert filter configurations to FilterOption format
3. Update event handlers to match new interface
4. Test mobile popup functionality
5. Verify all filter types work correctly

## Future Enhancements

- **Date Range Picker**: Add support for date range filters
- **Multi-select**: Support for multiple value selection
- **Saved Filters**: Allow users to save filter presets
- **Advanced Search**: Support for complex search queries
- **Filter Chips**: Show active filters as removable chips
