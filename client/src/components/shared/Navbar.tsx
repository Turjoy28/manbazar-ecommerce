"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Sparkles } from "lucide-react";

interface NavbarProps {
  banner: {
    logo?: string;
    title?: string;
    bannerImage?: string;
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
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* 1. Left Portion: Home Button */}
        <div className="shrink-0">
          <Link
            href="/"
            onClick={handleHomeClick}
            className="flex items-center gap-2 text-secondary hover:text-primary transition-all duration-200 font-semibold text-base md:text-lg py-1.5 px-3.5 rounded-lg hover:bg-amber-100/30 border border-transparent hover:border-amber-200/35 active:scale-95"
          >
            <Home className="h-5 w-5 text-primary" />
            <span>হোম</span>
          </Link>
        </div>

        {/* 2. Middle Portion: Sliding Marquee Text Box (Right to Left) */}
        {marqueeText && (
          <div className="flex-1 mx-2 sm:mx-4 max-w-[200px] sm:max-w-md md:max-w-lg lg:max-w-xl bg-amber-100/40 text-amber-950 border border-amber-200/80 px-4 py-2.5 rounded-lg text-sm md:text-[15px] font-bold shadow-2xs overflow-hidden select-none relative">
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

        {/* 3. Right Portion: Announcement/Notice Box from Admin */}
        {noticeText && (
          <a
            href={`tel:${noticeText}`}
            className="shrink-0 flex items-center gap-2 bg-primary/8 text-primary border border-primary/20 px-4 py-2 rounded-full text-xs md:text-sm font-bold shadow-xs transition-all duration-300 hover:bg-primary/20 cursor-pointer"
            title="Click to call"
          >
            <span className="flex h-2 w-2 relative shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <Sparkles className="h-3.5 w-3.5 text-primary/90 shrink-0" />
            <span className="truncate select-none font-sans max-w-[120px] sm:max-w-[200px] md:max-w-[280px] tracking-wide">
              হটলাইন নম্বর: {noticeText}
            </span>
          </a>
        )}
      </div>
    </header>
  );
}
