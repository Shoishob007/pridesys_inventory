import { useState, useEffect } from "react";
import { Upload } from "lucide-react";
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
} from "@/components/ui/sheet";
import { LabelBadge } from "@/components/common/LabelBadge";
import { InventoryItem, Label as ItemLabel, FilterSubOption } from "@/types";
import { cn } from "@/lib/utils";

interface ItemFormDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: InventoryItem | null;
  onSave: (item: Partial<InventoryItem>) => void;
  locationOptions: FilterSubOption[];
  labelOptions: FilterSubOption[];
}

export function ItemFormDrawer({
  open,
  onOpenChange,
  item,
  onSave,
  locationOptions,
  labelOptions,
}: ItemFormDrawerProps) {
  const isEditing = !!item;

  const getInitialFormData = (
    item: InventoryItem | null | undefined
  ): Partial<InventoryItem> => {
    if (item) {
      return {
        id: item.id,
        name: item.name || "",
        modelNumber: item.modelNumber || "",
        description: item.description || "",
        quantity: item.quantity || 1,
        locationId: item.locationId || item.location?.id || "",
        labels: item.labels || [],
      };
    }
    return {
      name: "",
      modelNumber: "",
      description: "",
      quantity: 1,
      locationId: "",
      labels: [],
    };
  };

  const [formData, setFormData] = useState<Partial<InventoryItem>>(
    getInitialFormData(item)
  );

  useEffect(() => {
    setFormData(getInitialFormData(item));
  }, [item, open]);

  const toggleLabel = (label: ItemLabel) => {
    const currentLabels = formData.labels || [];
    const exists = currentLabels.find((l) => l.id === label.id);
    if (exists) {
      setFormData({
        ...formData,
        labels: currentLabels.filter((l) => l.id !== label.id),
      });
    } else {
      setFormData({
        ...formData,
        labels: [...currentLabels, label],
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{isEditing ? "Edit Item" : "Add New Item"}</SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
            <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Drag and drop an image, or click to browse
            </p>
            <Button type="button" variant="outline" size="sm" className="mt-2">
              Upload Image
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Item Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g., MacBook Pro 16"
                required
              />
            </div>

            <div>
              <Label htmlFor="modelNumber">Model Number</Label>
              <Input
                id="modelNumber"
                value={formData.modelNumber}
                onChange={(e) =>
                  setFormData({ ...formData, modelNumber: e.target.value })
                }
                placeholder="e.g., A2485"
              />
            </div>

            <div>
              <Label htmlFor="location">Location *</Label>
              <Select
                value={formData.locationId}
                onValueChange={(value) =>
                  setFormData({ ...formData, locationId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a location" />
                </SelectTrigger>
                <SelectContent>
                  {locationOptions.map((loc) => (
                    <SelectItem key={loc.id} value={loc.value}>
                      {loc.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min={0}
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    quantity: parseInt(e.target.value) || 0,
                  })
                }
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label>Labels</Label>
            <div className="flex flex-wrap gap-2">
              {labelOptions.map((label) => {
                const isSelected = (formData.labels || []).some(
                  (l) => l.id === label.value
                );
                const labelData = {
                  id: label.value,
                  name: label.label,
                  color: label.color,
                };
                return (
                  <button
                    key={label.id}
                    type="button"
                    onClick={() => toggleLabel(labelData)}
                    className={cn(
                      "transition-all",
                      isSelected &&
                        "ring-2 ring-primary ring-offset-2 rounded-full"
                    )}
                  >
                    <LabelBadge name={label.label} />
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <Label htmlFor="description">Notes / Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Add any additional notes..."
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              {isEditing ? "Save Changes" : "Add Item"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
