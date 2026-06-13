import { Product, SizeChartRow, Feature } from "@/types";

export const SITE_CONFIG = {
  brandName: "FASHION",
  heroTitle: "ক্লাসিক স্ট্রাইপ, সলিড, এবং বক্স চেক ডিজাইনের ব্র্যান্ডেড শার্ট এখন আরও আকর্ষণীয় মূল্যে!",
  heroButtonText: "অর্ডার করতে চাই",
  productSectionTitle: "ইম্পোর্টেড শার্টিং ফাইন কটন, 100% কটন",
  whyUsSectionLabel: "আমাদের বিশেষত্ব",
  whyUsSectionTitle: "কেন আমাদের থেকে কিনবেন?",
  whyUsSubtitle: "ফ্যাশনে ডিজঅর্ডার করুন, ভালোভাবে থাকুন আর প্রতিষ্ঠানীয়-স্তরে — নিজস্ব এক অধ্যায়।",
  ctaBannerTitle: "আপনার পছন্দের টি-শার্ট এখনই অর্ডার করুন",
  ctaBannerSubtitle: "সেরা কোয়ালিটি, মূল্য সীমা এবং আকর্ষণীয় প্যাক আজকেই সুরক্ষিত করুন।",
  ctaBannerButton: "অর্ডার করতে চাই",
};

