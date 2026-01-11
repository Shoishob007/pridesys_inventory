export interface FilterSubOption {
  id: string;
  label: string;
  value: string;
  color?: string;
}

export interface FilterOption {
  id: string;
  label: string;
  options: FilterSubOption[];
}

export interface FilterValue {
  id: string;
  label: string;
  value: string;
  type: string;
}

export interface Label {
  id: string;
  name: string;
  description?: string;
  color?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  locationId: string;
  labels: Label[];
  updatedAt: string;
}
