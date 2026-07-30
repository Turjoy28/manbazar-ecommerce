import { Request, Response, NextFunction } from "express";
import { feedService } from "./feed.service.js";

/* ═══════════════════════════════════════════════════════════════════════════════
   XML FEED CONTROLLERS
   Generates dynamic XML product feeds from the database.
   All endpoints are public (no authentication required).
   ═══════════════════════════════════════════════════════════════════════════════ */

const SITE_URL = process.env.SITE_URL || "https://manbazar.com";
const STORE_NAME = "ManBazar";
const CURRENCY = "BDT";
const BRAND = "ManBazar";

/** Escape special XML characters to prevent malformed output. */
function escapeXml(str: string): string {
    if (!str) return "";
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
}

/** Compute stock from quantity_on_hand and quantity_reserved (mirrors the virtual). */
function computeStock(doc: any): number {
    if (doc.variants && doc.variants.length > 0) {
        return doc.variants.reduce(
            (sum: number, v: any) => sum + ((v.quantity_on_hand || 0) - (v.quantity_reserved || 0)),
            0
        );
    }
    return (doc.quantity_on_hand || 0) - (doc.quantity_reserved || 0);
}

/* ─────────────────────────────────────────────────────────────────────────────
   1. PRODUCTS.XML — ManBazar Custom Product Catalog
   ───────────────────────────────────────────────────────────────────────────── */
const getProductsCatalogXml = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const products = await feedService.getAllProductsForFeed();

        let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
        xml += `<catalog>\n`;
        xml += `    <store>\n`;
        xml += `        <name>${escapeXml(STORE_NAME)}</name>\n`;
        xml += `        <url>${escapeXml(SITE_URL)}</url>\n`;
        xml += `        <currency>${CURRENCY}</currency>\n`;
        xml += `        <total_products>${products.length}</total_products>\n`;
        xml += `        <generated_at>${new Date().toISOString()}</generated_at>\n`;
        xml += `    </store>\n\n`;
        xml += `    <products>\n`;

        for (const p of products) {
            const stock = computeStock(p);
            const availability = stock > 0 ? "In Stock" : "Out of Stock";
            const colors = p.variants && p.variants.length > 0
                ? p.variants.map((v: any) => v.color?.name).filter(Boolean)
                : (p.colors || []);
            const allImages: string[] = [];
            if (p.variants && p.variants.length > 0) {
                p.variants.forEach((v: any) => {
                    if (v.images) allImages.push(...v.images);
                });
            }
            if (p.images && p.images.length > 0) {
                p.images.forEach((img: string) => {
                    if (!allImages.includes(img)) allImages.push(img);
                });
            }
            const updatedAt = p.updatedAt
                ? new Date(p.updatedAt).toISOString().split("T")[0]
                : new Date().toISOString().split("T")[0];

            xml += `\n        <product>\n`;
            xml += `            <id>${escapeXml(p.productId || p._id.toString())}</id>\n`;
            xml += `            <title>${escapeXml(p.name)}</title>\n`;
            xml += `            <brand>${escapeXml(BRAND)}</brand>\n`;
            xml += `            <category>${escapeXml(p.categoryAssignment || "TOP")}</category>\n`;
            xml += `            <description>${escapeXml(p.description || "")}</description>\n`;
            xml += `            <price>${p.base_price || p.price || 0}</price>\n`;
            if (p.is_on_sale && p.sale_price) {
                xml += `            <sale_price>${p.sale_price}</sale_price>\n`;
            }
            xml += `            <availability>${availability}</availability>\n`;
            xml += `            <quantity>${stock}</quantity>\n`;
            xml += `            <condition>New</condition>\n`;
            if (colors.length > 0) {
                xml += `            <color>${escapeXml(colors.join(", "))}</color>\n`;
            }
            if (p.sizes && p.sizes.length > 0) {
                xml += `            <size>${escapeXml(p.sizes.join(", "))}</size>\n`;
            }
            if (p.fabric) {
                xml += `            <material>${escapeXml(p.fabric)}</material>\n`;
            }
            xml += `            <currency>${CURRENCY}</currency>\n`;
            xml += `            <image>${escapeXml(p.thumbnail || "")}</image>\n`;
            if (allImages.length > 0) {
                xml += `            <additional_images>\n`;
                for (const img of allImages) {
                    xml += `                <image>${escapeXml(img)}</image>\n`;
                }
                xml += `            </additional_images>\n`;
            }
            xml += `            <product_url>${escapeXml(SITE_URL)}/product/${escapeXml(p.slug)}</product_url>\n`;
            xml += `            <last_updated>${updatedAt}</last_updated>\n`;

            // Variants
            if (p.variants && p.variants.length > 0) {
                xml += `            <variants>\n`;
                for (const v of p.variants) {
                    const vStock = (v.quantity_on_hand || 0) - (v.quantity_reserved || 0);
                    xml += `                <variant>\n`;
                    xml += `                    <color>${escapeXml(v.color?.name || "")}</color>\n`;
                    xml += `                    <color_hex>${escapeXml(v.color?.hex || "")}</color_hex>\n`;
                    if (v.sku) xml += `                    <sku>${escapeXml(v.sku)}</sku>\n`;
                    xml += `                    <stock>${vStock}</stock>\n`;
                    if (v.price != null) xml += `                    <price>${v.price}</price>\n`;
                    if (v.sale_price != null) xml += `                    <sale_price>${v.sale_price}</sale_price>\n`;
                    if (v.images && v.images.length > 0) {
                        xml += `                    <images>\n`;
                        for (const img of v.images) {
                            xml += `                        <image>${escapeXml(img)}</image>\n`;
                        }
                        xml += `                    </images>\n`;
                    }
                    xml += `                </variant>\n`;
                }
                xml += `            </variants>\n`;
            }

            xml += `        </product>\n`;
        }

        xml += `\n    </products>\n`;
        xml += `</catalog>`;

        res.set("Content-Type", "application/xml; charset=utf-8");
        res.set("Cache-Control", "public, max-age=300"); // 5-min cache
        res.send(xml);
    } catch (err) {
        next(err);
    }
};