export const PRODUCTS = [
  {
    _id: "1",
    name: "ক্লাসিক ব্ল্যাক শার্ট",
    thumbnail: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&h=750&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&h=750&fit=crop",
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&h=750&fit=crop",
      "https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?w=600&h=750&fit=crop",
      "https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=600&h=750&fit=crop",
    ],
    price: 400,
    originalPrice: 650,
    description:
      "প্রিমিয়াম কোয়ালিটির ইম্পোর্টেড ফাইন কটন দিয়ে তৈরি এই ক্লাসিক ব্ল্যাক শার্টটি যেকোনো অনুষ্ঠানে পরার উপযুক্ত। হাল্কা ওজনের এবং নরম কাপড় সারাদিন আরামদায়কভাবে পরা যায়।",
    highlights: [
      "১০০% ইম্পোর্টেড ফাইন কটন",
      "রঙ দীর্ঘস্থায়ী, বারবার ধুলেও ফিকে হয় না",
      "হাল্কা ওজন, সারাদিন আরামদায়ক",
      "Regular fit — সব বডি টাইপে মানানসই",
    ],
    fabric: "১০০% কটন (ইম্পোর্টেড ফাইন কটন)",
    fit: "Regular Fit",
    careInstructions: ["ঠান্ডা পানিতে হাতে ধুন", "সরাসরি রোদে না শুকিয়ে ছায়ায় শুকান", "হালকা আয়রন করুন"],
    slug: "classic-black-shirt",
    sizes: ["M", "L", "XL", "XXL"],
    colors: ["Black", "Orange", "Blue", "Yellow"]
  },
  {
    _id: "2",
    name: "টিল গ্রিন শার্ট",
    thumbnail: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=600&h=750&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=600&h=750&fit=crop",
      "https://images.unsplash.com/photo-1621072156002-e2fccdc0b176?w=600&h=750&fit=crop",
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&h=750&fit=crop",
      "https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=600&h=750&fit=crop",
    ],
    price: 400,
    originalPrice: 650,
    description:
      "ট্রেন্ডি টিল গ্রিন কালারের এই শার্টটি আপনার লুককে একটু আলাদা করে তুলবে। অফিস থেকে আড্ডা — সব জায়গায় মানানসই।",
    highlights: [
      "১০০% ইম্পোর্টেড ফাইন কটন",
      "ট্রেন্ডি টিল গ্রিন কালার",
      "Slim fit ডিজাইন",
      "Anti-wrinkle ফেব্রিক",
    ],
    fabric: "১০০% কটন (ইম্পোর্টেড ফাইন কটন)",
    fit: "Slim Fit",
    careInstructions: ["ঠান্ডা পানিতে হাতে ধুন", "ছায়ায় শুকান", "হালকা আয়রন করুন"],
    slug: "till-green-shirt",
    sizes: ["M", "L", "XL", "XXL"],
    colors: ["Black", "Orange", "Blue"]
  },
  {
    _id: "3",
    name: "ওয়াইন রেড শার্ট",
    thumbnail: "https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?w=600&h=750&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?w=600&h=750&fit=crop",
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&h=750&fit=crop",
      "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=600&h=750&fit=crop",
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&h=750&fit=crop",
    ],
    price: 400,
    originalPrice: 650,
    description:
      "গাঢ় ওয়াইন রেড রঙের এই শার্টটি বিশেষ অনুষ্ঠান বা পার্টিতে পরার জন্য আদর্শ। প্রিমিয়াম কাপড় এবং নিখুঁত সেলাই এটিকে অনন্য করে তুলেছে।",
    highlights: [
      "১০০% ইম্পোর্টেড ফাইন কটন",
      "Rich ওয়াইন রেড কালার",
      "পার্টি ও অনুষ্ঠানের জন্য পারফেক্ট",
      "Premium finishing",
    ],
    fabric: "১০০% কটন (ইম্পোর্টেড ফাইন কটন)",
    fit: "Regular Fit",
    careInstructions: ["ঠান্ডা পানিতে হাতে ধুন", "ছায়ায় শুকান", "হালকা আয়রন করুন"],
    slug: "waieen-red-shirt",
    sizes: ["M", "L", "XL", "XXL"],
    colors: ["Black", "Orange", "Blue"]
  },
  {
    _id: "4",
    name: "অলিভ গ্রিন শার্ট",
    thumbnail: "https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=600&h=750&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=600&h=750&fit=crop",
      "https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?w=600&h=750&fit=crop",
      "https://images.unsplash.com/photo-1621072156002-e2fccdc0b176?w=600&h=750&fit=crop",
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&h=750&fit=crop",
    ],
    price: 400,
    originalPrice: 650,
    description:
      "ন্যাচারাল অলিভ গ্রিন কালারের এই শার্টটি ক্যাজুয়াল আউটিং বা অফিসের জন্য পারফেক্ট। আর্থি টোনের রঙটি যেকোনো ট্রাউজারের সাথে মানানসই।",
    highlights: [
      "১০০% ইম্পোর্টেড ফাইন কটন",
      "ন্যাচারাল অলিভ গ্রিন টোন",
      "ক্যাজুয়াল ও অফিস উভয়ের জন্য উপযুক্ত",
      "Breathable ফেব্রিক",
    ],
    fabric: "১০০% কটন (ইম্পোর্টেড ফাইন কটন)",
    fit: "Regular Fit",
    careInstructions: ["ঠান্ডা পানিতে হাতে ধুন", "ছায়ায় শুকান", "হালকা আয়রন করুন"],
    slug: "olive-green-shirt",
    sizes: ["M", "L", "XL", "XXL"],
    colors: ["Black", "Orange", "Blue"]
  },
  {
    _id: "5",
    name: "মেরুন শার্ট",
    thumbnail: "https://images.unsplash.com/photo-1621072156002-e2fccdc0b176?w=600&h=750&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1621072156002-e2fccdc0b176?w=600&h=750&fit=crop",
      "https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=600&h=750&fit=crop",
      "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=600&h=750&fit=crop",
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&h=750&fit=crop",
    ],
    price: 400,
    originalPrice: 650,
    description:
      "ক্লাসিক মেরুন রঙের এই শার্টটি বাংলাদেশে সবচেয়ে জনপ্রিয় রঙগুলোর একটি। শীতকালীন আবহাওয়ায় অথবা যেকোনো ফর্মাল অনুষ্ঠানে পরুন।",
    highlights: [
      "১০০% ইম্পোর্টেড ফাইন কটন",
      "ক্লাসিক মেরুন কালার",
      "ফর্মাল ও ক্যাজুয়াল উভয়ে মানানসই",
      "Durable stitching",
    ],
    fabric: "১০০% কটন (ইম্পোর্টেড ফাইন কটন)",
    fit: "Regular Fit",
    careInstructions: ["ঠান্ডা পানিতে হাতে ধুন", "ছায়ায় শুকান", "হালকা আয়রন করুন"],
    slug: "merun-shirt",
    sizes: ["M", "L", "XL", "XXL"],
    colors: ["Black", "Orange", "Blue"]
  },
  {
    _id: "6",
    name: "প্রিমিয়াম ব্ল্যাক শার্ট",
    thumbnail: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&h=750&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&h=750&fit=crop",
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&h=750&fit=crop",
      "https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?w=600&h=750&fit=crop",
      "https://images.unsplash.com/photo-1621072156002-e2fccdc0b176?w=600&h=750&fit=crop",
    ],
    price: 400,
    originalPrice: 650,
    description:
      "প্রিমিয়াম কোয়ালিটির ব্ল্যাক শার্ট যা আপনার পার্সোনালিটিকে আরও শক্তিশালী করে তুলবে। যেকোনো প্রফেশনাল মিটিং বা ফর্মাল ইভেন্টে পরার জন্য আদর্শ।",
    highlights: [
      "১০০% ইম্পোর্টেড প্রিমিয়াম কটন",
      "ডিপ ব্ল্যাক কালার যা ফিকে হয় না",
      "প্রফেশনাল লুকের জন্য আদর্শ",
      "Extra fine stitching",
    ],
    fabric: "১০০% প্রিমিয়াম কটন (ইম্পোর্টেড)",
    fit: "Slim Fit",
    careInstructions: ["ঠান্ডা পানিতে হাতে ধুন", "ছায়ায় শুকান", "হালকা আয়রন করুন"],
    slug: "primeam-black-shirt",
    sizes: ["M", "L", "XL", "XXL"],
    colors: ["Black", "Orange", "Blue"]
  },
];

