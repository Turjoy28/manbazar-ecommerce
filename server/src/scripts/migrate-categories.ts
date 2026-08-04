/**
 * @deprecated This migration script has been superseded by:
 *   - src/scripts/migrate-product-categories.ts (for syncing old products → new categories)
 *   - src/script/seedCategories.ts (runs on server startup)
 *
 * Kept for historical reference. Use migrate-product-categories.ts instead.
 *
 * Usage: npx tsx src/scripts/migrate-product-categories.ts [--dry-run]
 */

console.log("⚠️  This script is deprecated.");
console.log("   Use `npx tsx src/scripts/migrate-product-categories.ts` instead.");
console.log("   Pass --dry-run to preview changes without writing to the database.");
process.exit(0);
