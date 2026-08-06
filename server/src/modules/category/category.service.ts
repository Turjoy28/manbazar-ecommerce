import mongoose from "mongoose";
import { Category } from "../../models/category.model.js";

/** Helper: generate a URL-friendly slug from a name */
const generateSlug = (name: string): string => {
    return name
        .toLowerCase()
        .trim()
        .replace(/[^\p{L}\p{N}\s-]/gu, "")
        .replace(/[\s_]+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
};

/** Get all active categories (public — for client storefront), flat list with parent populated */
const getActiveCategories = async () => {
    return Category.find({ isActive: { $ne: false } })
        .populate("parent", "name slug")
        .sort({ sortOrder: 1, createdAt: 1 });
};

/** Get all categories including inactive (admin only), flat list with parent populated */
const getAllCategories = async () => {
    return Category.find()
        .populate("parent", "name slug")
        .sort({ sortOrder: 1, createdAt: 1 });
};

/**
 * Build a nested category tree from a flat list.
 * Returns only root categories (parent: null), each with a `children` array.
 * Useful for rendering hierarchical menus in admin or storefront.
 */
const getCategoryTree = async (activeOnly = false) => {
    const filter = activeOnly ? { isActive: { $ne: false } } : {};
    const allCategories = await Category.find(filter)
        .sort({ sortOrder: 1, createdAt: 1 })
        .lean();

    // Build a map of id → category (with children array)
    const map = new Map<string, any>();
    for (const cat of allCategories) {
        map.set(cat._id.toString(), { ...cat, children: [] });
    }

    // Attach children to parents
    const roots: any[] = [];
    for (const cat of allCategories) {
        const node = map.get(cat._id.toString());
        if (cat.parent) {
            const parentNode = map.get(cat.parent.toString());
            if (parentNode) {
                parentNode.children.push(node);
            } else {
                // Parent not found (maybe deleted/inactive) — treat as root
                roots.push(node);
            }
        } else {
            roots.push(node);
        }
    }

    return roots;
};

/**
 * Get all descendant category IDs for a given category (inclusive).
 * Walks the tree breadth-first. Used for queries like
 * "show all products in Clothing including sub-categories".
 */
const getDescendantIds = async (categoryId: string): Promise<string[]> => {
    const allCategories = await Category.find().select("_id parent").lean();

    // Build a parent → children map
    const childrenMap = new Map<string, string[]>();
    for (const cat of allCategories) {
        const parentKey = cat.parent ? cat.parent.toString() : "__root__";
        if (!childrenMap.has(parentKey)) childrenMap.set(parentKey, []);
        childrenMap.get(parentKey)!.push(cat._id.toString());
    }

    // BFS from categoryId
    const result: string[] = [categoryId];
    const queue = [categoryId];
    while (queue.length > 0) {
        const current = queue.shift()!;
        const children = childrenMap.get(current) || [];
        for (const childId of children) {
            result.push(childId);
            queue.push(childId);
        }
    }

    return result;
};

/** Get a single category by ID */
const getCategoryById = async (id: string) => {
    return Category.findById(id).populate("parent", "name slug");
};

/** Get a single category by slug */
const getCategoryBySlug = async (slug: string) => {
    return Category.findOne({ slug, isActive: { $ne: false } }).populate("parent", "name slug");
};

/** Create a new category */
const createCategory = async (payload: {
    name: string;
    description?: string;
    image?: string;
    parent?: string | null;
    createdBy?: string;
}) => {
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

    // Validate parent if provided
    let parentId: mongoose.Types.ObjectId | null = null;
    if (payload.parent) {
        const parentCategory = await Category.findById(payload.parent);
        if (!parentCategory) {
            throw new Error("Parent category not found");
        }
        parentId = parentCategory._id as mongoose.Types.ObjectId;
    }

    return Category.create({
        name: payload.name,
        slug,
        parent: parentId,
        description: payload.description || "",
        image: payload.image || "",
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

    // Validate parent if provided (prevent circular references)
    if (payload.parent !== undefined) {
        if (payload.parent === id) {
            throw new Error("A category cannot be its own parent");
        }
        if (payload.parent) {
            const parentCategory = await Category.findById(payload.parent);
            if (!parentCategory) {
                throw new Error("Parent category not found");
            }
            // Check for circular reference: walk up from parent to root
            let current = parentCategory;
            while (current.parent) {
                if (current.parent.toString() === id) {
                    throw new Error("Circular parent reference detected");
                }
                current = await Category.findById(current.parent) as any;
                if (!current) break;
            }
        }
    }

    return Category.findByIdAndUpdate(id, { $set: payload }, { new: true, runValidators: true })
        .populate("parent", "name slug");
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
    return Category.find().populate("parent", "name slug").sort({ sortOrder: 1 });
};

/** Delete a category */
const deleteCategory = async (id: string) => {
    // 1. Check if category exists
    const category = await Category.findById(id);
    if (!category) return null;

    // 2. Reassign sub-categories to this category's parent (or null if root)
    await Category.updateMany(
        { parent: category._id },
        { $set: { parent: category.parent || null } }
    );

    // 3. Un-categorize all products in this category (set category to null)
    // This allows the admin to reassign them individually later
    const { Product } = await import("../../models/product.model.js");
    await Product.updateMany(
        { category: category._id },
        { $set: { category: null } }
    );

    // 4. Finally, delete the category
    return Category.findByIdAndDelete(id);
};

export const categoryService = {
    getActiveCategories,
    getAllCategories,
    getCategoryTree,
    getDescendantIds,
    getCategoryById,
    getCategoryBySlug,
    createCategory,
    updateCategory,
    toggleCategory,
    reorderCategories,
    deleteCategory,
};
