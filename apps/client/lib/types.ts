export type UserType = {
  id: number;
  name: string;
  email: string;
  password: string;
  phone?: string | null;
  type: string;
  is_active: boolean;
  is_superuser: boolean;
  is_deleted: boolean;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date | null;
  stores?: StoreType[];
  orders?: PurchaseOrderType[];
};

export type StoreType = {
  id: number;
  name: string;
  marketplace: string;
  api_client: string;
  api_secret: string;
  is_active: boolean;
  is_deleted: boolean;
  user_id: number;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date | null;
  user?: UserType;
  orders?: PurchaseOrderType[];
  catalogs?: CatalogType[];
};

export type CatalogType = {
  id: number;
  asin: string;
  name: string; // changed from title
  brand: string;
  buying_price: string; // string now, not number
  selling_price: string; // string now, not number
  sku?: string | null;
  upc?: string | null;
  supplier?: string | null;
  moq: number | null; // minimum order quantity, can be null
  line_total?: number;
  quantity?: number; // nullable, used in purchase orders
  buybox_price?: string | null;
  amazon_fee?: string | null; // renamed from referral_fee
  profit?: string | null;
  margin?: string | null;
  roi?: number | null;
  selling_status: boolean;
  image_url?: string | null;
  created_at: Date;
  updated_at: Date;
  store_id: number;
  store?: StoreType;
  profitable?: boolean;

  wfs_id?: string; // nullable
  walmart_buybox?: string; // nullable
  walmart_fees?: string; // nullable
  walmart_profit?: string; // nullable
  walmart_margin?: string; // nullable
  walmart_roi?: string; // nullable

  // For indexing optional
  rowIndex?: number;
};

export type PurchaseOrderType = {
  id: number;
  order_id?: string;
  order_placed_at: Date;
  order_status: string;
  is_draft: boolean;
  is_api_succeed: boolean;
  created_at: Date;
  updated_at: Date;
  store_id: number;
  store?: StoreType;
  user_id: number;
  user?: UserType;
  items?: PurchaseOrderItemType[];
  paymentMethod: string;
  prepRequired: string;
  ungateAssistance: string;
  billingCountry: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  storefront: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  dueDate?: string;
};

export type PurchaseOrderItemType = {
  id: number;
  asin: string;
  title: string;
  brand: string;
  unit_price: number;
  quantity: number;
  sku: string;
  upc: string;
  supplier: string;
  purchase_order_id: number;
  purchase_order?: PurchaseOrderType;
};

export type StoreUpdateInput = {
  name?: string;
  marketplace?: string;
  api_client?: string;
  api_secret?: string;
  is_active?: boolean;
};
