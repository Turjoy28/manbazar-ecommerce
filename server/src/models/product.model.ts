import mongoose from "mongoose";

/* ─── Variant Sub-Schema ───────────────────────────────────────────────────────
   Each variant represents a unique color option.
   Supports per-variant: images, stock, optional price override, and SKU.
   Designed to be extended in the future with size/material/etc. attributes.
   ──────────────────────────────────────────────────────────────────────────── */
const variantSchema = new mongoose.Schema(
    {
        color: {
            name: { type: String, required: true, trim: true },
            hex: { type: String, default: "#000000", trim: true },
        },
        sku: { type: String, default: "", trim: true },
        stock: { type: Number, default: 0 },
        /** Optional per-variant price override. Falls back to product.price if null. */
        price: { type: Number, default: null },
        /** Optional per-variant sale price override. Falls back to product.sale_price if null. */
        sale_price: { type: Number, default: null },
        images: [{ type: String, trim: true }],
    },
    { _id: true }
);

const productSchema = new mongoose.Schema(
    {
        productId: {
            type: String,
            default: "",
            trim: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        slug: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        price: {
            type: Number,
            required: true,
        },
        vatPercentage: {
            type: Number,
            default: 0,
        },
        originalPrice: {
            type: Number,
            default: null,
        },
        base_price: {
            type: Number,
            default: 0,
        },
        offerType: {
            type: String,
            enum: ['NONE', 'PERCENTAGE', 'DIRECT'],
            default: 'NONE',
        },
        offerValue: {
            type: Number,
            default: 0,
        },
        sale_price: {
            type: Number,
            default: 0,
        },
        is_on_sale: {
            type: Boolean,
            default: false,
        },
        deliveryCharge: [
            {
                text: { type: String, required: true },
                price: { type: Number, required: true }
            }
        ],
        thumbnail: {
            type: String,
            required: true,
        },
        /** Legacy flat gallery — kept for backward compatibility with old products. */
        images: [
            { type: String },
        ],
        /** ─── Color Variants ─────────────────────────────────────────────────
            New structured variant system. Each element holds color info,
            its own image gallery, and optional stock/price overrides.
            Legacy products without this field continue to use the flat
            `colors` and `images` arrays above.
            ─────────────────────────────────────────────────────────────────── */
        variants: {
            type: [variantSchema],
            default: [],
        },
        description: {
            type: String,
            required: true,
        },
        /** Legacy flat color list — kept for backward compatibility. */
        colors: [{ type: String }],
        sizes: [{ type: String, required: true }],
        fabric: { type: String, default: "" },
        fit: { type: String, default: "" },
        highlights: [{ type: String }],
        careInstructions: [{ type: String }],
        /** Legacy global stock. Used when variants[] is empty. */
        stock: { type: Number, default: 0 },
        categoryAssignment: {
            type: String,
            enum: ['TOP', 'MIDDLE', 'BOTTOM'],
            default: "TOP",
        },
        /** Optional external video URL (YouTube, Instagram, TikTok, etc.) */
        videoUrl: { type: String, default: "", trim: true },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

productSchema.pre("save", async function () {
    const doc = this as any;
    if (doc.isNew && !doc.productId) {
        doc.productId = "MB-" + Math.floor(100000 + Math.random() * 900000).toString();
    }
});

export const Product = mongoose.models.Product || mongoose.model("Product", productSchema);