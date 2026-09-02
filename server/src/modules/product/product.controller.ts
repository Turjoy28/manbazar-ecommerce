import { NextFunction, Request, Response } from "express";
import { productService } from "./product.service.js";
import sendResponse from "../../utils/sendResponse.js";

/** POST /products — Create a new product (admin) */
const createProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await productService.createProduct(req.body);
        sendResponse(res, { statusCode: 201, success: true, message: "Product created successfully", data: result });
    } catch (error) { next(error); }
};

/** GET /products — Get all products (public, active only) */
const getAllProducts = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 50;
        const result = await productService.getAllProducts(page, limit);
        console.log("=== SERVER RETRIEVED PRODUCTS ===");
        console.log(JSON.stringify(result.products, null, 2));
        console.log("=================================");
        sendResponse(res, { statusCode: 200, success: true, message: "Products fetched successfully", data: result });
    } catch (error) { next(error); }
};

/** GET /products/admin — Get all products for admin (includes inactive) */
const getAllProductsAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 50;
        const result = await productService.getAllProductsAdmin(page, limit);
        sendResponse(res, { statusCode: 200, success: true, message: "Products fetched successfully", data: result });
    } catch (error) { next(error); }
};

/** GET /products/slug/:slug — Get product by slug (public) */
const getProductBySlug = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await productService.getProductBySlug(req.params.slug as string);
        if (!result) { res.status(404).json({ success: false, message: "Product not found" }); return; }
        sendResponse(res, { statusCode: 200, success: true, message: "Product fetched successfully", data: result });
    } catch (error) { next(error); }
};

/** GET /products/:id — Get product by ID (admin) */
const getProductById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await productService.getProductById(req.params.id as string);
        if (!result) { res.status(404).json({ success: false, message: "Product not found" }); return; }
        sendResponse(res, { statusCode: 200, success: true, message: "Product fetched successfully", data: result });
    } catch (error) { next(error); }
};

/** PATCH /products/:id — Update a product (admin) */
const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await productService.updateProduct(req.params.id as string, req.body);
        if (!result) { res.status(404).json({ success: false, message: "Product not found" }); return; }
        sendResponse(res, { statusCode: 200, success: true, message: "Product updated successfully", data: result });
    } catch (error) { next(error); }
};

/** DELETE /products/:id — Delete a product (admin) */
const deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await productService.deleteProduct(req.params.id as string);
        if (!result) { res.status(404).json({ success: false, message: "Product not found" }); return; }
        sendResponse(res, { statusCode: 200, success: true, message: "Product deleted successfully", data: result });
    } catch (error) { next(error); }
};