/* ─────────────────────────────────────────────────────────────────────────────
   2. GOOGLE-SHOPPING.XML — Google Merchant Center Feed (RSS 2.0 + g: namespace)
   ───────────────────────────────────────────────────────────────────────────── */
const getGoogleShoppingXml = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const products = await feedService.getAllProductsForFeed();

        let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
        xml += `<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">\n`;
        xml += `<channel>\n`;
        xml += `    <title>${escapeXml(STORE_NAME)} — Product Feed</title>\n`;
        xml += `    <link>${escapeXml(SITE_URL)}</link>\n`;
        xml += `    <description>Product feed for Google Merchant Center</description>\n\n`;

        for (const p of products) {
            const stock = computeStock(p);
            const availability = stock > 0 ? "in_stock" : "out_of_stock";
            const price = p.is_on_sale && p.sale_price ? p.sale_price : (p.price || 0);
            const colors = p.variants && p.variants.length > 0
                ? p.variants.map((v: any) => v.color?.name).filter(Boolean)
                : (p.colors || []);
            const allImages: string[] = [];
            if (p.variants && p.variants.length > 0) {
                p.variants.forEach((v: any) => {
                    if (v.images) allImages.push(...v.images);
                });
            }
            if (p.images && p.images.length > 0) {
                p.images.forEach((img: string) => {
                    if (!allImages.includes(img)) allImages.push(img);
                });
            }

            xml += `    <item>\n`;
            xml += `        <g:id>${escapeXml(p.productId || p._id.toString())}</g:id>\n`;
            xml += `        <g:title>${escapeXml(p.name)}</g:title>\n`;
            xml += `        <g:description>${escapeXml(p.description || "")}</g:description>\n`;
            xml += `        <g:link>${escapeXml(SITE_URL)}/product/${escapeXml(p.slug)}</g:link>\n`;
            xml += `        <g:image_link>${escapeXml(p.thumbnail || "")}</g:image_link>\n`;
            for (const img of allImages.slice(0, 10)) { // Google allows max 10 additional images
                xml += `        <g:additional_image_link>${escapeXml(img)}</g:additional_image_link>\n`;
            }
            xml += `        <g:availability>${availability}</g:availability>\n`;
            xml += `        <g:price>${price} ${CURRENCY}</g:price>\n`;
            if (p.is_on_sale && p.sale_price && p.base_price) {
                xml += `        <g:sale_price>${p.sale_price} ${CURRENCY}</g:sale_price>\n`;
            }
            xml += `        <g:brand>${escapeXml(BRAND)}</g:brand>\n`;
            xml += `        <g:condition>new</g:condition>\n`;
            xml += `        <g:mpn>${escapeXml(p.productId || p._id.toString())}</g:mpn>\n`;
            if (colors.length > 0) {
                xml += `        <g:color>${escapeXml(colors.join("/"))}</g:color>\n`;
            }
            if (p.sizes && p.sizes.length > 0) {
                xml += `        <g:size>${escapeXml(p.sizes.join("/"))}</g:size>\n`;
            }
            if (p.fabric) {
                xml += `        <g:material>${escapeXml(p.fabric)}</g:material>\n`;
            }
            xml += `        <g:product_type>Apparel &amp; Accessories &gt; Clothing &gt; Shirts &amp; Tops</g:product_type>\n`;
            xml += `        <g:google_product_category>212</g:google_product_category>\n`;
            xml += `        <g:gender>male</g:gender>\n`;
            xml += `        <g:age_group>adult</g:age_group>\n`;
            xml += `        <g:shipping>\n`;
            xml += `            <g:country>BD</g:country>\n`;
            if (p.deliveryCharge && p.deliveryCharge.length > 0) {
                const cheapest = p.deliveryCharge.reduce((min: any, d: any) => d.price < min.price ? d : min, p.deliveryCharge[0]);
                xml += `            <g:price>${cheapest.price} ${CURRENCY}</g:price>\n`;
            }
            xml += `        </g:shipping>\n`;
            xml += `    </item>\n\n`;
        }

        xml += `</channel>\n`;
        xml += `</rss>`;

        res.set("Content-Type", "application/xml; charset=utf-8");
        res.set("Cache-Control", "public, max-age=300");
        res.send(xml);
    } catch (err) {
        next(err);
    }
};

