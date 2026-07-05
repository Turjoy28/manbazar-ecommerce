import { getProducts } from "@/services/product";
import { getUiData } from "@/services/ui";
import ProductSection from "@/components/sections/ProductSection";
import Footer from "@/components/shared/Footert";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Product } from "@/types";

const DEFAULT_UI_DATA = {
  banner: {
    logo: "Manbazar",
  },
  footer: {
    shortDescription: "ম্যানবাজার - আপনার স্টাইল ও আরামের নির্ভরযোগ্য সঙ্গী। সেরা মানের পোশাক সরাসরি আপনাদের দোড়গোড়ায়।",
    contactInfo: {
      number: "01700-000000",
      email: "support@manbazar.com",
      website: "manbazar.com",
    },
    location: "ঢাকা, বাংলাদেশ",
    copyright: "ম্যানবাজার কর্তৃক সর্বস্বত্ব সংরক্ষিত।",
  },
};

interface PageProps {
  params: Promise<{ categoryName: string }>;
}

export default async function CategoryPage({ params }: PageProps) {
  const resolvedParams = await params;
  const categoryName = decodeURIComponent(resolvedParams.categoryName);

  const [uiData, productsData] = await Promise.all([
    getUiData().catch(() => null),
    getProducts(1, 100).catch(() => ({ data: { products: [] } })),
  ]);

  const uiRecord = uiData?.data?.[0] || DEFAULT_UI_DATA;
  const { banner, footer, chatbot } = uiRecord;

  const allProducts: Product[] = productsData?.data?.products || [];

  // Filter products by category (case-insensitive trim match)
  const filteredProducts = allProducts.filter(
    (p: Product) => (p.category || "").trim().toLowerCase() === categoryName.toLowerCase()
  );

  return (
    <main className="bg-white min-h-screen font-sans">
      {/* Go Back button */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 pt-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-primary transition-colors font-medium"
        >
          <ArrowLeft size={16} />
          হোম পেজে ফিরে যান
        </Link>
      </div>

      {/* Category products grid */}
      <ProductSection
        productsCaption={categoryName}
        products={filteredProducts}
        isCategorySection={false}
      />

      <Footer logo={banner?.logo} footerInfo={footer} chatbot={chatbot} />
    </main>
  );
}
