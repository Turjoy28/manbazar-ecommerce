"use client";

import { useContext, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types";
import { SIZE_CHART } from "@/data";
import { OrderContext } from "@/providers/OrderProvider";
import { Truck } from 'lucide-react';

// ── Icons ─────────────────────────────────────────────────────────────────────
function ChevronLeft() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  );
}
function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4 text-primary">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}
function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5 text-primary">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  );
}
function TruckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5 text-primary">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
    </svg>
  );
}


// ── Color Selector ───────────────────────────────────────────────────────────
function ColorSelector({
  colors,
  selected,
  onChange,
}: {
  colors: string[];
  selected: string;
  onChange: (c: string) => void;
}) {
  return (
    <div className="flex gap-3 items-center flex-wrap">
      {colors.map((c) => {
        const isHex = /^#([0-9A-F]{3}){1,2}$/i.test(c);
        return (
          <button
            key={c}
            onClick={() => onChange(c)}
            className={`relative  px-4 cursor-pointer rounded-full border-2 transition-all duration-150 ${selected === c
              ? "ring-2 ring-primary"
              : "border-gray-300 hover:ring-1 hover:ring-primary"
              }`}
            style={isHex ? { backgroundColor: c } : undefined}
            aria-label={`color-${c}`}
            title={c}
          >
            {!isHex && (
              <span className={`text-xs font-semibold ${selected === c ? "font-bold" : "text-gray-700"}`}>
                {c}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
function RefreshIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5 text-primary">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
    </svg>
  );
}



// ── URL → Embed URL Converter ────────────────────────────────────────────────
/**
 * Converts standard watch URLs into embeddable iframe src URLs.
 * - YouTube: /watch?v=ID → /embed/ID
 * - YouTube short: youtu.be/ID → /embed/ID
 * - TikTok: /video/ID → /embed/v2/ID
 * - Others: returned as-is (use Instagram's native embed URL)
 */
function toEmbedUrl(url: string): string {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtube.com") && u.searchParams.get("v")) {
      return `https://www.youtube.com/embed/${u.searchParams.get("v")}?rel=0&modestbranding=1`;
    }
    if (u.hostname === "youtu.be") {
      return `https://www.youtube.com/embed${u.pathname}?rel=0&modestbranding=1`;
    }
    if (u.hostname.includes("tiktok.com")) {
      const videoId = u.pathname.split("/video/")[1]?.split("?")[0];
      if (videoId) return `https://www.tiktok.com/embed/v2/${videoId}`;
    }
  } catch { /* invalid URL — pass through */ }
  return url;
}

// Helper to check if a URL points to a video
const isVideoUrl = (url: string) => {
  if (!url) return false;
  return url.includes("/video/upload/") || url.endsWith(".mp4") || url.endsWith(".webm") || url.endsWith(".mov") || url.endsWith(".avi");
};

// ── Image Gallery ─────────────────────────────────────────────────────────────
function ImageGallery({ images = [], name }: { images: string[]; name: string }) {
  const [activeIndex, setActiveIndex] = useState(0);

  // Filter out invalid/empty/whitespace-only image URLs
  const displayImages = images?.filter((img) => img && img.trim() !== "") || [];
  if (displayImages.length === 0) {
    displayImages.push("/placeholder.png");
  }

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Main large media (Image or Video) */}
      <div className="relative w-full aspect-4/5 rounded-xl overflow-hidden bg-gray-100 shadow-sm flex items-center justify-center">
        {isVideoUrl(displayImages[activeIndex]) ? (
          <video
            src={displayImages[activeIndex]}
            controls
            className="w-full h-full object-cover"
          />
        ) : (
          <Image
            key={activeIndex}
            src={displayImages[activeIndex] || "/placeholder.png"}
            alt={name}
            fill
            className="object-cover transition-opacity duration-300"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
        )}
        {/* Badge */}
        <div className="absolute top-3 left-3 bg-primary text-(--primary-text) text-xs font-bold px-2 py-1 rounded z-10">
          SALE
        </div>
      </div>

      {/* Thumbnail row */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {displayImages.map((img, idx) => (
          <button
            key={idx}
            onClick={() => setActiveIndex(idx)}
            className={`relative w-16 h-20 md:w-20 md:h-24 shrink-0 rounded-lg overflow-hidden border-2 transition-all duration-200 ${activeIndex === idx
                ? "border-primary shadow-md scale-105"
                : "border-gray-200 hover:border-gray-400"
              }`}
          >
            {isVideoUrl(img) ? (
              <div className="w-full h-full bg-gray-50 flex flex-col items-center justify-center relative">
                <video src={img} className="w-full h-full object-cover opacity-80" muted />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-white">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
            ) : (
              <Image
                src={img}
                alt={`${name} view ${idx + 1}`}
                fill
                className="object-cover"
                sizes="80px"
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}




// ── Quantity Selector ─────────────────────────────────────────────────────────
function QuantitySelector({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden w-fit">
      <button
        onClick={() => onChange(Math.max(1, value - 1))}
        className="px-4 py-2.5 text-gray-600 hover:bg-gray-100 font-bold text-lg transition-colors"
      >
        −
      </button>
      <span className="px-5 py-2.5 font-semibold text-gray-800 border-x border-gray-300 min-w-12 text-center">
        {value}
      </span>
      <button
        onClick={() => onChange(value + 1)}
        className="px-4 py-2.5 text-gray-600 hover:bg-gray-100 font-bold text-lg transition-colors"
      >
        +
      </button>
    </div>
  );
}



// ── Size Selector ─────────────────────────────────────────────────────────────
function SizeSelector({
  selected,
  onChange,
  sizes,
}: {
  selected: string;
  onChange: (s: string) => void;
  sizes?: string[];
}) {
  const list = sizes && sizes.length ? sizes : SIZE_CHART.map((r) => r.size);
  return (
    <div className="flex gap-2 flex-wrap">
      {list.map((size) => (
        <button
          key={size}
          onClick={() => onChange(size)}
          className={`w-12 h-12 rounded-lg border-2 font-semibold text-sm transition-all duration-200 ${selected === size
              ? "border-primary bg-primary text-(--primary-text) shadow"
              : "border-gray-300 text-gray-700 hover:border-primary hover:text-primary"
            }`}
        >
          {size}
        </button>
      ))}
    </div>
  );
}



// ── Main Component ─────────────────────────────────────────────────────────────
export default function ProductDetails({
  product,
}: {
  product: Product;
}) {
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] || "");
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || "");
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<"description" | "size" | "care">("description");

  const { addToCart } = useContext(OrderContext);

  const handleOrderNow = () => {
    addToCart(product, quantity, selectedSize, selectedColor);
  };

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <main className="bg-white min-h-screen">
      {/* ── Breadcrumb ── */}
      <div className="max-w-6xl mx-auto px-4 py-4">
        <nav className="flex items-center gap-2 text-sm text-gray-500">
          <Link
            href="/"
            className="hover:text-primary transition-colors flex items-center gap-1"
          >
            <ChevronLeft />
            হোমপেজ
          </Link>
          <span>/</span>
          <span className="text-gray-800 font-medium truncate max-w-50">
            {product.name}
          </span>
        </nav>
      </div>

      {/* ── Product Section ── */}
      <section className="max-w-6xl mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {/* LEFT: Image Gallery */}
          <ImageGallery images={[product.thumbnail, ...(product.images || [])]} name={product.name} />

          {/* RIGHT: Product Details */}
          <div className="flex flex-col gap-5">
            {/* Name */}
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
                {product.name}
              </h1>

              {/* Stars */}
              {/* <div className="flex items-center gap-2 mt-2">
                                <div className="flex items-center gap-0.5">
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <StarIcon key={i} filled={i <= 4} />
                                    ))}
                                </div>
                                <span className="text-sm text-gray-500">(৪.০) · ১২৮টি রিভিউ</span>
                            </div> */}
            </div>

            {/* Price */}
            <div className="flex gap-4 items-center">
              <span className="text-3xl font-bold text-primary">
                ৳{product.price}
              </span>
              {product.originalPrice && (
                <span className="text-xl text-gray-400 line-through">
                  ৳{product.originalPrice}
                </span>
              )}
              {product.originalPrice && (
                <span className="bg-red-100 text-red-600 text-sm font-bold px-2 py-0.5 rounded">
                  {discount}% ছাড়
                </span>
              )}
            </div>

            <hr className="border-gray-100" />

            {/* Size */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="font-semibold text-gray-800">সাইজ বেছে নিন</p>
                <button
                  onClick={() => {
                    setActiveTab("size");
                    setTimeout(() => {
                      document.getElementById("product-info-tabs")?.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                      });
                    }, 0);
                  }}
                  className="text-sm text-primary hover:underline"
                >
                  সাইজ গাইড →
                </button>
              </div>
              <SizeSelector
                selected={selectedSize}
                onChange={setSelectedSize}
                sizes={product.sizes}
              />

              {/* color selection */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-3">
                  <p className="font-semibold text-gray-800">
                    কালার বেছে নিন
                  </p>
                </div>
                <ColorSelector
                  colors={product.colors}
                  selected={selectedColor}
                  onChange={setSelectedColor}
                />
              </div>
            </div>

            {/* Quantity */}
            <div>
              <p className="font-semibold text-gray-800 mb-3">পরিমাণ</p>
              <QuantitySelector value={quantity} onChange={setQuantity} />
            </div>

            {(() => {
              const charges = product?.deliveryCharge || [];
              const inside = charges.find((d) => d.text.toLowerCase().includes("inside"))?.price ?? 50;
              const outside = charges.find((d) => d.text.toLowerCase().includes("outside"))?.price ?? 150;
              return (
                <div className="text-black/50 border border-primary/70 p-5 rounded-2xl text-sm">
                  <p className="flex gap-2 items-center">
                    <Truck size={20} /> ঢাকার ভেতরে ডেলিভারি চার্জ:{" "}
                    <span className="font-bold text-black">৳{inside}</span> টাকা
                  </p>
                  <p className="flex gap-2 items-center">
                    <Truck size={20} /> ঢাকার বাহিরে ডেলিভারি চার্জ:{" "}
                    <span className="font-bold text-black">৳{outside}</span> টাকা
                  </p>
                </div>
              );
            })()}

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/#billing"
                onClick={handleOrderNow}
                className="flex-1 py-4 rounded-xl font-bold text-base bg-primary text-(--primary-text) hover:bg-primary/90 text-center transition-all duration-200 animate-cta-bounce"
              >
                🔒 এখনই অর্ডার করুন
              </Link>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3 text-(--primary-text)">
              {[
                { icon: <ShieldIcon />, label: "100% অরিজিনাল" },
                { icon: <TruckIcon />, label: "ফ্রি ডেলিভারি" },
                { icon: <RefreshIcon />, label: "৭ দিন রিটার্ন" },
              ].map((badge, idx) => (
                <div
                  key={idx}
                  className="flex flex-col items-center gap-1 bg-primary/20 rounded-lg p-3 text-center border border-primary/70 text-(--primary-text)"
                >
                  <div className="text-(--primary-text)!">{badge.icon}</div>
                  <span className="text-xs font-medium leading-tight text-black">
                    {badge.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Fabric & fit quick info */}
            {(product.fabric || product.fit) && (
              <div className="flex gap-4 text-sm text-gray-600 bg-gray-50 rounded-lg px-4 py-3">
                {product.fabric && (
                  <span>
                    <span className="font-semibold text-gray-800">
                      ফেব্রিক:
                    </span>{" "}
                    {product.fabric}
                  </span>
                )}
                {product.fit && (
                  <>
                    <span className="text-gray-300">|</span>
                    <span>
                      <span className="font-semibold text-gray-800">
                        ফিট:
                      </span>{" "}
                      {product.fit}
                    </span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Tabs: Description / Size Chart / Care ── */}
        <div id="product-info-tabs" className="mt-12 border border-gray-200 rounded-xl overflow-hidden">
          {/* Tab headers */}
          <div className="flex border-b border-gray-200">
            {(["description", "size", "care"] as const).map((tab) => {
              const labels = {
                description: "বিবরণ",
                size: "সাইজ চার্ট",
                care: "যত্নবিধি",
              };
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-4 text-sm font-semibold transition-colors duration-200 ${activeTab === tab
                      ? "bg-primary text-(--primary-text)"
                      : "bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                >
                  {labels[tab]}
                </button>
              );
            })}
          </div>

          {/* Tab content */}
          <div className="p-6">
            {activeTab === "description" && (
              <div className="flex flex-col gap-4">
                <p className="text-gray-600 leading-relaxed">
                  {product.description}
                </p>
                {product.highlights && (
                  <ul className="flex flex-col gap-2 mt-2">
                    {product.highlights.map((h, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckIcon />
                        <span className="text-gray-700 text-sm">{h}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {activeTab === "size" && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#1a2332] text-white">
                      {["Size", "Chest", "Length", "Shoulder", "Sleeve"].map(
                        (h) => (
                          <th
                            key={h}
                            className="px-4 py-3 text-left font-semibold"
                          >
                            {h}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {SIZE_CHART.map((row, idx) => (
                      <tr
                        key={row.size}
                        className={`border-b border-gray-100 ${idx % 2 === 0 ? "bg-white" : "bg-gray-50"} ${selectedSize === row.size ? "ring-2 ring-inset ring-primary" : ""}`}
                      >
                        <td className="px-4 py-3">
                          <span
                            className={`inline-block text-xs font-bold px-2 py-0.5 rounded ${selectedSize === row.size ? "bg-primary text-(--primary-text)" : "bg-gray-200 text-gray-700"}`}
                          >
                            {row.size}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {row.chest}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {row.length}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {row.shoulder}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {row.sleeve}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="text-xs text-gray-400 mt-3">
                  * আপনার বর্তমান সিলেক্ট করা সাইজ হাইলাইট করা হয়েছে।
                </p>
              </div>
            )}

            {activeTab === "care" && product.careInstructions && (
              <ul className="flex flex-col gap-3">
                {product.careInstructions.map((instruction, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary text-(--primary-text) text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="text-gray-700">{instruction}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      {/* ── Remote Video Section ── */}
      {product.videoUrl && (
        <section className="max-w-6xl mx-auto px-4 pb-16">
          {/* Section header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-primary">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Product Video</h2>
              <p className="text-sm text-gray-500">Watch this product in action</p>
            </div>
          </div>

          {/* Responsive 16:9 iframe wrapper */}
          <div className="relative w-full rounded-2xl overflow-hidden shadow-lg bg-black" style={{ paddingBottom: "56.25%" }}>
            <iframe
              src={toEmbedUrl(product.videoUrl)}
              title={`${product.name} product video`}
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              loading="lazy"
            />
          </div>
        </section>
      )}

    </main>
  );
}
