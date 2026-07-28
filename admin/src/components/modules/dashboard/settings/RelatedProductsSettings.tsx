"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateUiData } from "@/services/ui";
import { toast } from "sonner";

export default function RelatedProductsSettings({
    relatedProducts,
    id
}: {
    relatedProducts?: {
        title?: string;
        subtitle?: string;
    };
    id: string;
}) {
    const [title, setTitle] = useState(relatedProducts?.title || "অনুরূপ পণ্য");
    const [subtitle, setSubtitle] = useState(relatedProducts?.subtitle || "একই ক্যাটাগরির অন্যান্য পছন্দের পণ্যগুলো দেখুন");

    const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const toastId = toast.loading("Updating related products settings...");

        try {
            await updateUiData(id, {
                "relatedProducts.title": title,
                "relatedProducts.subtitle": subtitle,
            });

            toast.success("Related products settings updated", { id: toastId });
        } catch (error) {
            console.log(error);
            toast.error("Failed to update settings", { id: toastId });
        }
    };

    return (
        <div className="border rounded-xl p-4 space-y-5">
            <h4 className="text-2xl mb-5">Related Products Settings</h4>
            <form onSubmit={handleUpdate} className="space-y-4">
                <div className="space-y-2">
                    <Label>Section Title</Label>
                    <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. অনুরূপ পণ্য"
                        className="w-full h-12"
                    />
                </div>

                <div className="space-y-2">
                    <Label>Section Subtitle</Label>
                    <Input
                        value={subtitle}
                        onChange={(e) => setSubtitle(e.target.value)}
                        placeholder="e.g. একই ক্যাটাগরির অন্যান্য পছন্দের পণ্যগুলো দেখুন"
                        className="w-full h-12"
                    />
                </div>

                <Button type="submit">Update Related Products</Button>
            </form>
        </div>
    );
}
