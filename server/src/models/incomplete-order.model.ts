import mongoose from "mongoose";

const incompleteOrderSchema = new mongoose.Schema(
    {
        /** Unique browser-session identifier (UUID stored in sessionStorage) */
        sessionId: { type: String, required: true, unique: true, index: true },

        customer: {
            name: { type: String, default: "" },
            phone: { type: String, default: "" },
            email: { type: String, default: "" },
            address: { type: String, default: "" },
            location: { type: String, default: "dhaka" },
        },

        products: [
            {
                productId: { type: String, default: "" },
                name: { type: String, default: "" },
                price: { type: Number, default: 0 },
                quantity: { type: Number, default: 1 },
                size: { type: String, default: "" },
                color: { type: String, default: "" },
                thumbnail: { type: String, default: "" },
            },
        ],

        totalPrice: { type: Number, default: 0 },
        paymentMethod: { type: String, default: "CashOnDelivery" },
        status: { type: String, default: "Incomplete" },
    },
    {
        timestamps: true,
    }
);

// Auto-expire incomplete orders after 30 days
incompleteOrderSchema.index({ updatedAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

export const IncompleteOrder = mongoose.model("IncompleteOrder", incompleteOrderSchema);
