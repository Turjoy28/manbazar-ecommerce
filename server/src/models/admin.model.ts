import mongoose from "mongoose";

const adminSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: false,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: false,
            select: false,
        },
        role: {
            type: String,
            enum: ["ADMIN", "USER", "MANAGER"],
            default: "ADMIN",
        },
        onboardingToken: {
            type: String,
            select: false,
        },
        onboardingTokenExpires: {
            type: Date,
        },
        onboardingTokenUsed: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);


export const Admin = mongoose.model("admin", adminSchema)