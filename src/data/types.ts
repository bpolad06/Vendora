import type { ArtKind } from '../shared/art/kinds';

export type CategorySlug =
  | 'qab-qacaq'
  | 'ev-esyalari'
  | 'qida'
  | 'teserrufat'
  | 'tekstil'
  | 'kosmetika'
  | 'elektrik'
  | 'tikinti';

export interface Category {
  slug: CategorySlug;
  name: string;
  art: ArtKind;
  commission: number;
}

export interface Seller {
  id: string;
  name: string;
  owner: string;
  market: string;
  address: string;
  city: string;
  phone: string;
  since: number;
  rating: number;
  reviewCount: number;
  followers: number;
  responseTime: string;
  verified: boolean;
  about: string;
  freeShippingFrom: number;
  shippingFee: number;
  createdAt: number;
}

export interface PriceTier {
  min: number;
  price: number;
}

export interface Product {
  id: string;
  sellerId: string;
  name: string;
  sku: string;
  category: CategorySlug;
  art: ArtKind;
  image?: string;
  unit: string;
  price: number;
  oldPrice?: number;
  cost: number;
  tiers: PriceTier[];
  minOrder: number;
  stock: number;
  minStock: number;
  supplierId?: string;
  published: boolean;
  publishedAt?: number;
  rating: number;
  reviewCount: number;
  soldCount: number;
  fastDelivery: boolean;
  group?: string;
  specs: [string, string][];
  description: string;
  createdAt: number;
}

export type OrderSource = 'Marketplace' | 'Kassa' | 'B2B';
export type OrderStatus = 'Yeni' | 'Hazırlanır' | 'Göndərildi' | 'Çatdırıldı' | 'Ləğv edildi';
export type PaymentMethod = 'Kartla' | 'Nağd' | 'Faktura ilə';
export type DeliveryMethod = 'Kuryer' | 'Özün götür';

export interface OrderItem {
  productId: string;
  name: string;
  sku: string;
  qty: number;
  unitPrice: number;
  unitCost: number;
}

export interface OrderEvent {
  status: OrderStatus;
  at: number;
}

export interface Order {
  id: string;
  number: string;
  checkoutId?: string;
  sellerId: string;
  source: OrderSource;
  status: OrderStatus;
  customerId?: string;
  customerName: string;
  phone: string;
  city: string;
  address: string;
  delivery: DeliveryMethod;
  payment: PaymentMethod;
  paid: boolean;
  dueAt?: number;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  createdAt: number;
  timeline: OrderEvent[];
}

export type MovementType =
  | 'Satış — Marketplace'
  | 'Satış — Kassa'
  | 'Satış — B2B'
  | 'Mədaxil'
  | 'Silinmə'
  | 'Düzəliş';

export interface InventoryLog {
  id: string;
  productId: string;
  sellerId: string;
  type: MovementType;
  qty: number;
  balance: number;
  user: string;
  at: number;
  ref?: string;
}

export type CustomerTag = 'Pərakəndə' | 'Topdan' | 'Restoran' | 'Kafe';

export interface Customer {
  id: string;
  sellerId: string;
  name: string;
  company?: string;
  phone: string;
  city: string;
  address: string;
  tag: CustomerTag;
  note?: string;
  createdAt: number;
}

export interface Supplier {
  id: string;
  sellerId: string;
  name: string;
  city: string;
  phone: string;
  contact: string;
  leadDays: number;
  debt: number;
  lastDelivery: number;
  prices: Record<string, number>;
}

export type PurchaseStatus = 'Göndərildi' | 'Təhvil alındı';

export interface PurchaseOrder {
  id: string;
  number: string;
  sellerId: string;
  supplierId: string;
  productId: string;
  qty: number;
  unitPrice: number;
  status: PurchaseStatus;
  createdAt: number;
  expectedAt: number;
}

export interface DataState {
  seededOn: string;
  sellers: Seller[];
  products: Product[];
  orders: Order[];
  logs: InventoryLog[];
  customers: Customer[];
  suppliers: Supplier[];
  purchases: PurchaseOrder[];
}
