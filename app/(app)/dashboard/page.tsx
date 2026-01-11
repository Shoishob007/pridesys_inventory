/* eslint-disable @typescript-eslint/no-explicit-any */
import { Package, MapPin, Tag, DollarSign, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { inventoryItems, locations, labels } from "@/data/mockData";

export default function Dashboard() {
  const totalItems = inventoryItems.length;
  const totalLocations = locations.length;
  const totalLabels = labels.length;
  const totalValue = inventoryItems.reduce(
    (sum: any, item: any) => sum + (item.purchasePrice || 0),
    0
  );

  const stats = [
    {
      title: "Total Items",
      value: totalItems.toString(),
      icon: Package,
      change: "+12%",
      changeType: "positive" as const,
    },
    {
      title: "Locations",
      value: totalLocations.toString(),
      icon: MapPin,
      change: "+3",
      changeType: "positive" as const,
    },
    {
      title: "Labels",
      value: totalLabels.toString(),
      icon: Tag,
      change: "+2",
      changeType: "positive" as const,
    },
    {
      title: "Total Value",
      value: `$${totalValue.toLocaleString()}`,
      icon: DollarSign,
      change: "+8%",
      changeType: "positive" as const,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your home inventory</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="flex items-center text-xs text-success mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {stat.change} from last month
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent items */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-5">
            {inventoryItems.slice(0, 5).map((item: any) => (
              <div key={item.id} className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Package className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.locationPath.join(" > ")}
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">
                  {item.updatedAt}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
