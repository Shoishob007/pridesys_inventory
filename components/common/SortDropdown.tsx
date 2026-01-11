import { ArrowUpDown, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export type SortField = 'name' | 'updatedAt' | 'quantity';
export type SortDirection = 'asc' | 'desc';

interface SortOption {
  field: SortField;
  label: string;
}

const sortOptions: SortOption[] = [
  { field: 'name', label: 'Name' },
  { field: 'updatedAt', label: 'Updated' },
  { field: 'quantity', label: 'Quantity' },
];

interface SortDropdownProps {
  sortField: SortField;
  sortDirection: SortDirection;
  onSortChange: (field: SortField, direction: SortDirection) => void;
}

export function SortDropdown({
  sortField,
  sortDirection,
  onSortChange,
}: SortDropdownProps) {
  const currentOption = sortOptions.find((o) => o.field === sortField);

  const handleSelect = (field: SortField) => {
    if (field === sortField) {
      // Toggle direction
      onSortChange(field, sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      onSortChange(field, 'asc');
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8">
          <ArrowUpDown className="h-3.5 w-3.5 mr-1" />
          Sort: {currentOption?.label} ({sortDirection === 'asc' ? '↑' : '↓'})
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {sortOptions.map((option) => (
          <DropdownMenuItem
            key={option.field}
            onClick={() => handleSelect(option.field)}
          >
            {option.label}
            {sortField === option.field && (
              <Check className="h-4 w-4 ml-auto" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
