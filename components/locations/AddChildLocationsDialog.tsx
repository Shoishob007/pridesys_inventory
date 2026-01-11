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
import { Location } from '@/types';

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

  const availableLocations = locations.filter(
    (loc) => loc.id !== parentLocation.id && !loc.parentId
  );

  const handleSelect = (locationId: string) => {
    setSelectedLocations((prev) =>
      prev.includes(locationId)
        ? prev.filter((id) => id !== locationId)
        : [...prev, locationId]
    );
  };

  const handleSave = () => {
    onAddChildren(selectedLocations);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Child Locations to {parentLocation.name}</DialogTitle>
        </DialogHeader>
        <Command>
          <CommandInput placeholder="Search locations..." />
          <CommandEmpty>No locations found.</CommandEmpty>
          <CommandGroup>
            {availableLocations.map((location) => (
              <CommandItem
                key={location.id}
                onSelect={() => handleSelect(location.id)}
                className={selectedLocations.includes(location.id) ? 'bg-accent' : ''}
              >
                {location.name}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Add Selected</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
