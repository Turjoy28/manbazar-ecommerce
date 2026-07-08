"use client";

import { Globe, Mail, MapPin, Phone } from "lucide-react";
import Logo from "./Logo";

interface FooterProps {
  logo: any;
  footerInfo: any;
  chatbot?: {
    messenger?: string;
    facebook?: string;
    tiktok?: string;
    whatsapp?: string;
    youtube?: string;
    instagram?: string;
  };
}

export default function Footer({ logo, footerInfo, chatbot }: FooterProps) {
  const hasLinks = Boolean(chatbot?.facebook || chatbot?.tiktok || chatbot?.youtube || chatbot?.instagram);

  const formatExternalLink = (url: string | undefined) => {
    if (!url) return "";
    const trimmed = url.trim();
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      return trimmed;
    }
    return `https://${trimmed}`;
  };

  return (
    <footer className="bg-tertiary text-(--tertiary-text) mt-4 relative">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
          {/* 1. Brand & Logo */}
          <div className="max-w-xs space-y-1">
            <div className="scale-90 origin-left -mb-2">
              <Logo logo={logo} />
            </div>
            <p className="leading-5 text-xs md:text-sm opacity-90">
              {footerInfo?.shortDescription}
            </p>
          </div>

          {/* 2. Contact info */}
          <div className="space-y-1.5 mt-20 md:mt-10">
            <h3 className="underline font-bold text-xs uppercase tracking-wider opacity-90">Contact information</h3>
            <div className="space-y-1.5">
              {footerInfo?.contactInfo?.number && (
                <a href={`tel:${footerInfo.contactInfo.number}`} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                  <Phone className="h-4 w-4 shrink-0 opacity-80" />
                  <span className="font-sans text-xs md:text-sm">{footerInfo.contactInfo.number}</span>
                </a>
              )}
              {footerInfo?.contactInfo?.email && (
                <a href={`mailto:${footerInfo.contactInfo.email}`} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                  <Mail className="h-4 w-4 shrink-0 opacity-80" />
                  <span className="text-xs md:text-sm">{footerInfo.contactInfo.email}</span>
                </a>
              )}
              {footerInfo?.contactInfo?.website && (
                <a href={formatExternalLink(footerInfo.contactInfo.website)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer">
                  <Globe className="h-4 w-4 shrink-0 opacity-80" />
                  <span className="text-xs md:text-sm">{footerInfo.contactInfo.website}</span>
                </a>
              )}
            </div>
          </div>

          {/* 3. Office location */}
          <div className="space-y-1.5 mt-20 md:mt-10">
            <h3 className="underline font-bold text-xs uppercase tracking-wider opacity-90">Office location</h3>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(footerInfo.location)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer"
            >
              <MapPin className="h-4 w-4 shrink-0 opacity-80" />
              <span className="text-xs md:text-sm">{footerInfo.location}</span>
            </a>
          </div>

          {/* 4. Social Links (Static Round Icons next to Location) */}
          {hasLinks && (
            <div className="space-y-1.5 mt-20 md:mt-10">
              <h3 className="underline font-bold text-xs uppercase tracking-wider opacity-90">Social Links</h3>
              <div className="flex flex-wrap gap-2 items-center">
                {chatbot?.facebook && (
                  <a
                    href={formatExternalLink(chatbot.facebook)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-8 h-8 rounded-full text-white shadow-sm bg-[#1877F2] hover:bg-[#1877F2]/90 hover:scale-105 hover:shadow-md transition-all duration-200"
                    title="Facebook Page"
                  >
                    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                      <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z" />
                    </svg>
                  </a>
                )}
                {chatbot?.tiktok && (
                  <a
                    href={formatExternalLink(chatbot.tiktok)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-8 h-8 rounded-full text-white shadow-sm bg-black hover:bg-zinc-900 hover:scale-105 hover:shadow-md border border-zinc-800 transition-all duration-200"
                    title="TikTok Profile"
                  >
                    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                      <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743l-.002-.001.002.001a2.895 2.895 0 0 1 3.183-4.51v-3.5a6.39 6.39 0 0 0-5.397 7.97 6.38 6.38 0 0 0 10.866 2.102 4.786 4.786 0 0 1 3.766-.349V6.686z" />
                    </svg>
                  </a>
                )}
                {chatbot?.youtube && (
                  <a
                    href={formatExternalLink(chatbot.youtube)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-8 h-8 rounded-full text-white shadow-sm bg-[#FF0000] hover:bg-[#FF0000]/90 hover:scale-105 hover:shadow-md transition-all duration-200"
                    title="YouTube Channel"
                  >
                    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                      <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.517 0-9.388.508a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.871.508 9.388.508 9.388.508s7.517 0 9.388-.508a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                    </svg>
                  </a>
                )}
                {chatbot?.instagram && (
                  <a
                    href={formatExternalLink(chatbot.instagram)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-8 h-8 rounded-full text-white shadow-sm bg-[#E1306C] hover:bg-[#E1306C]/90 hover:scale-105 hover:shadow-md transition-all duration-200"
                    title="Instagram Profile"
                  >
                    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
                    </svg>
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom full amber-brown bar */}
      <div className="bg-[#6b3512] text-amber-50/95 py-2 border-t border-amber-900/40 font-sans">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
          <p className="opacity-90">
            © {new Date().getFullYear()} {footerInfo?.copyright}
          </p>
          <p className="opacity-90">
            Developed by{" "}
            <a
              href="https://okobiz.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-amber-200 underline underline-offset-4 transition font-medium"
            >
              Okobiz
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
