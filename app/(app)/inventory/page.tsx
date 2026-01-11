"use client";
import { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Plus, Download, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/common/SearchInput";
import { FilterChip } from "@/components/common/FilterChip";
import { DataTable } from "@/components/common/DataTable";
import { Pagination } from "@/components/common/Pagination";
import { LabelBadge } from "@/components/common/LabelBadge";
import { ItemImage } from "@/components/common/ItemImage";
import { TableSkeleton } from "@/components/common/TableSkeleton";
import { ErrorState } from "@/components/common/ErrorState";
import { EmptyState } from "@/components/common/EmptyState";
import {
  SortDropdown,
  SortField,
  SortDirection,
} from "@/components/common/SortDropdown";
import {
  FilterDropdown,
  FilterValue,
} from "@/components/common/FilterDropdown";
import { ItemFormDrawer } from "@/components/inventory/ItemFormDrawer";
import { useDataFetching, mockFetch } from "@/hooks/useDataFetching";
import { inventoryItems } from "@/data/mockData";
import { InventoryItem } from "@/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

export default function Inventory() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>("updatedAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [filters, setFilters] = useState<FilterValue[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  const itemsPerPage = 8;

  // Fetch data with loading state
  const fetchInventory = useCallback(() => mockFetch(inventoryItems), []);
  const { data, isLoading, error, refetch } = useDataFetching(fetchInventory);

  // Filter and sort data
  const processedData = useMemo(() => {
    if (!data) return [];

    let result = [...data];

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.brand?.toLowerCase().includes(query) ||
          item.model?.toLowerCase().includes(query)
      );
    }

    // Apply filters
    filters.forEach((filter) => {
      if (filter.type === "location") {
        result = result.filter((item) => item.locationId === filter.value);
      }
      if (filter.type === "label") {
        result = result.filter((item) =>
          item.labels.some((l) => l.id === filter.value)
        );
      }
      if (filter.type === "status") {
        if (filter.value === "in-stock") {
          result = result.filter((item) => item.quantity > 0);
        } else if (filter.value === "out-of-stock") {
          result = result.filter((item) => item.quantity === 0);
        }
      }
    });

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "quantity":
          comparison = a.quantity - b.quantity;
          break;
        case "purchasePrice":
          comparison = (a.purchasePrice || 0) - (b.purchasePrice || 0);
          break;
        case "updatedAt":
        default:
          // Simple string comparison for demo
          comparison = a.updatedAt.localeCompare(b.updatedAt);
          break;
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });

    return result;
  }, [data, searchQuery, filters, sortField, sortDirection]);

  // Pagination
  const totalItems = processedData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedData = processedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSortChange = (field: SortField, direction: SortDirection) => {
    setSortField(field);
    setSortDirection(direction);
  };

  const removeFilter = (id: string) => {
    setFilters(filters.filter((f) => f.id !== id));
  };

  const handleAddItem = () => {
    setEditingItem(null);
    setDrawerOpen(true);
  };

  const handleEditItem = (item: InventoryItem) => {
    setEditingItem(item);
    setDrawerOpen(true);
  };

  const handleSaveItem = () => {
    if (editingItem) {
      toast.success("Item updated successfully");
    } else {
      toast.success("Item added successfully");
    }
  };

  const columns = [
    {
      key: "item",
      header: "Item",
      width: "30%",
      render: (item: InventoryItem) => (
        <div className="flex items-center gap-3">
          <ItemImage alt={item.name} />
          <div className="min-w-0">
            <p className="font-medium text-foreground truncate text-sm sm:text-base">
              {item.name}
            </p>
            {item.model && (
              <p className="text-xs text-muted-foreground truncate">
                Model: {item.model}
              </p>
            )}
            {/* Show location on mobile */}
            <p className="text-xs text-muted-foreground truncate sm:hidden mt-1">
              {item.locationPath.join(" > ")}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "location",
      header: "Location",
      className: "hidden sm:table-cell",
      render: (item: InventoryItem) => (
        <span className="text-sm text-muted-foreground">
          {item.locationPath.join(" > ")}
        </span>
      ),
    },
    {
      key: "labels",
      header: "Labels",
      className: "hidden md:table-cell",
      render: (item: InventoryItem) => (
        <div className="flex flex-wrap gap-1.5">
          {item.labels.map((label) => (
            <LabelBadge key={label.id} name={label.name} color={label.color} />
          ))}
        </div>
      ),
    },
    {
      key: "quantity",
      header: "Quantity",
      width: "80px",
      className: "hidden sm:table-cell",
      render: (item: InventoryItem) => (
        <span className="text-sm text-foreground">{item.quantity}</span>
      ),
    },
    {
      key: "updated",
      header: "Updated",
      width: "150px",
      className: "hidden lg:table-cell",
      render: (item: InventoryItem) => (
        <span className="text-sm text-muted-foreground">{item.updatedAt}</span>
      ),
    },
    {
      key: "actions",
      header: "",
      width: "60px",
      render: (item: InventoryItem) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => router.push(`/inventory/${item.id}`)}
            >
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleEditItem(item)}>
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="space-y-3 sm:space-y-4">
        {/* Title and action buttons row */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">
            Inventory
          </h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="flex">
              <Download className="h-4 w-4" />
              <span className="ml-2">Export</span>
            </Button>
            <Button onClick={handleAddItem} size="sm">
              <Plus className="h-4 w-4" />
              <span className="inline ml-2">Add Item</span>
            </Button>
          </div>
        </div>

        {/* Search bar row */}
        <div className="w-full">
          <SearchInput
            value={searchQuery}
            onChange={(value) => {
              setSearchQuery(value);
              setCurrentPage(1);
            }}
            placeholder="Search items..."
            className="w-full"
          />
        </div>
      </div>

      {/* Active filters and count */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-foreground whitespace-nowrap">
            Filters:
          </span>
          {filters.map((filter) => (
            <FilterChip
              key={filter.id}
              label={filter.label}
              onRemove={() => removeFilter(filter.id)}
            />
          ))}
          <FilterDropdown
            activeFilters={filters}
            onFiltersChange={(newFilters) => {
              setFilters(newFilters);
              setCurrentPage(1);
            }}
          />
        </div>
        <div className="flex items-center gap-3 justify-between sm:justify-end">
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            {totalItems} items
          </span>
          <SortDropdown
            sortField={sortField}
            sortDirection={sortDirection}
            onSortChange={handleSortChange}
          />
        </div>
      </div>

      {/* Data table with loading/error states */}
      {isLoading ? (
        <TableSkeleton rows={10} columns={5} showCheckbox />
      ) : error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : paginatedData.length === 0 ? (
        <EmptyState
          title="No items found"
          description={
            searchQuery || filters.length > 0
              ? "Try adjusting your search or filters"
              : "Get started by adding your first item"
          }
          actionLabel={
            !searchQuery && filters.length === 0 ? "Add Item" : undefined
          }
          onAction={handleAddItem}
        />
      ) : (
        <DataTable
          columns={columns}
          data={paginatedData}
          keyExtractor={(item) => item.id}
          selectable
          selectedItems={selectedItems}
          onSelectionChange={setSelectedItems}
        />
      )}

      {/* Pagination */}
      {!isLoading && !error && paginatedData.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      )}

      {/* Add/Edit Item Drawer */}
      <ItemFormDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        item={editingItem}
        onSave={handleSaveItem}
      />
    </div>
  );
}
