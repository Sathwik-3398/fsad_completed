
export type Role = 'CUSTOMER' | 'DELIVERY' | 'ADMIN';

export enum Category {
  MILK = 'Milk',
  CURD = 'Curd',
  GHEE = 'Ghee',
  PANEER = 'Paneer',
  SWEETS = 'Sweets',
  COMBOS = 'Combos'
}

export interface SavedAddress {
  id: string;
  label: string;
  hNo: string;
  plotNo: string;
  colony: string;
  street: string;
  pincode: string;
  city: string;
}

export interface PaymentMethod {
  id: string;
  type: 'UPI' | 'CARD';
  label: string;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Complaint {
  id: string;
  userId: string;
  userName: string;
  outletId: string;
  outletName: string;
  partnerName?: string;
  description: string;
  status: 'PENDING' | 'RESOLVED';
  adminReply?: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  category: Category;
  price: number;
  originalPrice?: number;
  quantity: string;
  images: string[];
  description: string;
  isSubscriptionAvailable: boolean;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface HubInventory {
  hubId: string;
  productId: string;
  stock: number;
}

export interface Outlet {
  id: string;
  name: string;
  address: string;
  serviceArea: string; // Pincode or Zone
  contactNumber: string;
  status: 'ACTIVE' | 'INACTIVE';
  lat: number;
  lng: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  phone: string;
  walletBalance: number;
  address?: string;
  role: Role;
  status: 'ACTIVE' | 'BLOCKED';
  savedAddresses?: SavedAddress[];
}

export type PlanDuration = 'TRIAL' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';

export interface Subscription {
  id: string;
  productId: string;
  userId: string;
  hubId: string;
  frequency: 'DAILY' | 'ALTERNATE' | 'WEEKLY';
  timeSlot: string;
  quantityPerDay: number;
  startDate: string;
  endDate: string;
  status: 'ACTIVE' | 'PAUSED' | 'CANCELLED';
  deliveryAddress: string;
    message?: string; 
    tenure?: number;

}

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
}

export type PaymentMode = 'COD' | 'UPI' | 'WALLET' | 'CARD' | 'NETBANKING';

export type OrderStatus = 'ordered' | 'picked' | 'out_for_delivery' | 'delivered' | 'CANCELLED' | 'PENDING' | 'ACCEPTED';

export interface Order {
  id: string;
  userId: string;
  outletId: string;
  deliveryPartnerId?: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  createdAt: string;
  deliveryAddress: string;
  paymentStatus: 'PAID' | 'PENDING';
  paymentMethod: PaymentMode;
  orderType: 'SUBSCRIPTION' | 'ADHOC';
  wantsInvoice?: boolean;
  timestamps?: Partial<Record<OrderStatus, string>>;
}

export interface DeliveryPartner {
  id: string;
  name: string;
  phone: string;
  password?: string;
  outletId: string;
  status: 'ONLINE' | 'OFFLINE' | 'BUSY' | 'INACTIVE';
  totalEarnings: number;
  completedOrders: number;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'PERCENT' | 'FIXED';
  value: number;
  minOrder: number;
  expiryDate: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface SystemSettings {
  deliveryCharge: number;
  platformFee: number;
  minOrderAmount: number;
  subscriptionRules: string;
  defaultSlots: string[];
}
