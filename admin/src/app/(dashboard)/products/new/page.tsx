"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { productService, ProductData } from "@/services/product";
import ProductForm from "@/components/modules/dashboard/products/ProductForm";

export default function NewProductPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (payload: Omit<ProductData, "_id">) => {
        setIsLoading(true);
        try {
            const res = await productService.createProduct(payload);
            if (res.success) {
                toast.success("Product created successfully!");
                router.push("/products");
                router.refresh();
            } else {
                toast.error(res.message || "Failed to create product.");
            }
        } catch (err: any) {
            toast.error(err.message || "Something went wrong.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
            <ProductForm onSubmit={handleSubmit} isLoading={isLoading} />
        </div>
    );
}
