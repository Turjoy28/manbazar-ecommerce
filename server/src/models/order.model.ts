import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
    {
        products: [
            {
                id: { type: String, required: true },
                name: { type: String, required: true },
                price: { type: Number, required: true },
                quantity: { type: Number, required: true },
                size: { type: String, default: "" },
                color: { type: String, default: "" },
            },
        ],
        customer: {
            name: { type: String, required: true },
            phone: { type: String, required: true },
            address: { type: String, required: true },
            location: { type: String, default: "dhaka" },
            paymantMethod: { type: String, default: "cod" },
            transactionId: { type: String, default: "" },
            senderNumber: { type: String, default: "" },
        },
        coupon: { type: String, default: "" },
        subtotal: { type: Number, required: true },
        deliveryCharge: { type: Number, default: 0 },
        total: { type: Number, required: true },
        status: {
            type: String,
            enum: ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"],
            default: "pending",
        },
        courierName: { type: String, default: "" },
        courierTrackingCode: { type: String, default: "" },
        courierStatus: { type: String, default: "" },
        courierConsignmantId: { type: String, default: "" },
    },
    { timestamps: true }
);

export const Order = mongoose.model("Order", orderSchema);
