"use client";

import React, { useState } from "react";
import { MessageCircle, X } from "lucide-react";

interface FloatingChatbotProps {
    chatbot?: {
        messenger?: string;
        facebook?: string;
        tiktok?: string;
        whatsapp?: string;
        youtube?: string;
        instagram?: string;
    };
}

export default function FloatingChatbot({ chatbot }: FloatingChatbotProps) {
    const [isOpen, setIsOpen] = useState(false);

    if (!chatbot) return null;

    const { messenger, whatsapp } = chatbot;

    // Check if at least one link is configured
    const hasLinks = Boolean(messenger || whatsapp);
    if (!hasLinks) return null;

    // Helper to ensure links are absolute URLs
    const formatExternalLink = (url: string | undefined) => {
        if (!url) return "";
        const trimmed = url.trim();
        if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
            return trimmed;
        }
        return `https://${trimmed}`;
    };

    return (
        <div className="fixed bottom-24 md:bottom-6 right-6 z-40 flex flex-col gap-3 items-end font-sans">
            {/* Sub-buttons list (slides/fades up when isOpen is true) */}
            <div
                className={`flex flex-col gap-3 items-end transition-all duration-300 ease-out origin-bottom ${
                    isOpen
                        ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
                        : "opacity-0 translate-y-4 scale-90 pointer-events-none"
                }`}
            >
                {/* WhatsApp Button */}
                {whatsapp && (
                    <div className="group relative flex items-center">
                        <span className="absolute right-14 scale-0 group-hover:scale-100 transition-all duration-200 origin-right bg-black/80 text-white text-xs font-semibold px-3 py-1.5 rounded-lg whitespace-nowrap shadow-md select-none">
                            Chat on WhatsApp
                        </span>
                        <a
                            href={formatExternalLink(whatsapp)}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Chat on WhatsApp"
                            className="flex items-center justify-center w-12 h-12 rounded-full text-white shadow-lg bg-[#25D366] hover:bg-[#25d366]/90 hover:shadow-emerald-500/20 transition-all duration-300 hover:scale-110 active:scale-95"
                        >
                            <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
                                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.262 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.5-5.734-1.453L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.42 9.864-9.864.002-2.637-1.023-5.116-2.883-6.978C16.59 1.899 14.116.874 11.48.876c-5.437 0-9.861 4.42-9.865 9.864 0 1.902.499 3.76 1.449 5.36L2.052 22.15l6.196-1.626v-.001zm9.251-6.7c-.244-.122-1.441-.712-1.664-.794-.223-.081-.385-.122-.547.122-.162.244-.63.794-.771.955-.143.162-.285.183-.53.061-.243-.122-1.03-.38-1.962-1.21-.724-.647-1.213-1.447-1.355-1.69-.143-.244-.015-.376.107-.497.111-.11.244-.285.365-.426.122-.142.162-.244.244-.406.082-.162.041-.305-.021-.426-.062-.122-.547-1.32-.75-1.81-.197-.474-.397-.41-.547-.418-.142-.008-.305-.01-.468-.01-.162 0-.427.061-.65.305-.224.244-.854.834-.854 2.031 0 1.198.874 2.353.996 2.516.122.163 1.722 2.63 4.171 3.691.582.253 1.037.404 1.392.517.585.186 1.117.16 1.538.097.469-.071 1.442-.589 1.644-1.157.203-.568.203-1.056.142-1.157-.061-.101-.223-.162-.466-.284z"/>
                            </svg>
                        </a>
                    </div>
                )}

                {/* Messenger Button */}
                {messenger && (
                    <div className="group relative flex items-center">
                        <span className="absolute right-14 scale-0 group-hover:scale-100 transition-all duration-200 origin-right bg-black/80 text-white text-xs font-semibold px-3 py-1.5 rounded-lg whitespace-nowrap shadow-md select-none">
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
            </div>

            {/* Main Toggle Trigger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Toggle chat options"
                className="flex items-center justify-center w-14 h-14 rounded-full text-white shadow-xl bg-primary hover:bg-primary/95 transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer relative"
            >
                {/* Ring animation to draw attention */}
                {!isOpen && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-40"></span>
                )}
                
                {isOpen ? (
                    <span className="text-xl font-bold flex items-center justify-center">
                        <X className="w-6 h-6" />
                    </span>
                ) : (
                    <span className="flex items-center justify-center">
                        <MessageCircle className="w-7 h-7" />
                    </span>
                )}
            </button>
        </div>
    );
}
