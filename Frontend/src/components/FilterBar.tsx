import React from 'react';
import { Search, RotateCcw } from 'lucide-react';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { Button } from './ui/Button';

interface FilterOption {
  label: string;
  value: string;
  id?: string;
}

interface FilterDropdown {
  key: string;
  value: string;
  placeholder: string;
  options: FilterOption[];
}

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  searchPlaceholder?: string;
  filters?: FilterDropdown[];
  onFilterChange?: (key: string, value: string) => void;
  onReset?: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  onSearchChange,
  searchPlaceholder = 'Search...',
  filters = [],
  onFilterChange,
  onReset,
}) => {
  return (
    <div className="flex flex-col space-y-3 md:flex-row md:items-center md:space-x-3 md:space-y-0 bg-card border border-border p-4 rounded-xl mb-6 shadow-sm">
      {/* Search Input */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={searchPlaceholder}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Dynamic Dropdowns */}
      {filters.map((filter) => (
        <div key={filter.key} className="w-full md:w-48">
          <Select
            value={filter.value}
            onChange={(e) => onFilterChange?.(filter.key, e.target.value)}
          >
            <option value="">{filter.placeholder}</option>
            {filter.options.map((opt) => (
              <option key={opt.id || opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Select>
        </div>
      ))}

      {/* Reset Button */}
      {onReset && (
        <Button
          variant="outline"
          onClick={onReset}
          className="flex items-center gap-1.5 font-semibold"
        >
          <RotateCcw className="w-4 h-4" />
          Unfilter
        </Button>
      )}
    </div>
  );
};
export default FilterBar;
