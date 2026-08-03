import HeroSection from "@/components/sections/HeroSection";
import ProductSection from "@/components/sections/ProductSection";

import CTABanner from "@/components/sections/CTABanner";
import BillingSection from "@/components/sections/BillingSection";
import { getUiData } from "@/services/ui";
import { getProducts } from "@/services/product";
import { getBanners } from "@/services/banners";
import { getCategories, ClientCategory } from "@/services/category";
import PromotionalBanners from "@/components/sections/PromotionalBanners";
import Footer from "@/components/shared/Footert";
import { Product } from "@/types";

export const dynamic = "force-dynamic";

const DEFAULT_UI_DATA = {
  banner: {
    logo: "Manbazar",
    title: "প্রিমিয়াম কোয়ালিটির টি-শার্ট কালেকশন",
    bannerImage: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=1600",
  },
  productsCaption: {
    title: "আমাদের হট সেলিং প্রোডাক্টস",
  },
  chart: {
    subTitle: "সঠিক সাইজ বেছে নিন",
    title: "সাইজ চার্ট গাইড",
    description: "আপনার জন্য পারফেক্ট ফিট খুঁজে পেতে নিচের চার্টটি অনুসরণ করুন।",
    tableTitle: "টি-শার্ট সাইজ পরিমাপ",
    tableSubTitle: "সব মাপ ইঞ্চিতে দেওয়া হলো",
    chartTable: {
      tableTitle: ["সাইজ", "বডি (Chest)", "লম্বা (Length)", "হাতা (Sleeve)"],
      tableProperties: [
        ["M", "৩৮", "২৭", "৭.৫"],
        ["L", "৪০", "২৮", "৮"],
        ["XL", "৪২", "২৯", "৮.৫"],
        ["XXL", "৪৪", "৩০", "৯"],
      ],
    },
    chartMeta: {
      title: "কীভাবে মাপবেন?",
      cards: [
        {
          logo: "📏",
          title: "বডি বা চেস্ট",
          description: "বুকের সবচেয়ে চওড়া অংশ বরাবর ফিতা দিয়ে মেপে নিন।",
        },
        {
          logo: "📐",
          title: "লম্বা বা লেন্থ",
          description: "কাঁধের সর্বোচ্চ অংশ থেকে নিচের বর্ডার পর্যন্ত সোজা মেপে নিন।",
        },
        {
          logo: "💡",
          title: "টিপস",
          description: "মাপ যদি দুটি সাইজের মাঝে হয়, তবে বড় সাইজটি সিলেক্ট করা নিরাপদ।",
        },
      ],
    },
  },
  specialty: {
    subTitle: "আমাদের বিশেষত্ব",
    title: "কেন আমাদের টি-শার্ট সেরা?",
    description: "সেরা মানের ফেব্রিক ও নিখুঁত ফিনিশিং দিয়ে তৈরি প্রতিটি টি-শার্ট।",
    cards: [
      {
        image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=400",
        title: "১০০% প্রিমিয়াম কটন",
        description: "উচ্চমানের কটন ফেব্রিক, যা অত্যন্ত আরামদায়ক ও দীর্ঘস্থায়ী।",
      },
      {
        image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=400",
        title: "নিখুঁত স্টিচিং ও ফিনিশিং",
        description: "অভিজ্ঞ কারিগর দ্বারা সেলাইকৃত এবং ডাবল স্টিচ ফিনিশিং।",
      },
      {
        image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=400",
        title: "রঙের দীর্ঘস্থায়িত্ব",
        description: "প্রিমিয়াম ডাইং প্রসেস ব্যবহারের কারণে রঙ সহজে নষ্ট বা ফেড হয় না।",
      },
    ],
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
  theme: {
    primaryColor: "#e07b39",
    secondaryColor: "#111827",
    tertiaryColor: "#f97316",
  },
  cta: {
    title: "আপনার পছন্দের টি-শার্ট এখনই অর্ডার করুন",
    subtitle: "সেরা কোয়ালিটি, মূল্য সীমা এবং আকর্ষণীয় প্যাক আজকেই সুরক্ষিত করুন।",
    buttonText: "অর্ডার করতে চাই",
  },
};

export default async function Home() {
  const [uiData, productsData, bannersData, categoriesData] = await Promise.all([
    getUiData().catch(() => null),
    getProducts(1, 100).catch(() => ({ data: { products: [] } })),
    getBanners().catch(() => null),
    getCategories().catch(() => ({ success: false, data: [] })),
  ]);
  const uiRecord = uiData?.data?.[0] || DEFAULT_UI_DATA;
  const { banner, chart, productsCaption, specialty, footer, theme, cta, chatbot } = uiRecord;

  const products: Product[] = productsData?.data?.products || [];
  const banners = bannersData?.data || [];
  const activeCategories: ClientCategory[] = categoriesData?.data || [];

  // ── Dynamic Category Grouping ──
  // Group products by their populated category reference.
  // If categories exist from the API, use them. Otherwise, fall back to the old TOP/MIDDLE/BOTTOM system.
  let categoriesToRender: { label: string; id: string; slug: string; products: Product[] }[] = [];

  if (activeCategories.length > 0) {
    // New dynamic category system — group products by category._id
    categoriesToRender = activeCategories
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((cat) => {
        const catProducts = products.filter((p: Product) => {
          const productCat = p.category;
          if (!productCat) return false;
          const catId = typeof productCat === "string" ? productCat : productCat._id;
          return catId === cat._id;
        });
        return {
          label: cat.name,
          id: cat._id,
          slug: cat.slug,
          products: catProducts.slice(0, 4),
        };
      });
  } else {
    // Fallback: old hardcoded TOP/MIDDLE/BOTTOM system for backward compatibility
    const uiLabels = uiRecord?.categoryLabels || {
      topCategoryLabel: "Trending Now",
      middleCategoryLabel: "Seasonal Essentials",
      bottomCategoryLabel: "Clearance & Steals",
    };

    const topProducts = products.filter((p: Product) => p.categoryAssignment === "TOP" || !p.categoryAssignment);
    const middleProducts = products.filter((p: Product) => p.categoryAssignment === "MIDDLE");
    const bottomProducts = products.filter((p: Product) => p.categoryAssignment === "BOTTOM");

    categoriesToRender = [
      { label: uiLabels.topCategoryLabel, id: "TOP", slug: "TOP", products: topProducts.slice(0, 4) },
      { label: uiLabels.middleCategoryLabel, id: "MIDDLE", slug: "MIDDLE", products: middleProducts.slice(0, 4) },
      { label: uiLabels.bottomCategoryLabel, id: "BOTTOM", slug: "BOTTOM", products: bottomProducts.slice(0, 4) },
    ].filter((cat) => cat.products.length > 0);
  }

  return (
    <main className="bg-white min-h-screen font-sans">
      <HeroSection banner={banner} />

      {/* Promotional Offers Grid */}
      <PromotionalBanners banners={banners} />

      {/* 2. Products — Dynamic category sections */}
      <div id="products">
        {categoriesToRender.length > 0 ? (
          categoriesToRender.map((cat) => (
            <div key={cat.id} className="my-2">
              <ProductSection
                productsCaption={cat.label}
                categoryAssignmentId={cat.slug}
                products={cat.products}
                isCategorySection={true}
              />
              {/* Divider between sections */}
              <div className="max-w-5xl mx-auto px-4 my-2">
                <hr className="border-gray-100" />
              </div>
            </div>
          ))
        ) : (
          <>
            <ProductSection
              productsCaption={productsCaption?.title || "আমাদের হট সেলিং প্রোডাক্টস"}
              products={products.slice(0, 4)}
            />
            {/* Divider */}
            <div className="max-w-5xl mx-auto px-4">
              <hr className="border-gray-100" />
            </div>
          </>
        )}
      </div>



      {/* 5. CTA Banner — Dynamic call-to-action from admin settings */}
      <CTABanner cta={cta} />

      {/* Divider */}
      <div className="max-w-5xl mx-auto px-4">
        <hr className="border-gray-100" />
      </div>

      {/* 6. Billing — Order form and cart summary */}
      <BillingSection />

      {/* 7. Footer — Contact info, copyright, and links */}
      <Footer logo={banner?.logo} footerInfo={footer} chatbot={chatbot} />
    </main>
  );
}
