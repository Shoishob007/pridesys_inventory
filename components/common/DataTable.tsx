import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";

interface Column<T> {
  key: string;
  header: string;
  width?: string;
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
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  selectable = false,
  selectedItems = [],
  onSelectionChange,
  className,
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
                className="px-4 py-3 text-left text-xs font-600 font-semibold text-foreground uppercase tracking-wider"
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
                className={cn(
                  "hover:bg-muted/30 transition-colors",
                  isSelected && "bg-primary/5"
                )}
              >
                {selectable && (
                  <td className="px-4 py-4">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleSelectItem(id)}
                    />
                  </td>
                )}
                {columns.map((column) => (
                  <td key={column.key} className="px-4 py-4">
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
