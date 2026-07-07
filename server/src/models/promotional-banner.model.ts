import mongoose from "mongoose";

const promotionalBannerSchema = new mongoose.Schema(
    {
        imageUrl: {
            type: String,
            required: true,
        },
        destinationUrl: {
            type: String,
            default: "",
        },
        isActive: {
            type: Boolean,
            default: true,
        }
    },
    { timestamps: true }
);

export const PromotionalBanner = mongoose.model("promotional_banner", promotionalBannerSchema);
