import { orderService } from "../order/order.service.js";
import config from "../../config/index.js";
import { Ui } from "../../models/ui.model.js";

/**
 * Courier service integration for SteadFast, Pathao, and RedX.
 * API credentials are loaded from environment variables so only .env needs updating.
 */

// ── SteadFast ──────────────────────────────────────────────────────────────────
const sendToSteadFast = async (order: {
    id: string; customerName: string; customerPhone: string;
    customerAddress: string; amount: number; note?: string;
}) => {
    const uiData = await Ui.findOne();
    const steadfast = uiData?.courier?.steadfast;

    const apiKey = steadfast?.apiKey || config.steadfast.api_key;
    const apiSecret = steadfast?.apiSecret || config.steadfast.api_secret;

    if (!apiKey || !apiSecret) {
        throw new Error('CRITICAL: Steadfast API credentials are missing in the environment variables.');
    }

    const errors: string[] = [];

    // 1. recipient_name validation
    if (!order.customerName || typeof order.customerName !== 'string') {
        errors.push('recipient_name is required and must be a string.');
    } else if (order.customerName.length > 100) {
        errors.push('recipient_name exceeds the 100 character limit.');
    }

    // 2. recipient_phone validation (Bangladeshi format: starts with 01, exactly 11 digits)
    const phoneRegex = /^01[3-9]\d{8}$/;
    if (!order.customerPhone || !phoneRegex.test(order.customerPhone)) {
        errors.push('recipient_phone must be a valid 11-digit Bangladeshi number starting with 01.');
    }

    // 3. recipient_address validation
    if (!order.customerAddress || typeof order.customerAddress !== 'string') {
        errors.push('recipient_address is required and must be a string.');
    } else if (order.customerAddress.length > 250) {
        errors.push('recipient_address exceeds the 250 character limit.');
    }

    // 4. cod_amount validation
    if (typeof order.amount !== 'number' || order.amount < 0) {
        errors.push('cod_amount must be a positive number or 0 for prepaid.');
    }

    // 5. note validation (Optional)
    let safeNote = order.note || '';
    if (typeof safeNote !== 'string') {
        errors.push('note must be a string.');
    } else if (safeNote.length > 480) {
        errors.push('note exceeds the 480 character limit.');
    }

    if (errors.length > 0) {
        throw new Error(`Payload Validation Failed: ${errors.join(' | ')}`);
    }

    const payload = {
        invoice: order.id,
        recipient_name: order.customerName.trim(),
        recipient_phone: order.customerPhone.trim(),
        recipient_address: order.customerAddress.trim(),
        cod_amount: order.amount,
        note: safeNote.trim(),
    };

    console.log(`[STEADFAST] Dispatching order for invoice: ${payload.invoice}...`);

    try {
        const response = await fetch("https://portal.packzy.com/api/v1/create_order", {
            method: "POST",
            headers: {
                "Api-Key": apiKey,
                "Secret-Key": apiSecret,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            let errorData: any;
            let errorMsg = 'Server rejected the request';
            let rawText = '';
            try {
                rawText = await response.text();
                errorData = JSON.parse(rawText);
                if (errorData) {
                    if (errorData.errors) {
                        errorMsg = typeof errorData.errors === 'object' ? JSON.stringify(errorData.errors) : errorData.errors;
                    } else if (errorData.message) {
                        errorMsg = errorData.message;
                    } else {
                        errorMsg = JSON.stringify(errorData);
                    }
                }
            } catch {
                errorMsg = rawText || response.statusText;
                errorData = rawText || undefined;
            }
            console.error(`❌ [STEADFAST API ERROR] Status: ${response.status}`);
            console.error(`   └─ Details: ${typeof errorData === 'string' ? errorData : JSON.stringify(errorData)}`);
            throw new Error(`Steadfast API Error (Status ${response.status}): ${errorMsg}`);
        }

        const data = await response.json() as any;
        
        console.log(`✅ [STEADFAST] SUCCESS: Order created for invoice ${payload.invoice}`);
        console.log(`   └─ Consignment ID: ${data.consignment_id}`);
        console.log(`   └─ Tracking Code:  ${data.tracking_code}`);

        return data;
    } catch (error: any) {
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            console.error(`❌ [STEADFAST NETWORK ERROR] No response received from server.`);
            console.error(`   └─ Please check your network connection or if Steadfast is down.`);
            throw new Error('Steadfast Network Timeout: No response received.');
        } else if (!error.message.includes('Steadfast API Error')) {
            console.error(`❌ [STEADFAST ERROR] ${error.message}`);
        }
        throw error;
    }
};

// ── Pathao ─────────────────────────────────────────────────────────────────────
const getPathaoToken = async () => {
    const uiData = await Ui.findOne();
    const pathao = uiData?.courier?.pathao;

    const client_id = pathao?.clientId || config.pathao.client_id;
    const client_secret = pathao?.clientSecret || config.pathao.client_secret;
    const username = pathao?.username || config.pathao.username;
    const password = pathao?.password || config.pathao.password;

    const resp = await fetch("https://hermes.pathao.com/api/v1/issue-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            client_id,
            client_secret,
            username,
            password,
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
    const uiData = await Ui.findOne();
    const store_id = uiData?.courier?.pathao?.storeId || config.pathao.store_id;

    const token = await getPathaoToken();
    const response = await fetch("https://hermes.pathao.com/api/v1/orders", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            store_id,
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
    const uiData = await Ui.findOne();
    const apiKey = uiData?.courier?.redx?.apiKey || config.redx.api_key;
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
export const sendOrdersToCourier = async (orderIds: string[], courier?: CourierName | string) => {
    const uiData = await Ui.findOne();
    const activeProvider = courier || uiData?.courier?.activeProvider;

    if (!activeProvider || activeProvider === 'none') {
        throw new Error('No active courier provider is selected. Please configure it in settings.');
    }
    const results: { orderId: string; success: boolean; tracking?: string; error?: string }[] = [];

    for (const orderId of orderIds) {
        try {
            const order = await orderService.getOrderById(orderId) as any;
            if (!order || !order.customer) { results.push({ orderId, success: false, error: "Order or customer details not found" }); continue; }

            const amountToCollect = (order.paymentMethod === "bkash" || order.paymentStatus === "completed") ? 0 : order.total;

            const orderData = {
                id: orderId,
                customerName: order.customer.name,
                customerPhone: order.customer.phone,
                customerAddress: order.customer.address,
                amount: amountToCollect,
            };

            let apiResult: any = {};

            if (activeProvider === "steadfast") {
                apiResult = await sendToSteadFast(orderData);
            } else if (activeProvider === "pathao") {
                apiResult = await sendToPathao(orderData);
            } else if (activeProvider === "redx") {
                apiResult = await sendToRedX(orderData);
            } else {
                throw new Error(`Unsupported courier: ${activeProvider}`);
            }

            // Extract tracking code from response (varies by courier)
            const trackingCode = String(
                apiResult?.consignment_id ||
                apiResult?.data?.consignment_id ||
                apiResult?.tracking_id ||
                apiResult?.parcel_tracking_id ||
                orderId
            );

            await orderService.updateCourierInfo(orderId, activeProvider, trackingCode, String(trackingCode), "dispatched");
            results.push({ orderId, success: true, tracking: trackingCode });
        } catch (error: unknown) {
            const err = error as Error;
            results.push({ orderId, success: false, error: err.message });
        }
    }

    return results;
};
