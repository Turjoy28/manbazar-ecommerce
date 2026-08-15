import mongoose from "mongoose";
import { Ui } from "../models/ui.model.js";
import { Product } from "../models/product.model.js";
import { Category } from "../models/category.model.js";

const ASSIGNMENT_MAP: Record<string, { defaultName: string; labelKey: string }> = {
    TOP: { defaultName: "Trending Now", labelKey: "topCategoryLabel" },
    MIDDLE: { defaultName: "Seasonal Essentials", labelKey: "middleCategoryLabel" },
    BOTTOM: { defaultName: "Clearance & Steals", labelKey: "bottomCategoryLabel" },
};

/**
 * Seeds initial categories from the old TOP/MIDDLE/BOTTOM system
 * and links any unlinked products to the matching category.
 * 
 * This runs on server startup. It's safe to run multiple times
 * (idempotent — checks for existing categories before creating).
 */
export async function seedCategories() {
    try {
        console.log("📦 Checking if old categories need migration...");
        
        // If categories already exist, skip migration to prevent duplicates on server restart
        const existingCount = await Category.countDocuments();
        if (existingCount > 0) {
            console.log("  ⏭️ Categories already exist. Skipping automatic migration.");
            return;
        }
        
        // 1. Drop old indexes that might conflict (like title_1 from a previous schema)
        try {
            await Category.collection.dropIndex("title_1");
            console.log("  ⚠️ Dropped conflicting title_1 index from categories collection.");
        } catch (e: any) {
            // Ignore error if index doesn't exist
        }

        // 2. Get existing category labels from UI model
        const uiDoc = await Ui.findOne();
        const labels = (uiDoc as any)?.categoryLabels || {};

        const categoryMap: Record<string, mongoose.Types.ObjectId> = {};

        for (const [assignment, meta] of Object.entries(ASSIGNMENT_MAP)) {
            const name = (labels as any)[meta.labelKey] || meta.defaultName;
            let slug = name
                .toLowerCase()
                .trim()
                .replace(/[\s_]+/g, "-")
                .replace(/-+/g, "-")
                .replace(/^-|-$/g, "");
            
            if (!slug) {
                slug = `category-${assignment.toLowerCase()}`;
            }

            // Check if category with this slug already exists
            let category = await Category.findOne({ slug });
            if (!category) {
                category = await Category.create({
                    name,
                    slug,
                    parent: null, // Root-level categories
                    isActive: true,
                    sortOrder: assignment === "TOP" ? 0 : assignment === "MIDDLE" ? 1 : 2,
                    description: `Auto-migrated from ${assignment} category tier.`,
                });
                console.log(`  ✅ Created category: "${name}" (slug: ${slug}, sortOrder: ${category.sortOrder})`);
            }

            categoryMap[assignment] = category._id as mongoose.Types.ObjectId;
        }

        // 3. Update products that still have no category to reference their Category document
        console.log("🔗 Linking unlinked products to categories...");

        for (const [assignment, categoryId] of Object.entries(categoryMap)) {
            if (assignment === "TOP") {
                // Products with TOP or no assignment
                const result = await Product.updateMany(
                    {
                        category: null,
                        $or: [
                            { categoryAssignment: "TOP" },
                            { categoryAssignment: { $exists: false } },
                            { categoryAssignment: null },
                        ],
                    },
                    { $set: { category: categoryId } }
                );
                if (result.modifiedCount > 0) {
                    console.log(`  ✅ ${assignment}: Linked ${result.modifiedCount} products`);
                }
            } else {
                const result = await Product.updateMany(
                    { categoryAssignment: assignment, category: null },
                    { $set: { category: categoryId } }
                );
                if (result.modifiedCount > 0) {
                    console.log(`  ✅ ${assignment}: Linked ${result.modifiedCount} products`);
                }
            }
        }
    } catch (error) {
        console.error("❌ Category migration failed:", error);
    }
}
