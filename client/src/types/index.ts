export interface DeliveryChargeItem {
  text: string;
  price: number;
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
  images: string[];
  thumbnail: string;
  description: string;
  fabric?: string;
  fit?: string;
  colors: string[];
  sizes: string[];
  highlights: string[];
  careInstructions: string[];
  deliveryCharge: DeliveryChargeItem[];
  stock: number;
  isActive: boolean;
  category?: string;
  categoryAssignment?: "TOP" | "MIDDLE" | "BOTTOM";
  /** External video URL (YouTube, Instagram Reel, TikTok, etc.) */
  videoUrl?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  size?: string;
  color?: string;
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
