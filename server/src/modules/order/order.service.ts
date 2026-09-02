import { Order } from "../../models/order.model.js";

/** Place a new order (public) — with payment routing and server-side calculation */
const createOrder = async (payload: Record<string, any>) => {
    const method = (payload.paymentMethod as string | undefined) || "cod";

    if (method === "bkash") {
        const txn = (payload.bkashTxnId as string | undefined)?.trim();
        if (!txn) {
            throw Object.assign(
                new Error("bkashTxnId is required for bKash payments."),
                { statusCode: 400 }
            );
        }
        payload.paymentStatus = "pending";
        payload.bkashTxnId = txn;
    } else {
        // COD
        payload.paymentMethod = "cod";
        payload.paymentStatus = "pending";
        payload.bkashTxnId = null;
    }

    // Import Product inline to avoid circular dependencies
    const Product = (await import("../../models/product.model.js")).Product;

    if (!payload.products || !Array.isArray(payload.products) || payload.products.length === 0) {
        throw Object.assign(new Error("Products are required to place an order."), { statusCode: 400 });
    }

    // Fetch fresh product data from DB
    const productIds = payload.products.map((p: any) => p.id);
    const dbProducts = await Product.find({ _id: { $in: productIds } });

    if (dbProducts.length !== productIds.length) {
        throw Object.assign(new Error("One or more products could not be found."), { statusCode: 400 });
    }

    let subtotal = 0;
    let totalVat = 0;
    const finalProducts = [];
    const bulkInventoryUpdates: any[] = [];

    const location = payload.customer?.location;
    let highestDeliveryCharge = 0;

    for (const p of payload.products) {
        const dbProduct = dbProducts.find((dbp: any) => dbp._id.toString() === p.id);
        if (!dbProduct) continue;

        const qty = Number(p.quantity);
        if (!qty || qty <= 0) {
            throw Object.assign(new Error(`Invalid quantity for product ${dbProduct.name}`), { statusCode: 400 });
        }

        // -- Variant Lookup & Pricing --
        let variantMatch = null;
        let variantIndex = -1;
        if (dbProduct.variants && dbProduct.variants.length > 0) {
            variantIndex = dbProduct.variants.findIndex((v: any) => v.color?.name === p.color);
            if (variantIndex !== -1) variantMatch = dbProduct.variants[variantIndex];
        }

        let price = dbProduct.price;
        if (variantMatch) {
            if (variantMatch.sale_price != null && variantMatch.sale_price > 0) {
                price = variantMatch.sale_price;
            } else if (variantMatch.price != null && variantMatch.price > 0) {
                price = variantMatch.price;
            }
        }

        const vatPercentage = dbProduct.vatPercentage || 0;
        const itemSubtotal = price * qty;
        const itemVat = itemSubtotal * (vatPercentage / 100);

        // -- Inventory Validation and Reservation Logic --

        const onHand = variantMatch ? (variantMatch.quantity_on_hand || 0) : (dbProduct.quantity_on_hand || 0);
        const reserved = variantMatch ? (variantMatch.quantity_reserved || 0) : (dbProduct.quantity_reserved || 0);
        const available = onHand - reserved;

        if (qty > available) {
            throw Object.assign(
                new Error(`Only ${available} items left in stock for ${dbProduct.name} ${variantMatch ? `(${variantMatch.color.name})` : ''}. Please adjust your cart.`),
                { statusCode: 400 }
            );
        }

        // Prepare atomic bulk update to reserve stock
        if (variantMatch) {
            const updateKey = `variants.${variantIndex}.quantity_reserved`;
            bulkInventoryUpdates.push({
                updateOne: {
                    filter: { _id: dbProduct._id },
                    update: { $inc: { [updateKey]: qty } }
                }
            });
        } else {
            bulkInventoryUpdates.push({
                updateOne: {
                    filter: { _id: dbProduct._id },
                    update: { $inc: { quantity_reserved: qty } }
                }
            });
        }
        // ----------------------------------------------

        subtotal += itemSubtotal;
        totalVat += itemVat;

        finalProducts.push({
            id: dbProduct._id.toString(),
            productId: dbProduct.productId,
            name: dbProduct.name,
            price: price, // Legacy field
            purchasedPrice: price, // Snapshotted real cost
            appliedVatPercentage: vatPercentage, // Snapshotted VAT %
            quantity: qty,
            size: p.size || "",
            color: p.color || "",
        });

        const charges = dbProduct.deliveryCharge || [];
        let chargeText = "";
        if (location === "dhaka") chargeText = "inside";
        else if (location === "outside") chargeText = "outside";
        else if (location === "subcity") chargeText = "subcity";
        else chargeText = "inside"; // Default fallback

        const match = charges.find((d: any) =>
            d.text.toLowerCase().includes(chargeText)
        );

        let defaultCharge = 50;
        if (location === "outside") defaultCharge = 150;
        else if (location === "subcity") defaultCharge = 100;

        const chargeForProduct = match ? match.price : defaultCharge;
        if (chargeForProduct > highestDeliveryCharge) {
            highestDeliveryCharge = chargeForProduct;
        }
    }

    const deliveryCharge = highestDeliveryCharge;
    const total = subtotal + totalVat;
    const grandTotal = total + deliveryCharge;

    // Overwrite payload with securely calculated values
    payload.products = finalProducts;
    payload.subtotal = Number(subtotal.toFixed(2));
    payload.totalVat = Number(totalVat.toFixed(2));
    payload.total = Number(total.toFixed(2));
    payload.deliveryCharge = Number(deliveryCharge.toFixed(2));
    payload.grandTotal = Number(grandTotal.toFixed(2));

    // Execute all reservations atomically
    if (bulkInventoryUpdates.length > 0) {
        await Product.bulkWrite(bulkInventoryUpdates);
    }

    const createdOrder = await Order.create(payload);

    // Clean up any incomplete order records for this customer (fire-and-forget)
    try {
        const { incompleteOrderService } = await import("../incomplete-order/incomplete-order.service.js");
        await incompleteOrderService.cleanupByPhone(payload.customer?.phone);
    } catch (err) {
        console.error("[IncompleteOrder Cleanup] Failed:", err);
    }

    return createdOrder;
};