/* ─────────────────────────────────────────────────────────────────────────────
   3. FACEBOOK-CATALOG.XML — Facebook / Instagram Product Feed
   ───────────────────────────────────────────────────────────────────────────── */
const getFacebookCatalogXml = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const products = await feedService.getAllProductsForFeed();

        let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
        xml += `<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">\n`;
        xml += `<channel>\n`;
        xml += `    <title>${escapeXml(STORE_NAME)} — Facebook Product Catalog</title>\n`;
        xml += `    <link>${escapeXml(SITE_URL)}</link>\n`;
        xml += `    <description>Product catalog for Facebook and Instagram Shops</description>\n\n`;

        for (const p of products) {
            const stock = computeStock(p);
            const availability = stock > 0 ? "in stock" : "out of stock";
            const price = p.is_on_sale && p.sale_price ? p.sale_price : (p.price || 0);
            const colors = p.variants && p.variants.length > 0
                ? p.variants.map((v: any) => v.color?.name).filter(Boolean)
                : (p.colors || []);
            const allImages: string[] = [];
            if (p.variants && p.variants.length > 0) {
                p.variants.forEach((v: any) => {
                    if (v.images) allImages.push(...v.images);
                });
            }
            if (p.images && p.images.length > 0) {
                p.images.forEach((img: string) => {
                    if (!allImages.includes(img)) allImages.push(img);
                });
            }

            xml += `    <item>\n`;
            xml += `        <g:id>${escapeXml(p.productId || p._id.toString())}</g:id>\n`;
            xml += `        <g:title>${escapeXml(p.name)}</g:title>\n`;
            xml += `        <g:description>${escapeXml(p.description || "")}</g:description>\n`;
            xml += `        <g:availability>${availability}</g:availability>\n`;
            xml += `        <g:condition>new</g:condition>\n`;
            xml += `        <g:price>${price} ${CURRENCY}</g:price>\n`;
            if (p.is_on_sale && p.sale_price && p.base_price) {
                xml += `        <g:sale_price>${p.sale_price} ${CURRENCY}</g:sale_price>\n`;
            }
            xml += `        <g:link>${escapeXml(SITE_URL)}/product/${escapeXml(p.slug)}</g:link>\n`;
            xml += `        <g:image_link>${escapeXml(p.thumbnail || "")}</g:image_link>\n`;
            for (const img of allImages.slice(0, 10)) {
                xml += `        <g:additional_image_link>${escapeXml(img)}</g:additional_image_link>\n`;
            }
            xml += `        <g:brand>${escapeXml(BRAND)}</g:brand>\n`;
            if (colors.length > 0) {
                xml += `        <g:color>${escapeXml(colors.join("/"))}</g:color>\n`;
            }
            if (p.sizes && p.sizes.length > 0) {
                xml += `        <g:size>${escapeXml(p.sizes.join("/"))}</g:size>\n`;
            }
            if (p.fabric) {
                xml += `        <g:material>${escapeXml(p.fabric)}</g:material>\n`;
            }
            xml += `        <g:gender>male</g:gender>\n`;
            xml += `        <g:age_group>adult</g:age_group>\n`;
            xml += `        <g:inventory>${stock}</g:inventory>\n`;
            xml += `        <g:product_type>Apparel &amp; Accessories &gt; Clothing</g:product_type>\n`;
            xml += `    </item>\n\n`;
        }

        xml += `</channel>\n`;
        xml += `</rss>`;

        res.set("Content-Type", "application/xml; charset=utf-8");
        res.set("Cache-Control", "public, max-age=300");
        res.send(xml);
    } catch (err) {
        next(err);
    }
};

export const feedController = {
    getProductsCatalogXml,
    getGoogleShoppingXml,
    getFacebookCatalogXml,
};
