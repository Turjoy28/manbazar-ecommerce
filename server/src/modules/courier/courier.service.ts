import { orderService } from "../order/order.service.js";
import config from "../../config/index.js";

/**
 * Courier service integration for SteadFast, Pathao, and RedX.
 * API credentials are loaded from environmant variables so only .env needs updating.
 */

// ── SteadFast ──────────────────────────────────────────────────────────────────
const sendToSteadFast = async (order: {
    id: string; customerName: string; customerPhone: string;
    customerAddress: string; amount: number; note?: string;
}) => {
    const apiKey = config.steadfast.api_key;
    const apiSecret = config.steadfast.api_secret;

    const response = await fetch("https://portal.steadfast.com.bd/api/v1/create_order", {
        method: "POST",
        headers: {
            "Api-Key": apiKey,
            "Secret-Key": apiSecret,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            invoice: order.id,
            recipient_name: order.customerName,
            recipient_phone: order.customerPhone,
            recipient_address: order.customerAddress,
            cod_amount: order.amount,
            note: order.note || "",
        }),
    });

    if (!response.ok) throw new Error(`SteadFast error: ${response.statusText}`);
    return response.json();
};

// ── Pathao ─────────────────────────────────────────────────────────────────────
const getPathaoToken = async () => {
    const resp = await fetch("https://hermes.pathao.com/api/v1/issue-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            client_id: config.pathao.client_id,
            client_secret: config.pathao.client_secret,
            username: config.pathao.username,
            password: config.pathao.password,
            grant_type: "password",
        }),
    });
    const data = await resp.json() as { access_token?: string };
    return data.access_token;
};

const sendToPathao = async (order: {
    id: string; customerName: string; customerPhone: string;
    customerAddress: string; amount: number;
}) => {
    const token = await getPathaoToken();
    const response = await fetch("https://hermes.pathao.com/api/v1/orders", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            store_id: config.pathao.store_id,
            merchant_order_id: order.id,
            recipient_name: order.customerName,
            recipient_phone: order.customerPhone,
            recipient_address: order.customerAddress,
            recipient_city: 1,
            recipient_zone: 1,
            delivery_type: 48,
            item_type: 2,
            special_instruction: "",
            item_quantity: 1,
            item_weight: 0.5,
            amount_to_collect: order.amount,
            item_description: "",
        }),
    });

    if (!response.ok) throw new Error(`Pathao error: ${response.statusText}`);
    return response.json();
};

// ── RedX ───────────────────────────────────────────────────────────────────────
const sendToRedX = async (order: {
    id: string; customerName: string; customerPhone: string;
    customerAddress: string; amount: number;
}) => {
    const apiKey = config.redx.api_key;
    const response = await fetch("https://openapi.redx.com.bd/v1.0.0-beta/parcel", {
        method: "POST",
        headers: {
            "API-ACCESS-TOKEN": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            customer_name: order.customerName,
            customer_phone: order.customerPhone,
            delivery_area: order.customerAddress,
            delivery_area_id: 508,
            customer_address: order.customerAddress,
            merchant_invoice_id: order.id,
            cash_collection_amount: order.amount,
            parcel_weight: 500,
        }),
    });

    if (!response.ok) throw new Error(`RedX error: ${response.statusText}`);
    return response.json();
};

// ── Dispatcher ─────────────────────────────────────────────────────────────────
export type CourierName = "steadfast" | "pathao" | "redx";

/**
 * Send multiple orders to a chosen courier service.
 * Updates each order in the database with tracking info on success.
 */
export const sendOrdersToCourier = async (orderIds: string[], courier: CourierName) => {
    const results: { orderId: string; success: boolean; tracking?: string; error?: string }[] = [];

    for (const orderId of orderIds) {
        try {
            const order = await orderService.getOrderById(orderId) as any;
            if (!order || !order.customer) { results.push({ orderId, success: false, error: "Order or customer details not found" }); continue; }

            const orderData = {
                id: orderId,
                customerName: order.customer.name,
                customerPhone: order.customer.phone,
                customerAddress: order.customer.address,
                amount: order.total,
            };

            let apiResult: any = {};

            if (courier === "steadfast") {
                apiResult = await sendToSteadFast(orderData);
            } else if (courier === "pathao") {
                apiResult = await sendToPathao(orderData);
            } else if (courier === "redx") {
                apiResult = await sendToRedX(orderData);
            }

            // Extract tracking code from response (varies by courier)
            const trackingCode = String(
                apiResult?.consignmant_id ||
                apiResult?.data?.consignmant_id ||
                apiResult?.tracking_id ||
                apiResult?.parcel_tracking_id ||
                orderId
            );

            await orderService.updateCourierInfo(orderId, courier, trackingCode, String(trackingCode), "dispatched");
            results.push({ orderId, success: true, tracking: trackingCode });
        } catch (error: unknown) {
            const err = error as Error;
            results.push({ orderId, success: false, error: err.message });
        }
    }

    return results;
};
