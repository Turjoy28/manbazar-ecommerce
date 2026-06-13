/* ═══════════════════════════════════════════════════════════════════════════════
   EDIT PRODUCT PAGE
   Fetches an existing product by its ID and renders the reusable ProductForm
   in edit mode. On successful save, navigates back to the products list.
   ═══════════════════════════════════════════════════════════════════════════════ */
"use client";

import React, { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { productService, ProductData } from "@/services/product";
import ProductForm from "@/components/modules/dashboard/products/ProductForm";
import { Loader2 } from "lucide-react";

interface EditProductPageProps {
    params: Promise<{ id: string }>;
}

export default function EditProductPage({ params }: EditProductPageProps) {
    const router = useRouter();
    const { id } = use(params);
    const [product, setProduct] = useState<ProductData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await productService.getProductById(id);
                if (res.success && res.data) {
                    setProduct(res.data);
                } else {
                    toast.error(res.message || "Failed to load product.");
                    router.push("/products");
                }
            } catch (err: any) {
                toast.error(err.message || "Product not found.");
                router.push("/products");
            } finally {
                setIsLoading(false);
            }
        };

        fetchProduct();
    }, [id, router]);

    const handleSubmit = async (payload: Omit<ProductData, "_id">) => {
        setIsSaving(true);
        try {
            const res = await productService.updateProduct(id, payload);
            if (res.success) {
                toast.success("Product updated successfully!");
                router.push("/products");
                router.refresh();
            } else {
                toast.error(res.message || "Failed to update product.");
            }
        } catch (err: any) {
            toast.error(err.message || "Something went wrong.");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-[400px] flex-col items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                <p className="text-muted-foreground text-sm">Loading product details...</p>
            </div>
        );
    }

    return (
        <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
            <ProductForm initialData={product} onSubmit={handleSubmit} isLoading={isSaving} />
        </div>
    );
}
