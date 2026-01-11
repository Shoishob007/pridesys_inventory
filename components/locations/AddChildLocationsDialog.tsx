import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { 
  Command, 
  CommandEmpty, 
  CommandGroup, 
  CommandInput, 
  CommandItem 
} from '@/components/ui/command';
import { Check } from 'lucide-react';
import { Location } from '@/types';
import { cn } from '@/lib/utils';

interface AddChildLocationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parentLocation: Location;
  locations: Location[];
  onAddChildren: (childrenIds: string[]) => void;
}

export function AddChildLocationDialog({
  open,
  onOpenChange,
  parentLocation,
  locations,
  onAddChildren,
}: AddChildLocationDialogProps) {
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);

  // Flatten the location tree to get all locations
  const flattenLocations = (locs: Location[]): Location[] => {
    const result: Location[] = [];
    const flatten = (items: Location[]) => {
      items.forEach((item) => {
        result.push(item);
        if (item.children && item.children.length > 0) {
          flatten(item.children);
        }
      });
    };
    flatten(locs);
    return result;
  };

  const allFlatLocations = flattenLocations(locations);

  // Get all descendant IDs of a location (to prevent circular references)
  const getDescendantIds = (locationId: string): string[] => {
    const descendants: string[] = [];
    const findDescendants = (id: string) => {
      const location = allFlatLocations.find((loc) => loc.id === id);
      if (location?.children) {
        location.children.forEach((child) => {
          descendants.push(child.id);
          findDescendants(child.id);
        });
      }
    };
    findDescendants(locationId);
    return descendants;
  };

  // Get all ancestor IDs of a location (to prevent circular references)
  const getAncestorIds = (locationId: string): string[] => {
    const ancestors: string[] = [];
    const findAncestors = (id: string) => {
      const location = allFlatLocations.find((loc) => loc.id === id);
      if (location?.parentId) {
        ancestors.push(location.parentId);
        findAncestors(location.parentId);
      }
    };
    findAncestors(locationId);
    return ancestors;
  };

  const descendantIds = getDescendantIds(parentLocation.id);
  const ancestorIds = getAncestorIds(parentLocation.id);
  const excludedIds = [parentLocation.id, ...descendantIds, ...ancestorIds];

  // Filter out: the parent itself, its descendants, its ancestors, and locations that already have this as parent
  const availableLocations = allFlatLocations.filter(
    (loc) => 
      !excludedIds.includes(loc.id) && 
      loc.parentId !== parentLocation.id
  );

  const handleSelect = (locationId: string) => {
    setSelectedLocations((prev) =>
      prev.includes(locationId)
        ? prev.filter((id) => id !== locationId)
        : [...prev, locationId]
    );
  };

  const handleSave = () => {
    if (selectedLocations.length > 0) {
      onAddChildren(selectedLocations);
      setSelectedLocations([]);
    }
    onOpenChange(false);
  };

  const handleCancel = () => {
    setSelectedLocations([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen: boolean) => {
      if (!isOpen) {
        setSelectedLocations([]);
      }
      onOpenChange(isOpen);
    }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Child Locations to {parentLocation.name}</DialogTitle>
        </DialogHeader>
        <div className="text-sm text-muted-foreground mb-2">
          Select locations to add as children. Selected: {selectedLocations.length}
        </div>
        <Command className="border rounded-lg">
          <CommandInput placeholder="Search locations..." />
          <CommandEmpty>No locations found.</CommandEmpty>
          <CommandGroup className="max-h-[300px] overflow-y-auto">
            {availableLocations.length > 0 ? (
              availableLocations.map((location) => {
                const isSelected = selectedLocations.includes(location.id);
                return (
                  <CommandItem
                    key={location.id}
                    onSelect={() => handleSelect(location.id)}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center justify-between w-full">
                      <span>{location.name}</span>
                      <Check
                        className={cn(
                          "h-4 w-4",
                          isSelected ? "opacity-100" : "opacity-0"
                        )}
                      />
                    </div>
                  </CommandItem>
                );
              })
            ) : (
              <div className="py-6 text-center text-sm text-muted-foreground">
                No available locations to add as children
              </div>
            )}
          </CommandGroup>
        </Command>
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={selectedLocations.length === 0}>
            Add {selectedLocations.length > 0 ? `${selectedLocations.length} ` : ''}Selected
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}