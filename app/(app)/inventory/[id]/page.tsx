"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import { Edit, Paperclip, Trash2, MapPin, Calendar, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Breadcrumb } from "@/components/common/Breadcrumb";
import { LabelBadge } from "@/components/common/LabelBadge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { inventoryItems } from "@/data/mockData";

export default function ItemDetails() {
  const { id } = useParams();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Find the item - default to Sony headphones for demo
  const item = inventoryItems.find((i) => i.id === id) || inventoryItems[6];

  const breadcrumbItems = [
    { label: "Inventory", href: "/inventory" },
    { label: item.name },
  ];

  // Mock image placeholders
  const images = [
    null, // Main image placeholder
    null,
    null,
    null,
  ];

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
            variant="outline-destructive"
            className="flex-1 sm:flex-initial"
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
          {item.labels.map((label) => (
            <LabelBadge key={label.id} name={label.name} color={label.color} />
          ))}
          {item.warrantyExpiry && (
            <LabelBadge name="Active Warranty" color="green" />
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Image gallery */}
        <div className="lg:col-span-2 space-y-4">
          {/* Main image */}
          {/* Main image */}
          <div className="aspect-4/3 bg-muted rounded-xl flex items-center justify-center border min-h-[400px] lg:min-h-[500px]">
            {" "}
            {/* Responsive min-height */}
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
                {item.locationPath.join(" > ")}
              </span>
            </div>
          </div>

          <div>
            <p className="text-sm text-muted-foreground mb-2">Labels</p>
            <div className="flex flex-wrap gap-1.5">
              {item.labels.map((label) => (
                <LabelBadge
                  key={label.id}
                  name={label.name}
                  color={label.color}
                />
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm text-muted-foreground mb-1">Quantity</p>
            <span className="text-foreground font-medium">{item.quantity}</span>
          </div>

          {item.purchaseDate && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                Purchase Date
              </p>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-foreground">{item.purchaseDate}</span>
              </div>
            </div>
          )}

          {item.purchasePrice && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                Purchase Price
              </p>
              <span className="text-xl font-bold text-foreground">
                ${item.purchasePrice.toFixed(2)}
              </span>
            </div>
          )}

          {item.warrantyExpiry && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">Warranty</p>
              <LabelBadge
                name={`Active until ${item.warrantyExpiry}`}
                color="green"
              />
            </div>
          )}

          {item.notes && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">Notes</p>
              <p className="text-sm text-foreground">{item.notes}</p>
            </div>
          )}
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
                {item.brand && (
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Brand</span>
                    <span className="font-medium text-foreground">
                      {item.brand}
                    </span>
                  </div>
                )}
                {item.model && (
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Model</span>
                    <span className="font-medium text-foreground">
                      {item.model}
                    </span>
                  </div>
                )}
                {item.color && (
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Color</span>
                    <span className="font-medium text-foreground">
                      {item.color}
                    </span>
                  </div>
                )}
                {item.condition && (
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Condition</span>
                    <span className="font-medium text-foreground">
                      {item.condition}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Additional Details */}
            <div>
              <h3 className="font-semibold text-foreground mb-4">
                Additional Details
              </h3>
              <div className="space-y-3">
                {item.serialNumber && (
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Serial Number</span>
                    <span className="font-medium text-foreground">
                      {item.serialNumber}
                    </span>
                  </div>
                )}
                {item.purchasedFrom && (
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">
                      Purchased From
                    </span>
                    <span className="font-medium text-foreground">
                      {item.purchasedFrom}
                    </span>
                  </div>
                )}
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Last Updated</span>
                  <span className="font-medium text-foreground">
                    {item.updatedAt}
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
