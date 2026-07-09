import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

async function migrate() {
    console.log("Connecting to MongoDB...");
    const MONGO_URI = process.env.DATABASE_URI || "mongodb://localhost:27017/menbazar";
    await mongoose.connect(MONGO_URI);
    console.log("Connected to DB.");

    try {
        const db = mongoose.connection.db;
        if (!db) throw new Error("DB connection not established");

        const collection = db.collection("products");

        // Migrate root level stock
        const rootResult = await collection.updateMany(
            { stock: { $exists: true } },
            [
                {
                    $set: {
                        quantity_on_hand: "$stock",
                        quantity_reserved: 0
                    }
                },
                {
                    $unset: "stock"
                }
            ]
        );
        console.log(`Migrated ${rootResult.modifiedCount} root products.`);

        // Migrate variants stock (using aggregation pipeline in updateMany or multiple updates)
        // Since variants is an array, we can use the $[] operator.
        // Unfortunately, rename doesn't work easily with $[] in a single query across all array elements if we want to copy the value.
        // It's safer to fetch all products that have variants with stock and update them one by one.
        const productsWithVariants = await collection.find({ "variants.stock": { $exists: true } }).toArray();
        let variantsUpdated = 0;

        for (const p of productsWithVariants) {
            if (Array.isArray(p.variants)) {
                const newVariants = p.variants.map((v: any) => {
                    if (v.stock !== undefined) {
                        const newV = { ...v, quantity_on_hand: v.stock, quantity_reserved: 0 };
                        delete newV.stock;
                        variantsUpdated++;
                        return newV;
                    }
                    return v;
                });

                await collection.updateOne(
                    { _id: p._id },
                    { $set: { variants: newVariants } }
                );
            }
        }
        
        console.log(`Migrated ${variantsUpdated} variant entries across ${productsWithVariants.length} products.`);
        console.log("Migration complete!");
    } catch (err) {
        console.error("Migration failed:", err);
    } finally {
        await mongoose.disconnect();
        console.log("Disconnected.");
    }
}

migrate();
