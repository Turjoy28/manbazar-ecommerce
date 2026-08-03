"use client";

import { useEffect, useState, useRef } from "react";
import { Product } from "@/types";
import { getProducts } from "@/services/product";
import { getCategories } from "@/services/category";
import { ProductCard } from "@/components/sections/ProductSection";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";

export default function RelatedProducts({
  currentProduct,
  title = "অনুরূপ পণ্য",
  subtitle = "একই ক্যাটাগরির অন্যান্য পছন্দের পণ্যগুলো দেখুন",
}: {
  currentProduct: Product;
  title?: string;
  subtitle?: string;
}) {
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    Promise.all([
      getProducts(1, 100),
      getCategories().catch(() => ({ success: false, data: [] }))
    ])
      .then(([productsRes, categoriesRes]) => {
        if (!isMounted) return;
        const allProducts = productsRes?.data?.products || [];

        // Exclude the current product and fetch all
        const otherProducts = allProducts.filter(
          (p) => p._id !== currentProduct._id
        );

        setRelatedProducts(otherProducts);

        const activeCategories = categoriesRes?.data || [];
        setCategories(activeCategories);
      })
      .catch((err) => {
        console.error("Failed to fetch related products or categories:", err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [currentProduct._id]);

  const getCategoryName = () => {
    if (!currentProduct.category) return "";

    // If it's already an object, return its name
    if (typeof currentProduct.category === "object" && (currentProduct.category as any).name) {
      return (currentProduct.category as any).name;
    }

    // If it's a string ID, find it in our categories list
    const categoryId = typeof currentProduct.category === "string" 
      ? currentProduct.category 
      : (currentProduct.category as any)._id;

    if (categoryId) {
      const match = categories.find(c => c._id === categoryId || c.slug === categoryId);
      if (match) return match.name;
    }

    return "";
  };

  // Auto scroll every 4 seconds in desktop view
  useEffect(() => {
    if (relatedProducts.length <= 5 || isHovered) return;

    const interval = setInterval(() => {
      if (window.innerWidth < 768) return;

      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        const isAtEnd = scrollLeft + clientWidth >= scrollWidth - 15;

        if (isAtEnd) {
          scrollRef.current.scrollTo({
            left: 0,
            behavior: "smooth",
          });
        } else {
          // Scroll by roughly 1 card width
          const cardWidth = clientWidth / 5;
          scrollRef.current.scrollTo({
            left: scrollLeft + cardWidth,
            behavior: "smooth",
          });
        }
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [relatedProducts, isHovered]);

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
        <div className="grid grid-cols-2 gap-3 sm:flex sm:gap-4 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="w-full sm:w-[calc((100%-32px)/3)] md:w-[calc((100%-64px)/5)] h-72 bg-gray-100 rounded-xl shrink-0"
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
              <span>{title}</span>
              {getCategoryName() && (
                <span className="text-xs md:text-sm font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md border border-gray-200">
                  {getCategoryName()}
                </span>
              )}
            </h2>
            <p className="text-[10px] md:text-xs text-gray-500 mt-0.5">
              {subtitle}
            </p>
          </div>
        </div>

        {/* Scroll Arrows - Hidden on mobile view as it displays vertically in a grid */}
        <div className="hidden sm:flex items-center gap-1.5 md:gap-2">
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

      {/* Grid on mobile (vertically wrapping), horizontally scrollable carousel on tablet/desktop */}
      <div
        ref={scrollRef}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="grid grid-cols-2 gap-3 sm:flex sm:gap-4 sm:overflow-x-auto pb-4 pt-1 sm:scroll-smooth sm:snap-x sm:snap-mandatory sm:[-ms-overflow-style:none] sm:[scrollbar-width:none] sm:[&::-webkit-scrollbar]:hidden"
      >
        {relatedProducts.map((p) => (
          <div
            key={p._id}
            className="w-full sm:w-[calc((100%-32px)/3)] md:w-[calc((100%-64px)/5)] shrink-0 sm:shrink-0 snap-start"
          >
            <ProductCard product={p} isSmall={true} />
          </div>
        ))}
      </div>
    </div>
  );
}
