import { notFound } from "next/navigation";
import { getProductBySlug } from "@/services/product";
import ProductDetails from "@/components/sections/ProductDetails";

interface PageProps {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
    const { slug } = await params;
    try {
        const productData = await getProductBySlug(slug);
        const product = productData?.data;
        return {
            title: product ? `${product.name} | Fashion T-Shirts` : "Product Not Found",
            description: product?.description?.substring(0, 160) || "Explore our premium collection of T-shirts.",
            keywords: [product?.name, "T-shirt", "Fashion", "Mens Wear", product?.category || ""].filter(Boolean).join(", "),
            openGraph: {
                title: product ? `${product.name} | Fashion T-Shirts` : "Product Not Found",
                description: product?.description?.substring(0, 160) || "Explore our premium collection of T-shirts.",
                url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://manbazar.com'}/product/${slug}`,
                siteName: "Menbazar",
                images: [
                    {
                        url: product?.thumbnail || product?.images?.[0] || "",
                        width: 800,
                        height: 600,
                        alt: product?.name || "Product Image",
                    },
                ],
                locale: "en_US",
                type: "website",
            },
            twitter: {
                card: "summary_large_image",
                title: product ? `${product.name} | Fashion T-Shirts` : "Product Not Found",
                description: product?.description?.substring(0, 160) || "Explore our premium collection of T-shirts.",
                images: [product?.thumbnail || product?.images?.[0] || ""],
            },
        };
    } catch (e) {
        return { title: "Product Not Found" };
    }
}

export default async function ProductPage({ params }: PageProps) {
    const { slug } = await params;
    
    try {
        const productData = await getProductBySlug(slug);
        const product = productData?.data;
        if (!product) notFound();
        return <ProductDetails product={product} />;
    } catch (e) {
        notFound();
    }
}
