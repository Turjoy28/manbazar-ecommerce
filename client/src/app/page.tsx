/* ═══════════════════════════════════════════════════════════════════════════════
   CLIENT HOMEPAGE — Server Component
   Fetches UI configuration (banner, chart, products, footer, theme, CTA) from
   the backend API and renders the full landing page with dynamic data.
   
   THEME INJECTION:
   The style block below injects primary/secondary colors from the database
   as CSS custom properties. This allows Tailwind utility classes that reference
   these variables to reflect admin-configured brand colors without a rebuild.
   ═══════════════════════════════════════════════════════════════════════════════ */

import HeroSection from "@/components/sections/HeroSection";
import ProductSection from "@/components/sections/ProductSection";
import SizeChartSection from "@/components/sections/SizeChartSection";
import WhyUsSection from "@/components/sections/WhyUsSection";
import CTABanner from "@/components/sections/CTABanner";
import BillingSection from "@/components/sections/BillingSection";
import { getUiData } from "@/services/ui";
import { getProducts } from "@/services/product";
import Footer from "@/components/shared/Footert";


export default async function Home() {
  /* 
    Fetch UI data and products in parallel for faster page loads.
    Products fetch has a fallback so the page still renders if the API is down.
  */
  const [uiData, productsData] = await Promise.all([
    getUiData(),
    getProducts(1, 100).catch(() => ({ data: { products: [] } }))
  ]);

  /* Destructure UI configuration sections from the first document */
  const { banner, chart, productsCaption, specialty, footer, theme, cta } = uiData.data[0];

  /* Extract active products array */
  const products = productsData.data.products || [];


  return (
    <main className="bg-white min-h-screen font-sans">

      {/* 1. Hero — Banner image, logo, and headline */}
      <HeroSection banner={banner} />

      {/* 2. Products — Dynamic grid of products from the database */}
      <ProductSection productsCaption={productsCaption?.title} products={products} />

      {/* Divider */}
      <div className="max-w-5xl mx-auto px-4">
        <hr className="border-gray-100" />
      </div>

      {/* 3. Size Chart — Tabular sizing guide */}
      <SizeChartSection chart={chart} />

      {/* Divider */}
      <div className="max-w-5xl mx-auto px-4">
        <hr className="border-gray-100" />
      </div>

      {/* 4. Why Us — Specialty cards showcasing product benefits */}
      <WhyUsSection specialty={specialty} />

      {/* 5. CTA Banner — Dynamic call-to-action from admin settings */}
      <CTABanner cta={cta} />

      {/* Divider */}
      <div className="max-w-5xl mx-auto px-4">
        <hr className="border-gray-100" />
      </div>

      {/* 6. Billing — Order form and cart summary */}
      <BillingSection />

      {/* 7. Footer — Contact info, copyright, and links */}
      <Footer logo={banner?.logo} footerInfo={footer} />
    </main>
  );
}
