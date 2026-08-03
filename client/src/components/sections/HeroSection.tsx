"use client";
import Logo from "../shared/Logo";
import { useContext } from "react";
import { OrderContext } from "@/providers/OrderProvider";

export default function HeroSection({ banner }: { banner: any }) {
  const { cartItems } = useContext(OrderContext);
  const targetHref = cartItems && cartItems.length > 0 ? "#billing" : "#products";
  return (
    <section className="relative w-full overflow-hidden">
      {/* Banner image — full aspect ratio on mobile, capped height on desktop */}
      <img
        src={banner?.bannerImage}
        alt={banner?.title || "Banner"}
        className="w-full h-auto block md:max-h-130 md:object-cover md:object-center"
      />

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/20" />

      {/* Content */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-4 text-center">
        {/* Brand name */}
        <Logo logo={banner.logo} />

        {/* Hero title */}
        <h1 className="text-white text-[10px] sm:text-base md:text-4xl lg:text-5xl font-bold leading-snug max-w-[85%] md:max-w-5xl mb-1.5 md:mb-8 font-sans drop-shadow-sm">
          {banner.title}
        </h1>

        {/* CTA button */}
        <a
          href={targetHref}
          className="bg-primary text-(--primary-text) hover:bg-primary/90 font-semibold px-2.5 py-1 md:px-8 md:py-3 rounded-sm transition-all duration-200 text-[9px] md:text-lg cursor-pointer animate-cta-bounce"
        >
          অর্ডার করতে চাই
        </a>
      </div>
    </section>
  );
}
