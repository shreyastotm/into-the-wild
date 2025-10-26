import {
  Calendar,
  DollarSign,
  Filter,
  MapPin,
  Search,
  Users,
  X,
} from "lucide-react";
import React, { Component } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

export interface TrekFiltersBaseProps {
  options: FilterOptions;
  onFilterChange: (key: keyof FilterOptions, value: string) => void;
  onReset: () => void;
  categories: string[];
  locations: string[];
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

const TrekFiltersBase: React.FC<TrekFiltersBaseProps> = ({
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
  const getActiveFilters = () => {
    const active: Array<{
      key: keyof FilterOptions;
      label: string;
      value: string;
    }> = [];

    if (options.search)
      active.push({ key: "search", label: "Search", value: options.search });
    if (options.category)
      active.push({
        key: "category",
        label: "Category",
        value: options.category,
      });
    if (options.eventType)
      active.push({
        key: "eventType",
        label: "Event Type",
        value: options.eventType,
      });
    if (options.dateRange)
      active.push({
        key: "dateRange",
        label: "Date Range",
        value: options.dateRange,
      });
    if (options.location)
      active.push({
        key: "location",
        label: "Location",
        value: options.location,
      });
    if (options.priceRange)
      active.push({
        key: "priceRange",
        label: "Price Range",
        value: options.priceRange,
      });
    if (options.transportMode)
      active.push({
        key: "transportMode",
        label: "Transport",
        value: options.transportMode,
      });
    if (options.difficulty)
      active.push({
        key: "difficulty",
        label: "Difficulty",
        value: options.difficulty,
      });
    if (options.duration)
      active.push({
        key: "duration",
        label: "Duration",
        value: options.duration,
      });
    if (options.availability)
      active.push({
        key: "availability",
        label: "Availability",
        value: options.availability,
      });

    return active;
  };

  const activeFilters = getActiveFilters();

  const removeFilter = (key: keyof FilterOptions) => {
    onFilterChange(key, "");
  };

  const renderCompactFilters = () => (
    <div className="flex items-center gap-2 flex-wrap">
      {showSearch && (
        <div className="flex-1 min-w-[200px]">
          <Input
            placeholder="Search treks..."
            value={options.search}
            onChange={(e) => onFilterChange("search", e.target.value)}
            className="h-9"
          />
        </div>
      )}

      {showCategory && (
        <Select
          value={options.category}
          onValueChange={(value) => onFilterChange("category", value)}
        >
          <SelectTrigger className="w-[140px] h-9">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {showDateRange && (
        <Select
          value={options.dateRange}
          onValueChange={(value) => onFilterChange("dateRange", value)}
        >
          <SelectTrigger className="w-[140px] h-9">
            <SelectValue placeholder="Date" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Any Date</SelectItem>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="tomorrow">Tomorrow</SelectItem>
            <SelectItem value="this_week">This Week</SelectItem>
            <SelectItem value="next_week">Next Week</SelectItem>
            <SelectItem value="this_month">This Month</SelectItem>
            <SelectItem value="next_month">Next Month</SelectItem>
          </SelectContent>
        </Select>
      )}

      {activeFilters.length > 0 && (
        <Button variant="outline" size="sm" onClick={onReset}>
          Clear All
        </Button>
      )}
    </div>
  );

  const renderDefaultFilters = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filter Treks
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        {showSearch && (
          <div>
            <Label htmlFor="search" className="flex items-center gap-2 mb-2">
              <Search className="h-4 w-4" />
              Search
            </Label>
            <Input
              id="search"
              placeholder="Search by name or description..."
              value={options.search}
              onChange={(e) => onFilterChange("search", e.target.value)}
            />
          </div>
        )}

        {/* Filters Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Category */}
          {showCategory && (
            <div>
              <Label
                htmlFor="category"
                className="flex items-center gap-2 mb-2"
              >
                <Filter className="h-4 w-4" />
                Category
              </Label>
              <Select
                value={options.category}
                onValueChange={(value) => onFilterChange("category", value)}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Event Type */}
          {showEventType && (
            <div>
              <Label
                htmlFor="eventType"
                className="flex items-center gap-2 mb-2"
              >
                <Calendar className="h-4 w-4" />
                Event Type
              </Label>
              <Select
                value={options.eventType}
                onValueChange={(value) => onFilterChange("eventType", value)}
              >
                <SelectTrigger id="eventType">
                  <SelectValue placeholder="Select Event Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Types</SelectItem>
                  <SelectItem value="trek">Trek</SelectItem>
                  <SelectItem value="camping">Camping</SelectItem>
                  <SelectItem value="jam_yard">Jam Yard</SelectItem>
                  <SelectItem value="hiking">Hiking</SelectItem>
                  <SelectItem value="adventure">Adventure</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Date Range */}
          {showDateRange && (
            <div>
              <Label
                htmlFor="dateRange"
                className="flex items-center gap-2 mb-2"
              >
                <Calendar className="h-4 w-4" />
                Date Range
              </Label>
              <Select
                value={options.dateRange}
                onValueChange={(value) => onFilterChange("dateRange", value)}
              >
                <SelectTrigger id="dateRange">
                  <SelectValue placeholder="Select Date Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any Date</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="tomorrow">Tomorrow</SelectItem>
                  <SelectItem value="this_week">This Week</SelectItem>
                  <SelectItem value="next_week">Next Week</SelectItem>
                  <SelectItem value="this_month">This Month</SelectItem>
                  <SelectItem value="next_month">Next Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Location */}
          {showLocation && (
            <div>
              <Label
                htmlFor="location"
                className="flex items-center gap-2 mb-2"
              >
                <MapPin className="h-4 w-4" />
                Location
              </Label>
              <Select
                value={options.location}
                onValueChange={(value) => onFilterChange("location", value)}
              >
                <SelectTrigger id="location">
                  <SelectValue placeholder="Select Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Locations</SelectItem>
                  {locations.map((location) => (
                    <SelectItem key={location} value={location}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Price Range */}
          {showPriceRange && (
            <div>
              <Label
                htmlFor="priceRange"
                className="flex items-center gap-2 mb-2"
              >
                <DollarSign className="h-4 w-4" />
                Price Range
              </Label>
              <Select
                value={options.priceRange}
                onValueChange={(value) => onFilterChange("priceRange", value)}
              >
                <SelectTrigger id="priceRange">
                  <SelectValue placeholder="Select Price Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any Price</SelectItem>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="under_500">Under ₹500</SelectItem>
                  <SelectItem value="500_1000">₹500 - ₹1,000</SelectItem>
                  <SelectItem value="1000_2000">₹1,000 - ₹2,000</SelectItem>
                  <SelectItem value="over_2000">Over ₹2,000</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Transport Mode */}
          {showTransportMode && (
            <div>
              <Label
                htmlFor="transportMode"
                className="flex items-center gap-2 mb-2"
              >
                <Users className="h-4 w-4" />
                Transport
              </Label>
              <Select
                value={options.transportMode}
                onValueChange={(value) =>
                  onFilterChange("transportMode", value)
                }
              >
                <SelectTrigger id="transportMode">
                  <SelectValue placeholder="Select Transport" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any Transport</SelectItem>
                  <SelectItem value="cars">Cars</SelectItem>
                  <SelectItem value="mini_van">Mini Van</SelectItem>
                  <SelectItem value="bus">Bus</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Difficulty */}
          {showDifficulty && (
            <div>
              <Label
                htmlFor="difficulty"
                className="flex items-center gap-2 mb-2"
              >
                <Filter className="h-4 w-4" />
                Difficulty
              </Label>
              <Select
                value={options.difficulty}
                onValueChange={(value) => onFilterChange("difficulty", value)}
              >
                <SelectTrigger id="difficulty">
                  <SelectValue placeholder="Select Difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any Difficulty</SelectItem>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Duration */}
          {showDuration && (
            <div>
              <Label
                htmlFor="duration"
                className="flex items-center gap-2 mb-2"
              >
                <Calendar className="h-4 w-4" />
                Duration
              </Label>
              <Select
                value={options.duration}
                onValueChange={(value) => onFilterChange("duration", value)}
              >
                <SelectTrigger id="duration">
                  <SelectValue placeholder="Select Duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any Duration</SelectItem>
                  <SelectItem value="half_day">Half Day</SelectItem>
                  <SelectItem value="full_day">Full Day</SelectItem>
                  <SelectItem value="overnight">Overnight</SelectItem>
                  <SelectItem value="weekend">Weekend</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Availability */}
          {showAvailability && (
            <div>
              <Label
                htmlFor="availability"
                className="flex items-center gap-2 mb-2"
              >
                <Users className="h-4 w-4" />
                Availability
              </Label>
              <Select
                value={options.availability}
                onValueChange={(value) => onFilterChange("availability", value)}
              >
                <SelectTrigger id="availability">
                  <SelectValue placeholder="Select Availability" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any Availability</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="limited">Limited Spots</SelectItem>
                  <SelectItem value="waitlist">Waitlist Only</SelectItem>
                  <SelectItem value="full">Fully Booked</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Active Filters */}
        {showActiveFilters && activeFilters.length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Active Filters:</Label>
            <div className="flex flex-wrap gap-2">
              {activeFilters.map((filter) => (
                <Badge
                  key={filter.key}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {filter.label}: {filter.value}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 ml-1"
                    onClick={() => removeFilter(filter.key)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-between items-center pt-4 border-t">
          <Button variant="outline" onClick={onReset} disabled={loading}>
            Reset Filters
          </Button>
          {onApply && (
            <Button onClick={onApply} disabled={loading}>
              {loading ? "Applying..." : "Apply Filters"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const renderSidebarFilters = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Filters</h3>
        <Button variant="ghost" size="sm" onClick={onReset}>
          Clear All
        </Button>
      </div>

      {renderDefaultFilters()}
    </div>
  );

  const renderFloatingFilters = () => (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="w-80 max-h-96 overflow-y-auto">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Quick Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {renderCompactFilters()}
        </CardContent>
      </Card>
    </div>
  );

  const content = (() => {
    switch (variant) {
      case "compact":
        return renderCompactFilters();
      case "sidebar":
        return renderSidebarFilters();
      case "floating":
        return renderFloatingFilters();
      default:
        return renderDefaultFilters();
    }
  })();

  return <div className={className}>{content}</div>;
};

export default TrekFiltersBase;
