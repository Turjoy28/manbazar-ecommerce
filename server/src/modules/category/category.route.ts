import { Router } from "express";
import { categoryController } from "./category.controller.js";
import { authenticate } from "../../middleware/authenticate.js";
import { authorize } from "../../middleware/authorize.js";
import { seedCategories } from "../../script/seedCategories.js";

const router = Router();

// ── Public routes ──────────────────────────────────────────────────────────────
/** GET all active categories (for client storefront) */
router.get("/", categoryController.getActiveCategories);

/** GET hierarchical category tree (for menus) */
router.get("/tree", categoryController.getCategoryTree);

/** GET category by slug (for client category page) */
router.get("/slug/:slug", categoryController.getCategoryBySlug);

/** GET force-seed categories */
router.get("/force-seed", async (req, res) => {
    try {
        await seedCategories();
        res.json({ success: true, message: "Migration triggered successfully" });
    } catch (error: any) {
        res.json({ success: false, message: error.message });
    }
});

router.get("/admin/all", authenticate, authorize("ADMIN"), categoryController.getAllCategories);

/** POST create a new category */
router.post("/", authenticate, authorize("ADMIN"), categoryController.createCategory);

/** PATCH bulk reorder categories (must be before /:id to avoid conflict) */
router.patch("/reorder", authenticate, authorize("ADMIN"), categoryController.reorderCategories);

/** PATCH toggle category active/inactive */
router.patch("/:id/toggle", authenticate, authorize("ADMIN"), categoryController.toggleCategory);

/** PATCH update category */
router.patch("/:id", authenticate, authorize("ADMIN"), categoryController.updateCategory);

/** DELETE category */
router.delete("/:id", authenticate, authorize("ADMIN"), categoryController.deleteCategory);

/** GET descendant category IDs (for inclusive product queries) */
router.get("/:id/descendants", categoryController.getDescendantIds);

/** GET category by ID (admin) */
router.get("/:id", authenticate, authorize("ADMIN"), categoryController.getCategoryById);

export const categoryRoute = router;
