import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
    {
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
        category: {
            type: String,
            default: "",
            trim: true,
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

export const Product = mongoose.model("Product", productSchema);