/** Get paginated orders (admin) */
const getOrders = async (page = 1, limit = 10) => {
    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
        Order.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
        Order.countDocuments(),
    ]);
    return { orders, total, page, limit, pages: Math.ceil(total / limit) };
};

/** Get a single order by ID */
const getOrderById = async (id: string) => {
    return Order.findById(id);
};

/** Update order status */
const updateOrderStatus = async (id: string, status: string) => {
    const order = await Order.findById(id);
    if (!order) return null;

    const oldStatus = order.status;
    const updatedOrder = await Order.findByIdAndUpdate(id, { $set: { status } }, { new: true });

    // Inventory Lifecycle Management
    if (oldStatus !== status) {
        const Product = (await import("../../models/product.model.js")).Product;
        const bulkUpdates: any[] = [];

        for (const item of order.products) {
            const qty = item.quantity;

            // Re-fetch product to find correct variant index based on color
            const dbProduct = await Product.findById(item.id);
            if (!dbProduct) continue;

            let variantIndex = -1;
            if (item.color && dbProduct.variants && dbProduct.variants.length > 0) {
                variantIndex = dbProduct.variants.findIndex((v: any) => v.color?.name === item.color);
            }

            const isVariant = variantIndex !== -1;

            if (status === "shipped") {
                // Physically left warehouse: decrement both reserved and on_hand
                const incObj = isVariant
                    ? { [`variants.${variantIndex}.quantity_on_hand`]: -qty, [`variants.${variantIndex}.quantity_reserved`]: -qty }
                    : { quantity_on_hand: -qty, quantity_reserved: -qty };

                bulkUpdates.push({
                    updateOne: { filter: { _id: item.id }, update: { $inc: incObj } }
                });
            } else if (status === "cancelled" && oldStatus !== "shipped" && oldStatus !== "delivered") {
                // Free up reserved stock immediately
                const incObj = isVariant
                    ? { [`variants.${variantIndex}.quantity_reserved`]: -qty }
                    : { quantity_reserved: -qty };

                bulkUpdates.push({
                    updateOne: { filter: { _id: item.id }, update: { $inc: incObj } }
                });
            } else if (status === "returned") {
                // Return items physically back to the warehouse
                const incObj = isVariant
                    ? { [`variants.${variantIndex}.quantity_on_hand`]: qty }
                    : { quantity_on_hand: qty };

                bulkUpdates.push({
                    updateOne: { filter: { _id: item.id }, update: { $inc: incObj } }
                });
            }
        }

        if (bulkUpdates.length > 0) {
            await Product.bulkWrite(bulkUpdates);
        }
    }

    return updatedOrder;
};

