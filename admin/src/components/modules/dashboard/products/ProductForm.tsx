/* ═══════════════════════════════════════════════════════════════════════════════
   PRODUCT FORM — Reusable Create/Edit Component
   
   Used by both /products/new and /products/[id] pages.
   Handles all product fields: general info, color variants (with per-variant
   image galleries), sizes, pricing, delivery, thumbnail, and legacy gallery.
   
   KEY DESIGN DECISIONS:
   - Color Variants replace flat colors[] + images[]. Each variant has its own
     image gallery, stock count, and optional price override.
   - Legacy `colors` and `images` fields are still sent to support old products
     that haven't been migrated.
   - Thumbnail is a SEPARATE upload — explicit control over product card image.
   - Auto-slug generation only runs for new products (not edits).
   ═══════════════════════════════════════════════════════════════════════════════ */
"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { ProductData, ProductVariant, DeliveryChargeItem } from "@/services/product";
import { categoryService, CategoryData } from "@/services/category";
import ImageUpload from "@/components/shared/imageUpload";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Plus, X, Loader2, ArrowLeft, ChevronDown, ChevronUp, Palette, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

/* ─── URL → Embed URL Converter ─── */
function toEmbedUrl(url: string): string {
    try {
        const u = new URL(url);
        if (u.hostname.includes("youtube.com") && u.searchParams.get("v")) {
            return `https://www.youtube.com/embed/${u.searchParams.get("v")}`;
        }
        if (u.hostname === "youtu.be") {
            return `https://www.youtube.com/embed${u.pathname}`;
        }
        if (u.hostname.includes("tiktok.com")) {
            const videoId = u.pathname.split("/video/")[1]?.split("?")[0];
            if (videoId) return `https://www.tiktok.com/embed/v2/${videoId}`;
        }
    } catch {
        // not a valid URL — return as-is
    }
    return url;
}

/* ─── Default empty variant factory ─── */
const createEmptyVariant = (): ProductVariant => ({
    color: { name: "", hex: "#3B82F6" },
    sku: "",
    stock: 0,
    quantity_on_hand: 0,
    price: null,
    sale_price: null,
    images: [],
});

/* ─── Props ─── */
interface ProductFormProps {
    initialData?: ProductData | null;
    onSubmit: (data: Omit<ProductData, "_id">) => Promise<void>;
    isLoading: boolean;
}

