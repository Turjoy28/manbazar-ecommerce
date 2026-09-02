import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const uri = process.env.DATABASE_URI || process.env.MONGODB_URI || "";

const run = async () => {
    try {
        await mongoose.connect(uri);
        console.log("Connected to DB");

        const { Product } = await import("../models/product.model.js");

        const products = await Product.find({});
        let updatedCount = 0;

        for (const p of products) {
            let changed = false;
            
            if (p.quantity_reserved !== 0) {
                p.quantity_reserved = 0;
                changed = true;
            }

            if (p.variants && p.variants.length > 0) {
                for (const v of p.variants) {
                    if (v.quantity_reserved !== 0) {
                        v.quantity_reserved = 0;
                        changed = true;
                    }
                }
            }

            if (changed) {
                p.markModified('variants');
                await p.save();
                updatedCount++;
            }
        }

        console.log(`Reset reserved quantities for ${updatedCount} products.`);
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
};

run();
