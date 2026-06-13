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
