"use client";
import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Edit, Paperclip, Trash2, MapPin, Calendar, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Breadcrumb } from "@/components/common/Breadcrumb";
import { LabelBadge } from "@/components/common/LabelBadge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TableSkeleton } from "@/components/common/TableSkeleton";
import { ErrorState } from "@/components/common/ErrorState";
import { ItemFormDrawer } from "@/components/inventory/ItemFormDrawer";
import { InventoryItem, FilterSubOption, Label, Location } from "@/types";
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
import { ItemDetailsSkeleton } from "@/components/common/ItemDetailsSkeleton";

export default function ItemDetails() {
  const { id } = useParams();
  const router = useRouter();
  const [item, setItem] = useState<InventoryItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [locationOptions, setLocationOptions] = useState<FilterSubOption[]>([]);
  const [labelOptions, setLabelOptions] = useState<FilterSubOption[]>([]);

  const fetchItem = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    setIsLoading(true);
    try {
      const headers = { Authorization: token };
      const itemPromise = fetch(`/api/items/${id}`, { headers }).then((res) => {
        if (!res.ok) throw new Error("Failed to fetch item details");
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

      const [itemData, locationsData, labelsData] = await Promise.all([
        itemPromise,
        locationsPromise,
        labelsPromise,
      ]);

      setItem(itemData);
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
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err instanceof Error ? err.message : "Failed to load item");
    } finally {
      setIsLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    if (id) {
      fetchItem();
    }
  }, [id, fetchItem]);

  const handleEditItem = () => {
    setDrawerOpen(true);
  };

  const handleDeleteConfirmation = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteItem = async () => {
    if (!item) return;

    const token = localStorage.getItem("token");
    if (token) {
      try {
        const response = await fetch(`/api/items/${item.id}`, {
          method: "DELETE",
          headers: {
            Authorization: token,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to delete item");
        }

        toast.success("Item deleted successfully");
        router.push("/inventory");
      } catch (error) {
        console.error("Delete error:", error);
        toast.error("Failed to delete item");
      } finally {
        setDeleteDialogOpen(false);
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
        fetchItem();
        setDrawerOpen(false);
      } catch (error) {
        console.error("Save error:", error);
        toast.error("Failed to save item");
      }
    }
  };

  if (isLoading) {
    return <ItemDetailsSkeleton />;
  }

  if (error || !item) {
    return (
      <ErrorState
        message={error || "Item not found"}
        onRetry={() => window.location.reload()}
      />
    );
  }

  const breadcrumbItems = [
    { label: "Inventory", href: "/inventory" },
    { label: item.name },
  ];

  const images = [null, null, null, null];

  const formatDate = (dateString?: string) => {
    if (
      !dateString ||
      dateString === "" ||
      dateString === "0001-01-01T00:00:00Z"
    )
      return null;
    return new Date(dateString).toLocaleDateString();
  };

  const hasActiveWarranty =
    item.lifetimeWarranty ||
    (item.warrantyExpires &&
      item.warrantyExpires !== "" &&
      new Date(item.warrantyExpires) > new Date());

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Breadcrumb items={breadcrumbItems} />
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap sm:flex-nowrap">
          <Button
            variant="outline"
            className="flex-1 sm:flex-initial"
            onClick={handleEditItem}
          >
            <Edit className="h-4 w-4" />
            <span className="hidden sm:inline ml-2">Edit</span>
          </Button>
          <Button
            variant="outline"
            className="flex-1 sm:flex-initial whitespace-nowrap"
          >
            <Paperclip className="h-4 w-4" />
            <span className="hidden sm:inline ml-2">Add Attachment</span>
          </Button>
          <Button
            variant="outline"
            className="flex-1 sm:flex-initial text-destructive hover:text-destructive"
            onClick={handleDeleteConfirmation}
          >
            <Trash2 className="h-4 w-4" />
            <span className="hidden sm:inline ml-2">Delete</span>
          </Button>
        </div>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-foreground">{item.name}</h1>
        <div className="flex items-center gap-2 mt-2">
          {item.labels?.map((label) => (
            <LabelBadge
              key={label.id}
              name={label.name}            />
          ))}
          {hasActiveWarranty && (
            <LabelBadge name="Active Warranty" color="green" />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="aspect-4/3 bg-muted rounded-xl flex items-center justify-center border min-h-[400px] lg:min-h-[500px]">
            <div className="text-muted-foreground">No image</div>
          </div>

          <div className="flex gap-3">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setSelectedImageIndex(index)}
                className={`w-20 h-20 rounded-lg border-2 flex items-center justify-center bg-muted transition-colors ${
                  selectedImageIndex === index
                    ? "border-primary"
                    : "border-transparent hover:border-border"
                }`}
              >
                {index === images.length - 1 ? (
                  <Plus className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <div className="text-xs text-muted-foreground">No img</div>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-xl border p-6 space-y-5 h-fit">
          <h2 className="font-semibold text-foreground">Key Details</h2>

          <div>
            <p className="text-sm text-muted-foreground mb-1">Location</p>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              <span className="text-foreground">
                {item.location?.name || "N/A"}
              </span>
            </div>
          </div>

          <div>
            <p className="text-sm text-muted-foreground mb-2">Labels</p>
            <div className="flex flex-wrap gap-1.5">
              {item.labels && item.labels.length > 0 ? (
                item.labels.map((label) => (
                  <LabelBadge
                    key={label.id}
                    name={label.name}                  />
                ))
              ) : (
                <span className="text-sm text-muted-foreground">N/A</span>
              )}
            </div>
          </div>

          <div>
            <p className="text-sm text-muted-foreground mb-1">Quantity</p>
            <span className="text-foreground font-medium">{item.quantity}</span>
          </div>

          <div>
            <p className="text-sm text-muted-foreground mb-1">Purchase Date</p>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-foreground">
                {formatDate(item.purchaseTime) || "N/A"}
              </span>
            </div>
          </div>

          <div>
            <p className="text-sm text-muted-foreground mb-1">Purchase Price</p>
            <span className="text-xl font-bold text-foreground">
              {item.purchasePrice && item.purchasePrice > 0
                ? `$${item.purchasePrice.toFixed(2)}`
                : "N/A"}
            </span>
          </div>

          <div>
            <p className="text-sm text-muted-foreground mb-1">Warranty</p>
            {hasActiveWarranty ? (
              item.lifetimeWarranty ? (
                <LabelBadge name="Lifetime Warranty" color="green" />
              ) : (
                <LabelBadge
                  name={`Active until ${formatDate(item.warrantyExpires)}`}
                  color="green"
                />
              )
            ) : (
              <span className="text-sm text-foreground">N/A</span>
            )}
          </div>

          <div>
            <p className="text-sm text-muted-foreground mb-1">Notes</p>
            <p className="text-sm text-foreground">{item.notes || "N/A"}</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="details" className="mt-8">
        <TabsList className="border-b w-full justify-start rounded-none h-auto p-0 bg-transparent">
          <TabsTrigger
            value="details"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
          >
            Details
          </TabsTrigger>
          <TabsTrigger
            value="attachments"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
          >
            Attachments
          </TabsTrigger>
          <TabsTrigger
            value="activity"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
          >
            Activity
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-foreground mb-4">
                Product Information
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Brand</span>
                  <span className="font-medium text-foreground">
                    {item.manufacturer || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Model</span>
                  <span className="font-medium text-foreground">
                    {item.modelNumber || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Color</span>
                  <span className="font-medium text-foreground">N/A</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Condition</span>
                  <span className="font-medium text-foreground">N/A</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-4">
                Additional Details
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Serial Number</span>
                  <span className="font-medium text-foreground">
                    {item.serialNumber || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Purchased From</span>
                  <span className="font-medium text-foreground">
                    {item.purchaseFrom || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Last Updated</span>
                  <span className="font-medium text-foreground">
                    {formatDate(item.updatedAt) || "N/A"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="attachments" className="pt-6">
          <p className="text-muted-foreground">No attachments yet</p>
        </TabsContent>

        <TabsContent value="activity" className="pt-6">
          <p className="text-muted-foreground">No activity recorded</p>
        </TabsContent>
      </Tabs>

      <ItemFormDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onSave={handleSaveItem}
        item={item}
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
