"use client";

import Link from "next/link";
import { Home, Sparkles } from "lucide-react";

interface NavbarProps {
  banner: {
    logo?: string;
    title?: string;
    bannerImage?: string;
    navbarText?: string;
  };
}

export default function Navbar({ banner }: NavbarProps) {
  const noticeText = banner?.navbarText?.trim() || "";

  return (
    <header className="sticky top-0 z-50 w-full bg-[#FCFBF2] border-b border-amber-100/80 shadow-xs transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Left Portion: Home Button */}
        <div>
          <Link
            href="/"
            className="flex items-center gap-2 text-secondary hover:text-primary transition-all duration-200 font-semibold text-base md:text-lg py-1.5 px-3.5 rounded-lg hover:bg-amber-100/30 border border-transparent hover:border-amber-200/35 active:scale-95"
          >
            <Home className="h-5 w-5 text-primary" />
            <span>হোম</span>
          </Link>
        </div>

        {/* Right Portion: Announcement/Notice Box from Admin */}
        {noticeText && (
          <div className="flex items-center gap-2 bg-primary/8 text-primary border border-primary/15 px-4 py-2 rounded-full text-xs md:text-sm font-medium max-w-[200px] sm:max-w-[320px] md:max-w-lg lg:max-w-2xl shadow-xs transition-all duration-300 animate-fade-in">
            <span className="flex h-2 w-2 relative shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <Sparkles className="h-3.5 w-3.5 text-primary/80 shrink-0" />
            <span className="truncate select-none font-sans" title={noticeText}>
              {noticeText}
            </span>
          </div>
        )}
      </div>
    </header>
  );
}
