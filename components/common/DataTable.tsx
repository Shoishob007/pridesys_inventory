import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";

interface Column<T> {
  key: string;
  header: string;
  width?: string;
  className?: string;
  render: (item: T) => ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  selectable?: boolean;
  selectedItems?: string[];
  onSelectionChange?: (ids: string[]) => void;
  className?: string;
  onRowClick?: (item: T) => void;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  selectable = false,
  selectedItems = [],
  onSelectionChange,
  className,
  onRowClick,
}: DataTableProps<T>) {
  const allSelected = data.length > 0 && selectedItems.length === data.length;

  const toggleSelectAll = () => {
    if (allSelected) {
      onSelectionChange?.([]);
    } else {
      onSelectionChange?.(data.map(keyExtractor));
    }
  };

  const toggleSelectItem = (id: string) => {
    if (selectedItems.includes(id)) {
      onSelectionChange?.(selectedItems.filter((i) => i !== id));
    } else {
      onSelectionChange?.([...selectedItems, id]);
    }
  };

  return (
    <div className={cn("bg-card rounded-lg border overflow-scroll", className)}>
      <table className="w-full">
        <thead>
          <tr className="border-b bg-muted/30">
            {selectable && (
              <th className="w-12 px-4 py-3">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={toggleSelectAll}
                />
              </th>
            )}
            {columns.map((column) => (
              <th
                key={column.key}
                className={cn(
                  "px-4 py-3 text-left text-xs font-600 font-semibold text-foreground uppercase tracking-wider",
                  column.className
                )}
                style={{ width: column.width }}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y">
          {data.map((item) => {
            const id = keyExtractor(item);
            const isSelected = selectedItems.includes(id);

            return (
              <tr
                key={id}
                onClick={() => onRowClick?.(item)}
                className={cn(
                  "hover:bg-muted/30 transition-colors",
                  isSelected && "bg-primary/5",
                  onRowClick && "cursor-pointer"
                )}
              >
                {selectable && (
                  <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleSelectItem(id)}
                    />
                  </td>
                )}
                {columns.map((column) => (
                  <td 
                    key={column.key} 
                    className={cn("px-4 py-4", column.className)}
                  >
                    {column.render(item)}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}