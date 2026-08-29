import { IncompleteOrder } from "../../models/incomplete-order.model.js";

/** Upsert an incomplete order for a given session (public — called from client form onChange) */
const upsertIncompleteOrder = async (sessionId: string, data: Record<string, any>) => {
    const update = {
        customer: {
            name: data.customer?.name || "",
            phone: data.customer?.phone || "",
            email: data.customer?.email || "",
            address: data.customer?.address || "",
            location: data.customer?.location || "dhaka",
        },
        products: (data.products || []).map((p: any) => ({
            productId: p.productId || "",
            name: p.name || "",
            price: p.price || 0,
            quantity: p.quantity || 1,
            size: p.size || "",
            color: p.color || "",
            thumbnail: p.thumbnail || "",
        })),
        totalPrice: data.totalPrice || 0,
        paymentMethod: data.paymentMethod || "CashOnDelivery",
        status: "Incomplete",
    };

    return IncompleteOrder.findOneAndUpdate(
        { sessionId },
        { $set: update },
        { upsert: true, new: true, setDefaultsOnInsert: true }
    );
};

/** Get paginated incomplete orders (admin) */
const getIncompleteOrders = async (page = 1, limit = 10) => {
    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
        IncompleteOrder.find().sort({ updatedAt: -1 }).skip(skip).limit(limit),
        IncompleteOrder.countDocuments(),
    ]);
    return { orders, total, page, limit, pages: Math.ceil(total / limit) };
};

/** Bulk delete incomplete orders by IDs */
const deleteIncompleteOrders = async (ids: string[]) => {
    return IncompleteOrder.deleteMany({ _id: { $in: ids } });
};

/** Delete a single incomplete order */
const deleteIncompleteOrder = async (id: string) => {
    return IncompleteOrder.findByIdAndDelete(id);
};

/** Clean up incomplete order(s) when a real order is placed (match by phone) */
const cleanupByPhone = async (phone: string) => {
    if (!phone) return;
    return IncompleteOrder.deleteMany({ "customer.phone": phone });
};

export const incompleteOrderService = {
    upsertIncompleteOrder,
    getIncompleteOrders,
    deleteIncompleteOrders,
    deleteIncompleteOrder,
    cleanupByPhone,
};
