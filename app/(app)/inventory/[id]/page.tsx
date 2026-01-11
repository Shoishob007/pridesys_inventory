"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Edit, Paperclip, Trash2, MapPin, Calendar, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Breadcrumb } from "@/components/common/Breadcrumb";
import { LabelBadge } from "@/components/common/LabelBadge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TableSkeleton } from "@/components/common/TableSkeleton";
import { ErrorState } from "@/components/common/ErrorState";
import { InventoryItem } from "@/types";
import { toast } from "sonner";

export default function ItemDetails() {
  const { id } = useParams();
  const router = useRouter();
  const [item, setItem] = useState<InventoryItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    const fetchItem = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(`/api/items/${id}`, {
          headers: { Authorization: token },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch item details');
        }

        const data = await response.json();
        setItem(data);
        setError(null);
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err instanceof Error ? err.message : 'Failed to load item');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchItem();
    }
  }, [id, router]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 bg-muted animate-pulse rounded" />
        <TableSkeleton rows={6} columns={2} />
      </div>
    );
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

  // Mock image placeholders
  const images = [null, null, null, null];

  const formatDate = (dateString?: string) => {
    if (!dateString || dateString === "" || dateString === "0001-01-01T00:00:00Z") return null;
    return new Date(dateString).toLocaleDateString();
  };

  const hasActiveWarranty = item.lifetimeWarranty || 
    (item.warrantyExpires && item.warrantyExpires !== "" && 
     new Date(item.warrantyExpires) > new Date());

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Breadcrumb items={breadcrumbItems} />
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap sm:flex-nowrap">
          <Button variant="outline" className="flex-1 sm:flex-initial">
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
            onClick={() => toast.error("Delete functionality coming soon")}
          >
            <Trash2 className="h-4 w-4" />
            <span className="hidden sm:inline ml-2">Delete</span>
          </Button>
        </div>
      </div>

      {/* Title and badges */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">{item.name}</h1>
        <div className="flex items-center gap-2 mt-2">
          {item.labels?.map((label) => (
            <LabelBadge key={label.id} name={label.name} color={label.color || 'blue'} />
          ))}
          {hasActiveWarranty && (
            <LabelBadge name="Active Warranty" color="green" />
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Image gallery */}
        <div className="lg:col-span-2 space-y-4">
          {/* Main image */}
          <div className="aspect-4/3 bg-muted rounded-xl flex items-center justify-center border min-h-[400px] lg:min-h-[500px]">
            <div className="text-muted-foreground">No image</div>
          </div>

          {/* Thumbnails */}
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

        {/* Key details */}
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
                    name={label.name}
                    color={label.color || 'blue'}
                  />
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
            <p className="text-sm text-foreground">
              {item.notes || "N/A"}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs section */}
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
            {/* Product Information */}
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

            {/* Additional Details */}
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
    </div>
  );
}