/** Bulk delete orders */
const deleteOrders = async (ids: string[]) => {
    const Product = (await import("../../models/product.model.js")).Product;
    const ordersToDelete = await Order.find({ _id: { $in: ids } });

    const bulkUpdates: any[] = [];
    for (const order of ordersToDelete) {
        if (order.status !== "shipped" && order.status !== "delivered" && order.status !== "cancelled") {
            // Order is holding reserved stock, must free it before deletion
            for (const item of order.products) {
                const dbProduct = await Product.findById(item.id);
                if (!dbProduct) continue;

                let variantIndex = -1;
                if (item.color && dbProduct.variants && dbProduct.variants.length > 0) {
                    variantIndex = dbProduct.variants.findIndex((v: any) => v.color?.name === item.color);
                }
                const isVariant = variantIndex !== -1;

                const incObj = isVariant
                    ? { [`variants.${variantIndex}.quantity_reserved`]: -item.quantity }
                    : { quantity_reserved: -item.quantity };

                bulkUpdates.push({
                    updateOne: { filter: { _id: item.id }, update: { $inc: incObj } }
                });
            }
        }
    }

    if (bulkUpdates.length > 0) {
        await Product.bulkWrite(bulkUpdates);
    }

    return Order.deleteMany({ _id: { $in: ids } });
};

/** Update courier info on an order */
const updateCourierInfo = async (
    id: string,
    courierName: string,
    courierTrackingCode: string,
    courierConsignmentId: string,
    courierStatus: string
) => {
    return Order.findByIdAndUpdate(
        id,
        { $set: { courierName, courierTrackingCode, courierConsignmentId, courierStatus } },
        { new: true }
    );
};

