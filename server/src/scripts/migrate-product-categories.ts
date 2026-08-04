/**
 * Migration Script: Synchronize old products with the new hierarchical category system.
 *
 * Usage: npx tsx src/scripts/migrate-product-categories.ts [--dry-run]
 *
 * What this script does:
 * 1. Finds all products where `category` is null (legacy products with only `categoryAssignment`)
 * 2. Also finds products where `category` is a plain string (e.g., "Polo") instead of an ObjectId
 * 3. For each product, looks up or creates the matching Category document
 * 4. Sets `product.category = category._id`
 * 5. Prints a detailed report
 *
 * Pass `--dry-run` to preview changes without writing to the database.
 */

import mongoose from "mongoose";
import config from "../config/index.js";
import { Product } from "../models/product.model.js";
import { Category } from "../models/category.model.js";
import { Ui } from "../models/ui.model.js";

const DRY_RUN = process.argv.includes("--dry-run");

/** Helper: generate a URL-friendly slug from a name */
function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .trim()
        .replace(/[\s_]+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
}

/** Map from old categoryAssignment values to their seeded category names */
const ASSIGNMENT_MAP: Record<string, { defaultName: string; labelKey: string }> = {
    TOP: { defaultName: "Trending Now", labelKey: "topCategoryLabel" },
    MIDDLE: { defaultName: "Seasonal Essentials", labelKey: "middleCategoryLabel" },
    BOTTOM: { defaultName: "Clearance & Steals", labelKey: "bottomCategoryLabel" },
};

interface MigrationStats {
    totalProducts: number;
    alreadyLinked: number;
    migratedByAssignment: number;
    migratedByStringMatch: number;
    categoryCreated: number;
    unresolved: number;
    errors: string[];
}

