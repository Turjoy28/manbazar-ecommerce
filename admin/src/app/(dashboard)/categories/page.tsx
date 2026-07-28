"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { getUiData, updateUiData } from "@/services/ui";
import { productService, ProductData } from "@/services/product";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Layers, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default function CategoriesPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [uiId, setUiId] = useState<string>("");
    
    const [topLabel, setTopLabel] = useState("Trending Now");
    const [middleLabel, setMiddleLabel] = useState("Seasonal Essentials");
    const [bottomLabel, setBottomLabel] = useState("Clearance & Steals");

    const [products, setProducts] = useState<ProductData[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [uiRes, prodRes] = await Promise.all([
                    getUiData(),
                    productService.getProducts()
                ]);

                if (uiRes?.data?.[0]) {
                    const data = uiRes.data[0];
                    setUiId(data._id);
                    if (data.categoryLabels) {
                        setTopLabel(data.categoryLabels.topCategoryLabel || "Trending Now");
                        setMiddleLabel(data.categoryLabels.middleCategoryLabel || "Seasonal Essentials");
                        setBottomLabel(data.categoryLabels.bottomCategoryLabel || "Clearance & Steals");
                    }
                }

                if (prodRes.success && prodRes.data?.products) {
                    setProducts(prodRes.data.products);
                }
            } catch (error) {
                console.error("Failed to fetch categories data:", error);
                toast.error("Failed to load category settings.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!uiId) {
            toast.error("UI configuration ID not found.");
            return;
        }

        const toastId = toast.loading("Updating category names...");
        setIsUpdating(true);

        try {
            await updateUiData(uiId, {
                "categoryLabels.topCategoryLabel": topLabel,
                "categoryLabels.middleCategoryLabel": middleLabel,
                "categoryLabels.bottomCategoryLabel": bottomLabel,
            });

            toast.success("Categories updated successfully!", { id: toastId });
        } catch (error: any) {
            console.error("Update error:", error);
            toast.error(error.message || "Failed to update categories.", { id: toastId });
        } finally {
            setIsUpdating(false);
        }
    };

    const topCount = products.filter(p => p.categoryAssignment === "TOP" || !p.categoryAssignment).length;
    const middleCount = products.filter(p => p.categoryAssignment === "MIDDLE").length;
    const bottomCount = products.filter(p => p.categoryAssignment === "BOTTOM").length;

    if (isLoading) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
                        <Layers className="h-8 w-8 text-primary" />
                        Manage Categories
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Edit your storefront product layout category names and view product assignments.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 border-border bg-card/40">
                    <CardHeader>
                        <CardTitle className="text-xl">Category Display Names</CardTitle>
                        <CardDescription>
                            These titles appear on your storefront home page above each product grid tier.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleUpdate} className="space-y-6">
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <Label className="text-base font-semibold">Top Tier Category Name</Label>
                                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                                        {topCount} Products Assigned
                                    </Badge>
                                </div>
                                <Input
                                    value={topLabel}
                                    onChange={(e) => setTopLabel(e.target.value)}
                                    placeholder="e.g. Trending Now"
                                    className="h-12 text-lg font-medium"
                                    required
                                />
                                <p className="text-xs text-muted-foreground">Displayed as the first section on the homepage.</p>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <Label className="text-base font-semibold">Middle Tier Category Name</Label>
                                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                                        {middleCount} Products Assigned
                                    </Badge>
                                </div>
                                <Input
                                    value={middleLabel}
                                    onChange={(e) => setMiddleLabel(e.target.value)}
                                    placeholder="e.g. Seasonal Essentials"
                                    className="h-12 text-lg font-medium"
                                    required
                                />
                                <p className="text-xs text-muted-foreground">Displayed as the second section on the homepage.</p>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <Label className="text-base font-semibold">Bottom Tier Category Name</Label>
                                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                                        {bottomCount} Products Assigned
                                    </Badge>
                                </div>
                                <Input
                                    value={bottomLabel}
                                    onChange={(e) => setBottomLabel(e.target.value)}
                                    placeholder="e.g. Clearance & Steals"
                                    className="h-12 text-lg font-medium"
                                    required
                                />
                                <p className="text-xs text-muted-foreground">Displayed as the third section on the homepage.</p>
                            </div>

                            <div className="pt-2">
                                <Button 
                                    type="submit" 
                                    size="lg" 
                                    disabled={isUpdating}
                                    className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 px-8 h-12 text-base font-semibold shadow-md shadow-primary/20"
                                >
                                    {isUpdating ? (
                                        <>
                                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                            Updating Categories...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle2 className="mr-2 h-5 w-5" />
                                            Update Categories
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                <Card className="border-border bg-card/40 h-fit">
                    <CardHeader>
                        <CardTitle className="text-lg">How Categories Work</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm text-muted-foreground leading-relaxed">
                        <p>
                            Your storefront organizes products into three sequential category sections on the homepage.
                        </p>
                        <div className="space-y-2 border-l-2 border-primary/50 pl-3 py-1">
                            <p className="font-medium text-foreground">Assigning Products:</p>
                            <p>
                                To change which category a product appears under, go to <Link href="/products" className="text-primary underline hover:opacity-80">Products</Link>, click <strong>Edit Product</strong>, and select the desired <strong>Layout Category Tier</strong> (TOP, MIDDLE, or BOTTOM).
                            </p>
                        </div>
                        <p className="text-xs bg-muted p-3 rounded-lg border border-border">
                            💡 <strong>Tip:</strong> If a category has 0 assigned products, that section will be automatically hidden from the storefront homepage so there are no empty grids!
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
