import { useState, useEffect } from 'react';
import { X, Upload, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { LabelBadge } from '@/components/common/LabelBadge';
import { InventoryItem, Label as ItemLabel, LabelColor } from '@/types';
import { locations, allLabels } from '@/data/mockData';
import { cn } from '@/lib/utils';

interface ItemFormDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: InventoryItem | null;
  onSave: (item: Partial<InventoryItem>) => void;
}

const conditionOptions = ['New', 'Excellent', 'Good', 'Fair', 'Poor'];

// Flatten locations for select
const flattenLocations = (locs: typeof locations, prefix = ''): { id: string; name: string }[] => {
  return locs.flatMap((loc) => {
    const fullName = prefix ? `${prefix} > ${loc.name}` : loc.name;
    const children = loc.children ? flattenLocations(loc.children, fullName) : [];
    return [{ id: loc.id, name: fullName }, ...children];
  });
};

const flatLocations = flattenLocations(locations);

export function ItemFormDrawer({
  open,
  onOpenChange,
  item,
  onSave,
}: ItemFormDrawerProps) {
  const isEditing = !!item;
  
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    model: '',
    serialNumber: '',
    locationId: '',
    quantity: 1,
    purchasePrice: '',
    purchaseDate: '',
    purchasedFrom: '',
    warrantyExpiry: '',
    condition: 'Good',
    color: '',
    notes: '',
    labels: [] as ItemLabel[],
  });

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name || '',
        brand: item.brand || '',
        model: item.model || '',
        serialNumber: item.serialNumber || '',
        locationId: item.locationId || '',
        quantity: item.quantity || 1,
        purchasePrice: item.purchasePrice?.toString() || '',
        purchaseDate: item.purchaseDate || '',
        purchasedFrom: item.purchasedFrom || '',
        warrantyExpiry: item.warrantyExpiry || '',
        condition: item.condition || 'Good',
        color: item.color || '',
        notes: item.notes || '',
        labels: item.labels || [],
      });
    } else {
      setFormData({
        name: '',
        brand: '',
        model: '',
        serialNumber: '',
        locationId: '',
        quantity: 1,
        purchasePrice: '',
        purchaseDate: '',
        purchasedFrom: '',
        warrantyExpiry: '',
        condition: 'Good',
        color: '',
        notes: '',
        labels: [],
      });
    }
  }, [item, open]);

  const toggleLabel = (label: ItemLabel) => {
    const exists = formData.labels.find((l) => l.id === label.id);
    if (exists) {
      setFormData({
        ...formData,
        labels: formData.labels.filter((l) => l.id !== label.id),
      });
    } else {
      setFormData({
        ...formData,
        labels: [...formData.labels, label],
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      purchasePrice: formData.purchasePrice ? parseFloat(formData.purchasePrice) : undefined,
    });
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{isEditing ? 'Edit Item' : 'Add New Item'}</SheetTitle>
          <SheetDescription>
            {isEditing
              ? 'Update the item details below.'
              : 'Fill in the details to add a new item to your inventory.'}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          {/* Image upload placeholder */}
          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
            <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Drag and drop an image, or click to browse
            </p>
            <Button type="button" variant="outline" size="sm" className="mt-2">
              Upload Image
            </Button>
          </div>

          {/* Basic info */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Item Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., MacBook Pro 16"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="brand">Brand</Label>
                <Input
                  id="brand"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  placeholder="e.g., Apple"
                />
              </div>
              <div>
                <Label htmlFor="model">Model</Label>
                <Input
                  id="model"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  placeholder="e.g., A2485"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="serialNumber">Serial Number</Label>
              <Input
                id="serialNumber"
                value={formData.serialNumber}
                onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                placeholder="Enter serial number"
              />
            </div>
          </div>

          {/* Location and quantity */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="location">Location *</Label>
              <Select
                value={formData.locationId}
                onValueChange={(value) => setFormData({ ...formData, locationId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a location" />
                </SelectTrigger>
                <SelectContent>
                  {flatLocations.map((loc) => (
                    <SelectItem key={loc.id} value={loc.id}>
                      {loc.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min={1}
                  value={formData.quantity}
                  onChange={(e) =>
                    setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })
                  }
                />
              </div>
              <div>
                <Label htmlFor="condition">Condition</Label>
                <Select
                  value={formData.condition}
                  onValueChange={(value) => setFormData({ ...formData, condition: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {conditionOptions.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Purchase info */}
          <div className="space-y-4">
            <h4 className="font-medium text-foreground">Purchase Information</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="purchasePrice">Purchase Price</Label>
                <Input
                  id="purchasePrice"
                  type="number"
                  step="0.01"
                  value={formData.purchasePrice}
                  onChange={(e) =>
                    setFormData({ ...formData, purchasePrice: e.target.value })
                  }
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="purchaseDate">Purchase Date</Label>
                <Input
                  id="purchaseDate"
                  type="date"
                  value={formData.purchaseDate}
                  onChange={(e) =>
                    setFormData({ ...formData, purchaseDate: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="purchasedFrom">Purchased From</Label>
                <Input
                  id="purchasedFrom"
                  value={formData.purchasedFrom}
                  onChange={(e) =>
                    setFormData({ ...formData, purchasedFrom: e.target.value })
                  }
                  placeholder="e.g., Amazon"
                />
              </div>
              <div>
                <Label htmlFor="warrantyExpiry">Warranty Expiry</Label>
                <Input
                  id="warrantyExpiry"
                  type="date"
                  value={formData.warrantyExpiry}
                  onChange={(e) =>
                    setFormData({ ...formData, warrantyExpiry: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          {/* Labels */}
          <div className="space-y-3">
            <Label>Labels</Label>
            <div className="flex flex-wrap gap-2">
              {allLabels.map((label) => {
                const isSelected = formData.labels.some((l) => l.id === label.id);
                return (
                  <button
                    key={label.id}
                    type="button"
                    onClick={() => toggleLabel(label)}
                    className={cn(
                      'transition-all',
                      isSelected && 'ring-2 ring-primary ring-offset-2 rounded-full'
                    )}
                  >
                    <LabelBadge name={label.name} color={label.color} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Add any additional notes..."
              rows={3}
            />
          </div>

          {/* Actions */}
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
              {isEditing ? 'Save Changes' : 'Add Item'}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
