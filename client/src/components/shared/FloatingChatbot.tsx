"use client";

import React from "react";

interface FloatingChatbotProps {
    chatbot?: {
        messenger?: string;
        facebook?: string;
        tiktok?: string;
    };
}

export default function FloatingChatbot({ chatbot }: FloatingChatbotProps) {
    if (!chatbot) return null;

    const { messenger, facebook, tiktok } = chatbot;

    // Check if at least one link is configured
    const hasLinks = Boolean(messenger || facebook || tiktok);
    if (!hasLinks) return null;

    // Helper to ensure links are absolute URLs (preventing relative paths inside Next.js router)
    const formatExternalLink = (url: string | undefined) => {
        if (!url) return "";
        const trimmed = url.trim();
        if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
            return trimmed;
        }
        return `https://${trimmed}`;
    };

    return (
        <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-3 items-end">
            {/* Messenger Button */}
            {messenger && (
                <div className="group relative flex items-center">
                    {/* Tooltip */}
                    <span className="absolute right-14 scale-0 group-hover:scale-100 transition-all duration-200 origin-right bg-black/80 text-white text-xs font-semibold px-3 py-1.5 rounded-lg whitespace-nowrap shadow-md">
                        Chat on Messenger
                    </span>
                    <a
                        href={formatExternalLink(messenger)}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Chat on Messenger"
                        className="flex items-center justify-center w-12 h-12 rounded-full text-white shadow-lg bg-linear-to-tr from-[#006AFF] to-[#00B2FE] hover:shadow-blue-500/30 transition-all duration-300 hover:scale-110 active:scale-95"
                    >
                        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
                            <path d="M12 2C6.477 2 2 6.145 2 11.243c0 2.908 1.448 5.483 3.702 7.052L5.22 22l3.615-1.983c1.018.28 2.1.426 3.165.426 5.523 0 10-4.145 10-9.243S17.523 2 12 2zm1.096 12.39-2.502-2.668-4.887 2.668 5.378-5.714 2.56 2.668 4.829-2.668-5.378 5.714z" />
                        </svg>
                    </a>
                </div>
            )}

            {/* Facebook Button */}
            {facebook && (
                <div className="group relative flex items-center">
                    {/* Tooltip */}
                    <span className="absolute right-14 scale-0 group-hover:scale-100 transition-all duration-200 origin-right bg-black/80 text-white text-xs font-semibold px-3 py-1.5 rounded-lg whitespace-nowrap shadow-md">
                        Facebook Page
                    </span>
                    <a
                        href={formatExternalLink(facebook)}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Visit Facebook Page"
                        className="flex items-center justify-center w-12 h-12 rounded-full text-white shadow-lg bg-[#1877F2] hover:bg-[#1877F2]/90 hover:shadow-blue-600/30 transition-all duration-300 hover:scale-110 active:scale-95"
                    >
                        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
                            <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z" />
                        </svg>
                    </a>
                </div>
            )}

            {/* TikTok Button */}
            {tiktok && (
                <div className="group relative flex items-center">
                    {/* Tooltip */}
                    <span className="absolute right-14 scale-0 group-hover:scale-100 transition-all duration-200 origin-right bg-black/80 text-white text-xs font-semibold px-3 py-1.5 rounded-lg whitespace-nowrap shadow-md">
                        Follow on TikTok
                    </span>
                    <a
                        href={formatExternalLink(tiktok)}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Follow on TikTok"
                        className="flex items-center justify-center w-12 h-12 rounded-full text-white shadow-lg bg-black hover:bg-zinc-900 border border-zinc-800 hover:shadow-zinc-500/30 transition-all duration-300 hover:scale-110 active:scale-95"
                    >
                        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
                            <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743l-.002-.001.002.001a2.895 2.895 0 0 1 3.183-4.51v-3.5a6.39 6.39 0 0 0-5.397 7.97 6.38 6.38 0 0 0 10.866 2.102 4.786 4.786 0 0 1 3.766-.349V6.686z" />
                        </svg>
                    </a>
                </div>
            )}
        </div>
    );
}
