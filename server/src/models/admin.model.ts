import mongoose from "mongoose";

const adminSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: true,
            select: false,
        },
        role: {
            type: String,
            enum: ["ADMIN"],
            default: "ADMIN",
        },
    },
    { timestamps: true }
);


export const Admin = mongoose.model("admin", adminSchema)