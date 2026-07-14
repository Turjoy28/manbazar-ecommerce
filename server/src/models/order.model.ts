import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
    {
        products: [
            {
                id: { type: String, default: "" },
                productId: { type: String, default: "" },
                name: { type: String, required: true },
                price: { type: Number, required: true },
                purchasedPrice: { type: Number, required: true },
                appliedVatPercentage: { type: Number, default: 0 },
                quantity: { type: Number, required: true },
                size: { type: String, default: "" },
                color: { type: String, default: "" },
            },
        ],
        customer: {
            name: { type: String, required: true },
            phone: { type: String, required: true },
            email: { type: String, default: "" },
            address: { type: String, required: true },
            location: { type: String, default: "dhaka" },
            // Legacy fields kept for backward-compat reads on old orders
            paymentMethod: { type: String, default: "" },
            transactionId: { type: String, default: "" },
            senderNumber: { type: String, default: "" },
        },

        // ── Top-level payment fields ──────────────────────────────────────────
        /** 'bkash' | 'cod' */
        paymentMethod: {
            type: String,
            enum: ["bkash", "cod"],
            default: "cod",
        },
        /** Lifecycle state of the payment */
        paymentStatus: {
            type: String,
            enum: ["pending", "completed", "failed", "refunded"],
            default: "pending",
        },
        /**
         * Transaction ID for bKash payments. Null for COD.
         * Validated at the service layer — no schema-level validator
         * to avoid 'this' context issues during Order.create().
         */
        bkashTxnId: {
            type: mongoose.Schema.Types.Mixed,
            default: null,
        },
        // ─────────────────────────────────────────────────────────────────────

        coupon: { type: String, default: "" },
        subtotal: { type: Number, required: true },
        totalVat: { type: Number, default: 0 },
        deliveryCharge: { type: Number, default: 0 },
        total: { type: Number, required: true },
        grandTotal: { type: Number, required: true },
        status: {
            type: String,
            enum: ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"],
            default: "pending",
        },
        courierName: { type: String, default: "" },
        courierTrackingCode: { type: String, default: "" },
        courierStatus: { type: String, default: "" },
        courierConsignmentId: { type: String, default: "" },
    },
    { timestamps: true }
);

export const Order = mongoose.model("Order", orderSchema);

