/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState, useMemo } from "react";
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
  ArrowRight,
  HelpCircle,
  Bell,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/common/SearchInput";
import { ItemImage } from "@/components/common/ItemImage";
import { LabelBadge } from "@/components/common/LabelBadge";
import { locations, inventoryItems } from "@/data/mockData";
import { Location } from "@/types";
import { cn } from "@/lib/utils";

const iconMap: Record<string, React.ElementType> = {
  home: Home,
  car: Car,
  warehouse: Warehouse,
};

// Helper function to filter locations recursively
const filterLocations = (locations: Location[], query: string): Location[] => {
  if (!query.trim()) return locations;

  return locations
    .map((loc) => {
      const matches = loc.name.toLowerCase().includes(query.toLowerCase());
      const children = loc.children ? filterLocations(loc.children, query) : [];

      // Include location if it matches or has matching children
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

// Helper function to get all child location IDs recursively
const getAllChildLocationIds = (location: Location): string[] => {
  const ids = [location.id];
  if (location.children) {
    location.children.forEach((child) => {
      ids.push(...getAllChildLocationIds(child));
    });
  }
  return ids;
};

// Helper function to calculate item count for a location (including children)
const calculateLocationItemCount = (
  location: Location,
  allInventoryItems: any[]
): number => {
  const locationIds = getAllChildLocationIds(location);
  return allInventoryItems.filter((item) =>
    locationIds.includes(item.locationId)
  ).length;
};

// Helper function to calculate total value for a location (including children)
const calculateLocationTotalValue = (
  location: Location,
  allInventoryItems: any[]
): number => {
  const locationIds = getAllChildLocationIds(location);
  return allInventoryItems
    .filter((item) => locationIds.includes(item.locationId))
    .reduce((sum, item) => sum + (item.purchasePrice || 0), 0);
};

interface LocationTreeItemProps {
  location: Location;
  level: number;
  isSelected: boolean;
  onSelect: (location: Location) => void;
  isSearching?: boolean;
  allInventoryItems: any[];
}

function LocationTreeItem({
  location,
  level,
  isSelected,
  onSelect,
  isSearching = false,
  allInventoryItems,
}: LocationTreeItemProps) {
  const [isExpanded, setIsExpanded] = useState(isSearching || level === 0);

  const Icon = iconMap[location.icon] || MapPin;
  const hasChildren = location.children && location.children.length > 0;

  // Calculate actual item count dynamically
  const actualItemCount = useMemo(() => {
    return calculateLocationItemCount(location, allInventoryItems);
  }, [location, allInventoryItems]);

  return (
    <div>
      <div className="flex items-center">
        {/* Chevron button - separate from main button */}
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
        {/* Spacer for items without children */}
        {!hasChildren && (
          <div
            style={{ width: `${level * 16 + 20}px` }}
            className="flex-shrink-0"
          />
        )}

        {/* Main location button */}
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
            {actualItemCount}
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
              isSelected={isSelected && child.id === location.id}
              onSelect={onSelect}
              isSearching={isSearching}
              allInventoryItems={allInventoryItems}
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
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    locations[0].children?.[0].children?.[0] || null
  );

  // Filter locations based on search query
  const filteredLocations = useMemo(() => {
    return filterLocations(locations, searchQuery);
  }, [searchQuery]);

  // Get all items in selected location (including child locations)
  const locationItems = useMemo(() => {
    if (!selectedLocation) return [];

    // Get all location IDs (selected location + all its children)
    const allLocationIds = getAllChildLocationIds(selectedLocation);

    // Filter items that belong to any of these locations
    return inventoryItems.filter((item) =>
      allLocationIds.includes(item.locationId)
    );
  }, [selectedLocation]);

  // Build breadcrumb path
  const getBreadcrumbPath = (location: Location): string[] => {
    const path: string[] = [];
    const findPath = (loc: Location, target: string): boolean => {
      if (loc.id === target) {
        path.push(loc.name);
        return true;
      }
      if (loc.children) {
        for (const child of loc.children) {
          if (findPath(child, target)) {
            path.unshift(loc.name);
            return true;
          }
        }
      }
      return false;
    };

    for (const rootLoc of locations) {
      if (findPath(rootLoc, location.id)) break;
    }
    return path;
  };

  // Handle location selection
  const handleSelectLocation = (location: Location) => {
    setSelectedLocation(location);
  };

  // Calculate dynamic counts for selected location stats
  const selectedLocationStats = useMemo(() => {
    if (!selectedLocation) return { itemCount: 0, totalValue: 0 };

    return {
      itemCount: calculateLocationItemCount(selectedLocation, inventoryItems),
      totalValue: calculateLocationTotalValue(selectedLocation, inventoryItems),
    };
  }, [selectedLocation]);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
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
            <Bell className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <HelpCircle className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Left panel - Location tree */}
        <div className="bg-card rounded-xl border p-4 space-y-4 lg:min-h-screen">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search locations..."
          />

          <Button className="w-full">
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
                  isSelected={selectedLocation?.id === location.id}
                  onSelect={handleSelectLocation}
                  isSearching={searchQuery.length > 0}
                  allInventoryItems={inventoryItems}
                />
              ))
            ) : (
              <div className="text-center py-4 text-muted-foreground text-sm">
                No locations found matching &quot;{searchQuery}&quot;
              </div>
            )}
          </div>
        </div>

        {/* Right panel - Location details */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {selectedLocation ? (
            <>
              {/* Location header */}
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
                          {getBreadcrumbPath(selectedLocation).join(" > ")}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 sm:flex-initial"
                    >
                      <Edit className="h-4 w-4" />
                      <span className="hidden sm:inline ml-2">Edit</span>
                    </Button>
                    <Button
                      variant="outline-success"
                      size="sm"
                      className="flex-1 sm:flex-initial whitespace-nowrap"
                    >
                      <Plus className="h-4 w-4" />
                      <span className="hidden sm:inline ml-2">Add Child</span>
                    </Button>
                    <Button
                      variant="outline-destructive"
                      size="sm"
                      className="flex-1 sm:flex-initial"
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

                {/* Stats - Using dynamically calculated counts */}
                <div className="grid grid-cols-3 gap-3 sm:gap-6 pt-4 border-t">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                      Items
                    </p>
                    <p className="text-xl sm:text-2xl font-bold text-foreground">
                      {selectedLocationStats.itemCount}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                      Total Value
                    </p>
                    <p className="text-lg sm:text-2xl font-bold text-foreground break-all">
                      ${selectedLocationStats.totalValue.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                      Created
                    </p>
                    <p className="text-sm sm:text-base text-foreground">
                      {selectedLocation.createdAt}
                    </p>
                  </div>
                </div>
              </div>

              {/* Items in location */}
              <div className="bg-card rounded-xl border p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-foreground text-sm sm:text-base">
                    Items in this Location
                  </h3>
                  <button className="text-xs sm:text-sm text-primary hover:underline flex items-center gap-1 whitespace-nowrap">
                    View All{" "}
                    <ArrowRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  </button>
                </div>

                <div className="space-y-3">
                  {locationItems.length > 0 ? (
                    locationItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 sm:gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={() => router.push(`/inventory/${item.id}`)}
                      >
                        <ItemImage alt={item.name} />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground truncate text-sm sm:text-base">
                            {item.name}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {item.labels[0]?.name} • Added {item.updatedAt}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          {item.purchasePrice && (
                            <p className="font-medium text-foreground text-sm sm:text-base whitespace-nowrap">
                              ${item.purchasePrice.toFixed(2)}
                            </p>
                          )}
                          <LabelBadge
                            name={item.condition || "Good"}
                            color="green"
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-sm py-4 text-center">
                      No items in this location
                    </p>
                  )}
                </div>

                <button className="w-full mt-4 py-3 text-xs sm:text-sm text-primary hover:text-primary/80 flex items-center justify-center gap-1">
                  <Plus className="h-4 w-4" />
                  Add Item to this Location
                </button>
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
                  ? `No location found matching "${searchQuery}". Try a different search.`
                  : "Choose a location from the tree to view its details"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
