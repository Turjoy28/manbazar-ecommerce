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

  const { addToCart } = useContext(OrderContext);

  const handleAddToCart = () => {
    // Add to cart with default first size/color if available
    addToCart(product, 1, product.sizes?.[0], product.colors?.[0]);
    toast.success("Item added to cart");
  };

  return (
    <div className="flex flex-col bg-white overflow-hidden shadow-sm border border-gray-150 hover:shadow-md transition-all duration-300 h-full">
      <Link
        href={`/product/${product.slug}`}
        className="p-3 pb-0 transition-all hover:opacity-95"
      >
        <div className="relative w-full aspect-[3/4] bg-gray-50 rounded-xl overflow-hidden">
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
      <div className="flex gap-2 items-center w-full p-3 pt-2 mt-auto">
        <Button
          onClick={handleAddToCart}
          className="w-1/2 cursor-pointer font-bold h-11 bg-secondary text-(--secondary-text) hover:bg-secondary/80 text-[10px] sm:text-xs md:text-sm rounded-none text-center justify-center items-center flex whitespace-normal"
        >
          কার্টে যোগ করুন
        </Button>
        <a href="#billing" onClick={handleAddToCart} className="w-1/2">
          <Button className="font-bold bg-primary text-(--primary-text) text-[10px] sm:text-xs md:text-sm transition-colors duration-200 cursor-pointer w-full h-11 text-center justify-center items-center flex rounded-none whitespace-normal hover:bg-primary/90">
            এখনই অর্ডার করুন
          </Button>
        </a>
      </div>
    </div>
  );
}

export default function ProductSection({ productsCaption, products }: { productsCaption: string, products: Product[] }) {
  const [showAll, setShowAll] = useState(false);

  // Show first 8 products (4 columns * 2 rows) if showAll is false
  const displayedProducts = showAll ? products : products?.slice(0, 8);

  return (
    <section id="products" className="py-10 px-4 md:px-6 max-w-7xl mx-auto">
      {/* Section title */}
      <div className="flex flex-col items-center mb-8">
        <div className="border border-gray-300 rounded-xl px-6 py-3 text-sm md:text-4xl font-bold mb-1">
          {productsCaption}
          <div className="flex items-center justify-center gap-3 pt-3">
            <div className="w-20 h-1 bg-linear-to-r from-black from-10% to-primary to-60% rounded-full" />
            <div className="w-2 h-2 rounded-full bg-primary"></div>
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
      {products && products.length > 8 && (
        <div className="flex justify-center mt-10">
          <Button
            onClick={() => setShowAll(!showAll)}
            variant="outline"
            className="border-primary text-primary hover:bg-primary hover:text-white px-8 py-3 rounded-xl transition-all duration-300 font-semibold cursor-pointer shadow-xs"
          >
            {showAll ? "Show Less" : "See All"}
          </Button>
        </div>
      )}
    </section>
  );
}
