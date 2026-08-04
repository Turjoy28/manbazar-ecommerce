"use client";

import React, { useRef, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Layers } from "lucide-react";
import { ClientCategory } from "@/services/category";

interface CategoryNavigationProps {
    categories: ClientCategory[];
}

export default function CategoryNavigation({ categories }: CategoryNavigationProps) {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    // Only show categories that are active
    const activeCategories = categories.filter((c) => c.isActive);

    // Trigger the expand-from-center animation on mount
    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), 100);
        return () => clearTimeout(timer);
    }, []);

    if (activeCategories.length === 0) return null;

    const scroll = (direction: "left" | "right") => {
        if (scrollContainerRef.current) {
            const scrollAmount = 300;
            scrollContainerRef.current.scrollBy({
                left: direction === "left" ? -scrollAmount : scrollAmount,
                behavior: "smooth",
            });
        }
    };

    // Calculate delay for each item so they animate from center outward
    const total = activeCategories.length;
    const mid = Math.floor(total / 2);
    const getDelay = (index: number) => {
        const distFromCenter = Math.abs(index - mid);
        return distFromCenter * 80; // ms per step from center
    };

    return (
        <section className="max-w-5xl mx-auto px-4 py-4 md:py-6">
            <div className="relative group">
                {/* Scroll Left Button */}
                <button
                    onClick={() => scroll("left")}
                    className="absolute left-1 md:-ml-4 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-6 h-6 md:w-8 md:h-8 rounded-full bg-white/90 backdrop-blur-sm md:bg-white shadow-md border border-gray-100 text-gray-600 hover:text-primary hover:border-primary transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100"
                    aria-label="Scroll left"
                >
                    <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
                </button>

                {/* Categories Container */}
                <div
                    ref={scrollContainerRef}
                    className="flex overflow-x-auto justify-center gap-3 md:gap-8 pb-4 pt-2 px-2 scrollbar-hide snap-x"
                    style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                    {activeCategories.map((category, index) => (
                        <Link
                            key={category._id}
                            href={`/category/${category.slug}`}
                            className="flex flex-col items-center gap-1 md:gap-2 group/cat shrink-0 snap-start w-[70px] md:w-auto transition-all duration-500 ease-out"
                            style={{
                                opacity: isVisible ? 1 : 0,
                                transform: isVisible ? "scale(1) translateY(0)" : "scale(0.3) translateY(20px)",
                                transitionDelay: `${getDelay(index)}ms`,
                            }}
                        >
                            {/* Image Circle */}
                            <div className="w-12 h-12 md:w-16 md:h-16 rounded-full overflow-hidden border-2 border-gray-100 group-hover/cat:border-primary group-hover/cat:shadow-lg transition-all duration-300 relative bg-white flex items-center justify-center p-0">
                                <div className="w-full h-full rounded-full overflow-hidden relative bg-gray-50">
                                    {category.image ? (
                                        <Image
                                            src={category.image}
                                            alt={category.name}
                                            fill
                                            className="object-cover group-hover/cat:scale-110 transition-transform duration-500"
                                            sizes="(max-width: 768px) 48px, 64px"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Layers className="w-5 h-5 md:w-8 md:h-8 text-gray-400 group-hover/cat:text-primary transition-colors" />
                                        </div>
                                    )}
                                </div>
                            </div>
                            {/* Category Name & Description */}
                            <div className="flex flex-col items-center w-full">
                                <span className="text-[10px] md:text-sm font-semibold text-gray-700 text-center w-full md:w-28 line-clamp-2 group-hover/cat:text-primary transition-colors leading-tight">
                                    {category.name}
                                </span>
                                {category.description && (
                                    <span className="text-[8px] md:text-[10px] text-gray-500 text-center w-full md:w-28 line-clamp-2 mt-0.5 leading-tight">
                                        {category.description}
                                    </span>
                                )}
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Scroll Right Button */}
                <button
                    onClick={() => scroll("right")}
                    className="absolute right-1 md:-mr-4 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-6 h-6 md:w-8 md:h-8 rounded-full bg-white/90 backdrop-blur-sm md:bg-white shadow-md border border-gray-100 text-gray-600 hover:text-primary hover:border-primary transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100"
                    aria-label="Scroll right"
                >
                    <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
                </button>
            </div>
            
            {/* Custom CSS to hide scrollbar for webkit browsers */}
            <style jsx global>{`
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </section>
    );
}
