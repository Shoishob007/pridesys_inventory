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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<InventoryItem | null>(null);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  const itemsPerPage = 8;

  const refetch = useCallback(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setIsLoading(true);
    const headers = { Authorization: token };

    const queryParams = new URLSearchParams();
    if (searchQuery) queryParams.append("q", searchQuery);
    queryParams.append("page", currentPage.toString());
    queryParams.append("pageSize", itemsPerPage.toString());

    filters.forEach((filter) => {
      if (filter.type === "label") queryParams.append("labels", filter.value);
      if (filter.type === "location")
        queryParams.append("locations", filter.value);
    });

    const queryString = queryParams.toString();
    const inventoryUrl = `/api/inventory?${queryString}`;

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
        const statusFilters = filters.filter((f) => f.type === "status");
        let filteredItems = items;

        if (statusFilters.length > 0) {
          filteredItems = items.filter((item: any) =>
            statusFilters.some((filter) => {
              if (filter.value === "in-stock") return item.quantity > 0;
              if (filter.value === "out-of-stock") return item.quantity === 0;
              return true;
            })
          );
        }

        setData(
          filteredItems.map((item: any) => ({
            ...item,
            locationId: item.location?.id,
            labels: Array.isArray(item.labels) ? item.labels : [],
          }))
        );
        setTotalItems(inventoryData.total || filteredItems.length);

        setLocationOptions(
          (Array.isArray(locationsData) ? locationsData : []).map(
            (loc: Location) => ({
              id: loc.id,
              value: loc.id,
              label: loc.name,
            })
          )
        );
        setLabelOptions(
          (Array.isArray(labelsData) ? labelsData : []).map((label: Label) => ({
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
      })
      .finally(() => setIsLoading(false));
  }, [currentPage, searchQuery, filters, itemsPerPage]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const handleSortChange = (field: SortField, direction: SortDirection) => {
    setSortField(field);
    setSortDirection(direction);
  };

  const removeFilter = (id: string) => {
    setFilters(filters.filter((f) => f.id !== id));
    setCurrentPage(1);
  };

  const handleFiltersChange = (newFilters: FilterValue[]) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleAddItem = () => {
    setEditingItem(null);
    setDrawerOpen(true);
  };

  const handleEditItem = (item: InventoryItem) => {
    setEditingItem(item);
    setDrawerOpen(true);
  };

  const handleDeleteConfirmation = (item: InventoryItem) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  const handleDeleteItem = async () => {
    if (!itemToDelete) return;

    const token = localStorage.getItem("token");
    if (token) {
      try {
        const response = await fetch(`/api/items/${itemToDelete.id}`, {
          method: "DELETE",
          headers: {
            Authorization: token,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to delete item");
        }

        toast.success("Item deleted successfully");
        refetch();
      } catch (error) {
        console.error("Delete error:", error);
        toast.error("Failed to delete item");
      } finally {
        setDeleteDialogOpen(false);
        setItemToDelete(null);
      }
    }
  };

  const handleSaveItem = async (itemData: Partial<InventoryItem>) => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const isUpdating = !!itemData.id;
        const url = isUpdating ? `/api/items/${itemData.id}` : "/api/items";
        const method = isUpdating ? "PUT" : "POST";

        const requestBody = {
          name: itemData.name,
          modelNumber: itemData.modelNumber || "",
          description: itemData.description || "",
          quantity: itemData.quantity || 0,
          locationId: itemData.locationId,
          labelIds: itemData.labels?.map((label) => label.id) || [],
        };

        const response = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json", Authorization: token },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) throw new Error("Failed to save item");

        toast.success(`Item ${isUpdating ? "updated" : "added"} successfully`);
        refetch();
        setDrawerOpen(false);
      } catch (error) {
        console.error("Save error:", error);
        toast.error("Failed to save item");
      }
    }
  };

  const getLocationName = (locationId: string | undefined) =>
    locationOptions.find((l) => l.value === locationId)?.label || "N/A";

  const columns = [
    {
      key: "item",
      header: "Item",
      width: "40%",
      render: (item: InventoryItem) => (
        <div className="flex items-center gap-3">
          <ItemImage alt={item.name} />
          <div>
            <p className="font-medium text-foreground truncate">{item.name}</p>
            <p className="text-xs text-muted-foreground truncate">
              Model: {item.modelNumber || "No Data"}
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
      render: (item: InventoryItem) =>
        item.labels && item.labels.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {item.labels.map((itemLabel: Label) => {
              const fullLabel = labelOptions.find(
                (opt) => opt.id === itemLabel.id
              );
              return (
                <LabelBadge
                  key={itemLabel.id}
                  name={fullLabel?.label || itemLabel.name}
                  color={fullLabel?.color || "blue"}
                />
              );
            })}
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">No labels</span>
        ),
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
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => handleDeleteConfirmation(item)}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between">
<div className="flex items-center gap-3">
<h1 className="text-xl sm:text-2xl font-bold text-foreground">
            Inventory
          </h1>
          <SearchInput
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Search items..."
          className="w-full"
        />
</div>
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
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <FilterDropdown
            locationOptions={locationOptions}
            labelOptions={labelOptions}
            activeFilters={filters}
            onFiltersChange={handleFiltersChange}
          />
          {filters.map((filter) => (
            <FilterChip
              key={filter.id}
              label={filter.label}
              onRemove={() => removeFilter(filter.id)}
            />
          ))}
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
          selectable
          selectedItems={selectedRows}
          onSelectionChange={setSelectedRows}
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

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              item.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteItem}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