async function migrate() {
    const stats: MigrationStats = {
        totalProducts: 0,
        alreadyLinked: 0,
        migratedByAssignment: 0,
        migratedByStringMatch: 0,
        categoryCreated: 0,
        unresolved: 0,
        errors: [],
    };

    try {
        console.log(`\n${"═".repeat(60)}`);
        console.log(`  Product → Category Migration Script`);
        console.log(`  Mode: ${DRY_RUN ? "🔍 DRY RUN (no changes will be saved)" : "✍️  LIVE (changes will be written)"}`);
        console.log(`${"═".repeat(60)}\n`);

        console.log("🔌 Connecting to MongoDB...");
        await mongoose.connect(config.database_uri);
        console.log("✅ Connected to MongoDB\n");

        // ────────────────────────────────────────────────────────────────────
        // Step 1: Build the categoryAssignment → Category._id lookup map
        // ────────────────────────────────────────────────────────────────────
        console.log("📦 Step 1: Building category assignment lookup map...");

        const uiDoc = await Ui.findOne();
        const labels = (uiDoc as any)?.categoryLabels || {};

        // Build map: "TOP" → categoryId, "MIDDLE" → categoryId, etc.
        const assignmentToCategoryId: Record<string, mongoose.Types.ObjectId> = {};

        for (const [assignment, meta] of Object.entries(ASSIGNMENT_MAP)) {
            const name = (labels as any)[meta.labelKey] || meta.defaultName;
            const slug = generateSlug(name) || `category-${assignment.toLowerCase()}`;

            // Try to find by slug first, then by name
            let category = await Category.findOne({ slug });
            if (!category) {
                category = await Category.findOne({ name });
            }

            if (category) {
                assignmentToCategoryId[assignment] = category._id as mongoose.Types.ObjectId;
                console.log(`  ✅ ${assignment} → "${category.name}" (${category._id})`);
            } else {
                console.log(`  ⚠️  ${assignment} → No category found for "${name}" (slug: ${slug})`);
                console.log(`      Will create it during migration.`);
            }
        }

        // ────────────────────────────────────────────────────────────────────
        // Step 2: Find all products that need migration
        // ────────────────────────────────────────────────────────────────────
        console.log("\n🔍 Step 2: Scanning products...");

        const allProducts = await Product.find().lean();
        stats.totalProducts = allProducts.length;
        console.log(`  Found ${allProducts.length} total products.`);

        // Separate products into groups
        const needsMigration: any[] = [];
        for (const product of allProducts) {
            const cat = product.category;

            // Already linked to an ObjectId
            if (cat && mongoose.Types.ObjectId.isValid(cat.toString()) && typeof cat !== "string") {
                stats.alreadyLinked++;
                continue;
            }

            // Check if category is actually an ObjectId stored as a valid hex string (24 chars)
            if (cat && typeof cat === "string" && /^[a-f\d]{24}$/i.test(cat)) {
                stats.alreadyLinked++;
                continue;
            }

            needsMigration.push(product);
        }

        console.log(`  ✅ ${stats.alreadyLinked} already linked to categories.`);
        console.log(`  🔄 ${needsMigration.length} need migration.\n`);

        if (needsMigration.length === 0) {
            console.log("🎉 All products are already synchronized! Nothing to do.");
            return;
        }

        // ────────────────────────────────────────────────────────────────────
        // Step 3: Migrate each product
        // ────────────────────────────────────────────────────────────────────
        console.log("🔗 Step 3: Migrating products...\n");

        // Cache for string-based category lookups (e.g., "Polo" → categoryId)
        const nameToCategory = new Map<string, mongoose.Types.ObjectId>();

        // Pre-populate the cache with all existing categories
        const allCategories = await Category.find().lean();
        for (const cat of allCategories) {
            nameToCategory.set(cat.name.toLowerCase().trim(), cat._id as mongoose.Types.ObjectId);
        }

        for (const product of needsMigration) {
            const productName = product.name || product.slug || product._id.toString();
            const assignment = product.categoryAssignment;
            const catField = product.category;

            let targetCategoryId: mongoose.Types.ObjectId | null = null;
            let migrationMethod = "";

            // Strategy 1: category is a plain string (e.g., "Polo")
            // Match it against Category.name
            if (catField && typeof catField === "string" && !/^[a-f\d]{24}$/i.test(catField)) {
                const lookupKey = catField.toLowerCase().trim();
                if (nameToCategory.has(lookupKey)) {
                    targetCategoryId = nameToCategory.get(lookupKey)!;
                    migrationMethod = `string match ("${catField}")`;
                    stats.migratedByStringMatch++;
                } else {
                    // Category doesn't exist — create it
                    if (!DRY_RUN) {
                        const slug = generateSlug(catField) || `category-${Date.now()}`;
                        let existingBySlug = await Category.findOne({ slug });
                        const finalSlug = existingBySlug ? `${slug}-${Date.now()}` : slug;

                        const newCat = await Category.create({
                            name: catField,
                            slug: finalSlug,
                            isActive: true,
                            sortOrder: 99,
                            description: `Auto-created during product migration from string category "${catField}".`,
                        });
                        targetCategoryId = newCat._id as mongoose.Types.ObjectId;
                        nameToCategory.set(lookupKey, targetCategoryId);
                        stats.categoryCreated++;
                        console.log(`  🆕 Created category: "${catField}" (${newCat._id})`);
                    } else {
                        console.log(`  🆕 [DRY RUN] Would create category: "${catField}"`);
                        stats.categoryCreated++;
                    }
                    migrationMethod = `string match + create ("${catField}")`;
                    stats.migratedByStringMatch++;
                }
            }

            // Strategy 2: Use categoryAssignment (TOP/MIDDLE/BOTTOM)
            if (!targetCategoryId && assignment && assignmentToCategoryId[assignment]) {
                targetCategoryId = assignmentToCategoryId[assignment];
                migrationMethod = `assignment (${assignment})`;
                stats.migratedByAssignment++;
            }

            // Strategy 3: Default to TOP if no match found
            if (!targetCategoryId && assignmentToCategoryId["TOP"]) {
                targetCategoryId = assignmentToCategoryId["TOP"];
                migrationMethod = `default (TOP fallback)`;
                stats.migratedByAssignment++;
            }

            // Apply the migration
            if (targetCategoryId) {
                if (!DRY_RUN) {
                    await Product.updateOne(
                        { _id: product._id },
                        { $set: { category: targetCategoryId } }
                    );
                }
                console.log(`  ✅ "${productName}" → ${migrationMethod} → ${targetCategoryId}`);
            } else {
                stats.unresolved++;
                stats.errors.push(`"${productName}" (${product._id}) — no matching category found`);
                console.log(`  ❌ "${productName}" — could not resolve category!`);
            }
        }

        // ────────────────────────────────────────────────────────────────────
        // Step 4: Print summary
        // ────────────────────────────────────────────────────────────────────
        console.log(`\n${"═".repeat(60)}`);
        console.log(`  Migration Summary${DRY_RUN ? " (DRY RUN)" : ""}`);
        console.log(`${"═".repeat(60)}`);
        console.log(`  Total products:            ${stats.totalProducts}`);
        console.log(`  Already linked:            ${stats.alreadyLinked}`);
        console.log(`  Migrated by assignment:    ${stats.migratedByAssignment}`);
        console.log(`  Migrated by string match:  ${stats.migratedByStringMatch}`);
        console.log(`  Categories auto-created:   ${stats.categoryCreated}`);
        console.log(`  Unresolved:                ${stats.unresolved}`);
        console.log(`${"═".repeat(60)}\n`);

        if (stats.errors.length > 0) {
            console.log("⚠️  Unresolved products:");
            for (const err of stats.errors) {
                console.log(`   • ${err}`);
            }
            console.log("");
        }

        if (DRY_RUN) {
            console.log("ℹ️  This was a DRY RUN. No changes were saved.");
            console.log("   Run without --dry-run to apply changes.\n");
        } else {
            // Verify: count products still without category
            const remaining = await Product.countDocuments({ category: null });
            console.log(`✅ Products still without category: ${remaining}`);
            if (remaining === 0) {
                console.log("🎉 All products are now synchronized with the category system!\n");
            } else {
                console.log(`⚠️  ${remaining} products still need manual attention.\n`);
            }
        }

    } catch (error) {
        console.error("❌ Migration failed:", error);
    } finally {
        await mongoose.disconnect();
        console.log("🔌 Disconnected from MongoDB");
    }
}

migrate();
