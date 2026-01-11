"use client";
import { useState, useCallback, useEffect } from "react";
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
import { FilterDropdown } from "@/components/common/FilterDropdown";
import { ItemFormDrawer } from "@/components/inventory/ItemFormDrawer";
import { InventoryItem, FilterValue, Label, FilterSubOption } from "@/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface Location {
  id: string;
  name: string;
}

export default function Inventory() {
  const router = useRouter();
  const [data, setData] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [sortField, setSortField] = useState<SortField>("updatedAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [filters, setFilters] = useState<FilterValue[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [locationOptions, setLocationOptions] = useState<FilterSubOption[]>([]);
  const [labelOptions, setLabelOptions] = useState<FilterSubOption[]>([]);

  const itemsPerPage = 8;

  const refetch = useCallback(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setIsLoading(true);
    const headers = { Authorization: token };

    // Build query parameters
    const queryParams = new URLSearchParams();

    // Add search query
    if (searchQuery) {
      queryParams.append("q", searchQuery);
    }

    // Add pagination
    queryParams.append("page", currentPage.toString());
    queryParams.append("pageSize", itemsPerPage.toString());

    // Add label filters
    const labelFilters = filters.filter((f) => f.type === "label");
    labelFilters.forEach((filter) => {
      queryParams.append("labels", filter.value);
    });

    // Add location filters
    const locationFilters = filters.filter((f) => f.type === "location");
    locationFilters.forEach((filter) => {
      queryParams.append("locations", filter.value);
    });

    const queryString = queryParams.toString();
    const inventoryUrl = `/api/inventory${
      queryString ? `?${queryString}` : ""
    }`;

    const inventoryPromise = fetch(inventoryUrl, { headers }).then((res) => {
      if (!res.ok) throw new Error("Failed to fetch inventory");
      return res.json();
    });

    const locationsPromise = fetch("/api/locations", { headers }).then(
      (res) => {
        if (!res.ok) throw new Error("Failed to fetch locations");
        return res.json();
      }
    );

    const labelsPromise = fetch("/api/labels", { headers }).then((res) => {
      if (!res.ok) throw new Error("Failed to fetch labels");
      return res.json();
    });

    Promise.all([inventoryPromise, locationsPromise, labelsPromise])
      .then(([inventoryData, locationsData, labelsData]) => {
        const items = Array.isArray(inventoryData.items)
          ? inventoryData.items
          : [];

        // Apply client-side stock status filter (in-stock/out-of-stock)
        const statusFilters = filters.filter((f) => f.type === "status");
        let filteredItems = items;

        if (statusFilters.length > 0) {
          filteredItems = items.filter((item: any) => {
            return statusFilters.some((filter) => {
              if (filter.value === "in-stock") return item.quantity > 0;
              if (filter.value === "out-of-stock") return item.quantity === 0;
              return true;
            });
          });
        }

        const transformedItems = filteredItems.map((item: any) => ({
          ...item,
          locationId: item.location?.id,
          labels: Array.isArray(item.labels) ? item.labels : [],
        }));

        setData(transformedItems);
        setTotalItems(inventoryData.total || transformedItems.length);

        const locations: Location[] = Array.isArray(locationsData)
          ? locationsData
          : [];
        setLocationOptions(
          locations.map((loc) => ({
            id: loc.id,
            value: loc.id,
            label: loc.name,
          }))
        );

        const labels: Label[] = Array.isArray(labelsData) ? labelsData : [];
        setLabelOptions(
          labels.map((label) => ({
            id: label.id,
            value: label.id,
            label: label.name,
            color: label.color,
          }))
        );

        setError(null);
      })
      .catch((err) => {
        setError(err.message);
        setData([]);
        setTotalItems(0);
        setLocationOptions([]);
        setLabelOptions([]);
      })
      .finally(() => setIsLoading(false));
  }, [currentPage, searchQuery, filters, itemsPerPage]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const handleSortChange = (field: SortField, direction: SortDirection) => {
    setSortField(field);
    setSortDirection(direction);
  };

  const removeFilter = (id: string) => {
    setFilters(filters.filter((f) => f.id !== id));
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const handleFiltersChange = (newFilters: FilterValue[]) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1); // Reset to first page when search changes
  };

  const handleAddItem = () => {
    setEditingItem(null);
    setDrawerOpen(true);
  };

  const handleEditItem = (item: InventoryItem) => {
    setEditingItem(item);
    setDrawerOpen(true);
  };

  const handleSaveItem = async (itemData: Partial<InventoryItem>) => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const requestBody = {
          name: itemData.name,
          description: itemData.description || "",
          quantity: itemData.quantity || 0,
          locationId: itemData.locationId,
          labelIds: itemData.labels?.map((label) => label.id) || [],
          ...(itemData.id && { id: itemData.id }),
        };

        const response = await fetch("/api/items", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: token },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) throw new Error("Failed to save item");

        toast.success(`Item ${itemData.id ? "updated" : "added"} successfully`);
        refetch();
        setDrawerOpen(false);
      } catch (error) {
        console.error("Save error:", error);
        toast.error("Failed to save item");
      }
    }
  };

  const getLocationName = (locationId: string | undefined) => {
    if (!locationId) return "N/A";
    return locationOptions.find((l) => l.value === locationId)?.label || "N/A";
  };

  const columns = [
    {
      key: "item",
      header: "Item",
      width: "40%",
      render: (item: InventoryItem) => (
        <div className="flex items-center gap-3">
          <ItemImage alt={item.name} />
          <div className="min-w-0">
            <p className="font-medium text-foreground truncate text-sm sm:text-base">
              {item.name}
            </p>
            <p className="text-xs text-muted-foreground truncate sm:hidden mt-1">
              {getLocationName(item.locationId)}
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
          {getLocationName(item.locationId)}
        </span>
      ),
    },
    {
      key: "labels",
      header: "Labels",
      className: "hidden md:table-cell",
      render: (item: InventoryItem) => {
        if (
          !item.labels ||
          !Array.isArray(item.labels) ||
          item.labels.length === 0
        ) {
          return (
            <span className="text-xs text-muted-foreground">No labels</span>
          );
        }

        return (
          <div className="flex flex-wrap gap-1.5">
            {item.labels.map((itemLabel: Label) => {
              const fullLabel = labelOptions.find(
                (opt) => opt.id === itemLabel.id
              );
              const badgeName = fullLabel?.label || itemLabel.name;
              const badgeColor = fullLabel?.color || "blue";

              return (
                <LabelBadge
                  key={itemLabel.id}
                  name={badgeName}
                  color={badgeColor}
                />
              );
            })}
          </div>
        );
      },
    },
    {
      key: "quantity",
      header: "Quantity",
      width: "80px",
      className: "text-right hidden sm:table-cell",
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
        <span className="text-sm text-muted-foreground">
          {new Date(item.updatedAt).toLocaleDateString()}
        </span>
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
      <div className="space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">
            Inventory
          </h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="hidden sm:flex">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button onClick={handleAddItem} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>
        </div>

        <div className="w-full">
          <SearchInput
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search items..."
            className="w-full"
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          {filters.map((filter) => (
            <FilterChip
              key={filter.id}
              label={filter.label}
              onRemove={() => removeFilter(filter.id)}
            />
          ))}
          <FilterDropdown
            locationOptions={locationOptions}
            labelOptions={labelOptions}
            activeFilters={filters}
            onFiltersChange={handleFiltersChange}
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

      {isLoading ? (
        <TableSkeleton rows={8} columns={6} />
      ) : error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : data.length === 0 ? (
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
          data={data}
          keyExtractor={(item) => item.id}
        />
      )}

      {!isLoading && !error && data.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      )}

      <ItemFormDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onSave={handleSaveItem}
        item={editingItem}
        locationOptions={locationOptions}
        labelOptions={labelOptions}
      />
    </div>
  );
}
