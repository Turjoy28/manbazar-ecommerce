import { Order } from "../../models/order.model.js";

/** Place a new order (public) */
const createOrder = async (payload: Record<string, unknown>) => {
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
    return Order.findByIdAndUpdate(id, { $set: { status } }, { new: true });
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

export const orderService = {
    createOrder,
    getOrders,
    getOrderById,
    updateOrderStatus,
    deleteOrders,
    updateCourierInfo,
    getStats,
    getMonthlyData,
};
