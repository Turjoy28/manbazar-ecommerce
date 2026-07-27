"use client";

import { useEffect, useState, useRef } from "react";
import { Product } from "@/types";
import { getProducts } from "@/services/product";
import { ProductCard } from "@/components/sections/ProductSection";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";

export default function RelatedProducts({
  currentProduct,
}: {
  currentProduct: Product;
}) {
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    getProducts(1, 100)
      .then((res) => {
        if (!isMounted) return;
        const allProducts = res?.data?.products || [];

        // Exclude the current product
        const otherProducts = allProducts.filter(
          (p) => p._id !== currentProduct._id
        );

        // Filter products belonging to the same category
        const sameCategory = otherProducts.filter(
          (p) =>
            p.category &&
            currentProduct.category &&
            p.category.trim().toLowerCase() === currentProduct.category.trim().toLowerCase()
        );

        // Use category products if available; otherwise fallback to other products so the section is never empty
        const finalProducts = sameCategory.length > 0 ? sameCategory : otherProducts;
        setRelatedProducts(finalProducts);
      })
      .catch((err) => {
        console.error("Failed to fetch related products:", err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [currentProduct._id, currentProduct.category]);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollAmount = clientWidth * 0.75;
      scrollRef.current.scrollTo({
        left:
          direction === "left"
            ? scrollLeft - scrollAmount
            : scrollLeft + scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (loading) {
    return (
      <div className="mt-8 md:mt-12 py-6 border-t border-gray-100 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
        <div className="flex gap-4 overflow-hidden">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="w-[165px] sm:w-[200px] md:w-[240px] h-72 bg-gray-100 rounded-xl shrink-0"
            />
          ))}
        </div>
      </div>
    );
  }

  if (relatedProducts.length === 0) return null;

  return (
    <div className="mt-8 md:mt-12 pt-6 md:pt-8 border-t border-gray-200">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary/10 text-primary shrink-0">
            <Sparkles className="w-4 h-4 md:w-5 md:h-5" />
          </div>
          <div>
            <h2 className="text-base md:text-2xl font-bold text-gray-900 leading-tight flex items-center gap-1.5 md:gap-2">
              <span>অনুরূপ পণ্য</span>
              {currentProduct.category && (
                <span className="text-xs md:text-sm font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md border border-gray-200">
                  {currentProduct.category}
                </span>
              )}
            </h2>
            <p className="text-[10px] md:text-xs text-gray-500 mt-0.5">
              একই ক্যাটাগরির অন্যান্য পছন্দের পণ্যগুলো দেখুন
            </p>
          </div>
        </div>

        {/* Scroll Arrows */}
        <div className="flex items-center gap-1.5 md:gap-2">
          <button
            onClick={() => scroll("left")}
            className="w-8 h-8 md:w-10 md:h-10 rounded-full border border-gray-200 bg-white hover:bg-primary hover:text-(--primary-text) hover:border-primary flex items-center justify-center transition-all duration-200 shadow-xs cursor-pointer text-gray-600 active:scale-95"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="w-8 h-8 md:w-10 md:h-10 rounded-full border border-gray-200 bg-white hover:bg-primary hover:text-(--primary-text) hover:border-primary flex items-center justify-center transition-all duration-200 shadow-xs cursor-pointer text-gray-600 active:scale-95"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </div>
      </div>

      {/* Horizontally Scrollable Container */}
      <div
        ref={scrollRef}
        className="flex gap-3 md:gap-5 overflow-x-auto pb-4 pt-1 scroll-smooth snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {relatedProducts.map((p) => (
          <div
            key={p._id}
            className="w-[165px] sm:w-[200px] md:w-[240px] shrink-0 snap-start"
          >
            <ProductCard product={p} />
          </div>
        ))}
      </div>
    </div>
  );
}
