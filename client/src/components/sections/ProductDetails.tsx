"use client"; // Trigger client rebuild

import { useContext, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product, ProductVariant } from "@/types";
import { SIZE_CHART } from "@/data";
import { OrderContext } from "@/providers/OrderProvider";
import { Truck, ThumbsUp, Banknote, PhoneCall, MessageCircle } from 'lucide-react';
import { getUiData } from "@/services/ui";

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


// ── Color Selector (Legacy flat colors[] fallback) ───────────────────────────
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

// ── Variant Color Selector (New hex-based swatch system) ─────────────────────
function VariantColorSelector({
  variants,
  selectedVariantId,
  onSelect,
}: {
  variants: ProductVariant[];
  selectedVariantId: string | undefined;
  onSelect: (v: ProductVariant) => void;
}) {
  return (
    <div className="flex gap-3 items-center flex-wrap">
      {variants.map((v) => {
        const isSelected = v._id === selectedVariantId || (!selectedVariantId && variants[0]?._id === v._id);
        return (
          <button
            key={v._id || v.color.name}
            onClick={() => onSelect(v)}
            title={v.color.name}
            aria-label={`color-${v.color.name}`}
            className={`relative w-6 h-6 md:w-8 md:h-8 rounded-full border-2 cursor-pointer transition-all duration-150 focus:outline-none ${isSelected
              ? "ring-2 ring-offset-2 ring-primary border-primary scale-110 shadow-md"
              : "border-gray-300 hover:scale-105 hover:border-primary/60"
              }`}
            style={{ backgroundColor: v.color.hex || "#e5e7eb" }}
          >
            {/* Checkmark for selected */}
            {isSelected && (
              <span className="absolute inset-0 flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={3} className="w-3.5 h-3.5 drop-shadow">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
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
function ImageGallery({
  images = [],
  name,
  activeIndex,
  setActiveIndex,
  offerBadgeText
}: {
  images: string[];
  name: string;
  activeIndex: number;
  setActiveIndex: (index: number) => void;
  offerBadgeText?: string | null;
}) {
  const [isZooming, setIsZooming] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });

  // Filter out invalid/empty/whitespace-only image URLs
  const displayImages = images?.filter((img) => img && img.trim() !== "") || [];
  if (displayImages.length === 0) {
    displayImages.push("/placeholder.png");
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x, y });
  };

  const handleMouseEnter = () => {
    // Only enable zoom for images, not videos
    if (!isVideoUrl(displayImages[activeIndex])) {
      setIsZooming(true);
    }
  };

  const handleMouseLeave = () => {
    setIsZooming(false);
    setZoomPosition({ x: 50, y: 50 });
  };

  return (
    <div className="flex flex-col gap-1.5 md:gap-3 w-full">
      {/* Main large media (Image or Video) with zoom on hover */}
      <div
        className="relative w-full aspect-[4/3] md:aspect-4/5 rounded-xl overflow-hidden bg-gray-100 shadow-sm flex items-center justify-center cursor-crosshair"
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {isVideoUrl(displayImages[activeIndex]) ? (
          <video
            src={displayImages[activeIndex]}
            controls
            className="w-full h-full object-contain md:object-cover"
          />
        ) : (
          <Image
            key={activeIndex}
            src={displayImages[activeIndex] || "/placeholder.png"}
            alt={name}
            fill
            className="object-contain md:object-cover transition-transform duration-200 ease-out"
            style={
              isZooming
                ? {
                  transform: "scale(2.5)",
                  transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                }
                : {
                  transform: "scale(1)",
                  transformOrigin: "center center",
                }
            }
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
        )}
        {/* Badge */}
        {offerBadgeText && (
          <div className={`absolute top-2 right-2 md:hidden bg-red-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-sm shadow-md z-10 uppercase tracking-wider transition-opacity duration-200 ${isZooming ? 'opacity-0' : 'opacity-100'}`}>
            {offerBadgeText}
          </div>
        )}
      </div>

      {/* All images grid — always visible, shows all photos for active variant */}
      <div className="flex flex-wrap gap-1.5 md:gap-2">
        {displayImages.map((img, idx) => (
          <button
            key={idx}
            onClick={() => setActiveIndex(idx)}
            className={`relative w-12 h-14 md:w-20 md:h-24 shrink-0 rounded-lg overflow-hidden border-2 transition-all duration-200 ${activeIndex === idx
              ? "border-primary shadow-md ring-2 ring-primary/30 scale-105"
              : "border-gray-200 hover:border-primary/60 hover:shadow-sm"
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
                sizes="(max-width: 768px) 80px, 100px"
              />
            )}
            {/* Active overlay indicator */}
            {activeIndex === idx && (
              <div className="absolute inset-0 bg-primary/10 pointer-events-none" />
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
  max,
}: {
  value: number;
  onChange: (v: number) => void;
  max?: number;
}) {
  return (
    <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden w-fit">
      <button
        onClick={() => onChange(Math.max(1, value - 1))}
        className="px-2 py-0.5 md:px-4 md:py-2.5 text-gray-600 hover:bg-gray-100 font-bold text-sm md:text-lg transition-colors"
      >
        −
      </button>
      <span className="px-2 py-0.5 md:px-5 md:py-2.5 font-semibold text-gray-800 border-x border-gray-300 min-w-8 md:min-w-12 text-center text-xs md:text-base">
        {value}
      </span>
      <button
        onClick={() => {
          if (max !== undefined && value >= max) return;
          onChange(value + 1);
        }}
        className="px-2 py-0.5 md:px-4 md:py-2.5 text-gray-600 hover:bg-gray-100 font-bold text-sm md:text-lg transition-colors"
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
          className={`w-7 h-7 md:w-12 md:h-12 rounded-md md:rounded-lg border-2 font-semibold text-[10px] md:text-sm transition-all duration-200 ${selected === size
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
  const hasVariants = Array.isArray(product.variants) && product.variants.length > 0;

  // ── Selected Variant State ─────────────────────────────────────────────────
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    hasVariants ? (product.variants![0]) : null
  );
  // ── Legacy color state (used only when no variants exist) ─────────────────
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] || "");

  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || "");
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<"description" | "size" | "care">("description");
  const [contactNumber, setContactNumber] = useState("+8801577498985");
  const [bkashNumber, setBkashNumber] = useState("");
  const [nagadNumber, setNagadNumber] = useState("");
  const [whatsappLink, setWhatsappLink] = useState("");
  const [messengerLink, setMessengerLink] = useState("");
  const [dynamicChart, setDynamicChart] = useState<{ tableTitle: string[], tableProperties: string[][] } | null>(null);

  // Lifted gallery state
  const [activeIndex, setActiveIndex] = useState(0);

  // Derived: ALL images from ALL variants
  const galleryImages: string[] = (() => {
    let imgs: string[] = [];
    if (hasVariants) {
      product.variants!.forEach(v => {
        imgs = [...imgs, ...(v.images || []).filter(Boolean)];
      });
    } else {
      imgs = [product.thumbnail, ...(product.images || [])].filter(Boolean);
    }
    if (imgs.length === 0) imgs.push("/placeholder.png");
    return imgs;
  })();

  // Handle color selection: update variant AND scroll gallery to its first image
  const handleSelectVariant = (v: ProductVariant) => {
    setSelectedVariant(v);
    if (v.images && v.images.length > 0) {
      const firstImg = v.images[0];
      const idx = galleryImages.indexOf(firstImg);
      if (idx !== -1) {
        setActiveIndex(idx);
      }
    }
  };

  // Handle image thumbnail click: update active image AND find matching variant
  const handleImageClick = (idx: number) => {
    setActiveIndex(idx);
    if (hasVariants && product.variants) {
      const clickedImg = galleryImages[idx];
      const matchingVariant = product.variants.find((v) => v.images?.includes(clickedImg));
      if (matchingVariant && matchingVariant._id !== selectedVariant?._id) {
        setSelectedVariant(matchingVariant);
      }
    }
  };

  // Derived: current active color name for display
  const activeColorName = hasVariants && selectedVariant
    ? selectedVariant.color.name
    : selectedColor;

  useEffect(() => {
    getUiData().then(res => {
      if (res?.data?.[0]?.footer?.contactInfo?.number) {
        setContactNumber(res.data[0].footer.contactInfo.number);
      }
      if (res?.data?.[0]?.footer?.contactInfo?.bkashNumber) {
        setBkashNumber(res.data[0].footer.contactInfo.bkashNumber);
      }
      if (res?.data?.[0]?.footer?.contactInfo?.nagadNumber) {
        setNagadNumber(res.data[0].footer.contactInfo.nagadNumber);
      }
      if (res?.data?.[0]?.chatbot?.whatsapp) {
        setWhatsappLink(res.data[0].chatbot.whatsapp);
      }
      if (res?.data?.[0]?.chatbot?.messenger) {
        setMessengerLink(res.data[0].chatbot.messenger);
      }
      if (res?.data?.[0]?.chart?.chartTable?.tableTitle?.length) {
        setDynamicChart(res.data[0].chart.chartTable);
      }
    }).catch(console.error);
  }, []);

  const { addToCart, cartItems } = useContext(OrderContext);

  const handleOrderNow = () => {
    if (hasVariants && selectedVariant) {
      addToCart(product, quantity, selectedSize, selectedVariant.color.name, selectedVariant);
    } else {
      addToCart(product, quantity, selectedSize, selectedColor);
    }
  };

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  // Calculate active prices based on selected variant
  let activePrice = product.price;
  let activeOriginalPrice = product.originalPrice;

  if (hasVariants && selectedVariant) {
    if (selectedVariant.sale_price != null && selectedVariant.sale_price > 0) {
      activePrice = selectedVariant.sale_price;
      activeOriginalPrice = selectedVariant.price != null && selectedVariant.price > 0
        ? selectedVariant.price
        : (product.originalPrice || product.price);
    } else if (selectedVariant.price != null && selectedVariant.price > 0) {
      activePrice = selectedVariant.price;
      activeOriginalPrice = undefined; // No strikethrough if only base price is set
    }
  }

  const availableStock = hasVariants && selectedVariant ? (selectedVariant.stock ?? 0) : (product.stock ?? 0);

  const currentCartQty = cartItems
    .filter(item => {
      if (item.product._id !== product._id) return false;
      if (hasVariants) return item.color === activeColorName;
      return true; // No variants = shared global stock across all sizes and colors
    })
    .reduce((sum, item) => sum + item.quantity, 0);

  const remainingStock = availableStock - currentCartQty;
  const isOutOfStock = remainingStock <= 0;

  useEffect(() => {
    if (quantity > remainingStock && remainingStock > 0) {
      setQuantity(remainingStock);
    }
  }, [remainingStock, quantity]);

  const stockText = remainingStock <= 0
    ? "স্টক শেষ"
    : remainingStock <= 5
      ? `মাত্র ${remainingStock}টি বাকি!`
      : `${remainingStock}টি স্টকে আছে`;

  const stockColor = remainingStock <= 0
    ? "text-red-500"
    : remainingStock <= 5
      ? "text-orange-500"
      : "text-green-600";

  const offerBadgeText = product.is_on_sale ? (
    product.offerType === "PERCENTAGE" && product.offerValue ? (
      `${product.offerValue}% OFF`
    ) : product.offerType === "DIRECT" && product.offerValue ? (
      `৳${product.offerValue} OFF`
    ) : product.originalPrice && product.originalPrice > product.price ? (
      `${Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF`
    ) : (
      "SALE"
    )
  ) : null;

  return (
    <main className="bg-white min-h-screen">
      {/* ── Breadcrumb ── */}
      <div className="max-w-[1400px] mx-auto px-2 md:px-4 xl:px-8 py-1 md:py-4">
        <nav className="flex items-center gap-1.5 md:gap-2 text-[10px] md:text-sm text-gray-500">
          <Link
            href="/"
            className="hover:text-primary transition-colors flex items-center gap-0.5 md:gap-1"
          >
            <span className="scale-75 md:scale-100"><ChevronLeft /></span>
            হোমপেজ
          </Link>
          <span>/</span>
          <span className="text-gray-800 font-medium truncate max-w-50">
            {product.name}
          </span>
        </nav>
      </div>

      {/* ── Product Section ── */}
      <section className="max-w-[1400px] mx-auto px-2 md:px-4 xl:px-8 pb-3 md:pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 md:gap-8 lg:gap-10 xl:gap-12">
          {/* LEFT: Image Gallery */}
          <div className="lg:col-span-5">
            <ImageGallery
              images={galleryImages}
              name={product.name}
              activeIndex={activeIndex}
              setActiveIndex={handleImageClick}
              offerBadgeText={offerBadgeText}
            />
          </div>

          {/* MIDDLE: Product Details */}
          <div className="lg:col-span-4 flex flex-col gap-1.5 md:gap-5 w-full">
            {/* Desktop Offer Badge */}
            {offerBadgeText && (
              <div className="mb-0.5 md:mb-2 hidden md:block">
                <span className="inline-flex bg-red-500 text-white text-xs font-extrabold px-3 py-1 rounded-lg shadow-md uppercase tracking-wider">
                  {offerBadgeText}
                </span>
              </div>
            )}

            {/* Name & Price Row */}
            <div className="flex justify-between items-start md:flex-col gap-x-2 gap-y-0.5 md:gap-4 pr-10 md:pr-0">
              <h1 className="text-base md:text-3xl font-bold text-gray-900 leading-tight">
                {product.name}
                <span className="inline-block ml-2 text-[10px] md:text-lg text-gray-400 font-medium tracking-wider align-middle md:align-baseline">
                  Id:#{product._id?.slice(-6).toUpperCase()}
                </span>
              </h1>

              {/* Price */}
              <div className="flex flex-row gap-1.5 md:gap-4 items-center shrink-0 mt-0.5 md:mt-0">
                <span className="text-base md:text-3xl font-bold text-primary">
                  ৳{activePrice}
                </span>
                {activeOriginalPrice && activeOriginalPrice > activePrice && (
                  <span className="text-[10px] md:text-xl text-gray-400 line-through mt-0.5 md:mt-0">
                    ৳{activeOriginalPrice}
                  </span>
                )}
              </div>
            </div>

            <hr className="border-gray-100 hidden md:block" />

            {/* Size */}
            <div>
              <div className="flex items-center justify-between mb-1.5 md:mb-3">
                <p className="font-semibold text-gray-800 text-xs md:text-base">সাইজ বেছে নিন</p>
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
                  className="text-[10px] md:text-sm text-primary hover:underline"
                >
                  সাইজ গাইড →
                </button>
              </div>
              <SizeSelector
                selected={selectedSize}
                onChange={setSelectedSize}
                sizes={product.sizes}
              />

              {/* Color / Variant selection */}
              <div className="mt-2 md:mt-6">
                <div className="flex items-center justify-between mb-1.5 md:mb-3">
                  <p className="font-semibold text-gray-800 text-xs md:text-base">কালার বেছে নিন</p>
                  {activeColorName && (
                    <span className="text-[10px] md:text-sm text-gray-500 font-medium">{activeColorName}</span>
                  )}
                </div>
                {hasVariants ? (
                  <>
                    <VariantColorSelector
                      variants={product.variants!}
                      selectedVariantId={selectedVariant?._id}
                      onSelect={handleSelectVariant}
                    />
                  </>
                ) : (
                  <ColorSelector
                    colors={product.colors}
                    selected={selectedColor}
                    onChange={setSelectedColor}
                  />
                )}
              </div>
            </div>

            {/* Quantity */}
            <div>
              <div className="flex items-center justify-between mb-1.5 md:mb-3">
                <p className="font-semibold text-gray-800 text-xs md:text-base">পরিমাণ</p>
                <p className={`text-[10px] md:text-xs font-medium ${stockColor}`}>
                  {stockText}
                </p>
              </div>
              <QuantitySelector value={quantity} onChange={setQuantity} max={remainingStock} />
            </div>

            {/* Buttons */}
            <div className="flex flex-col gap-2 md:gap-3 w-full">
              {isOutOfStock ? (
                <button
                  disabled
                  className="w-full py-3 md:py-4 rounded-xl font-bold text-base bg-gray-300 text-gray-500 text-center cursor-not-allowed"
                >
                  স্টক শেষ (Out of Stock)
                </button>
              ) : (
                <Link
                  href="/#billing"
                  onClick={handleOrderNow}
                  className="w-full py-3 md:py-4 rounded-xl font-bold text-sm md:text-base bg-primary text-(--primary-text) hover:bg-primary/90 text-center transition-all duration-200 animate-cta-bounce"
                >
                  🔒 এখনই অর্ডার করুন
                </Link>
              )}

              <div className="grid grid-cols-3 gap-2 w-full">
                {whatsappLink && (
                  <a
                    href={whatsappLink.startsWith("http") ? whatsappLink : `https://${whatsappLink}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2 md:py-3 rounded-xl font-bold text-[9px] md:text-xs bg-[#25D366] text-white hover:bg-[#20b858] transition-all duration-200 flex flex-col items-center justify-center gap-1 shadow-sm text-center leading-tight"
                  >
                    <svg viewBox="0 0 24 24" className="w-4 h-4 md:w-5 md:h-5 fill-current">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.262 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.5-5.734-1.453L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.42 9.864-9.864.002-2.637-1.023-5.116-2.883-6.978C16.59 1.899 14.116.874 11.48.876c-5.437 0-9.861 4.42-9.865 9.864 0 1.902.499 3.76 1.449 5.36L2.052 22.15l6.196-1.626v-.001zm9.251-6.7c-.244-.122-1.441-.712-1.664-.794-.223-.081-.385-.122-.547.122-.162.244-.63.794-.771.955-.143.162-.285.183-.53.061-.243-.122-1.03-.38-1.962-1.21-.724-.647-1.213-1.447-1.355-1.69-.143-.244-.015-.376.107-.497.111-.11.244-.285.365-.426.122-.142.162-.244.244-.406.082-.162.041-.305-.021-.426-.062-.122-.547-1.32-.75-1.81-.197-.474-.397-.41-.547-.418-.142-.008-.305-.01-.468-.01-.162 0-.427.061-.65.305-.224.244-.854.834-.854 2.031 0 1.198.874 2.353.996 2.516.122.163 1.722 2.63 4.171 3.691.582.253 1.037.404 1.392.517.585.186 1.117.16 1.538.097.469-.071 1.442-.589 1.644-1.157.203-.568.203-1.056.142-1.157-.061-.101-.223-.162-.466-.284z" />
                    </svg>
                    <span>হোয়াটসঅ্যাপে<br className="block xl:hidden" /> অর্ডার করুন</span>
                  </a>
                )}
                {messengerLink && (
                  <a
                    href={messengerLink.startsWith("http") ? messengerLink : `https://${messengerLink}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2 md:py-3 rounded-xl font-bold text-[9px] md:text-xs bg-[#0084FF] text-white hover:bg-[#0074e0] transition-all duration-200 flex flex-col items-center justify-center gap-1 shadow-sm text-center leading-tight"
                  >
                    <MessageCircle className="w-4 h-4 md:w-5 md:h-5" />
                    <span>মেসেঞ্জারে<br className="block xl:hidden" /> অর্ডার করুন</span>
                  </a>
                )}
                {contactNumber && (
                  <a
                    href={`tel:${contactNumber}`}
                    className="w-full py-2 md:py-3 rounded-xl font-bold text-[9px] md:text-xs bg-gray-800 text-white hover:bg-gray-700 transition-all duration-200 flex flex-col items-center justify-center gap-1 shadow-sm text-center leading-tight"
                  >
                    <PhoneCall className="w-4 h-4 md:w-5 md:h-5" />
                    <span>কল করে<br className="block xl:hidden" /> অর্ডার করুন</span>
                  </a>
                )}
              </div>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-1.5 md:gap-3 text-(--primary-text)">
              {[
                { icon: <ShieldIcon />, label: "100% অরিজিনাল" },
                { icon: <TruckIcon />, label: "ফ্রি ডেলিভারি" },
                { icon: <RefreshIcon />, label: "৭ দিন রিটার্ন" },
              ].map((badge, idx) => (
                <div
                  key={idx}
                  className="flex flex-col items-center gap-0.5 md:gap-1 bg-primary/20 rounded-lg p-1 md:p-3 text-center border border-primary/70 text-(--primary-text)"
                >
                  <div className="text-(--primary-text)! scale-[0.6] md:scale-100">{badge.icon}</div>
                  <span className="text-[8px] md:text-xs font-medium leading-tight text-black">
                    {badge.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Fabric & fit quick info */}
            {(product.fabric || product.fit) && (
              <div className="flex gap-2 md:gap-4 text-[10px] md:text-sm text-gray-600 bg-gray-50 rounded-lg px-2 py-1.5 md:px-4 md:py-3">
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

          {/* RIGHT: Dashed Info Boxes */}
          <div className="lg:col-span-3 w-full shrink-0 flex flex-col gap-2 md:gap-5 mt-2 lg:mt-0">
            {/* Delivery Info Box (Dashed Border) */}
            {(() => {
              const charges = product?.deliveryCharge || [];
              const inside = charges.find((d) => d.text.toLowerCase().includes("inside"))?.price ?? 50;
              const outside = charges.find((d) => d.text.toLowerCase().includes("outside"))?.price ?? 150;
              const subcity = charges.find((d) => d.text.toLowerCase().includes("subcity"))?.price ?? 100;

              return (
                <div className="border border-dashed border-gray-500 rounded-lg p-1.5 md:p-3 text-[9px] md:text-[12px] space-y-1 md:space-y-2.5">
                  <p className="flex items-start gap-1 md:gap-2">
                    <CheckIcon />
                    <span className="text-gray-700 leading-snug">আজই অর্ডার করুন এবং ০১ - ০২ দিনের মধ্যে ডেলিভারি নিন।</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <ThumbsUp className="w-3.5 h-3.5 text-gray-700 shrink-0 mt-0.5" />
                    <span className="text-gray-700 leading-snug">গুণগত মানসম্পন্ন পণ্য।</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <Banknote className="w-3.5 h-3.5 text-gray-700 shrink-0 mt-0.5" />
                    <span className="text-gray-700 leading-snug">ক্যাশ অন ডেলিভারি সুবিধা।</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <Truck className="w-3.5 h-3.5 text-gray-700 shrink-0 mt-0.5" />
                    <span className="text-gray-700 leading-snug">ঢাকার ভিতরে ডেলিভারি চার্জ {inside} টাকা।</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <Truck className="w-3.5 h-3.5 text-gray-700 shrink-0 mt-0.5" />
                    <span className="text-gray-700 leading-snug">ঢাকার বাইরে ডেলিভারি চার্জ {outside} টাকা।</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <Truck className="w-3.5 h-3.5 text-gray-700 shrink-0 mt-0.5" />
                    <span className="text-gray-700 leading-snug">উপশহরে ডেলিভারি চার্জ {subcity} টাকা।</span>
                  </p>
                </div>
              );
            })()}

            {/* Contact Info Box (Dashed Border) */}
            <div className="border border-dashed border-gray-500 rounded-lg p-1.5 md:p-3 text-[9px] md:text-[12px]">
              <p className="text-gray-800 font-semibold mb-1 md:mb-2.5 leading-snug">
                এই পণ্যটি সম্পর্কে আপনার কোনো প্রশ্ন থাকলে অনুগ্রহ করে কল করুন
              </p>

              <div className="space-y-2">
                {contactNumber && (
                  <a href={`tel:${contactNumber}`} className="flex items-center gap-1.5 text-gray-700 hover:text-primary transition-colors">
                    <PhoneCall className="w-3.5 h-3.5 text-gray-600 shrink-0" />
                    <span>{contactNumber}</span>
                  </a>
                )}

                {bkashNumber && (
                  <a href={`tel:${bkashNumber}`} className="flex items-center gap-1.5 text-gray-700 hover:text-primary transition-colors flex-wrap">
                    <PhoneCall className="w-3.5 h-3.5 text-gray-600 shrink-0" />
                    <span>{bkashNumber}</span>
                    <span className="text-red-500 border border-dashed border-red-500 rounded px-1 py-0.5 text-[9px] font-medium shrink-0 tracking-wide">Bkash Personal</span>
                  </a>
                )}

                {nagadNumber && (
                  <a href={`tel:${nagadNumber}`} className="flex items-center gap-1.5 text-gray-700 hover:text-primary transition-colors flex-wrap">
                    <PhoneCall className="w-3.5 h-3.5 text-gray-600 shrink-0" />
                    <span>{nagadNumber}</span>
                    <span className="text-orange-500 border border-dashed border-orange-500 rounded px-1 py-0.5 text-[9px] font-medium shrink-0 tracking-wide">Nagad Personal</span>
                  </a>
                )}
              </div>
            </div>
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
                <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
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
                      {(dynamicChart?.tableTitle || ["Size", "Chest", "Length", "Shoulder", "Sleeve"]).map(
                        (h, idx) => (
                          <th
                            key={idx}
                            className="px-4 py-3 text-left font-semibold"
                          >
                            {h}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {dynamicChart?.tableProperties ? (
                      dynamicChart.tableProperties.map((row, idx) => (
                        <tr
                          key={idx}
                          className={`border-b border-gray-100 ${idx % 2 === 0 ? "bg-white" : "bg-gray-50"} ${selectedSize === row[0] ? "ring-2 ring-inset ring-primary" : ""}`}
                        >
                          {row.map((cell, cellIdx) => (
                            <td key={cellIdx} className={`px-4 py-3 ${cellIdx === 0 ? "" : "text-gray-600"}`}>
                              {cellIdx === 0 ? (
                                <span
                                  className={`inline-block text-xs font-bold px-2 py-0.5 rounded ${selectedSize === cell ? "bg-primary text-(--primary-text)" : "bg-gray-200 text-gray-700"}`}
                                >
                                  {cell}
                                </span>
                              ) : (
                                cell
                              )}
                            </td>
                          ))}
                        </tr>
                      ))
                    ) : (
                      SIZE_CHART.map((row, idx) => (
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
                      ))
                    )}
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
        <section className="max-w-[1400px] mx-auto px-4 xl:px-8 pb-16">
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
