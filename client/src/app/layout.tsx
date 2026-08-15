import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { GoogleTagManager } from '@next/third-parties/google';
import { OrderProvider } from "@/providers/OrderProvider";
import { Toaster } from "sonner";
import FloatingCartButton from "@/components/shared/FloatingCartButton";
import FloatingChatbot from "@/components/shared/FloatingChatbot";
import { getUiData } from "@/services/ui";
import { getCategories } from "@/services/category";
import Navbar from "@/components/shared/Navbar";
import MobileBottomNav from "@/components/shared/MobileBottomNav";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const uiData = await getUiData().catch(() => null);
  const logoUrl = uiData?.data?.[0]?.banner?.logo;

  const icons = logoUrl && logoUrl.startsWith("http")
    ? {
      icon: logoUrl,
      shortcut: logoUrl,
      apple: logoUrl,
    }
    : undefined;

  return {
    title: "Fashion T-Shirts | ব্র্যান্ডেড শার্ট",
    description: "ক্লাসিক স্ট্রাইপ, সলিড, এবং বক্স চেক ডিজাইনের ব্র্যান্ডেড শার্ট",
    ...(icons && { icons }),
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const [uiData, categoriesData] = await Promise.all([
    getUiData().catch(() => null),
    getCategories().catch(() => ({ success: false, data: [] })),
  ]);

  const banner = uiData?.data?.[0]?.banner || {
    logo: "Manbazar",
    title: "প্রিমিয়াম কোয়ালিটির টি-শার্ট কালেকশন",
    bannerImage: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=1600",
    navbarText: "প্রিমিয়াম শপিং এক্সপেরিয়েন্স - ম্যানবাজার",
    marqueeText: "ম্যানবাজারে আপনাকে স্বাগতম! প্রিমিয়াম কোয়ালিটির টি-শার্ট কালেকশন দেখতে নিচে স্ক্রোল করুন।"
  };

  const uiRecord = uiData?.data?.[0];
  const theme = uiRecord?.theme;

  // Extract active categories dynamically
  const activeCategories = categoriesData?.data || [];
  const categoryLabels = uiRecord?.categoryLabels;

  const navCategories = activeCategories.length > 0
    ? activeCategories
        .sort((a: any, b: any) => (a.sortOrder || 0) - (b.sortOrder || 0))
        .map((cat: any) => ({
          label: cat.name,
          id: cat.slug || cat._id,
        }))
    : [
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
        <Script async src="https://www.googletagmanager.com/gtag/js?id=G-HYFVPSRMJS" strategy="afterInteractive" />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-HYFVPSRMJS');
            `,
          }}
        />

        <Script
          id="facebook-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '1519962375868494');
              fbq('track', 'PageView');
            `,
          }}
        />
        <noscript><img height="1" width="1" className="hidden"
          src="https://www.facebook.com/tr?id=1519962375868494&ev=PageView&noscript=1"
        /></noscript>


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
      <GoogleTagManager gtmId="GTM-NRXMDP3J" />
    </html>
  );
}
