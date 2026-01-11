/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Edit,
  Trash2,
  ChevronRight,
  Home,
  Car,
  Warehouse,
  MapPin,
  HelpCircle,
  Bell,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/common/SearchInput";
import { ItemImage } from "@/components/common/ItemImage";
import { Location, InventoryItem } from "@/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
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
import { AddChildLocationDialog } from "@/components/locations/AddChildLocationsDialog";
import { LocationForm } from "@/components/locations/LocationsForm";

const iconMap: Record<string, React.ElementType> = {
  home: Home,
  car: Car,
  warehouse: Warehouse,
};

const findLocationById = (locations: Location[], id: string): Location | null => {
  for (const location of locations) {
    if (location.id === id) return location;
    if (location.children) {
      const found = findLocationById(location.children, id);
      if (found) return found;
    }
  }
  return null;
};


const filterLocations = (locations: Location[], query: string): Location[] => {
  if (!query.trim()) return locations;

  return locations
    .map((loc) => {
      const matches = loc.name.toLowerCase().includes(query.toLowerCase());
      const children = loc.children ? filterLocations(loc.children, query) : [];

      if (matches || children.length > 0) {
        return {
          ...loc,
          children: children.length > 0 ? children : loc.children,
        } as Location;
      }
      return null;
    })
    .filter((loc): loc is Location => loc !== null);
};

interface LocationTreeItemProps {
  location: Location;
  level: number;
  selectedLocationId: string | null;
  onSelect: (location: Location) => void;
  isSearching?: boolean;
}

