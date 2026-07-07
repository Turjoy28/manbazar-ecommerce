/* ═══════════════════════════════════════════════════════════════════════════════
   PRODUCT FORM — Reusable Create/Edit Component
   
   Used by both /products/new and /products/[id] pages.
   Handles all product fields: general info, variants, pricing, delivery,
   thumbnail, and gallery images.
   
   KEY DESIGN DECISIONS:
   - Thumbnail is a SEPARATE upload from gallery images. This gives the admin
     explicit control over which image appears in product cards/lists.
   - The same reusable ImageUpload component is used for both thumbnail (single
     mode) and gallery (multiple mode).
   - Auto-slug generation only runs for new products (not edits).
   ═══════════════════════════════════════════════════════════════════════════════ */
"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { ProductData, DeliveryChargeItem } from "@/services/product";
import { getUiData } from "@/services/ui";
import ImageUpload from "@/components/shared/imageUpload";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Plus, X, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

/* ─── URL → Embed URL Converter ─── */
/**
 * Converts a watch URL to the appropriate embed URL for iframes.
 * YouTube: https://www.youtube.com/watch?v=ID → https://www.youtube.com/embed/ID
 * YouTube short: https://youtu.be/ID           → https://www.youtube.com/embed/ID
 * TikTok: https://www.tiktok.com/@x/video/ID  → https://www.tiktok.com/embed/v2/ID
 * Others: returned as-is (Instagram, etc. use their own embed URLs)
 */
function toEmbedUrl(url: string): string {
    try {
        const u = new URL(url);
        // YouTube full  
        if (u.hostname.includes("youtube.com") && u.searchParams.get("v")) {
            return `https://www.youtube.com/embed/${u.searchParams.get("v")}`;
        }
        // YouTube short  
        if (u.hostname === "youtu.be") {
            return `https://www.youtube.com/embed${u.pathname}`;
        }
        // TikTok  
        if (u.hostname.includes("tiktok.com")) {
            const videoId = u.pathname.split("/video/")[1]?.split("?")[0];
            if (videoId) return `https://www.tiktok.com/embed/v2/${videoId}`;
        }
    } catch {
        // not a valid URL — return as-is
    }
    return url;
}

/* ─── Props ─── */
interface ProductFormProps {
    /** Pre-existing product data (for edit mode). Null/undefined for create mode. */
    initialData?: ProductData | null;
    /** Callback fired when the form is submitted with validated data. */
    onSubmit: (data: Omit<ProductData, "_id">) => Promise<void>;
    /** Whether the parent is currently processing the submission. */
    isLoading: boolean;
}