/** POST /products/bulk-csv — Bulk upload products from CSV file (admin) */
const bulkUploadCSV = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const file = (req as any).file;
        if (!file) {
            res.status(400).json({ success: false, message: "No CSV file uploaded." });
            return;
        }

        const { parse } = await import("csv-parse/sync");
        const csvContent = file.buffer.toString("utf-8");
        const rows: Record<string, string>[] = parse(csvContent, {
            columns: true,
            skip_empty_lines: true,
            trim: true,
            bom: true,
        });

        if (!rows.length) {
            res.status(400).json({ success: false, message: "CSV file is empty or has no valid rows." });
            return;
        }

        // Group rows by product name → each group becomes one product with multiple variants
        const productMap = new Map<string, { base: Record<string, string>; variantRows: Record<string, string>[] }>();

        for (const row of rows) {
            const name = (row.name || "").trim();
            if (!name) continue;

            if (!productMap.has(name)) {
                productMap.set(name, { base: row, variantRows: [] });
            }
            productMap.get(name)!.variantRows.push(row);
        }

        // Build product payloads
        const payloads: Record<string, unknown>[] = [];

        for (const [name, { base, variantRows }] of productMap) {
            const slug = (base.slug || "").trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

            // Parse delivery charges
            const deliveryCharge: { text: string; price: number }[] = [];
            if (base.deliveryCharge_text) {
                const texts = base.deliveryCharge_text.split(",").map((t: string) => t.trim());
                const prices = (base.deliveryCharge_price || "").split(",").map((p: string) => Number(p.trim()) || 0);
                for (let i = 0; i < texts.length; i++) {
                    if (texts[i]) deliveryCharge.push({ text: texts[i], price: prices[i] || 0 });
                }
            }

            // Parse sizes
            const sizes = base.sizes ? base.sizes.split(",").map((s: string) => s.trim()).filter(Boolean) : [];

            // Build variants from all rows belonging to this product
            const variants: any[] = [];
            for (const vRow of variantRows) {
                const colorName = (vRow.color_name || "").trim();
                if (!colorName) continue;

                // Parse variant_sizes like "S:100,M:200,L:150,XL:40"
                const variantSizes: { size: string; stock: number }[] = [];
                if (vRow.variant_sizes) {
                    const pairs = vRow.variant_sizes.split(",").map((p: string) => p.trim());
                    for (const pair of pairs) {
                        const [sizeName, sizeStock] = pair.split(":").map((x: string) => x.trim());
                        if (sizeName) {
                            variantSizes.push({ size: sizeName, stock: Number(sizeStock) || 0 });
                        }
                    }
                }

                // If sizes are specified, stock is the sum of sizes; otherwise use variant_stock
                const stockFromSizes = variantSizes.reduce((sum, s) => sum + s.stock, 0);
                const manualStock = Number(vRow.variant_stock) || 0;
                const effectiveStock = variantSizes.length > 0 ? stockFromSizes : manualStock;

                // Parse variant images
                const images = vRow.variant_images
                    ? vRow.variant_images.split(",").map((u: string) => u.trim()).filter(Boolean)
                    : [];

                variants.push({
                    color: {
                        name: colorName,
                        hex: (vRow.color_hex || "#000000").trim(),
                    },
                    sku: (vRow.variant_sku || "").trim(),
                    sizes: variantSizes,
                    quantity_on_hand: effectiveStock,
                    quantity_reserved: 0,
                    price: vRow.variant_price ? Number(vRow.variant_price) : null,
                    sale_price: vRow.variant_sale_price ? Number(vRow.variant_sale_price) : null,
                    images,
                });
            }

            // Calculate total stock from variants
            const totalStock = variants.reduce((sum, v) => sum + (v.quantity_on_hand || 0), 0);

            const payload: Record<string, unknown> = {
                name,
                slug,
                description: (base.description || "").trim(),
                base_price: Number(base.base_price) || 0,
                offerType: base.offerType || "NONE",
                offerValue: Number(base.offerValue) || 0,
                vatPercentage: Number(base.vatPercentage) || 0,
                thumbnail: (base.thumbnail || "").trim(),
                fabric: (base.fabric || "").trim(),
                fit: (base.fit || "").trim(),
                sizes,
                deliveryCharge,
                variants,
                quantity_on_hand: totalStock,
                quantity_reserved: 0,
                isActive: base.isActive !== undefined ? base.isActive.toLowerCase() !== "false" : true,
                videoUrl: (base.videoUrl || "").trim(),
            };

            // Only set category if provided and looks like a valid ObjectId
            const cat = (base.category || "").trim();
            if (cat && /^[a-f0-9]{24}$/i.test(cat)) {
                payload.category = cat;
            }

            payloads.push(payload);
        }

        const result = await productService.bulkCreateProducts(payloads);
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: `CSV processed: ${result.created.length} created, ${result.skipped.length} skipped, ${result.errors.length} errors.`,
            data: result,
        });
    } catch (error) { next(error); }
};

export const productController = {
    createProduct,
    getAllProducts,
    getAllProductsAdmin,
    getProductBySlug,
    getProductById,
    updateProduct,
    deleteProduct,
    bulkUploadCSV,
};