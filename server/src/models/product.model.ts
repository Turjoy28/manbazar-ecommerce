import mongoose from "mongoose";

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
                text: {
                    type: String,
                    required: true,
                },
                price: {
                    type: Number,
                    required: true
                }
            }
        ],
        thumbnail: {
            type: String,
            required: true,
        },

        images: [
            {
                type: String,
                required: true,
            },
        ],

        description: {
            type: String,
            required: true,
        },

        colors: [
            {
                type: String,
                required: true,
            },
        ],

        sizes: [
            {
                type: String,
                required: true,
            },
        ],

        fabric: {
            type: String,
            default: "",
        },

        fit: {
            type: String,
            default: "",
        },

        highlights: [
            {
                type: String,
            },
        ],

        careInstructions: [
            {
                type: String,
            },
        ],

        stock: {
            type: Number,
            default: 0,
        },
        categoryAssignment: {
            type: String,
            enum: ['TOP', 'MIDDLE', 'BOTTOM'],
            default: "TOP",
        },
        /** Optional external video URL (YouTube, Instagram, TikTok, etc.) */
        videoUrl: {
            type: String,
            default: "",
            trim: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

productSchema.pre("save", async function () {
    const doc = this as any;
    if (doc.isNew && !doc.productId) {
        doc.productId = "MB-" + Math.floor(100000 + Math.random() * 900000).toString();
    }
});

export const Product = mongoose.models.Product || mongoose.model("Product", productSchema);