"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Phone, Truck } from "lucide-react";

interface NavbarProps {
  banner: {
    logo?: string;
    title?: string;
    bannerImage?: string;
    logoText?: string;
    navbarText?: string;
    marqueeText?: string;
  };
}

export default function Navbar({ banner }: NavbarProps) {
  const pathname = usePathname();
  const noticeText = banner?.navbarText?.trim() || "";
  const marqueeText = banner?.marqueeText?.trim() || "";

  const handleHomeClick = (e: React.MouseEvent) => {
    if (pathname === "/") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-[#FCFBF2] border-b border-amber-100/80 shadow-xs transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 min-h-[64px] py-2 md:py-0 flex flex-wrap md:flex-nowrap items-center justify-between gap-2 md:gap-4">
        {/* 1. Left Portion: Logo Button */}
        <div className="shrink-0">
          <Link
            href="/"
            onClick={handleHomeClick}
            className="flex items-center gap-2.5 hover:opacity-80 transition-opacity active:scale-95"
          >
            {banner?.logo && (
              <img
                src={banner.logo}
                alt="Manbazar Logo"
                className="h-10 md:h-12 w-auto object-contain drop-shadow-sm"
              />
            )}
            <span className="font-black text-2xl md:text-[28px] text-primary tracking-tighter drop-shadow-sm" style={{ fontFamily: 'var(--font-heading, inherit)' }}>
              {banner?.logoText || "Manbazar"}
            </span>
          </Link>
        </div>

        {/* 2. Middle Portion: Sliding Marquee Text Box (Right to Left) */}
        {marqueeText && (
          <div className="w-full order-last md:order-none mt-3 md:mt-0 md:flex-1 mx-0 md:mx-4 md:max-w-lg lg:max-w-xl bg-amber-100/40 text-amber-950 border border-amber-200/80 px-4 py-2.5 rounded-lg text-sm md:text-[15px] font-bold shadow-2xs overflow-hidden select-none relative">
            <style>{`
              @keyframes navMarqueeRL {
                0% { transform: translateX(100%); }
                100% { transform: translateX(-100%); }
              }
              .marquee-content-rl {
                display: inline-block;
                white-space: nowrap;
                width: max-content;
                animation: navMarqueeRL 16s linear infinite;
              }
            `}</style>
            <div className="overflow-hidden w-full relative flex items-center">
              <span className="marquee-content-rl font-sans tracking-wide">
                {marqueeText}
              </span>
            </div>
          </div>
        )}

        {/* 3. Right Portion: Announcement/Notice Box from Admin & Track Button */}
        <div className="shrink-0 flex items-center gap-2 lg:gap-3">
          <Link
            href="/track"
            className="flex items-center gap-1.5 md:gap-2 bg-white text-gray-700 border border-gray-200 px-3 md:px-4 py-2 rounded-full text-xs md:text-sm font-bold shadow-xs transition-all duration-300 hover:bg-gray-50 hover:border-gray-300 hover:text-primary active:scale-95"
          >
            <Truck className="h-3.5 w-3.5 md:h-4 md:w-4" />
            <span className="hidden sm:inline">অর্ডার ট্র্যাক</span>
            <span className="sm:hidden">ট্র্যাক</span>
          </Link>

          {noticeText && (
            <a
              href={`tel:${noticeText}`}
              className="flex items-center gap-2 bg-primary/8 text-primary border border-primary/20 px-4 py-2 rounded-full text-xs md:text-sm font-bold shadow-xs transition-all duration-300 hover:bg-primary/20 cursor-pointer"
              title="Click to call"
            >
              <Phone className="h-3.5 w-3.5 text-primary/90 shrink-0" />
              <span className="truncate select-none font-sans max-w-[120px] sm:max-w-[200px] md:max-w-[280px] tracking-wide">
                {noticeText}
              </span>
            </a>
          )}
        </div>
      </div>
    </header>
  );
}
