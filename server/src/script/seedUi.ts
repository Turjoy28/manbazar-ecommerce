import { Ui } from "../models/ui.model.js";

export const seedUi = async () => {
    try {
        const isUiExists = await Ui.findOne();

        if (isUiExists) {
            console.log("✅ UI Config already exists");
            return;
        }

        const defaultUi = {
            banner: {
                logo: "Manbazar",
                title: "প্রিমিয়াম কোয়ালিটির টি-শার্ট কালেকশন",
                bannerImage: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=1600",
                navbarText: "প্রিমিয়াম শপিং এক্সপেরিয়েন্স - ম্যানবাজার"
            },
            productsCaption: {
                title: "আমাদের হট সেলিং প্রোডাক্টস"
            },
            chart: {
                subTitle: "সঠিক সাইজ বেছে নিন",
                title: "সাইজ চার্ট গাইড",
                description: "আপনার জন্য পারফেক্ট ফিট খুঁজে পেতে নিচের চার্টটি অনুসরণ করুন।",
                tableTitle: "টি-শার্ট সাইজ পরিমাপ",
                tableSubTitle: "সব মাপ ইঞ্চিতে দেওয়া হলো",
                chartTable: {
                    tableTitle: ["সাইজ", "বডি (Chest)", "লম্বা (Length)", "হাতা (Sleeve)"],
                    tableProperties: [
                        ["M", "৩৮", "২৭", "৭.৫"],
                        ["L", "৪০", "২৮", "৮"],
                        ["XL", "৪২", "২৯", "৮.৫"],
                        ["XXL", "৪৪", "৩০", "৯"]
                    ]
                },
                chartMeta: {
                    title: "কীভাবে মাপবেন?",
                    cards: [
                        {
                            logo: "📏",
                            title: "বডি বা চেস্ট",
                            description: "বুকের সবচেয়ে চওড়া অংশ বরাবর ফিতা দিয়ে মেপে নিন।"
                        },
                        {
                            logo: "📐",
                            title: "লম্বা বা লেন্থ",
                            description: "কাঁধের সর্বোচ্চ অংশ থেকে নিচের বর্ডার পর্যন্ত সোজা মেপে নিন।"
                        },
                        {
                            logo: "💡",
                            title: "টিপস",
                            description: "মাপ যদি দুটি সাইজের মাঝে হয়, তবে বড় সাইজটি সিলেক্ট করা নিরাপদ।"
                        }
                    ]
                }
            },
            specialty: {
                title: "কেন আমাদের টি-শার্ট সেরা?",
                subTitle: "আমাদের বিশেষত্ব",
                description: "সেরা মানের ফেব্রিক ও নিখুঁত ফিনিশিং দিয়ে তৈরি প্রতিটি টি-শার্ট।",
                cards: [
                    {
                        image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=400",
                        title: "১০০% প্রিমিয়াম কটন",
                        description: "উচ্চমানের কটন ফেব্রিক, যা অত্যন্ত আরামদায়ক ও দীর্ঘস্থায়ী।"
                    },
                    {
                        image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=400",
                        title: "নিখুঁত স্টিচিং ও ফিনিশিং",
                        description: "অভিজ্ঞ কারিগর দ্বারা সেলাইকৃত এবং ডাবল স্টিচ ফিনিশিং।"
                    },
                    {
                        image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=400",
                        title: "রঙের দীর্ঘস্থায়িত্ব",
                        description: "প্রিমিয়াম ডাইং প্রসেস ব্যবহারের কারণে রঙ সহজে নষ্ট বা ফেড হয় না।"
                    }
                ]
            },
            footer: {
                shortDescription: "ম্যানবাজার - আপনার স্টাইল ও আরামের নির্ভরযোগ্য সঙ্গী। সেরা মানের পোশাক সরাসরি আপনাদের দোড়গোড়ায়।",
                contactInfo: {
                    number: "01700-000000",
                    email: "support@manbazar.com",
                    website: "manbazar.com"
                },
                location: "ঢাকা, বাংলাদেশ",
                copyright: "ম্যানবাজার কর্তৃক সর্বস্বত্ব সংরক্ষিত।"
            },
            theme: {
                primaryColor: "#e07b39",
                secondaryColor: "#111827",
                tertiaryColor: "#f97316"
            },
            cta: {
                title: "আপনার পছন্দের টি-শার্ট এখনই অর্ডার করুন",
                subtitle: "সেরা কোয়ালিটি, মূল্য সীমা এবং আকর্ষণীয় প্যাক আজকেই সুরক্ষিত করুন।",
                buttonText: "অর্ডার করতে চাই"
            },
            chatbot: {
                messenger: "",
                facebook: "",
                tiktok: "",
                whatsapp: ""
            }
        };

        await Ui.create(defaultUi);
        console.log("UI Config seeded successfully");
    } catch (error) {
        console.log("❌ UI Config seed failed", error);
    }
}
