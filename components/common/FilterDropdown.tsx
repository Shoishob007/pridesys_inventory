import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { LabelBadge } from './LabelBadge';
import { cn } from '@/lib/utils';
import { FilterValue, FilterSubOption } from '@/types';

interface FilterDropdownProps {
  activeFilters: FilterValue[];
  onFiltersChange: (filters: FilterValue[]) => void;
  locationOptions: FilterSubOption[];
  labelOptions: FilterSubOption[];
}

const stockStatuses = [
  { id: 'status-instock', label: 'In Stock', value: 'in-stock' },
  { id: 'status-out', label: 'Out of Stock', value: 'out-of-stock' },
];

export function FilterDropdown({
  activeFilters,
  onFiltersChange,
  locationOptions,
  labelOptions,
}: FilterDropdownProps) {
  const [open, setOpen] = useState(false);

  const isFilterActive = (type: string, value: string) => {
    return activeFilters.some((f) => f.type === type && f.value === value);
  };

  const toggleFilter = (filter: FilterValue) => {
    const exists = activeFilters.find((f) => f.id === filter.id);
    if (exists) {
      onFiltersChange(activeFilters.filter((f) => f.id !== filter.id));
    } else {
      onFiltersChange([...activeFilters, filter]);
    }
  };

  const clearAllFilters = () => {
    onFiltersChange([]);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="text-sm text-primary hover:underline flex items-center gap-1">
          <Plus className="h-3.5 w-3.5" />
          Add Filter
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0" align="start">
        <div className="p-3 border-b">
          <div className="flex items-center justify-between">
            <span className="font-medium text-sm">Filters</span>
            {activeFilters.length > 0 && (
              <button
                onClick={clearAllFilters}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Clear all
              </button>
            )}
          </div>
        </div>

        <div className="max-h-80 overflow-y-auto">
          {/* Stock Status */}
          <div className="p-3 border-b">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
              Stock Status
            </p>
            <div className="space-y-1">
              {stockStatuses.map((status) => (
                <button
                  key={status.id}
                  onClick={() =>
                    toggleFilter({
                      id: status.id,
                      label: status.label,
                      type: 'status',
                      value: status.value,
                    })
                  }
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-muted text-sm text-left"
                >
                  <Checkbox
                    checked={isFilterActive('status', status.value)}
                    className="pointer-events-none"
                  />
                  <span>{status.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Labels */}
          <div className="p-3 border-b">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
              Labels
            </p>
            <div className="flex flex-wrap gap-2">
              {labelOptions.map((label) => (
                <button
                  key={label.id}
                  onClick={() =>
                    toggleFilter({
                      id: label.id,
                      label: label.label,
                      type: 'label',
                      value: label.value,
                    })
                  }
                  className={cn(
                    'transition-all',
                    isFilterActive('label', label.value) &&
                      'ring-2 ring-primary ring-offset-1 rounded-full'
                  )}
                >
                  <LabelBadge name={label.label} color={label.color} />
                </button>
              ))}
            </div>
          </div>

          {/* Locations */}
          <div className="p-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
              Location
            </p>
            <div className="space-y-1">
              {locationOptions.map((loc) => (
                <button
                  key={loc.id}
                  onClick={() =>
                    toggleFilter({
                      id: loc.id,
                      label: loc.label,
                      type: 'location',
                      value: loc.value,
                    })
                  }
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-muted text-sm text-left"
                >
                  <Checkbox
                    checked={isFilterActive('location', loc.value)}
                    className="pointer-events-none"
                  />
                  <span className="truncate">{loc.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-3 border-t">
          <Button size="sm" className="w-full" onClick={() => setOpen(false)}>
            Apply Filters
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
