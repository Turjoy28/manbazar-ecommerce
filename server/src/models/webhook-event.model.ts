import mongoose from "mongoose";

const webhookEventSchema = new mongoose.Schema(
    {
        provider: {
            type: String,
            required: true,
        },
        eventId: {
            type: String,
            unique: true,
            required: true,
        },
        payload: {
            type: Object,
            required: true,
        },
        processed: {
            type: Boolean,
            default: false,
        },
        processedAt: {
            type: Date,
        },
        error: {
            type: String,
        },
    },
    { timestamps: true }
);

export const WebhookEvent = mongoose.model("WebhookEvent", webhookEventSchema);
