import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
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
            lowercase: true,
        },
        /** Self-referencing parent for infinite hierarchy. null = root category. */
        parent: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            default: null,
        },
        description: {
            type: String,
            default: "",
            trim: true,
        },
        image: {
            type: String,
            default: "",
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        sortOrder: {
            type: Number,
            default: 0,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "admin",
        },
    },
    { timestamps: true }
);

export const Category = mongoose.model("Category", categorySchema);
