"use client";
import Image from "next/image";
import { Product } from "@/types";
import Link from "next/link";
import { useContext, useState } from "react";
import { OrderContext } from "@/providers/OrderProvider";
import { ShoppingCart } from "lucide-react";
import { Button } from "../ui/button";
import { toast } from "sonner";

function ProductCard({ product }: { product: Product }) {

  const { addToCart, cartItems } = useContext(OrderContext);

  const defaultVariant = product.variants?.[0];
  const availableStock = defaultVariant ? (defaultVariant.stock ?? 0) : (product.stock ?? 0);
  const colorName = defaultVariant?.color?.name || product.colors?.[0];

  const currentCartQty = cartItems
    .filter(item => {
      if (item.product._id !== product._id) return false;
      if (product.variants && product.variants.length > 0) return item.color === colorName;
      return true;
    })
    .reduce((sum, item) => sum + item.quantity, 0);

  const isOutOfStock = availableStock - currentCartQty <= 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    if (isOutOfStock) {
      e.preventDefault();
      toast.error("স্টক শেষ (Out of stock)");
      return;
    }
    // Add to cart with default first size/color if available
    addToCart(product, 1, product.sizes?.[0], product.colors?.[0]);
  };

  return (
    <div className="flex flex-col bg-white overflow-hidden shadow-sm border border-gray-150 hover:shadow-md transition-all duration-300 h-full">
      <Link
        href={`/product/${product.slug}`}
        className="p-3 pb-0 transition-all hover:opacity-95"
      >
        <div className="relative w-full aspect-[3/4] bg-gray-50 rounded-xl overflow-hidden">
          {product.is_on_sale && (
            <div className="absolute top-2.5 left-2.5 bg-red-500 text-white text-[10px] md:text-xs font-extrabold px-2.5 py-1 rounded-lg shadow-md z-10 uppercase tracking-wide">
              {product.offerType === "PERCENTAGE" && product.offerValue ? (
                `${product.offerValue}% OFF`
              ) : product.offerType === "DIRECT" && product.offerValue ? (
                `৳${product.offerValue} OFF`
              ) : product.originalPrice && product.originalPrice > product.price ? (
                `${Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF`
              ) : (
                "SALE"
              )}
            </div>
          )}
          <Image
            src={product.thumbnail || product.images?.[0] || "/placeholder.png"}
            alt={product.name}
            fill
            className="object-cover rounded-xl"
            sizes="(max-width: 768px) 50vw, 33vw"
          />
        </div>
      </Link>

      {/* Product Name & Price */}
      <div className="flex flex-col items-center px-3 py-2 mt-auto text-center">
        <h3 className="text-xs md:text-sm font-semibold text-gray-800 line-clamp-2 min-h-[2.5rem] flex items-center justify-center px-1">
          {product.name}
        </h3>
        <div className="flex gap-2 items-center justify-center mt-1">
          <span className="text-sm md:text-base font-bold text-gray-900">৳{product.price}</span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-xs text-red-500 line-through">৳{product.originalPrice}</span>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-1.5 md:gap-2 items-center w-full p-2 md:p-3 pt-1 md:pt-2 mt-auto">
        {isOutOfStock ? (
          <Button
            disabled
            className="w-full font-semibold h-7 md:h-11 bg-gray-300 text-gray-500 text-[8px] sm:text-xs md:text-sm rounded-none text-center justify-center items-center flex whitespace-nowrap overflow-hidden leading-tight cursor-not-allowed px-1"
          >
            স্টক শেষ
          </Button>
        ) : (
          <>
            <Button
              onClick={handleAddToCart}
              className="w-1/2 cursor-pointer font-semibold h-7 md:h-11 bg-secondary text-(--secondary-text) hover:bg-secondary/80 text-[8px] sm:text-xs md:text-sm rounded-none text-center justify-center items-center flex whitespace-nowrap overflow-hidden leading-tight px-1"
            >
              কার্টে যোগ করুন
            </Button>
            <a href="/#billing" onClick={handleAddToCart} className="w-1/2">
              <Button className="font-semibold bg-primary text-(--primary-text) text-[8px] sm:text-xs md:text-sm transition-all duration-200 cursor-pointer w-full h-7 md:h-11 text-center justify-center items-center flex rounded-none whitespace-nowrap overflow-hidden leading-tight px-1 hover:bg-primary/90 animate-cta-bounce">
                এখনই অর্ডার করুন
              </Button>
            </a>
          </>
        )}
      </div>
    </div>
  );
}

export default function ProductSection({
  productsCaption,
  products,
  isCategorySection = false,
  categoryAssignmentId,
}: {
  productsCaption: string;
  products: Product[];
  isCategorySection?: boolean;
  categoryAssignmentId?: string;
}) {
  const [showAll, setShowAll] = useState(false);

  // For category section, always slice to 8 (and use the link to 'See All' page).
  // Otherwise, use state-based toggle.
  const displayedProducts = isCategorySection
    ? products?.slice(0, 8)
    : (showAll ? products : products?.slice(0, 8));

  return (
    <section id="products" className="py-4 px-4 md:px-6 max-w-7xl mx-auto">
      {/* Section title */}
      <div
        id={categoryAssignmentId ? `category-${categoryAssignmentId}` : undefined}
        className="flex flex-col items-center mb-4 scroll-mt-16"
      >
        <div className="border border-gray-300 rounded-lg px-4 py-1.5 md:px-8 md:py-4 text-sm md:text-3xl font-bold text-center mb-1">
          {productsCaption}
          <div className="flex items-center justify-center gap-2 md:gap-3 pt-1.5 md:pt-3">
            <div className="w-14 md:w-24 h-0.5 md:h-1 bg-linear-to-r from-black from-10% to-primary to-60% rounded-full" />
            <div className="w-1.5 h-1.5 md:w-2.5 md:h-2.5 rounded-full bg-primary"></div>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 md:gap-8">
        {displayedProducts?.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>

      {/* See All Button */}
      {(isCategorySection || (products && products.length > 8)) && (
        <div className="flex justify-center mt-4">
          {isCategorySection ? (
            <Link href={`/category/${encodeURIComponent(categoryAssignmentId || productsCaption)}`}>
              <Button
                variant="outline"
                className="border-primary text-primary hover:bg-primary hover:text-white px-8 py-3 rounded-xl transition-all duration-300 font-semibold cursor-pointer shadow-xs"
              >
                See All
              </Button>
            </Link>
          ) : (
            <Button
              onClick={() => setShowAll(!showAll)}
              variant="outline"
              className="border-primary text-primary hover:bg-primary hover:text-white px-8 py-3 rounded-xl transition-all duration-300 font-semibold cursor-pointer shadow-xs"
            >
              {showAll ? "Show Less" : "See All"}
            </Button>
          )}
        </div>
      )}
    </section>
  );
}