/** Aggregate dashboard statistics */
const getStats = async () => {
    const Product = (await import("../../models/product.model.js")).Product;
    const Category = (await import("../../models/category.model.js")).Category;

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
        totalOrders, 
        totalRevenue, 
        pending, 
        delivered, 
        cancelled, 
        totalProducts,
        thisMonthOrders,
        thisMonthRevenueResult,
        ordersByLocation,
        mostOrderedItems,
        allProducts
    ] = await Promise.all([
        Order.countDocuments(),
        Order.aggregate([
            { $match: { paymentStatus: "completed" } },
            { $group: { _id: null, total: { $sum: "$total" } } }
        ]),
        Order.countDocuments({ status: "pending" }),
        Order.countDocuments({ status: "delivered" }),
        Order.countDocuments({ status: "cancelled" }),
        Product.countDocuments(),
        Order.countDocuments({ createdAt: { $gte: startOfMonth } }),
        Order.aggregate([
            { $match: { createdAt: { $gte: startOfMonth }, paymentStatus: "completed" } },
            { $group: { _id: null, total: { $sum: "$total" } } }
        ]),
        Order.aggregate([
            { $group: { _id: "$customer.location", count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]),
        Order.aggregate([
            { $unwind: "$products" },
            { $group: { _id: { id: "$products.id", name: "$products.name" }, count: { $sum: "$products.quantity" } } },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]),
        Product.find({}).populate("category")
    ]);

    // Calculate complex inventory metrics in-memory
    let totalStockUnits = 0;
    let totalStockValue = 0;
    const categoryMap = new Map<string, { totalItems: number, products: any[] }>();

    for (const p of allProducts) {
        const catName = p.category?.name || "Uncategorized";
        if (!categoryMap.has(catName)) {
            categoryMap.set(catName, { totalItems: 0, products: [] });
        }
        const catData = categoryMap.get(catName)!;
        
        let pStock = 0;
        let pValue = 0;
        const colorBreakdown: { color: string, hex?: string, stock: number, sizes?: { size: string, stock: number }[] }[] = [];

        if (p.variants && p.variants.length > 0) {
            for (const v of p.variants) {
                const available = (v.quantity_on_hand || 0) - (v.quantity_reserved || 0);
                if (available > 0) {
                    pStock += available;
                    const vPrice = v.price || p.price;
                    pValue += (available * vPrice);
                    colorBreakdown.push({ 
                        color: v.color.name, 
                        hex: v.color.hex || "#ccc",
                        stock: available,
                        sizes: v.sizes || []
                    });
                }
            }
        } else {
            const available = (p.quantity_on_hand || 0) - (p.quantity_reserved || 0);
            if (available > 0) {
                pStock += available;
                pValue += (available * p.price);
            }
        }

        totalStockUnits += pStock;
        totalStockValue += pValue;

        if (pStock > 0) {
            catData.totalItems += pStock;
            catData.products.push({
                name: p.name,
                stock: pStock,
                sizes: p.sizes || [],
                colors: colorBreakdown
            });
        }
    }

    const stockByCategory = Array.from(categoryMap.entries()).map(([name, data]) => ({
        category: name,
        totalItems: data.totalItems,
        products: data.products
    })).sort((a, b) => b.totalItems - a.totalItems);

    return {
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        pendingOrders: pending,
        deliveredOrders: delivered,
        cancelledOrders: cancelled,
        totalProducts,
        thisMonthOrders,
        thisMonthRevenue: thisMonthRevenueResult[0]?.total || 0,
        ordersByLocation: ordersByLocation.map(loc => ({
            location: loc._id || "Unknown",
            count: loc.count
        })),
        mostOrderedItems: mostOrderedItems.map(item => ({
            name: item._id.name,
            count: item.count
        })),
        inventory: {
            totalStockUnits,
            totalStockValue,
            stockByCategory
        }
    };
};

/** Daily order data for chart (last 90 days) */
const getMonthlyData = async () => {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    return Order.aggregate([
        { $match: { createdAt: { $gte: ninetyDaysAgo } } },
        {
            $group: {
                _id: {
                    year: { $year: "$createdAt" },
                    month: { $month: "$createdAt" },
                    day: { $dayOfMonth: "$createdAt" }
                },
                orders: { $sum: 1 },
                revenue: {
                    $sum: {
                        $cond: [{ $eq: ["$paymentStatus", "completed"] }, "$total", 0]
                    }
                },
            },
        },
        { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
    ]);
};

/** Reconcile a COD order — mark paymentStatus as 'completed' (admin only) */
const reconcilePayment = async (id: string) => {
    const order = await Order.findById(id);
    if (!order) {
        throw Object.assign(new Error("Order not found."), { statusCode: 404 });
    }

    if (order.paymentStatus !== "pending") {
        throw Object.assign(
            new Error("Order payment is not in a pending state."),
            { statusCode: 400 }
        );
    }
    return Order.findByIdAndUpdate(
        id,
        { $set: { paymentStatus: "completed" } },
        { new: true }
    );
};

/** Fully update an order (admin only) */
const updateOrder = async (id: string, payload: Partial<any>) => {
    const order = await Order.findByIdAndUpdate(id, { $set: payload }, { new: true });
    if (!order) {
        throw Object.assign(new Error("Order not found."), { statusCode: 404 });
    }
    return order;
};

/** Delete all orders permanently (danger zone) */
const deleteAllOrders = async () => {
    // Reset all reserved stock to 0 across all products and variants
    const Product = (await import("../../models/product.model.js")).Product;
    const products = await Product.find({});
    
    for (const p of products) {
        let changed = false;
        
        if (p.quantity_reserved !== 0) {
            p.quantity_reserved = 0;
            changed = true;
        }

        if (p.variants && p.variants.length > 0) {
            for (const v of p.variants) {
                if (v.quantity_reserved !== 0) {
                    v.quantity_reserved = 0;
                    changed = true;
                }
            }
        }

        if (changed) {
            p.markModified('variants');
            await p.save();
        }
    }

    return Order.deleteMany({});
};

export const orderService = {
    createOrder,
    getOrders,
    getOrderById,
    updateOrder,
    updateOrderStatus,
    deleteOrders,
    deleteAllOrders,
    updateCourierInfo,
    getStats,
    getMonthlyData,
    reconcilePayment,
};
