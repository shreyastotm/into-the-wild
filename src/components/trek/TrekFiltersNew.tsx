import TrekFiltersBase from "./TrekFiltersBase";

export interface FilterOptions {
  search: string;
  category: string;
  eventType: string;
  dateRange: string;
  location: string;
  priceRange: string;
  transportMode: string;
  difficulty: string;
  duration: string;
  availability: string;
}

interface TrekFiltersProps {
  options: FilterOptions;
  onFilterChange: (key: keyof FilterOptions, value: string) => void;
  onReset: () => void;
  categories: string[];
  locations?: string[];
  className?: string;
  variant?: "default" | "compact" | "sidebar" | "floating";
  showSearch?: boolean;
  showCategory?: boolean;
  showEventType?: boolean;
  showDateRange?: boolean;
  showLocation?: boolean;
  showPriceRange?: boolean;
  showTransportMode?: boolean;
  showDifficulty?: boolean;
  showDuration?: boolean;
  showAvailability?: boolean;
  showActiveFilters?: boolean;
  onApply?: () => void;
  onClear?: () => void;
  loading?: boolean;
}

export const TrekFilters: React.FC<TrekFiltersProps> = ({
  options,
  onFilterChange,
  onReset,
  categories = [],
  locations = [],
  className = "",
  variant = "default",
  showSearch = true,
  showCategory = true,
  showEventType = true,
  showDateRange = true,
  showLocation = true,
  showPriceRange = true,
  showTransportMode = true,
  showDifficulty = true,
  showDuration = true,
  showAvailability = true,
  showActiveFilters = true,
  onApply,
  onClear,
  loading = false,
}) => {
  return (
    <TrekFiltersBase
      options={options}
      onFilterChange={onFilterChange}
      onReset={onReset}
      categories={categories}
      locations={locations}
      className={className}
      variant={variant}
      showSearch={showSearch}
      showCategory={showCategory}
      showEventType={showEventType}
      showDateRange={showDateRange}
      showLocation={showLocation}
      showPriceRange={showPriceRange}
      showTransportMode={showTransportMode}
      showDifficulty={showDifficulty}
      showDuration={showDuration}
      showAvailability={showAvailability}
      showActiveFilters={showActiveFilters}
      onApply={onApply}
      onClear={onClear}
      loading={loading}
    />
  );
};

export default TrekFilters;