function LocationTreeItem({
  location,
  level,
  selectedLocationId,
  onSelect,
  isSearching = false,
}: LocationTreeItemProps) {
  const [isExpanded, setIsExpanded] = useState(isSearching || level === 0);

  const Icon = (location.icon && iconMap[location.icon]) || MapPin;
  const hasChildren = location.children && location.children.length > 0;
  const isSelected = selectedLocationId === location.id;

  return (
    <div>
      <div className="flex items-center">
        {hasChildren && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-0.5 text-muted-foreground hover:text-foreground transition-colors"
            aria-label={isExpanded ? "Collapse" : "Expand"}
            style={{ marginLeft: `${level * 16}px` }}
          >
            <ChevronRight
              className={cn(
                "h-4 w-4 transition-transform",
                isExpanded && "rotate-90"
              )}
            />
          </button>
        )}
        {!hasChildren && (
          <div
            style={{ width: `${level * 16 + 20}px` }}
            className="flex-shrink-0"
          />
        )}

        <button
          onClick={() => onSelect(location)}
          className={cn(
            "flex-1 flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors",
            isSelected
              ? "bg-primary/10 text-primary"
              : "text-foreground hover:bg-muted"
          )}
        >
          <Icon className="h-4 w-4 shrink-0" />
          <span className="flex-1 truncate text-sm font-medium">
            {location.name}
          </span>
          <span className="text-xs text-muted-foreground">
            {location.itemCount || 0}
          </span>
        </button>
      </div>

      {hasChildren && isExpanded && (
        <div>
          {location.children!.map((child) => (
            <LocationTreeItem
              key={child.id}
              location={child}
              level={level + 1}
              selectedLocationId={selectedLocationId}
              onSelect={onSelect}
              isSearching={isSearching}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Locations() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [locations, setLocations] = useState<Location[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [locationToDelete, setLocationToDelete] = useState<Location | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [newLocationParentId, setNewLocationParentId] = useState<string | null>(
    null
  );
  const [isAddChildDialogOpen, setIsAddChildDialogOpen] = useState(false);

  const fetchLocations = useCallback(async (token: string) => {
    try {
      const response = await fetch("/api/locations/tree", {
        headers: { Authorization: token },
      });
      if (!response.ok) throw new Error("Failed to fetch locations");
      const data = await response.json();
      setLocations(data);
      if (!selectedLocation && data.length > 0) {
        setSelectedLocation(data[0]);
      }
    } catch (err) {
      setError("Could not fetch locations.");
      console.error(err);
    }
  }, []);

  const fetchInventoryItems = useCallback(async (token: string, locationName: string) => {
    try {
      setInventoryItems([]); // Clear previous items
      const response = await fetch(`/api/items?locations=${encodeURIComponent(locationName)}`, {
        headers: { Authorization: token },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch inventory items");
      }
      const data = await response.json();
      setInventoryItems(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Could not fetch inventory items.");
      console.error(err);
    }
  }, []);


  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    setIsLoading(true);
    fetchLocations(token).finally(() => setIsLoading(false));
  }, [fetchLocations, router]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && selectedLocation) {
        fetchInventoryItems(token, selectedLocation.name);
    }
  }, [fetchInventoryItems, selectedLocation]);

  const filteredLocations = useMemo(() => {
    return filterLocations(locations, searchQuery);
  }, [locations, searchQuery]);
  
  const getBreadcrumbPath = useCallback((locationId: string): string[] => {
    const path: string[] = [];
    
    function findPath(currentLocations: Location[], targetId: string, currentPath: string[]): boolean {
        for (const loc of currentLocations) {
            const newPath = [...currentPath, loc.name];
            if (loc.id === targetId) {
                path.push(...newPath);
                return true;
            }
            if (loc.children && loc.children.length > 0) {
                if (findPath(loc.children, targetId, newPath)) {
                    return true;
                }
            }
        }
        return false;
    }

    findPath(locations, locationId, []);
    return path;
}, [locations]);


  const handleSelectLocation = (location: Location) => {
    setSelectedLocation(location);
  };

  const handleDeleteConfirmation = (location: Location) => {
    setLocationToDelete(location);
    setDeleteDialogOpen(true);
  };

  const handleDeleteLocation = async () => {
    if (!locationToDelete) return;

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Authentication token not found.");
      return;
    }

    try {
      const response = await fetch(`/api/locations/${locationToDelete.id}`, {
        method: "DELETE",
        headers: {
          Authorization: token,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete location");
      }

      toast.success("Location deleted successfully");
      await fetchLocations(token); // Refresh the locations list
      setSelectedLocation(null); // Deselect the deleted location
    } catch (error: any) {
      console.error("Delete error:", error);
      toast.error(error.message || "Failed to delete location");
    } finally {
      setDeleteDialogOpen(false);
      setLocationToDelete(null);
    }
  };

  const handleSaveLocation = async (locationData: Partial<Location>) => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Authentication token not found.");
      return;
    }

    const isUpdating = !!locationData.id;
    const url = isUpdating
      ? `/api/locations/${locationData.id}`
      : "/api/locations";
    const method = isUpdating ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: token },
        body: JSON.stringify(locationData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save location");
      }

      toast.success(`Location ${isUpdating ? "updated" : "added"} successfully`);
      await fetchLocations(token); // Refresh the locations list
      setIsFormOpen(false); // Close the form
    } catch (error: any) {
      console.error("Save error:", error);
      toast.error(error.message || "Failed to save location");
    }
  };

  const handleAddChildren = async (childrenIds: string[]) => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Authentication token not found.");
      return;
    }

    try {
      await Promise.all(
        childrenIds.map((childId) =>
          fetch(`/api/locations/${childId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json", Authorization: token },
            body: JSON.stringify({ parentId: selectedLocation?.id }),
          })
        )
      );

      toast.success("Child locations added successfully");
      await fetchLocations(token);
    } catch (error: any) {
      console.error("Add children error:", error);
      toast.error(error.message || "Failed to add child locations");
    }
  };

  if (isLoading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  if (error && !locations.length) {
    return <div className="text-center py-10 text-destructive">{error}</div>;
  }
  
  const breadcrumbPath = selectedLocation ? getBreadcrumbPath(selectedLocation.id) : [];


  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">
            Locations
          </h1>
          <span className="text-sm text-muted-foreground">
            Organize your items by location
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <Bell
              className={cn("h-5 w-5", {
                "text-destructive-foreground": locations.length > 5,
              })}
            />
          </Button>
          <Button variant="ghost" size="icon">
            <HelpCircle className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-card rounded-xl border p-4 space-y-4 lg:min-h-screen">
          <SearchInput
            value={searchQuery}
            onChange={(e) => setSearchQuery(e)}
            placeholder="Search locations..."
          />

          <Button
            className="w-full"
            onClick={() => {
              setEditingLocation(null);
              setNewLocationParentId(null);
              setIsFormOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
            New Location
          </Button>

          <div className="space-y-1">
            {filteredLocations.length > 0 ? (
              filteredLocations.map((location) => (
                <LocationTreeItem
                  key={location.id}
                  location={location}
                  level={0}
                  selectedLocationId={selectedLocation?.id ?? null}
                  onSelect={handleSelectLocation}
                  isSearching={searchQuery.length > 0}
                />
              ))
            ) : (
              <div className="text-center py-4 text-muted-foreground text-sm">
                No locations found matching &quot;{searchQuery}&quot;
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {selectedLocation ? (
            <>
              <div className="bg-card rounded-xl border p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                  <div className="flex items-start gap-3 sm:gap-4 min-w-0">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-lg sm:text-xl font-bold text-foreground break-words">
                        {selectedLocation.name}
                      </h2>
                      <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground">
                        <Home className="h-3 w-3 sm:h-3.5 sm:w-3.5 flex-shrink-0" />
                        <span className="truncate">
                          {breadcrumbPath.join(" > ")}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 sm:flex-initial"
                      onClick={() => {
                        setEditingLocation(selectedLocation);
                        setNewLocationParentId(null);
                        setIsFormOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                      <span className="hidden sm:inline ml-2">Edit</span>
                    </Button>
                    <Button
                      variant="outline-success"
                      size="sm"
                      className="flex-1 sm:flex-initial whitespace-nowrap"
                      onClick={() => {
                        setIsAddChildDialogOpen(true);
                      }}
                    >
                      <Plus className="h-4 w-4" />
                      <span className="hidden sm:inline ml-2">Add Child</span>
                    </Button>
                    <Button
                      variant="outline-destructive"
                      size="sm"
                      className="flex-1 sm:flex-initial"
                      onClick={() => handleDeleteConfirmation(selectedLocation)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="hidden sm:inline ml-2">Delete</span>
                    </Button>
                  </div>
                </div>

                {selectedLocation.description && (
                  <div className="mb-4 sm:mb-6">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                      Description
                    </p>
                    <p className="text-sm text-foreground">
                      {selectedLocation.description}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-3 sm:gap-6 pt-4 border-t">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                      Items
                    </p>
                    <p className="text-xl sm:text-2xl font-bold text-foreground">
                      {inventoryItems.length}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                      Total Value
                    </p>
                    <p className="text-lg sm:text-2xl font-bold text-foreground break-all">
                      $0.00
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                      Created
                    </p>
                    <p className="text-sm sm:text-base text-foreground">
                      {selectedLocation.createdAt
                        ? new Date(selectedLocation.createdAt).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-xl border p-4 sm:p-6">
                <h3 className="text-lg font-bold text-foreground mb-4">Items in this Location</h3>
                {inventoryItems.length > 0 ? (
                  <div className="space-y-4">
                    {inventoryItems.map((item) => (
                      <div key={item.id} className="flex items-center gap-4">
                        <ItemImage src={item.attachments?.[0]?.url} alt={item.name} />
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{item.name}</p>
                          <p className="text-sm text-muted-foreground">{item.assetId}</p>
                        </div>
                        <div className="text-right">
                            <p className="font-medium text-foreground">{item.quantity}</p>
                            <p className="text-sm text-muted-foreground">in stock</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No items found in this location.
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="bg-card rounded-xl border p-8 sm:p-12 text-center">
              <MapPin className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2 text-base sm:text-lg">
                {searchQuery ? "Location Not Found" : "Select a Location"}
              </h3>
              <p className="text-muted-foreground text-sm">
                {searchQuery
                  ? `No location found matching "'${searchQuery}'". Try a different search.`
                  : "Choose a location from the tree to view its details"}
              </p>
            </div>
          )}
        </div>
      </div>
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              location and all its items.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteLocation}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <LocationForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        location={editingLocation}
        parentId={newLocationParentId}
        onSave={handleSaveLocation}
        locations={locations}
      />
      {selectedLocation && (
        <AddChildLocationDialog
          open={isAddChildDialogOpen}
          onOpenChange={setIsAddChildDialogOpen}
          parentLocation={selectedLocation}
          locations={locations}
          onAddChildren={handleAddChildren}
        />
      )}
    </div>
  );
}