export default function ProductForm({ initialData, onSubmit, isLoading }: ProductFormProps) {
    const router = useRouter();

    /* ─── General Info State ─── */
    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");
    const [categoryAssignment, setCategoryAssignment] = useState<"TOP" | "MIDDLE" | "BOTTOM">("TOP");
    const [videoUrl, setVideoUrl] = useState("");
    const [price, setPrice] = useState<number | "">("");
    const [originalPrice, setOriginalPrice] = useState<number | "">("");
    const [offerType, setOfferType] = useState<"NONE" | "PERCENTAGE" | "DIRECT">("NONE");
    const [offerValue, setOfferValue] = useState<number | "">("");
    const [stock, setStock] = useState<number>(10);
    const [description, setDescription] = useState("");
    const [fabric, setFabric] = useState("");
    const [fit, setFit] = useState("");
    const [isActive, setIsActive] = useState(true);

    /* ─── Thumbnail State ───
       Stored as a single URL string. The ImageUpload component works with
       arrays, so we wrap/unwrap when passing to it. */
    const [thumbnail, setThumbnail] = useState("");

    /* ─── Gallery Images State ─── */
    const [images, setImages] = useState<string[]>([]);

    /* ─── Variant Arrays ─── */
    const [colors, setColors] = useState<string[]>([]);
    const [colorInput, setColorInput] = useState("");
    const [sizes, setSizes] = useState<string[]>([]);
    const [sizeInput, setSizeInput] = useState("");

    /* ─── Dynamic Lists (highlights, careInstructions) ─── */
    const [highlights, setHighlights] = useState<string[]>([]);
    const [newHighlight, setNewHighlight] = useState("");
    const [careInstructions, setCareInstructions] = useState<string[]>([]);
    const [newCareInstruction, setNewCareInstruction] = useState("");

    /* ─── Delivery charges (defaults: Inside Dhaka, Outside Dhaka) ─── */
    const [insideDhakaPrice, setInsideDhakaPrice] = useState<number>(80);
    const [outsideDhakaPrice, setOutsideDhakaPrice] = useState<number>(150);

    /* ─── Dynamic Layout Labels ─── */
    const [uiLabels, setUiLabels] = useState({
        TOP: "Trending Now",
        MIDDLE: "Seasonal Essentials",
        BOTTOM: "Clearance & Steals"
    });

    useEffect(() => {
        getUiData().then(res => {
            if (res?.data?.[0]?.categoryLabels) {
                const labels = res.data[0].categoryLabels;
                setUiLabels({
                    TOP: labels.topCategoryLabel || "Trending Now",
                    MIDDLE: labels.middleCategoryLabel || "Seasonal Essentials",
                    BOTTOM: labels.bottomCategoryLabel || "Clearance & Steals"
                });
            }
        }).catch(console.error);
    }, []);

    /* ─── Populate form fields when editing an existing product ─── */
    useEffect(() => {
        if (initialData) {
            setName(initialData.name || "");
            setSlug(initialData.slug || "");
            setCategoryAssignment(initialData.categoryAssignment || "TOP");
            setVideoUrl(initialData.videoUrl || "");
            setPrice(initialData.base_price ?? initialData.price ?? "");
            setOriginalPrice(initialData.originalPrice ?? "");
            setOfferType(initialData.offerType || "NONE");
            setOfferValue(initialData.offerValue ?? "");
            setStock(initialData.stock || 0);
            setDescription(initialData.description || "");
            setFabric(initialData.fabric || "");
            setFit(initialData.fit || "");
            setIsActive(initialData.isActive !== undefined ? initialData.isActive : true);
            /* Set thumbnail from existing data */
            setThumbnail(initialData.thumbnail || "");
            setImages(initialData.images || []);
            setColors(initialData.colors || []);
            setSizes(initialData.sizes || []);
            setHighlights(initialData.highlights || []);
            setCareInstructions(initialData.careInstructions || []);

            /* Extract delivery charge prices from the deliveryCharge array */
            const inside = initialData.deliveryCharge?.find(d => d.text.toLowerCase().includes("inside"))?.price ?? 80;
            const outside = initialData.deliveryCharge?.find(d => d.text.toLowerCase().includes("outside"))?.price ?? 150;
            setInsideDhakaPrice(inside);
            setOutsideDhakaPrice(outside);
        }
    }, [initialData]);

    /* ─── Auto-generate slug from product name (only for new products) ─── */
    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setName(val);
        if (!initialData) {
            setSlug(
                val
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, "-")
                    .replace(/(^-|-$)+/g, "")
            );
        }
    };

    /* ─── Color Helpers ─── */
    const addColor = () => {
        const color = colorInput.trim();
        if (color && !colors.includes(color)) {
            setColors([...colors, color]);
            setColorInput("");
        }
    };
    const removeColor = (colorToRemove: string) => {
        setColors(colors.filter(c => c !== colorToRemove));
    };

    /* ─── Size Helpers ─── */
    const addSize = () => {
        const size = sizeInput.trim().toUpperCase();
        if (size && !sizes.includes(size)) {
            setSizes([...sizes, size]);
            setSizeInput("");
        }
    };
    const removeSize = (sizeToRemove: string) => {
        setSizes(sizes.filter(s => s !== sizeToRemove));
    };

    /* ─── Highlights Helpers ─── */
    const addHighlight = () => {
        if (newHighlight.trim()) {
            setHighlights([...highlights, newHighlight.trim()]);
            setNewHighlight("");
        }
    };
    const removeHighlight = (index: number) => {
        setHighlights(highlights.filter((_, i) => i !== index));
    };

    /* ─── Care Instructions Helpers ─── */
    const addCareInstruction = () => {
        if (newCareInstruction.trim()) {
            setCareInstructions([...careInstructions, newCareInstruction.trim()]);
            setNewCareInstruction("");
        }
    };
    const removeCareInstruction = (index: number) => {
        setCareInstructions(careInstructions.filter((_, i) => i !== index));
    };

    /* ─── Form Submission ─── */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        /* Client-side validation */
        if (!name.trim()) {
            toast.error("Product name is required.");
            return;
        }
        if (!slug.trim()) {
            toast.error("Product slug is required.");
            return;
        }
        if (price === "" || price <= 0) {
            toast.error("Price must be greater than 0.");
            return;
        }
        if (!thumbnail) {
            toast.error("Please upload a thumbnail image.");
            return;
        }

        /* Client-side validation for promotional pricing */
        if (offerType !== "NONE") {
            if (offerValue === "" || Number(offerValue) <= 0) {
                toast.error("Please enter a valid offer value greater than 0.");
                return;
            }
            if (offerType === "PERCENTAGE" && Number(offerValue) > 100) {
                toast.error("Percentage discount cannot exceed 100%.");
                return;
            }
            if (offerType === "DIRECT" && Number(offerValue) > Number(price)) {
                toast.error("Direct discount amount cannot exceed the Base Price.");
                return;
            }
        }

        /* Build delivery charge array */
        const deliveryCharge: DeliveryChargeItem[] = [
            { text: "Inside Dhaka", price: insideDhakaPrice },
            { text: "Outside Dhaka", price: outsideDhakaPrice },
        ];

        /* Assemble the complete product payload */
        const payload: Omit<ProductData, "_id"> = {
            name: name.trim(),
            slug: slug.trim(),
            categoryAssignment,
            videoUrl: videoUrl.trim() || undefined,
            price: price as number,
            originalPrice: originalPrice !== "" ? originalPrice : undefined,
            base_price: price as number,
            offerType,
            offerValue: offerValue !== "" ? Number(offerValue) : 0,
            stock,
            description: description.trim(),
            fabric: fabric.trim() || undefined,
            fit: fit.trim() || undefined,
            isActive,
            images,
            /* Thumbnail is now explicitly set by the user, not auto-derived */
            thumbnail,
            colors,
            sizes,
            highlights,
            careInstructions,
            deliveryCharge,
        };

        await onSubmit(payload);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* ─── Page Header with Back and Save buttons ─── */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {/* Back button navigates to previous page */}
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => router.back()}
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-foreground">
                            {initialData ? "Edit Product" : "New Product"}
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            {initialData ? "Update product details and specifications" : "Create a new product listing"}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* Cancel navigates back without saving */}
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.back()}
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                    {/* Submit button with loading spinner */}
                    <Button
                        type="submit"
                        className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/20"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            "Save Product"
                        )}
                    </Button>
                </div>
            </div>

            {/* ─── Main Grid Layout: 2 columns left, 1 column right ─── */}
            <div className="grid gap-6 md:grid-cols-3">
                {/* ═════ LEFT COLUMNS — Product Details ═════ */}
                <div className="space-y-6 md:col-span-2">
                    {/* ── General Information Card ── */}
                    <Card className="border-border bg-card/40">
                        <CardHeader>
                            <CardTitle className="text-lg text-foreground">General Information</CardTitle>
                            <CardDescription className="text-muted-foreground">Specify details about your product</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Product name — auto-generates slug for new products */}
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-foreground/80">Product Name</Label>
                                <Input
                                    id="name"
                                    value={name}
                                    onChange={handleNameChange}
                                    placeholder="Premium Polo T-Shirt"
                                    className="border-border bg-background/40 text-foreground placeholder-muted-foreground focus:border-primary focus:ring-primary"
                                    required
                                />
                            </div>

                            {/* Slug — used for SEO-friendly URLs */}
                            <div className="space-y-2">
                                <Label htmlFor="slug" className="text-foreground/80">Slug URL</Label>
                                <Input
                                    id="slug"
                                    value={slug}
                                    onChange={(e) => setSlug(e.target.value)}
                                    placeholder="premium-polo-t-shirt"
                                    className="border-border bg-background/40 text-foreground placeholder-muted-foreground focus:border-primary focus:ring-primary"
                                    required
                                />
                            </div>

                            {/* Category input */}
                            <div className="space-y-2">
                                <Label htmlFor="categoryAssignment" className="text-foreground/80">Layout Category Tier</Label>
                                <select
                                    id="categoryAssignment"
                                    value={categoryAssignment}
                                    onChange={(e) => setCategoryAssignment(e.target.value as any)}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <option value="TOP">{uiLabels.TOP}</option>
                                    <option value="MIDDLE">{uiLabels.MIDDLE}</option>
                                    <option value="BOTTOM">{uiLabels.BOTTOM}</option>
                                </select>
                                <p className="text-[11px] text-muted-foreground">Assign this product to a category tier for dynamic sections in the storefront.</p>
                            </div>

                            {/* Product Video URL */}
                            <div className="space-y-2">
                                <Label htmlFor="videoUrl" className="text-foreground/80">
                                    Product Video URL
                                    <span className="ml-2 text-[10px] font-normal text-muted-foreground bg-muted px-1.5 py-0.5 rounded">Optional</span>
                                </Label>
                                <Input
                                    id="videoUrl"
                                    type="url"
                                    value={videoUrl}
                                    onChange={(e) => setVideoUrl(e.target.value)}
                                    placeholder="https://www.youtube.com/watch?v=... or https://www.instagram.com/reel/..."
                                    className="border-border bg-background/40 text-foreground placeholder-muted-foreground focus:border-primary focus:ring-primary"
                                />
                                <p className="text-[11px] text-muted-foreground">
                                    Paste a YouTube, Instagram Reel, or TikTok URL. The video will be embedded on the product page — no file upload needed.
                                </p>
                                {/* Live embed preview */}
                                {videoUrl.trim() && (
                                    <div className="mt-2 rounded-lg overflow-hidden border border-border aspect-video bg-black/10">
                                        <iframe
                                            src={toEmbedUrl(videoUrl.trim())}
                                            className="w-full h-full"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                            title="Video Preview"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Full product description */}
                            <div className="space-y-2">
                                <Label htmlFor="description" className="text-foreground/80">Description</Label>
                                <Textarea
                                    id="description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Add full product description..."
                                    className="min-h-[140px] border-border bg-background/40 text-foreground placeholder-muted-foreground focus:border-primary focus:ring-primary"
                                />
                            </div>

                            {/* Fabric and Fit — side by side */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="fabric" className="text-foreground/80">Fabric Material</Label>
                                    <Input
                                        id="fabric"
                                        value={fabric}
                                        onChange={(e) => setFabric(e.target.value)}
                                        placeholder="100% Pique Cotton"
                                        className="border-border bg-background/40 text-foreground placeholder-muted-foreground focus:border-primary"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="fit" className="text-foreground/80">Fit type</Label>
                                    <Input
                                        id="fit"
                                        value={fit}
                                        onChange={(e) => setFit(e.target.value)}
                                        placeholder="Regular Fit"
                                        className="border-border bg-background/40 text-foreground placeholder-muted-foreground focus:border-primary"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* ── Variants & Attributes Card ── */}
                    <Card className="border-border bg-card/40">
                        <CardHeader>
                            <CardTitle className="text-lg text-foreground">Product Variants & Attributes</CardTitle>
                            <CardDescription className="text-muted-foreground">Configure sizing, color swatches and features</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* ── Color Tags ── */}
                            <div className="space-y-2">
                                <Label className="text-foreground/80">Available Colors</Label>
                                <div className="flex gap-2">
                                    <Input
                                        value={colorInput}
                                        onChange={(e) => setColorInput(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addColor())}
                                        placeholder="Add color (e.g. Navy Blue) and press Enter"
                                        className="border-border bg-background/40 text-foreground"
                                    />
                                    <Button type="button" onClick={addColor} variant="outline" className="border-border text-foreground hover:bg-muted">Add</Button>
                                </div>
                                {/* Render color chips */}
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {colors.map((color) => (
                                        <span key={color} className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-sm text-foreground/80">
                                            {color}
                                            <button type="button" onClick={() => removeColor(color)} className="rounded-full p-0.5 hover:bg-muted-foreground/20 text-muted-foreground">
                                                <X className="h-3 w-3" />
                                            </button>
                                        </span>
                                    ))}
                                    {colors.length === 0 && <p className="text-xs text-muted-foreground italic">No colors added yet.</p>}
                                </div>
                            </div>

                            {/* ── Size Tags ── */}
                            <div className="space-y-2">
                                <Label className="text-foreground/80">Available Sizes</Label>
                                <div className="flex gap-2">
                                    <Input
                                        value={sizeInput}
                                        onChange={(e) => setSizeInput(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSize())}
                                        placeholder="Add size (e.g. XL, M) and press Enter"
                                        className="border-border bg-background/40 text-foreground"
                                    />
                                    <Button type="button" onClick={addSize} variant="outline" className="border-border text-foreground hover:bg-muted">Add</Button>
                                </div>
                                {/* Render size chips with brand accent */}
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {sizes.map((size) => (
                                        <span key={size} className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-sm text-primary font-semibold">
                                            {size}
                                            <button type="button" onClick={() => removeSize(size)} className="rounded-full p-0.5 hover:bg-primary/20 text-primary">
                                                <X className="h-3 w-3" />
                                            </button>
                                        </span>
                                    ))}
                                    {sizes.length === 0 && <p className="text-xs text-muted-foreground italic">No sizes added yet.</p>}
                                </div>
                            </div>

                            <hr className="border-border" />

                            {/* ── Highlights List ── */}
                            <div className="space-y-2">
                                <Label className="text-foreground/80">Product Highlights</Label>
                                <div className="flex gap-2">
                                    <Input
                                        value={newHighlight}
                                        onChange={(e) => setNewHighlight(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addHighlight())}
                                        placeholder="Add feature highlight..."
                                        className="border-border bg-background/40 text-foreground"
                                    />
                                    <Button type="button" onClick={addHighlight} variant="outline" className="border-border text-foreground hover:bg-muted">Add</Button>
                                </div>
                                <ul className="mt-2 space-y-1">
                                    {highlights.map((hl, i) => (
                                        <li key={i} className="flex items-center justify-between rounded-lg bg-background/20 border border-border/40 px-3 py-1.5 text-sm text-foreground/80">
                                            <span>• {hl}</span>
                                            <button type="button" onClick={() => removeHighlight(i)} className="text-muted-foreground hover:text-red-400">
                                                <X className="h-4 w-4" />
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* ── Care Instructions List ── */}
                            <div className="space-y-2">
                                <Label className="text-foreground/80">Care Instructions</Label>
                                <div className="flex gap-2">
                                    <Input
                                        value={newCareInstruction}
                                        onChange={(e) => setNewCareInstruction(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCareInstruction())}
                                        placeholder="Add care instruction (e.g. Wash cold)..."
                                        className="border-border bg-background/40 text-foreground"
                                    />
                                    <Button type="button" onClick={addCareInstruction} variant="outline" className="border-border text-foreground hover:bg-muted">Add</Button>
                                </div>
                                <ul className="mt-2 space-y-1">
                                    {careInstructions.map((ci, i) => (
                                        <li key={i} className="flex items-center justify-between rounded-lg bg-background/20 border border-border/40 px-3 py-1.5 text-sm text-foreground/80">
                                            <span>• {ci}</span>
                                            <button type="button" onClick={() => removeCareInstruction(i)} className="text-muted-foreground hover:text-red-400">
                                                <X className="h-4 w-4" />
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* ═════ RIGHT COLUMN — Pricing, Stock, Delivery, Images ═════ */}
                <div className="space-y-6">
                    {/* ── Pricing & Stock Card ── */}
                    <Card className="border-border bg-card/40">
                        <CardHeader>
                            <CardTitle className="text-lg text-foreground">Pricing & Stock</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Base price */}
                            <div className="space-y-2">
                                <Label htmlFor="price" className="text-foreground/80">Base Price (৳)</Label>
                                <Input
                                    id="price"
                                    type="number"
                                    value={price}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setPrice(val === "" ? "" : Number(val));
                                    }}
                                    className="border-border bg-background/40 text-foreground font-semibold"
                                    required
                                />
                            </div>

                            {/* Offer Type */}
                            <div className="space-y-2">
                                <Label htmlFor="offerType" className="text-foreground/80">Offer Type</Label>
                                <select
                                    id="offerType"
                                    value={offerType}
                                    onChange={(e) => {
                                        const val = e.target.value as any;
                                        setOfferType(val);
                                        if (val === "NONE") {
                                            setOfferValue("");
                                        }
                                    }}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <option value="NONE">None</option>
                                    <option value="PERCENTAGE">Percentage Reduction (%)</option>
                                    <option value="DIRECT">Direct Amount Reduction (৳)</option>
                                </select>
                            </div>

                            {/* Offer Value */}
                            <div className="space-y-2">
                                <Label htmlFor="offerValue" className="text-foreground/80">Offer Value</Label>
                                <Input
                                    id="offerValue"
                                    type="number"
                                    value={offerValue}
                                    disabled={offerType === "NONE"}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setOfferValue(val === "" ? "" : Number(val));
                                    }}
                                    className="border-border bg-background/40 text-foreground disabled:opacity-50"
                                    placeholder={
                                        offerType === "NONE"
                                            ? "Select an offer type first"
                                            : offerType === "PERCENTAGE"
                                            ? "e.g. 10 (for 10% off)"
                                            : "e.g. 50 (for ৳50 off)"
                                    }
                                />
                            </div>

                            {/* Dynamic final sale price display */}
                            {price !== "" && offerType !== "NONE" && offerValue !== "" && (
                                <div className="p-3 bg-primary/10 rounded-lg border border-primary/20 text-sm">
                                    <div className="flex justify-between items-center">
                                        <span className="text-muted-foreground font-medium">Final Sale Price:</span>
                                        <span className="text-primary font-bold text-base">
                                            ৳
                                            {Math.round(
                                                offerType === "PERCENTAGE"
                                                    ? Number(price) * (1 - Number(offerValue) / 100)
                                                    : Number(price) - Number(offerValue)
                                            )}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Stock count */}
                            <div className="space-y-2">
                                <Label htmlFor="stock" className="text-foreground/80">Stock Count</Label>
                                <Input
                                    id="stock"
                                    type="number"
                                    value={stock}
                                    onChange={(e) => setStock(Number(e.target.value))}
                                    className="border-border bg-background/40 text-foreground"
                                    required
                                />
                            </div>

                            {/* Active/Inactive toggle — controls storefront visibility */}
                            <div className="flex items-center justify-between rounded-lg bg-background/30 border border-border/80 p-3">
                                <div className="flex flex-col">
                                    <span className="text-sm font-semibold text-foreground/80">Product Status</span>
                                    <span className="text-xs text-muted-foreground">Visible on storefront if active</span>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={isActive}
                                    onChange={(e) => setIsActive(e.target.checked)}
                                    className="h-5 w-5 rounded border-border bg-background accent-primary"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* ── Delivery Charges Card ── */}
                    <Card className="border-border bg-card/40">
                        <CardHeader>
                            <CardTitle className="text-lg text-foreground">Delivery Charges (৳)</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="insideDhaka" className="text-foreground/80">Inside Dhaka (৳)</Label>
                                <Input
                                    id="insideDhaka"
                                    type="number"
                                    value={insideDhakaPrice}
                                    onChange={(e) => setInsideDhakaPrice(Number(e.target.value))}
                                    className="border-border bg-background/40 text-foreground"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="outsideDhaka" className="text-foreground/80">Outside Dhaka (৳)</Label>
                                <Input
                                    id="outsideDhaka"
                                    type="number"
                                    value={outsideDhakaPrice}
                                    onChange={(e) => setOutsideDhakaPrice(Number(e.target.value))}
                                    className="border-border bg-background/40 text-foreground"
                                    required
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* ══════════════════════════════════════════════════════════
                       THUMBNAIL UPLOAD — Single Image Mode
                       Uses the SAME reusable ImageUpload component in single mode.
                       The thumbnail is the primary image shown in product cards,
                       lists, and the storefront grid.
                       ══════════════════════════════════════════════════════════ */}
                    <ImageUpload
                        value={thumbnail ? [thumbnail] : []}
                        onChange={(urls) => setThumbnail(urls[0] || "")}
                        multiple={false}
                        maxFiles={1}
                        title="Product Thumbnail"
                        description="Upload the main product image. This appears in product cards and search results."
                    />

                    {/* ══════════════════════════════════════════════════════════
                       GALLERY IMAGES — Multiple Image Mode
                       Uses the SAME reusable ImageUpload component in multi mode.
                       These are additional images shown on the product detail page.
                       ══════════════════════════════════════════════════════════ */}
                    <ImageUpload
                        value={images}
                        onChange={setImages}
                        multiple
                        maxFiles={6}
                        title="Product Gallery Images"
                        description="Add up to 6 additional images for the product detail gallery."
                    />
                </div>
            </div>
        </form>
    );
}
