/* ═══════════════════════════════════════════════════════════════════════════════
   ADMIN ROOT LAYOUT
   The top-level layout for the entire admin application.
   
   - Forces dark mode via the "dark" class on <html> so the dark theme
     from globals.css is always active.
   - Loads Google Fonts (Geist Sans / Geist Mono) for code and UI text.
   - Includes Sonner toaster for toast notifications across all pages.
   - Sets proper metadata for the admin panel.
   ═══════════════════════════════════════════════════════════════════════════════ */

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

/* Load Geist Sans — clean, modern font for the admin UI */
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

/* Load Geist Mono — monospaced font for code/data displays */
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import { getUiData } from "@/services/ui";

/* Page metadata — dynamically fetched to use the admin logo as favicon */
export async function generateMetadata(): Promise<Metadata> {
  const uiData = await getUiData();
  const logoUrl = uiData?.data?.[0]?.banner?.logo;

  const icons = logoUrl && logoUrl.startsWith("http")
    ? {
        icon: logoUrl,
        shortcut: logoUrl,
        apple: logoUrl,
      }
    : undefined;

  return {
    title: "Manbazar Admin — Dashboard",
    description: "Admin panel for managing the Manbazar storefront, products, orders, and settings.",
    ...(icons && { icons }),
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    /* 
      "dark" class forces the dark theme from globals.css.
      This ensures the admin always uses the premium dark design. 
    */
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body suppressHydrationWarning>
        {children}
        {/* Sonner toaster — displays success/error/info notifications */}
        <Toaster richColors />
      </body>
    </html>
  );
}
