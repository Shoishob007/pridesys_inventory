export type LabelColor = 'blue' | 'green' | 'red' | 'orange' | 'purple' | 'yellow';

export interface Label {
  id: string;
  name: string;
  color: LabelColor;
}

export interface Location {
  id: string;
  name: string;
  icon: string;
  parentId: string | null;
  description?: string;
  itemCount: number;
  totalValue: number;
  createdAt: string;
  children?: Location[];
}

export interface InventoryItem {
  id: string;
  name: string;
  model?: string;
  brand?: string;
  image?: string;
  locationId: string;
  locationPath: string[];
  labels: Label[];
  quantity: number;
  updatedAt: string;
  purchaseDate?: string;
  purchasePrice?: number;
  warrantyExpiry?: string;
  notes?: string;
  serialNumber?: string;
  purchasedFrom?: string;
  color?: string;
  condition?: string;
  attachments?: Attachment[];
}

export interface Attachment {
  id: string;
  name: string;
  type: string;
  url: string;
  uploadedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface FilterOption {
  id: string;
  label: string;
  value: string;
}