export default function ProductForm({ initialData, onSubmit, isLoading }: ProductFormProps) {
    const router = useRouter();

    /* ─── General Info State ─── */
    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");
    const [productId, setProductId] = useState("");

    const [selectedCategory, setSelectedCategory] = useState<string>("");
    const [videoUrl, setVideoUrl] = useState("");
    const [price, setPrice] = useState<number | "">("");
    const [vatPercentage, setVatPercentage] = useState<number | "">("");
    const [originalPrice, setOriginalPrice] = useState<number | "">("");
    const [offerType, setOfferType] = useState<"NONE" | "PERCENTAGE" | "DIRECT">("NONE");
    const [offerValue, setOfferValue] = useState<number | "">("");
    const [quantityOnHand, setQuantityOnHand] = useState<number | "">("");
    const [description, setDescription] = useState("");
    const [fabric, setFabric] = useState("");
    const [fit, setFit] = useState("");
    const [isActive, setIsActive] = useState(true);

    /* ─── Thumbnail State ─── */
    const [thumbnail, setThumbnail] = useState("");

    /* ─── Legacy Gallery Images (fallback for old products) ─── */
    const [images, setImages] = useState<string[]>([]);

    /* ─── Color Variants State ─── */
    const [variants, setVariants] = useState<ProductVariant[]>([]);
    const [expandedVariant, setExpandedVariant] = useState<number | null>(null);

    /* ─── Size Tags ─── */
    const [sizes, setSizes] = useState<string[]>([]);
    const [sizeInput, setSizeInput] = useState("");

    /* ─── Dynamic Lists ─── */
    const [highlights, setHighlights] = useState<string[]>([]);
    const [newHighlight, setNewHighlight] = useState("");
    const [careInstructions, setCareInstructions] = useState<string[]>([]);
    const [newCareInstruction, setNewCareInstruction] = useState("");

    /* ─── Delivery charges ─── */
    const [insideDhakaPrice, setInsideDhakaPrice] = useState<number | "">(80);
    const [outsideDhakaPrice, setOutsideDhakaPrice] = useState<number | "">(150);
    const [subcityDhakaPrice, setSubcityDhakaPrice] = useState<number | "">(100);

    /* ─── Dynamic Categories ─── */
    const [availableCategories, setAvailableCategories] = useState<CategoryData[]>([]);

    useEffect(() => {
        categoryService.getCategories().then(res => {
            if (res.success && res.data) {
                setAvailableCategories(res.data);
            }
        }).catch(console.error);
    }, []);

    /* ─── Populate form for editing ─── */
    useEffect(() => {
        if (initialData) {
            setName(initialData.name || "");
            setSlug(initialData.slug || "");
            setProductId(initialData.productId || "");

            // Set the selected category from the populated category object
            const cat = initialData.category as any;
            if (cat) {
                setSelectedCategory(typeof cat === "string" ? cat : cat._id || "");
            }
            setVideoUrl(initialData.videoUrl || "");
            setPrice(initialData.base_price ?? initialData.price ?? "");
            setVatPercentage(initialData.vatPercentage ?? "");
            setOriginalPrice(initialData.originalPrice ?? "");
            setOfferType(initialData.offerType || "NONE");
            setOfferValue(initialData.offerValue ?? "");
            setQuantityOnHand(initialData.quantity_on_hand ?? initialData.stock ?? "");
            setDescription(initialData.description || "");
            setFabric(initialData.fabric || "");
            setFit(initialData.fit || "");
            setIsActive(initialData.isActive !== undefined ? initialData.isActive : true);
            setThumbnail(initialData.thumbnail || "");
            setImages(initialData.images || []);
            setVariants(initialData.variants || []);
            setSizes(initialData.sizes || []);
            setHighlights(initialData.highlights || []);
            setCareInstructions(initialData.careInstructions || []);

            const inside = initialData.deliveryCharge?.find(d => d.text.toLowerCase().includes("inside"))?.price;
            const outside = initialData.deliveryCharge?.find(d => d.text.toLowerCase().includes("outside"))?.price;
            const subcity = initialData.deliveryCharge?.find(d => d.text.toLowerCase().includes("subcity"))?.price;
            setInsideDhakaPrice(inside ?? 80);
            setOutsideDhakaPrice(outside ?? 150);
            setSubcityDhakaPrice(subcity ?? 100);
        }
    }, [initialData]);

    /* ─── Auto-generate slug & SKU from product name (real-time) ─── */
    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setName(val);
        const slugified = val
            .toLowerCase()
            .replace(/[^\p{L}\p{N}\s-]/gu, "")
            .replace(/[\s_]+/g, "-")
            .replace(/-+/g, "-")
            .replace(/(^-|-$)+/g, "");
        setSlug(slugified);
        // SKU only auto-generates for new products — stays fixed once created
        if (!initialData) {
            setProductId(
                "MB-" +
                val
                    .toUpperCase()
                    .replace(/[^A-Z0-9]+/g, "-")
                    .replace(/(^-|-$)+/g, "")
            );
        }
    };

    /* ─── Variant Helpers ─── */
    const addVariant = () => {
        const newVariant = createEmptyVariant();
        setVariants(prev => [...prev, newVariant]);
        setExpandedVariant(variants.length); // auto-expand the new one
    };

    const removeVariant = (index: number) => {
        setVariants(prev => prev.filter((_, i) => i !== index));
        if (expandedVariant === index) setExpandedVariant(null);
    };

    const updateVariant = (index: number, updates: Partial<ProductVariant>) => {
        setVariants(prev => {
            const next = [...prev];
            next[index] = { ...next[index], ...updates };
            return next;
        });
    };

    const updateVariantColor = (index: number, field: "name" | "hex", value: string) => {
        setVariants(prev => {
            const next = [...prev];
            next[index] = { ...next[index], color: { ...next[index].color, [field]: value } };
            return next;
        });
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

        if (!name.trim()) { toast.error("Product name is required."); return; }
        if (!slug.trim()) { toast.error("Product slug is required."); return; }
        if (price === "" || price <= 0) { toast.error("Price must be greater than 0."); return; }
        if (!thumbnail) { toast.error("Please upload a thumbnail image."); return; }

        if (offerType !== "NONE") {
            if (offerValue === "" || Number(offerValue) <= 0) { toast.error("Please enter a valid offer value greater than 0."); return; }
            if (offerType === "PERCENTAGE" && Number(offerValue) > 100) { toast.error("Percentage discount cannot exceed 100%."); return; }
            if (offerType === "DIRECT" && Number(offerValue) > Number(price)) { toast.error("Direct discount amount cannot exceed the Base Price."); return; }
        }

        // Validate variants — every variant needs a color name
        for (let i = 0; i < variants.length; i++) {
            if (!variants[i].color.name.trim()) {
                toast.error(`Variant ${i + 1}: Color name is required.`);
                setExpandedVariant(i);
                return;
            }
        }

        const deliveryCharge: DeliveryChargeItem[] = [
            { text: "Inside Dhaka", price: Number(insideDhakaPrice) || 0 },
            { text: "Outside Dhaka", price: Number(outsideDhakaPrice) || 0 },
            { text: "Subcity", price: Number(subcityDhakaPrice) || 0 },
        ];

        // Derive legacy colors[] from variant names for backward compat
        const legacyColors = variants.length > 0
            ? variants.map(v => v.color.name)
            : [];

        // Derive legacy images[] from the first variant's images (or keep existing)
        const legacyImages = variants.length > 0
            ? (variants[0]?.images || images)
            : images;

        const finalQuantityOnHand = variants.length > 0
            ? variants.reduce((sum, v) => sum + (v.quantity_on_hand ?? v.stock ?? 0), 0)
            : (quantityOnHand !== "" ? Number(quantityOnHand) : 0);

        const payload: Omit<ProductData, "_id"> = {
            name: name.trim(),
            slug: slug.trim(),
            productId: productId.trim(),

            category: selectedCategory || null,
            videoUrl: videoUrl.trim() || undefined,
            price: price as number,
            vatPercentage: vatPercentage !== "" ? Number(vatPercentage) : 0,
            originalPrice: originalPrice !== "" ? originalPrice : undefined,
            base_price: price as number,
            offerType,
            offerValue: offerValue !== "" ? Number(offerValue) : 0,
            quantity_on_hand: finalQuantityOnHand,
            stock: finalQuantityOnHand, // Fallback for clients expecting stock until full backend migration
            description: description.trim(),
            fabric: fabric.trim() || undefined,
            fit: fit.trim() || undefined,
            isActive,
            thumbnail,
            variants,
            images: legacyImages,
            colors: legacyColors,
            sizes,
            highlights,
            careInstructions,
            deliveryCharge,
        };

        await onSubmit(payload);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* ─── Page Header ─── */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Button type="button" variant="outline" size="icon" onClick={() => router.back()}>
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
                    <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>Cancel</Button>
                    <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/20" disabled={isLoading}>
                        {isLoading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</>) : ("Save Product")}
                    </Button>
                </div>
            </div>

            {/* ─── Main Grid Layout ─── */}
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
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-foreground/80">Product Name</Label>
                                <Input id="name" value={name} onChange={handleNameChange} placeholder="Premium Polo T-Shirt" className="border-border bg-background/40 text-foreground placeholder-muted-foreground focus:border-primary focus:ring-primary" required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="productId" className="text-foreground/80">SKU (Product ID)</Label>
                                    <Input id="productId" value={productId} onChange={(e) => setProductId(e.target.value)} placeholder="MB-PREMIUM-POLO-T-SHIRT" className="border-border bg-background/40 text-foreground placeholder-muted-foreground focus:border-primary focus:ring-primary font-mono text-sm" />
                                    <p className="text-[11px] text-muted-foreground">Auto-generated from product name. You can edit it manually.</p>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="slug" className="text-foreground/80">Slug URL</Label>
                                    <Input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="premium-polo-t-shirt" className="border-border bg-background/40 text-foreground placeholder-muted-foreground focus:border-primary focus:ring-primary font-mono text-sm" required />
                                    <p className="text-[11px] text-muted-foreground">Used in the product page URL. Auto-generated from product name.</p>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="categorySelect" className="text-foreground/80">Product Category</Label>
                                <select id="categorySelect" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                                    <option value="">Select a category...</option>
                                    {availableCategories.map((cat) => (
                                        <option key={cat._id} value={cat._id}>
                                            {cat.name}{!cat.isActive ? " (Inactive)" : ""}
                                        </option>
                                    ))}
                                </select>
                                <p className="text-[11px] text-muted-foreground">Assign this product to a storefront category. Categories are managed by the Super Admin.</p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="videoUrl" className="text-foreground/80">
                                    Product Video URL
                                    <span className="ml-2 text-[10px] font-normal text-muted-foreground bg-muted px-1.5 py-0.5 rounded">Optional</span>
                                </Label>
                                <Input id="videoUrl" type="url" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://www.youtube.com/watch?v=..." className="border-border bg-background/40 text-foreground placeholder-muted-foreground focus:border-primary focus:ring-primary" />
                                <p className="text-[11px] text-muted-foreground">Paste a YouTube, Instagram Reel, or TikTok URL. The video will be embedded on the product page.</p>
                                {videoUrl.trim() && (
                                    <div className="mt-2 rounded-lg overflow-hidden border border-border aspect-video bg-black/10">
                                        <iframe src={toEmbedUrl(videoUrl.trim())} className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen title="Video Preview" />
                                    </div>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description" className="text-foreground/80">Description</Label>
                                <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Add full product description..." className="min-h-[140px] border-border bg-background/40 text-foreground placeholder-muted-foreground focus:border-primary focus:ring-primary" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="fabric" className="text-foreground/80">Fabric Material</Label>
                                    <Input id="fabric" value={fabric} onChange={(e) => setFabric(e.target.value)} placeholder="100% Pique Cotton" className="border-border bg-background/40 text-foreground placeholder-muted-foreground focus:border-primary" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="fit" className="text-foreground/80">Fit type</Label>
                                    <Input id="fit" value={fit} onChange={(e) => setFit(e.target.value)} placeholder="Regular Fit" className="border-border bg-background/40 text-foreground placeholder-muted-foreground focus:border-primary" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="globalStock" className="text-foreground/80">
                                    Global Stock (On Hand)
                                    <span className="ml-2 text-[10px] font-normal text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                                        {variants.length > 0 ? "Auto-calculated" : "Fallback"}
                                    </span>
                                </Label>
                                <Input 
                                    id="globalStock" 
                                    type="number" 
                                    value={variants.length > 0 ? variants.reduce((sum, v) => sum + (v.quantity_on_hand ?? v.stock ?? 0), 0) : quantityOnHand} 
                                    onChange={(e) => setQuantityOnHand(e.target.value === "" ? "" : Number(e.target.value))} 
                                    placeholder="Total stock available" 
                                    className={`border-border bg-background/40 text-foreground placeholder-muted-foreground focus:border-primary focus:ring-primary ${variants.length > 0 ? "opacity-70 cursor-not-allowed bg-muted/50" : ""}`}
                                    readOnly={variants.length > 0}
                                    tabIndex={variants.length > 0 ? -1 : 0}
                                />
                                <p className="text-[11px] text-muted-foreground">
                                    {variants.length > 0 
                                        ? "Automatically calculated as the sum of your color variants' stock."
                                        : "This stock count is used if you do not specify individual stock for each color variant."}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* ── COLOR VARIANTS CARD (replaces old flat color/image section) ── */}
                    <Card className="border-border bg-card/40">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-lg text-foreground flex items-center gap-2">
                                        <Palette className="h-5 w-5 text-primary" />
                                        Color Variants
                                    </CardTitle>
                                    <CardDescription className="text-muted-foreground mt-1">
                                        Each color variant has its own image gallery and stock count.
                                    </CardDescription>
                                </div>
                                <Button type="button" onClick={addVariant} variant="outline" className="border-primary text-primary hover:bg-primary/10 gap-1">
                                    <Plus className="h-4 w-4" />
                                    Add Color
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {variants.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-10 gap-3 border border-dashed border-border rounded-xl text-center">
                                    <Palette className="h-10 w-10 text-muted-foreground/40" />
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">No color variants yet</p>
                                        <p className="text-xs text-muted-foreground/60 mt-1">Click "Add Color" to create your first variant with its own image gallery.</p>
                                    </div>
                                </div>
                            )}

                            {variants.map((variant, index) => (
                                <div key={index} className="border border-border rounded-xl overflow-hidden">
                                    {/* Variant Header Row */}
                                    <div
                                        className="flex items-center gap-3 p-4 cursor-pointer hover:bg-muted/30 transition-colors"
                                        onClick={() => setExpandedVariant(expandedVariant === index ? null : index)}
                                    >
                                        {/* Color swatch preview */}
                                        <div
                                            className="w-8 h-8 rounded-full border-2 border-border shadow-sm shrink-0"
                                            style={{ backgroundColor: variant.color.hex || "#e5e7eb" }}
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-foreground text-sm truncate">
                                                {variant.color.name || <span className="text-muted-foreground italic">Unnamed Color</span>}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {variant.images.length} image{variant.images.length !== 1 ? "s" : ""} · Stock: {variant.quantity_on_hand ?? variant.stock}
                                                {variant.sku ? ` · SKU: ${variant.sku}` : ""}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <button
                                                type="button"
                                                onClick={(e) => { e.stopPropagation(); removeVariant(index); }}
                                                className="p-1.5 rounded-full text-muted-foreground hover:text-red-400 hover:bg-red-50/10 transition-colors"
                                                title="Remove variant"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                            {expandedVariant === index ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                                        </div>
                                    </div>

                                    {/* Variant Expanded Content */}
                                    {expandedVariant === index && (
                                        <div className="border-t border-border p-4 bg-background/30 space-y-5">
                                            {/* Color Identity + Images */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-4">
                                                    <div className="space-y-2">
                                                        <Label className="text-foreground/80 text-sm">Color Name *</Label>
                                                        <Input
                                                            value={variant.color.name}
                                                            onChange={(e) => updateVariantColor(index, "name", e.target.value)}
                                                            placeholder="e.g. Navy Blue"
                                                            className="border-border bg-background/40 text-foreground text-sm"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-foreground/80 text-sm">Color Hex Code</Label>
                                                        <div className="flex gap-2 items-center">
                                                            <input
                                                                type="color"
                                                                value={variant.color.hex}
                                                                onChange={(e) => updateVariantColor(index, "hex", e.target.value)}
                                                                className="h-10 w-12 rounded-md border border-input cursor-pointer bg-transparent p-0.5"
                                                                title="Pick color"
                                                            />
                                                            <Input
                                                                value={variant.color.hex}
                                                                onChange={(e) => updateVariantColor(index, "hex", e.target.value)}
                                                                placeholder="#000000"
                                                                className="border-border bg-background/40 text-foreground text-sm font-mono"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label className="text-foreground/80 text-sm flex items-center gap-1.5">
                                                        <ImageIcon className="h-4 w-4" />
                                                        Images for "{variant.color.name || "this color"}"
                                                    </Label>
                                                    <ImageUpload
                                                        value={variant.images}
                                                        onChange={(urls) => updateVariant(index, { images: urls })}
                                                        multiple
                                                        maxFiles={8}
                                                        title=""
                                                        description={`Upload images for the ${variant.color.name || "color"} variant.`}
                                                        compact={true}
                                                    />
                                                </div>
                                            </div>

                                            {/* SKU + Stock */}
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label className="text-foreground/80 text-sm">
                                                        SKU
                                                        <span className="ml-1.5 text-[10px] font-normal text-muted-foreground bg-muted px-1 py-0.5 rounded">Optional</span>
                                                    </Label>
                                                    <Input
                                                        value={variant.sku || ""}
                                                        onChange={(e) => updateVariant(index, { sku: e.target.value })}
                                                        placeholder="e.g. POLO-BLK-M"
                                                        className="border-border bg-background/40 text-foreground text-sm"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-foreground/80 text-sm">Physical Stock (On Hand)</Label>
                                                    <Input
                                                        type="number"
                                                        value={(variant.quantity_on_hand ?? variant.stock) === 0 ? "" : (variant.quantity_on_hand ?? variant.stock)}
                                                        onChange={(e) => updateVariant(index, { quantity_on_hand: e.target.value === "" ? 0 : Number(e.target.value), stock: e.target.value === "" ? 0 : Number(e.target.value) })}
                                                        placeholder="0"
                                                        className="border-border bg-background/40 text-foreground text-sm"
                                                    />
                                                </div>
                                            </div>

                                            {/* Optional Price Override */}
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label className="text-foreground/80 text-sm">
                                                        Original Price (Color Specific) (৳)
                                                        <span className="ml-1.5 text-[10px] font-normal text-muted-foreground bg-muted px-1 py-0.5 rounded">Optional</span>
                                                    </Label>
                                                    <Input
                                                        type="number"
                                                        value={variant.price ?? ""}
                                                        onChange={(e) => updateVariant(index, { price: e.target.value === "" ? null : Number(e.target.value) })}
                                                        placeholder="Leave blank to use global"
                                                        className="border-border bg-background/40 text-foreground text-sm"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-foreground/80 text-sm">
                                                        Sale Price (Color Specific) (৳)
                                                        <span className="ml-1.5 text-[10px] font-normal text-muted-foreground bg-muted px-1 py-0.5 rounded">Optional</span>
                                                    </Label>
                                                    <Input
                                                        type="number"
                                                        value={variant.sale_price ?? ""}
                                                        onChange={(e) => updateVariant(index, { sale_price: e.target.value === "" ? null : Number(e.target.value) })}
                                                        placeholder="Leave blank to use global"
                                                        className="border-border bg-background/40 text-foreground text-sm"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* ── Product Attributes Card (Sizes, Highlights, Care) ── */}
                    <Card className="border-border bg-card/40">
                        <CardHeader>
                            <CardTitle className="text-lg text-foreground">Product Attributes</CardTitle>
                            <CardDescription className="text-muted-foreground">Configure sizing, highlights, and care instructions</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
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
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {sizes.map((size) => (
                                        <span key={size} className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-sm text-primary font-semibold">
                                            {size}
                                            <button type="button" onClick={() => removeSize(size)} className="rounded-full p-0.5 hover:bg-primary/20 text-primary"><X className="h-3 w-3" /></button>
                                        </span>
                                    ))}
                                    {sizes.length === 0 && <p className="text-xs text-muted-foreground italic">No sizes added yet.</p>}
                                </div>
                            </div>

                            <hr className="border-border" />

                            {/* ── Highlights ── */}
                            <div className="space-y-2">
                                <Label className="text-foreground/80">Product Highlights</Label>
                                <div className="flex gap-2">
                                    <Input value={newHighlight} onChange={(e) => setNewHighlight(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addHighlight())} placeholder="Add feature highlight..." className="border-border bg-background/40 text-foreground" />
                                    <Button type="button" onClick={addHighlight} variant="outline" className="border-border text-foreground hover:bg-muted">Add</Button>
                                </div>
                                <ul className="mt-2 space-y-1">
                                    {highlights.map((hl, i) => (
                                        <li key={i} className="flex items-center justify-between rounded-lg bg-background/20 border border-border/40 px-3 py-1.5 text-sm text-foreground/80">
                                            <span>• {hl}</span>
                                            <button type="button" onClick={() => removeHighlight(i)} className="text-muted-foreground hover:text-red-400"><X className="h-4 w-4" /></button>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* ── Care Instructions ── */}
                            <div className="space-y-2">
                                <Label className="text-foreground/80">Care Instructions</Label>
                                <div className="flex gap-2">
                                    <Input value={newCareInstruction} onChange={(e) => setNewCareInstruction(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCareInstruction())} placeholder="Add care instruction (e.g. Wash cold)..." className="border-border bg-background/40 text-foreground" />
                                    <Button type="button" onClick={addCareInstruction} variant="outline" className="border-border text-foreground hover:bg-muted">Add</Button>
                                </div>
                                <ul className="mt-2 space-y-1">
                                    {careInstructions.map((ci, i) => (
                                        <li key={i} className="flex items-center justify-between rounded-lg bg-background/20 border border-border/40 px-3 py-1.5 text-sm text-foreground/80">
                                            <span>• {ci}</span>
                                            <button type="button" onClick={() => removeCareInstruction(i)} className="text-muted-foreground hover:text-red-400"><X className="h-4 w-4" /></button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* ═════ RIGHT COLUMN — Pricing, Stock, Delivery, Thumbnail ═════ */}
                <div className="space-y-6">
                    {/* ── Pricing & Stock Card ── */}
                    <Card className="border-border bg-card/40">
                        <CardHeader>
                            <CardTitle className="text-lg text-foreground">Pricing & Stock</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="price" className="text-foreground/80">Original Price (৳)</Label>
                                <Input id="price" type="number" value={price} onChange={(e) => { const val = e.target.value; setPrice(val === "" ? "" : Number(val)); }} className="border-border bg-background/40 text-foreground font-semibold" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="vatPercentage" className="text-foreground/80">VAT Percentage (%)</Label>
                                <Input id="vatPercentage" type="number" value={vatPercentage} onChange={(e) => { const val = e.target.value; setVatPercentage(val === "" ? "" : Number(val)); }} className="border-border bg-background/40 text-foreground" placeholder="e.g. 5 or 15 (Optional)" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="offerType" className="text-foreground/80">Offer Type</Label>
                                <select id="offerType" value={offerType} onChange={(e) => { const val = e.target.value as any; setOfferType(val); if (val === "NONE") setOfferValue(""); }} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                                    <option value="NONE">None</option>
                                    <option value="PERCENTAGE">Percentage Reduction (%)</option>
                                    <option value="DIRECT">Direct Amount Reduction (৳)</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="offerValue" className="text-foreground/80">Offer Value</Label>
                                <Input id="offerValue" type="number" value={offerValue} disabled={offerType === "NONE"} onChange={(e) => { const val = e.target.value; setOfferValue(val === "" ? "" : Number(val)); }} className="border-border bg-background/40 text-foreground disabled:opacity-50" placeholder={offerType === "NONE" ? "Select an offer type first" : offerType === "PERCENTAGE" ? "e.g. 10 (for 10% off)" : "e.g. 50 (for ৳50 off)"} />
                            </div>
                            {price !== "" && offerType !== "NONE" && offerValue !== "" && (
                                <div className="p-3 bg-primary/10 rounded-lg border border-primary/20 text-sm">
                                    <div className="flex justify-between items-center">
                                        <span className="text-muted-foreground font-medium">Final Sale Price:</span>
                                        <span className="text-primary font-bold text-base">৳{Math.round(offerType === "PERCENTAGE" ? Number(price) * (1 - Number(offerValue) / 100) : Number(price) - Number(offerValue))}</span>
                                    </div>
                                </div>
                            )}
                            {variants.length === 0 && (
                                <div className="space-y-2">
                                    <Label htmlFor="quantityOnHand" className="text-foreground/80">Global Physical Stock (On Hand)</Label>
                                    <Input id="quantityOnHand" type="number" value={quantityOnHand} onChange={(e) => { const val = e.target.value; setQuantityOnHand(val === "" ? "" : Number(val)); }} className="border-border bg-background/40 text-foreground" />
                                    <p className="text-[11px] text-muted-foreground">Used since there are no color variants.</p>
                                </div>
                            )}
                            <div className="flex items-center justify-between rounded-lg bg-background/30 border border-border/80 p-3">
                                <div className="flex flex-col">
                                    <span className="text-sm font-semibold text-foreground/80">Product Status</span>
                                    <span className="text-xs text-muted-foreground">Visible on storefront if active</span>
                                </div>
                                <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="h-5 w-5 rounded border-border bg-background accent-primary" />
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
                                <Input id="insideDhaka" type="number" value={insideDhakaPrice} onChange={(e) => { const val = e.target.value; setInsideDhakaPrice(val === "" ? "" : Number(val)); }} className="border-border bg-background/40 text-foreground" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="outsideDhaka" className="text-foreground/80">Outside Dhaka (৳)</Label>
                                <Input id="outsideDhaka" type="number" value={outsideDhakaPrice} onChange={(e) => { const val = e.target.value; setOutsideDhakaPrice(val === "" ? "" : Number(val)); }} className="border-border bg-background/40 text-foreground" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="subcityDhaka" className="text-foreground/80">Subcity (উপশহরে) (৳)</Label>
                                <Input id="subcityDhaka" type="number" value={subcityDhakaPrice} onChange={(e) => { const val = e.target.value; setSubcityDhakaPrice(val === "" ? "" : Number(val)); }} className="border-border bg-background/40 text-foreground" required />
                            </div>
                        </CardContent>
                    </Card>

                    {/* ── Thumbnail ── */}
                    <ImageUpload
                        value={thumbnail ? [thumbnail] : []}
                        onChange={(urls) => setThumbnail(urls[0] || "")}
                        multiple={false}
                        maxFiles={1}
                        title="Product Thumbnail"
                        description="Upload the main product image. This appears in product cards and search results."
                    />

                    {/* ── Legacy Gallery (shown only when no variants exist) ── */}
                    {variants.length === 0 && (
                        <ImageUpload
                            value={images}
                            onChange={setImages}
                            multiple
                            maxFiles={6}
                            title="Product Gallery Images"
                            description="Add up to 6 additional images. When you add Color Variants above, their images are used instead."
                        />
                    )}
                </div>
            </div>
        </form>
    );
}
