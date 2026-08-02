/**
 * Migration Script: Convert hardcoded TOP/MIDDLE/BOTTOM categories to dynamic Category documents.
 * 
 * Usage: npx ts-node --esm src/scripts/migrate-categories.ts
 * 
 * This script:
 * 1. Reads the existing categoryLabels from the UI model
 * 2. Creates 3 Category documents (Trending Now, Seasonal Essentials, Clearance & Steals)
 * 3. Links all existing products to the appropriate Category document
 */

import mongoose from "mongoose";
import config from "../config/index.js";
import { Ui } from "../models/ui.model.js";
import { Product } from "../models/product.model.js";
import { Category } from "../models/category.model.js";

const ASSIGNMENT_MAP: Record<string, { defaultName: string; labelKey: string }> = {
    TOP: { defaultName: "Trending Now", labelKey: "topCategoryLabel" },
    MIDDLE: { defaultName: "Seasonal Essentials", labelKey: "middleCategoryLabel" },
    BOTTOM: { defaultName: "Clearance & Steals", labelKey: "bottomCategoryLabel" },
};

async function migrate() {
    try {
        console.log("🔌 Connecting to MongoDB...");
        await mongoose.connect(config.database_uri);
        console.log("✅ Connected to MongoDB");

        // 1. Get existing category labels from UI model
        const uiDoc = await Ui.findOne();
        const labels = (uiDoc as any)?.categoryLabels || {};

        console.log("\n📦 Creating categories from existing labels...");

        const categoryMap: Record<string, mongoose.Types.ObjectId> = {};

        for (const [assignment, meta] of Object.entries(ASSIGNMENT_MAP)) {
            const name = (labels as any)[meta.labelKey] || meta.defaultName;
            const slug = name
                .toLowerCase()
                .trim()
                .replace(/[^\w\s-]/g, "")
                .replace(/[\s_]+/g, "-")
                .replace(/-+/g, "-")
                .replace(/^-|-$/g, "");

            // Check if category with this slug already exists
            let category = await Category.findOne({ slug });
            if (category) {
                console.log(`  ⏭️  Category "${name}" (slug: ${slug}) already exists, skipping creation.`);
            } else {
                category = await Category.create({
                    name,
                    slug,
                    isActive: true,
                    sortOrder: assignment === "TOP" ? 0 : assignment === "MIDDLE" ? 1 : 2,
                    description: `Auto-migrated from ${assignment} category tier.`,
                });
                console.log(`  ✅ Created category: "${name}" (slug: ${slug}, sortOrder: ${category.sortOrder})`);
            }

            categoryMap[assignment] = category._id as mongoose.Types.ObjectId;
        }

        // 2. Update products to reference their new Category document
        console.log("\n🔗 Linking products to categories...");

        for (const [assignment, categoryId] of Object.entries(categoryMap)) {
            const filter: Record<string, any> = { category: null };
            if (assignment === "TOP") {
                // Products with TOP or no assignment
                filter.$or = [
                    { categoryAssignment: "TOP" },
                    { categoryAssignment: { $exists: false } },
                    { categoryAssignment: null },
                ];
                delete filter.category; // Don't filter by category for the $or query
                const result = await Product.updateMany(
                    { $and: [{ category: null }, { $or: filter.$or }] },
                    { $set: { category: categoryId } }
                );
                console.log(`  ✅ ${assignment}: Linked ${result.modifiedCount} products`);
            } else {
                const result = await Product.updateMany(
                    { categoryAssignment: assignment, category: null },
                    { $set: { category: categoryId } }
                );
                console.log(`  ✅ ${assignment}: Linked ${result.modifiedCount} products`);
            }
        }

        console.log("\n🎉 Migration complete!");
        console.log("   Categories created and products linked successfully.");
        console.log("   You can now manage categories from the admin panel.\n");

    } catch (error) {
        console.error("❌ Migration failed:", error);
    } finally {
        await mongoose.disconnect();
        console.log("🔌 Disconnected from MongoDB");
    }
}

migrate();
