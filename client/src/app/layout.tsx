import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { OrderProvider } from "@/providers/OrderProvider";
import { Toaster } from "sonner";
import FloatingCartButton from "@/components/shared/FloatingCartButton";
import FloatingChatbot from "@/components/shared/FloatingChatbot";
import { getUiData } from "@/services/ui";
import Navbar from "@/components/shared/Navbar";
import MobileBottomNav from "@/components/shared/MobileBottomNav";

export const metadata: Metadata = {
  title: "Fashion T-Shirts | ব্র্যান্ডেড শার্ট",
  description: "ক্লাসিক স্ট্রাইপ, সলিড, এবং বক্স চেক ডিজাইনের ব্র্যান্ডেড শার্ট",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const uiData = await getUiData();
  const banner = uiData?.data?.[0]?.banner || {
    logo: "Manbazar",
    title: "প্রিমিয়াম কোয়ালিটির টি-শার্ট কালেকশন",
    bannerImage: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=1600",
    navbarText: "প্রিমিয়াম শপিং এক্সপেরিয়েন্স - ম্যানবাজার",
    marqueeText: "ম্যানবাজারে আপনাকে স্বাগতম! প্রিমিয়াম কোয়ালিটির টি-শার্ট কালেকশন দেখতে নিচে স্ক্রোল করুন।"
  };

  const uiRecord = uiData?.data?.[0];
  const theme = uiRecord?.theme;

  // Extract category labels for bottom nav
  const categoryLabels = uiRecord?.categoryLabels;
  const navCategories = [
    { label: categoryLabels?.topCategoryLabel || "Trending Now", id: "TOP" },
    { label: categoryLabels?.middleCategoryLabel || "Seasonal Essentials", id: "MIDDLE" },
    { label: categoryLabels?.bottomCategoryLabel || "Clearance & Steals", id: "BOTTOM" },
  ];

  const primaryColor = theme?.primaryColor || "#e07b39";
  const secondaryColor = theme?.secondaryColor || "#111827";
  const tertiaryColor = theme?.tertiaryColor || "#f97316";

  return (
    <html lang="bn" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-HYFVPSRMJS"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-HYFVPSRMJS');
            `,
          }}
        />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        <style
          dangerouslySetInnerHTML={{
            __html: `
              :root {
                --primary-brand: ${primaryColor};
                --secondary-brand: ${secondaryColor};
                --tertiary-brand: ${tertiaryColor};
              }
            `,
          }}
        />
        <OrderProvider>
          <Navbar banner={banner} />
          {children}
          <FloatingCartButton />
          <MobileBottomNav phoneNumber={banner?.navbarText?.trim()} categories={navCategories} />
          <FloatingChatbot chatbot={uiData?.data?.[0]?.chatbot} />
        </OrderProvider>
        <Toaster richColors />
      </body>
    </html>
  );
}