export const SIZE_CHART: SizeChartRow[] = [
  { size: "M", chest: "38 inch", length: "27 inch", shoulder: "17 inch", sleeve: "8.5 inch" },
  { size: "L", chest: "40 inch", length: "28 inch", shoulder: "18 inch", sleeve: "9 inch" },
  { size: "XL", chest: "42 inch", length: "29 inch", shoulder: "19 inch", sleeve: "9.5 inch" },
  { size: "XXL", chest: "44 inch", length: "30 inch", shoulder: "20 inch", sleeve: "10 inch" },
];

export const FEATURES: Feature[] = [
  {
    _id: "1",
    icon: "shirt",
    title: "প্রিমিয়াম ফেব্রিক",
    description: "শ্রেষ্ঠ, উচ্চমানের কটন থেকে তৈরি সেরা মানের টি-শার্ট।",
    number: "01",
  },
  {
    _id: "2",
    icon: "palette",
    title: "ট্রেন্ডি ডিজাইন",
    description: "ক্লাসিক, স্টাইলিশ এবং ট্রেন্ডি ডিজাইন — যা সবকে আকর্ষণ করে।",
    number: "02",
  },
  {
    _id: "3",
    icon: "ruler",
    title: "কমফোর্টেবল ফিট",
    description: "সঠিক সাইজ এবং আরামদায়ক ফিট, যা সারাদিন পরতে স্বস্তিকর করে।",
    number: "03",
  },
  {
    _id: "4",
    icon: "refresh",
    title: "কালার ডিউরেবিলিটি",
    description: "দীর্ঘস্থায়ী রঙ, বারবার ধোয়ার পরেও রঙ এবং গুণমান অক্ষুণ্ণ থাকে।",
    number: "04",
  },
  {
    _id: "5",
    icon: "truck",
    title: "দ্রুত ডেলিভারি",
    description: "আপনার কাছাকাছি কুরিয়ারে দ্রুত এবং নিরাপদ ডেলিভারি।",
    number: "05",
  },
  {
    _id: "6",
    icon: "headphones",
    title: "সার্বক্ষণিক সাপোর্ট",
    description: "সার্বক্ষণিক সাপোর্ট, যেকোনো প্রশ্নে আমরা সাহায্য করতে প্রস্তুত।",
    number: "06",
  },
];

// Default cart item — replace with real cart state later
export const DEFAULT_CART_ITEMS = [
  {
    product: PRODUCTS[0],
    quantity: 1,
  },
];
