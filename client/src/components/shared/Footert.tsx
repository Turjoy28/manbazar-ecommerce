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
  };
}

export default function Footer({ logo, footerInfo, chatbot }: FooterProps) {
  const hasLinks = Boolean(chatbot?.facebook || chatbot?.tiktok);

  const formatExternalLink = (url: string | undefined) => {
    if (!url) return "";
    const trimmed = url.trim();
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      return trimmed;
    }
    return `https://${trimmed}`;
  };

  return (
    <footer className="bg-tertiary text-(--tertiary-text) mt-10 relative">
      <div className="max-w-7xl mx-auto px-6 pt-8 pb-6">
        <div className="flex flex-col md:flex-row justify-between gap-6 md:gap-4">
          {/* 1. Brand & Logo */}
          <div className="max-w-xs space-y-2">
            <div className="scale-90 origin-left -mb-2">
              <Logo logo={logo} />
            </div>
            <p className="leading-6 text-xs md:text-sm opacity-90">
              {footerInfo?.shortDescription}
            </p>
          </div>

          {/* 2. Contact info */}
          <div className="space-y-2.5">
            <h3 className="underline font-bold text-xs uppercase tracking-wider opacity-90">Contact information</h3>
            <div className="space-y-2">
              {footerInfo?.contactInfo?.number && (
                <p className="flex items-center gap-2">
                  <Phone className="h-4 w-4 shrink-0 opacity-80" /> 
                  <span className="font-sans text-xs md:text-sm">{footerInfo.contactInfo.number}</span>
                </p>
              )}
              {footerInfo?.contactInfo?.email && (
                <p className="flex items-center gap-2">
                  <Mail className="h-4 w-4 shrink-0 opacity-80" /> 
                  <span className="text-xs md:text-sm">{footerInfo.contactInfo.email}</span>
                </p>
              )}
              {footerInfo?.contactInfo?.website && (
                <p className="flex items-center gap-2">
                  <Globe className="h-4 w-4 shrink-0 opacity-80" /> 
                  <span className="text-xs md:text-sm">{footerInfo.contactInfo.website}</span>
                </p>
              )}
            </div>
          </div>

          {/* 3. Office location */}
          <div className="space-y-2.5">
            <h3 className="underline font-bold text-xs uppercase tracking-wider opacity-90">Office location</h3>
            <p className="flex items-center gap-2">
              <MapPin className="h-4 w-4 shrink-0 opacity-80" /> 
              <span className="text-xs md:text-sm">{footerInfo.location}</span>
            </p>
          </div>

          {/* 4. Social Links (Static Round Icons next to Location) */}
          {hasLinks && (
            <div className="space-y-2.5">
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
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom full amber-brown bar */}
      <div className="bg-[#6b3512] text-amber-50/95 py-3.5 border-t border-amber-900/40 font-sans">
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
