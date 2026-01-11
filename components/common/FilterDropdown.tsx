import { useState } from 'react';
import { Plus, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { locations, allLabels } from '@/data/mockData';
import { LabelBadge } from './LabelBadge';
import { cn } from '@/lib/utils';

export interface FilterValue {
  id: string;
  label: string;
  type: 'location' | 'label' | 'status';
  value: string;
}

interface FilterDropdownProps {
  activeFilters: FilterValue[];
  onFiltersChange: (filters: FilterValue[]) => void;
}

// Flatten locations
const flattenLocations = (locs: typeof locations): { id: string; name: string }[] => {
  return locs.flatMap((loc) => {
    const children = loc.children ? flattenLocations(loc.children) : [];
    return [{ id: loc.id, name: loc.name }, ...children];
  });
};

const flatLocations = flattenLocations(locations);

const stockStatuses = [
  { id: 'in-stock', name: 'In Stock' },
  { id: 'low-stock', name: 'Low Stock' },
  { id: 'out-of-stock', name: 'Out of Stock' },
];

export function FilterDropdown({
  activeFilters,
  onFiltersChange,
}: FilterDropdownProps) {
  const [open, setOpen] = useState(false);

  const isFilterActive = (type: string, value: string) => {
    return activeFilters.some((f) => f.type === type && f.value === value);
  };

  const toggleFilter = (filter: FilterValue) => {
    const exists = activeFilters.find(
      (f) => f.type === filter.type && f.value === filter.value
    );
    if (exists) {
      onFiltersChange(
        activeFilters.filter(
          (f) => !(f.type === filter.type && f.value === filter.value)
        )
      );
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
          {/* Locations */}
          <div className="p-3 border-b">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
              Location
            </p>
            <div className="space-y-1">
              {flatLocations.slice(0, 6).map((loc) => (
                <button
                  key={loc.id}
                  onClick={() =>
                    toggleFilter({
                      id: `loc-${loc.id}`,
                      label: loc.name,
                      type: 'location',
                      value: loc.id,
                    })
                  }
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-muted text-sm text-left"
                >
                  <Checkbox
                    checked={isFilterActive('location', loc.id)}
                    className="pointer-events-none"
                  />
                  <span className="truncate">{loc.name}</span>
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
              {allLabels.map((label) => (
                <button
                  key={label.id}
                  onClick={() =>
                    toggleFilter({
                      id: `label-${label.id}`,
                      label: label.name,
                      type: 'label',
                      value: label.id,
                    })
                  }
                  className={cn(
                    'transition-all',
                    isFilterActive('label', label.id) &&
                      'ring-2 ring-primary ring-offset-1 rounded-full'
                  )}
                >
                  <LabelBadge name={label.name} color={label.color} />
                </button>
              ))}
            </div>
          </div>

          {/* Status */}
          <div className="p-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
              Stock Status
            </p>
            <div className="space-y-1">
              {stockStatuses.map((status) => (
                <button
                  key={status.id}
                  onClick={() =>
                    toggleFilter({
                      id: `status-${status.id}`,
                      label: status.name,
                      type: 'status',
                      value: status.id,
                    })
                  }
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-muted text-sm text-left"
                >
                  <Checkbox
                    checked={isFilterActive('status', status.id)}
                    className="pointer-events-none"
                  />
                  <span>{status.name}</span>
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
