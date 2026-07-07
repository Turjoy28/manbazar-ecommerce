"use client";

import React from "react";
import Image from "next/image";
import { PromotionalBannerData } from "@/services/banners";

export default function PromotionalBanners({ banners }: { banners: PromotionalBannerData[] }) {
  const activeBanners = (banners || []).filter((b) => b.isActive !== false);

  if (activeBanners.length === 0) {
    return null;
  }

  // Dynamic grid column layout depending on count
  const getGridColsClass = (count: number) => {
    if (count === 1) return "grid-cols-1";
    if (count === 2) return "grid-cols-1 md:grid-cols-2";
    return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
  };

  return (
    <section className="w-full max-w-5xl mx-auto px-4 py-6">
      <div className={`grid gap-6 ${getGridColsClass(activeBanners.length)}`}>
        {activeBanners.map((banner) => {
          const content = (
            <div className="relative h-44 sm:h-52 md:h-60 w-full overflow-hidden rounded-xl shadow-md border border-gray-100 hover:shadow-xl transition-all duration-300 group">
              <Image
                src={banner.imageUrl}
                alt="Promotion"
                fill
                className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
          );

          if (banner.destinationUrl) {
            return (
              <a
                key={banner._id}
                href={banner.destinationUrl}
                target={banner.destinationUrl.startsWith("http") ? "_blank" : "_self"}
                rel="noopener noreferrer"
                className="block cursor-pointer"
              >
                {content}
              </a>
            );
          }

          return <div key={banner._id}>{content}</div>;
        })}
      </div>
    </section>
  );
}
