import { getProducts } from "@/services/product";
import { getUiData } from "@/services/ui";
import { getCategories } from "@/services/category";
import ProductSection from "@/components/sections/ProductSection";
import Footer from "@/components/shared/Footert";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Product } from "@/types";

export const dynamic = "force-dynamic";

const DEFAULT_UI_DATA = {
  banner: {
    logo: "Manbazar",
  },
  footer: {
    shortDescription: "ম্যানবাজার - আপনার স্টাইল ও আরামের নির্ভরযোগ্য সঙ্গী। সেরা মানের পোশাক সরাসরি আপনাদের দোড়গোড়ায়।",
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

  const [uiData, productsData, categoriesData] = await Promise.all([
    getUiData().catch(() => null),
    getProducts(1, 100).catch(() => ({ data: { products: [] } })),
    getCategories().catch(() => ({ success: false, data: [] })),
  ]);

  const uiRecord = uiData?.data?.[0] || DEFAULT_UI_DATA;
  const { banner, footer, chatbot, categoryLabels } = uiRecord;
  const activeCategories = categoriesData?.data || [];
  const allProducts: Product[] = productsData?.data?.products || [];

  // Try to find matching category from the new dynamic system
  // The categoryName param could be a slug, an _id, or the old TOP/MIDDLE/BOTTOM identifiers
  const matchedCategory = activeCategories.find(
    (cat) => cat.slug === categoryName || cat._id === categoryName
  );

  let displayTitle = categoryName;
  let filteredProducts: Product[] = [];

  if (matchedCategory) {
    // New dynamic category system — filter by category._id
    displayTitle = matchedCategory.name;
    filteredProducts = allProducts.filter((p: Product) => {
      const productCat = p.category;
      if (!productCat) return false;
      const catId = typeof productCat === "string" ? productCat : productCat._id;
      return catId === matchedCategory._id;
    });
  } else {
    // Fallback: old TOP/MIDDLE/BOTTOM system
    if (categoryName === "TOP" && categoryLabels?.topCategoryLabel) displayTitle = categoryLabels.topCategoryLabel;
    if (categoryName === "MIDDLE" && categoryLabels?.middleCategoryLabel) displayTitle = categoryLabels.middleCategoryLabel;
    if (categoryName === "BOTTOM" && categoryLabels?.bottomCategoryLabel) displayTitle = categoryLabels.bottomCategoryLabel;

    filteredProducts = allProducts.filter((p: Product) => {
      if (["TOP", "MIDDLE", "BOTTOM"].includes(categoryName)) {
        if (categoryName === "TOP" && !p.categoryAssignment) return true;
        return p.categoryAssignment === categoryName;
      }
      // Fallback for old free-text categories
      return ((p as any).category || "").toString().trim().toLowerCase() === categoryName.toLowerCase();
    });
  }

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
        productsCaption={displayTitle}
        products={filteredProducts}
        isCategorySection={false}
        showAllImmediately={true}
      />

      <Footer logo={banner?.logo} footerInfo={footer} chatbot={chatbot} />
    </main>
  );
}
