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

export interface Location {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  parentId?: string | null;
  children?: Location[];
  createdAt?: string;
  updatedAt?: string;
  itemCount?: number;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  size?: number;
  type?: string;
  createdAt?: string;
}

export interface CustomField {
  id: string;
  name: string;
  value: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  locationId?: string;
  location?: Location;
  labels: Label[];
  updatedAt: string;
  createdAt?: string;
  assetId?: string;
  insured?: boolean;
  archived?: boolean;
  purchasePrice?: number;
  syncChildItemsLocations?: boolean;
  serialNumber?: string;
  modelNumber?: string;
  manufacturer?: string;
  lifetimeWarranty?: boolean;
  warrantyExpires?: string;
  warrantyDetails?: string;
  purchaseTime?: string;
  purchaseFrom?: string;
  soldTime?: string;
  soldTo?: string;
  soldPrice?: number;
  soldNotes?: string;
  notes?: string;
  condition?: string;
  attachments?: Attachment[];
  fields?: CustomField[];
}
