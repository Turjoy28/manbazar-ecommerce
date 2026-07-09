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

    const isDhaka = payload.customer?.location === "dhaka";
    let highestDeliveryCharge = 0;

    for (const p of payload.products) {
        const dbProduct = dbProducts.find((dbp: any) => dbp._id.toString() === p.id);
        if (!dbProduct) continue;

        const qty = Number(p.quantity);
        if (!qty || qty <= 0) {
            throw Object.assign(new Error(`Invalid quantity for product ${dbProduct.name}`), { statusCode: 400 });
        }

        const price = dbProduct.price;
        const vatPercentage = dbProduct.vatPercentage || 0;

        const itemSubtotal = price * qty;
        const itemVat = itemSubtotal * (vatPercentage / 100);

        // -- Inventory Validation and Reservation Logic --
        let variantMatch = null;
        let variantIndex = -1;
        if (dbProduct.variants && dbProduct.variants.length > 0) {
            variantIndex = dbProduct.variants.findIndex((v: any) => v.color?.name === p.color);
            if (variantIndex !== -1) variantMatch = dbProduct.variants[variantIndex];
        }

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
        const match = charges.find((d: any) =>
            d.text.toLowerCase().includes(isDhaka ? "inside" : "outside")
        );
        const chargeForProduct = match ? match.price : (isDhaka ? 50 : 150);
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

    return Order.create(payload);
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
    const [totalOrders, totalRevenue, pending, delivered, cancelled, products] = await Promise.all([
        Order.countDocuments(),
        Order.aggregate([{ $group: { _id: null, total: { $sum: "$total" } } }]),
        Order.countDocuments({ status: "pending" }),
        Order.countDocuments({ status: "delivered" }),
        Order.countDocuments({ status: "cancelled" }),
        // Import inline to avoid circular deps
        (await import("../../models/product.model.js")).Product.countDocuments(),
    ]);

    return {
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        pendingOrders: pending,
        deliveredOrders: delivered,
        cancelledOrders: cancelled,
        totalProducts: products,
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
                revenue: { $sum: "$total" },
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

export const orderService = {
    createOrder,
    getOrders,
    getOrderById,
    updateOrder,
    updateOrderStatus,
    deleteOrders,
    updateCourierInfo,
    getStats,
    getMonthlyData,
    reconcilePayment,
};
