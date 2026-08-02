import { Category } from "../../models/category.model.js";

/** Helper: generate a URL-friendly slug from a name */
const generateSlug = (name: string): string => {
    return name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_]+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
};

/** Get all active categories (public — for client storefront) */
const getActiveCategories = async () => {
    return Category.find({ isActive: true }).sort({ sortOrder: 1, createdAt: 1 });
};

/** Get all categories including inactive (admin only) */
const getAllCategories = async () => {
    return Category.find().sort({ sortOrder: 1, createdAt: 1 });
};

/** Get a single category by ID */
const getCategoryById = async (id: string) => {
    return Category.findById(id);
};

/** Get a single category by slug */
const getCategoryBySlug = async (slug: string) => {
    return Category.findOne({ slug, isActive: true });
};

/** Create a new category */
const createCategory = async (payload: { name: string; description?: string; createdBy?: string }) => {
    // Auto-generate slug from name
    let slug = generateSlug(payload.name);

    // Ensure slug uniqueness
    let existing = await Category.findOne({ slug });
    let counter = 1;
    while (existing) {
        slug = `${generateSlug(payload.name)}-${counter}`;
        existing = await Category.findOne({ slug });
        counter++;
    }

    // Get highest sortOrder and add 1
    const lastCategory = await Category.findOne().sort({ sortOrder: -1 });
    const sortOrder = lastCategory ? lastCategory.sortOrder + 1 : 0;

    return Category.create({
        name: payload.name,
        slug,
        description: payload.description || "",
        sortOrder,
        createdBy: payload.createdBy,
    });
};

/** Update a category */
const updateCategory = async (id: string, payload: Record<string, unknown>) => {
    // If name is being updated, regenerate slug
    if (payload.name && typeof payload.name === "string") {
        let slug = generateSlug(payload.name);
        const existing = await Category.findOne({ slug, _id: { $ne: id } });
        if (existing) {
            slug = `${slug}-${Date.now()}`;
        }
        payload.slug = slug;
    }

    return Category.findByIdAndUpdate(id, { $set: payload }, { new: true, runValidators: true });
};

/** Toggle active/inactive status */
const toggleCategory = async (id: string) => {
    const category = await Category.findById(id);
    if (!category) return null;

    category.isActive = !category.isActive;
    await category.save();
    return category;
};

/** Bulk reorder categories */
const reorderCategories = async (orderedIds: string[]) => {
    const bulkOps = orderedIds.map((id, index) => ({
        updateOne: {
            filter: { _id: id },
            update: { $set: { sortOrder: index } },
        },
    }));
    await Category.bulkWrite(bulkOps);
    return Category.find().sort({ sortOrder: 1 });
};

/** Delete a category */
const deleteCategory = async (id: string) => {
    return Category.findByIdAndDelete(id);
};

export const categoryService = {
    getActiveCategories,
    getAllCategories,
    getCategoryById,
    getCategoryBySlug,
    createCategory,
    updateCategory,
    toggleCategory,
    reorderCategories,
    deleteCategory,
};
