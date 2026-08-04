export interface DeliveryChargeItem {
  text: string;
  price: number;
}

/** A single color variant with its own image gallery and optional price/stock overrides. */
export interface ProductVariant {
  _id?: string;
  color: {
    name: string;
    hex: string;
  };
  sku?: string;
  stock: number;
  /** If set, overrides the base product price for this variant. */
  price?: number | null;
  /** If set, overrides the base product sale_price for this variant. */
  sale_price?: number | null;
  images: string[];
}

export interface Product {
  _id: string;
  productId?: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  base_price?: number;
  offerType?: "NONE" | "PERCENTAGE" | "DIRECT";
  offerValue?: number;
  sale_price?: number;
  is_on_sale?: boolean;
  /** New structured variant system. When present, use this for images and color swatches. */
  variants?: ProductVariant[];
  /** Legacy flat gallery — used when variants[] is empty or absent. */
  images: string[];
  thumbnail: string;
  description: string;
  fabric?: string;
  fit?: string;
  /** Legacy flat color list — used when variants[] is empty or absent. */
  colors: string[];
  sizes: string[];
  highlights: string[];
  careInstructions: string[];
  deliveryCharge: DeliveryChargeItem[];
  stock: number;
  isActive: boolean;
  /** Category reference — can be a string ID or populated category object */
  category?: string | { _id: string; name: string; slug: string; isActive: boolean; sortOrder: number } | null;
  /** External video URL (YouTube, Instagram Reel, TikTok, etc.) */
  videoUrl?: string;
  vatPercentage?: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  size?: string;
  color?: string;
  /** Full variant object, preserved for cart display and order submission. */
  variant?: ProductVariant;
}

export interface SizeChartRow {
  size: string;
  chest: string;
  length: string;
  shoulder: string;
  sleeve: string;
}

export interface Feature {
  id: string;
  icon: string;
  title: string;
  description: string;
  number: string;
}
