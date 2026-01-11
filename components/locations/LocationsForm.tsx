import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetDescription,
} from "@/components/ui/sheet";
import { Location } from "@/types";

interface LocationFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  location?: Location | null;
  parentId?: string | null;
  onSave: (location: Partial<Location>) => void;
  locations: Location[];
}

export function LocationForm({
  open,
  onOpenChange,
  location,
  parentId,
  onSave,
  locations,
}: LocationFormProps) {
  const isEditing = !!location;
  const [formData, setFormData] = useState<Partial<Location>>({
    ...location,
    parentId,
  });

  useEffect(() => {
    setFormData({ ...location, parentId });
  }, [location, parentId, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>
            {isEditing ? "Edit Location" : "Add New Location"}
          </SheetTitle>
          <SheetDescription>
            {isEditing
              ? "Update the details of your location."
              : "Add a new location to your inventory."}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Location Name *</Label>
              <Input
                id="name"
                value={formData.name || ""}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g., Main Warehouse"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    description: e.target.value,
                  })
                }
                placeholder="Add any additional notes..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="parentId">Parent Location</Label>
              <Select
                value={formData.parentId || undefined}
                onValueChange={(value: string) =>
                  setFormData({ ...formData, parentId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="No parent" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((loc) => (
                    <SelectItem key={loc.id} value={loc.id}>
                      {loc.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <SheetFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              {isEditing ? "Save Changes" : "Add Location"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
