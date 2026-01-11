import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FilterChipProps {
  label: string;
  onRemove?: () => void;
  className?: string;
}

export function FilterChip({ label, onRemove, className }: FilterChipProps) {
  return (
    <span className={cn('filter-chip', className)}>
      {label}
      {onRemove && (
        <button
          onClick={onRemove}
          className="ml-1 hover:text-primary/80 transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </span>
  );
}
