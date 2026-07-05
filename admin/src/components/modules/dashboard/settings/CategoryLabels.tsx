"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateUiData } from "@/services/ui";
import { toast } from "sonner";

export default function CategoryLabels({
    labels, 
    id
}: {
    labels?: {
        topCategoryLabel?: string;
        middleCategoryLabel?: string;
        bottomCategoryLabel?: string;
    };
    id: string;
}) {
    const [topLabel, setTopLabel] = useState(labels?.topCategoryLabel || "Trending Now");
    const [middleLabel, setMiddleLabel] = useState(labels?.middleCategoryLabel || "Seasonal Essentials");
    const [bottomLabel, setBottomLabel] = useState(labels?.bottomCategoryLabel || "Clearance & Steals");

    const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const toastId = toast.loading("Updating category labels...");

        try {
            await updateUiData(id, {
                "categoryLabels.topCategoryLabel": topLabel,
                "categoryLabels.middleCategoryLabel": middleLabel,
                "categoryLabels.bottomCategoryLabel": bottomLabel,
            });

            toast.success("Category labels updated", { id: toastId });
        } catch (error) {
            console.log(error);
            toast.error("Failed to update labels", { id: toastId });
        }
    };

    return (
        <div className="border rounded-xl p-4 space-y-5">
            <h4 className="text-2xl mb-5">Product Layout Categories</h4>
            <form onSubmit={handleUpdate} className="space-y-4">
                <div className="space-y-2">
                    <Label>Top Category Display Name</Label>
                    <Input
                        value={topLabel}
                        onChange={(e) => setTopLabel(e.target.value)}
                        placeholder="e.g. Trending Now"
                        className="w-full h-12"
                    />
                </div>

                <div className="space-y-2">
                    <Label>Middle Category Display Name</Label>
                    <Input
                        value={middleLabel}
                        onChange={(e) => setMiddleLabel(e.target.value)}
                        placeholder="e.g. Seasonal Essentials"
                        className="w-full h-12"
                    />
                </div>

                <div className="space-y-2">
                    <Label>Bottom Category Display Name</Label>
                    <Input
                        value={bottomLabel}
                        onChange={(e) => setBottomLabel(e.target.value)}
                        placeholder="e.g. Clearance & Steals"
                        className="w-full h-12"
                    />
                </div>

                <Button type="submit">Update Layout Labels</Button>
            </form>
        </div>
    );
}
