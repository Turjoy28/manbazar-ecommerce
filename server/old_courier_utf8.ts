import { orderService } from "../order/order.service.js";
import config from "../../config/index.js";
import { Ui } from "../../models/ui.model.js";

/**
 * Courier service integration for SteadFast, Pathao, and RedX.
 * API credentials are loaded from environment variables so only .env needs updating.
 */

// ΓöÇΓöÇ SteadFast ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
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
            console.error(`Γ¥î [STEADFAST API ERROR] Status: ${response.status}`);
            console.error(`   ΓööΓöÇ Details: ${typeof errorData === 'string' ? errorData : JSON.stringify(errorData)}`);
            throw new Error(`Steadfast API Error (Status ${response.status}): ${errorMsg}`);
        }

        const data = await response.json() as any;
        
        console.log(`Γ£à [STEADFAST] SUCCESS: Order created for invoice ${payload.invoice}`);
        console.log(`   ΓööΓöÇ Consignment ID: ${data.consignment_id}`);
        console.log(`   ΓööΓöÇ Tracking Code:  ${data.tracking_code}`);

        return data;
    } catch (error: any) {
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            console.error(`Γ¥î [STEADFAST NETWORK ERROR] No response received from server.`);
            console.error(`   ΓööΓöÇ Please check your network connection or if Steadfast is down.`);
            throw new Error('Steadfast Network Timeout: No response received.');
        } else if (!error.message.includes('Steadfast API Error')) {
            console.error(`Γ¥î [STEADFAST ERROR] ${error.message}`);
        }
        throw error;
    }
};

// ΓöÇΓöÇ Pathao ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
const sendToPathao = async (order: {
    id: string; customerName: string; customerPhone: string;
    customerAddress: string; amount: number;
}) => {
    const uiData = await Ui.findOne();
    const store_id = uiData?.courier?.pathao?.storeId || config.pathao.store_id;
    const token = uiData?.courier?.pathao?.accessToken || config.pathao.access_token;
    
    if (!token) {
        throw new Error('Pathao Access Token is missing. Please configure it in settings.');
    }
    const response = await fetch("https://api-hermes.pathao.com/aladdin/api/v1/orders", {
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

// ΓöÇΓöÇ RedX ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
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
// ΓöÇΓöÇ CarryBee ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ

/**
 * Helper: fuzzy-match a query string against a list of { id, name } items.
 * Returns the best matching item's `id`, or null if no reasonable match is found.
 */
const fuzzyMatchLocation = (query: string, items: { id: number; name: string }[]): number | null => {
    const q = query.toLowerCase().trim();
    
    // 1. Exact match
    for (const item of items) {
        if (item.name.toLowerCase().trim() === q) return item.id;
    }
    
    // 2. Query contains item name or vice-versa
    for (const item of items) {
        const n = item.name.toLowerCase().trim();
        if (q.includes(n) || n.includes(q)) return item.id;
    }
    
    // 3. Word-level overlap
    const qWords = q.split(/[\s,αÑñ\-/]+/).filter(w => w.length > 2);
    let bestScore = 0;
    let bestId: number | null = null;
    
    for (const item of items) {
        const nWords = item.name.toLowerCase().split(/[\s,αÑñ\-/]+/).filter(w => w.length > 2);
        const score = qWords.filter(w => nWords.some(nw => nw.includes(w) || w.includes(nw))).length;
        if (score > bestScore) { bestScore = score; bestId = item.id; }
    }
    
    if (bestScore > 0 && bestId !== null) return bestId;

    // 4. Handle typos with Levenshtein Distance (for slight misspellings like "Mymenisngh")
    const levenshtein = (a: string, b: string): number => {
        const matrix = [];
        for (let i = 0; i <= b.length; i++) matrix[i] = [i];
        for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
        for (let i = 1; i <= b.length; i++) {
            for (let j = 1; j <= a.length; j++) {
                if (b.charAt(i - 1) === a.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1));
                }
            }
        }
        return matrix[b.length][a.length];
    };

    let bestLevenshteinDist = Infinity;
    let bestLevenshteinId: number | null = null;

    for (const item of items) {
        const n = item.name.toLowerCase().trim();
        // Check distance against the whole query
        let dist = levenshtein(q, n);
        
        // Also check distance against individual words in the query
        for (const w of qWords) {
             const wordDist = levenshtein(w, n);
             if (wordDist < dist) dist = wordDist;
        }

        // Allow up to 2 typos for a match
        if (dist < bestLevenshteinDist && dist <= 2) {
            bestLevenshteinDist = dist;
            bestLevenshteinId = item.id;
        }
    }

    return bestLevenshteinId;
};

const sendToCarryBee = async (order: {
    id: string;
    customerName: string;
    customerPhone: string;
    customerAddress: string;
    amount: number;
}) => {
    const uiData = await Ui.findOne();
    const carrybee = uiData?.courier?.carrybee;

    const clientId = carrybee?.clientId;
    const clientSecret = carrybee?.clientSecret;
    const clientContext = carrybee?.clientContext;

    if (!clientId || !clientSecret || !clientContext) {
        throw new Error('CarryBee credentials (Client ID, Secret, or Context) are missing in the admin settings.');
    }

    const baseUrl = 'https://developers.carrybee.com';
    const headers = {
        'Content-Type': 'application/json',
        'Client-ID': clientId,
        'Client-Secret': clientSecret,
        'Client-Context': clientContext
    };

    // ΓöÇΓöÇ 1. Resolve city_id from customer address ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
    console.log(`[CARRYBEE] Looking up city for address: "${order.customerAddress}"`);
    const citiesRes = await fetch(`${baseUrl}/api/v2/cities`, { method: 'GET', headers });

    if (!citiesRes.ok) throw new Error(`CarryBee Network Error (Cities): ${citiesRes.status} ${citiesRes.statusText}`);
    const citiesJson = await citiesRes.json() as any;
    console.log(`[CARRYBEE] Cities response keys: ${JSON.stringify(Object.keys(citiesJson))}`);

    // API may return cities under data.cities, data.data, or data directly
    const citiesList: { id: number; name: string }[] =
        citiesJson?.data?.cities ?? citiesJson?.data?.data ?? (Array.isArray(citiesJson?.data) ? citiesJson.data : []);

    if (!citiesList.length) {
        throw new Error(`CarryBee Error: Could not retrieve cities list. Raw response: ${JSON.stringify(citiesJson).slice(0, 500)}`);
    }

    const cityId = fuzzyMatchLocation(order.customerAddress, citiesList);
    if (!cityId) {
        const available = citiesList.slice(0, 15).map(c => c.name).join(', ');
        throw new Error(`CarryBee Address Error: Could not match a city from address "${order.customerAddress}". Available cities (first 15): ${available}`);
    }
    console.log(`[CARRYBEE] Matched city_id=${cityId} for address "${order.customerAddress}"`);

    // ΓöÇΓöÇ 2. Resolve zone_id from customer address ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
    const zonesRes = await fetch(`${baseUrl}/api/v2/cities/${cityId}/zones`, { method: 'GET', headers });

    if (!zonesRes.ok) throw new Error(`CarryBee Network Error (Zones): ${zonesRes.status} ${zonesRes.statusText}`);
    const zonesJson = await zonesRes.json() as any;
    console.log(`[CARRYBEE] Zones response keys: ${JSON.stringify(Object.keys(zonesJson))}`);

    const zonesList: { id: number; name: string }[] =
        zonesJson?.data?.zones ?? zonesJson?.data?.data ?? (Array.isArray(zonesJson?.data) ? zonesJson.data : []);

    let zoneId: number | null = null;
    if (zonesList.length) {
        zoneId = fuzzyMatchLocation(order.customerAddress, zonesList);
        // Fallback: use the first zone if address matching fails (better than failing entirely)
        if (!zoneId) {
            zoneId = zonesList[0].id;
            console.log(`[CARRYBEE] ΓÜá∩╕Å Could not fuzzy-match zone, falling back to first zone: id=${zoneId} (${zonesList[0].name})`);
        } else {
            console.log(`[CARRYBEE] Matched zone_id=${zoneId} for address "${order.customerAddress}"`);
        }
    } else {
        throw new Error(`CarryBee Error: No zones found for city_id=${cityId}. Raw response: ${JSON.stringify(zonesJson).slice(0, 500)}`);
    }

    // ΓöÇΓöÇ 3. Fetch the first available Store ID ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
    const storeRes = await fetch(`${baseUrl}/api/v2/stores`, { method: 'GET', headers });

    if (!storeRes.ok) throw new Error(`CarryBee Network Error (Stores): ${storeRes.status} ${storeRes.statusText}`);
    const storeJson = await storeRes.json() as any;
    console.log(`[CARRYBEE] Stores response keys: ${JSON.stringify(Object.keys(storeJson))}`);

    // API may return stores under data.stores, data.data (paginated), data directly, or as an array
    const storesList: any[] =
        storeJson?.data?.stores ?? storeJson?.data?.data ?? (Array.isArray(storeJson?.data) ? storeJson.data : []);

    if (!storesList.length) {
        throw new Error(`CarryBee Error: No pickup stores found. Please create a store in your CarryBee merchant dashboard. Raw response: ${JSON.stringify(storeJson).slice(0, 500)}`);
    }

    // Store ID field may be "store_id" or "id"
    const firstStore = storesList[0];
    const storeId = firstStore.store_id ?? firstStore.id;

    if (!storeId) {
        throw new Error(`CarryBee Error: First store has no ID field. Store object: ${JSON.stringify(firstStore)}`);
    }

    console.log(`[CARRYBEE] Using store: id=${storeId}, name="${firstStore.store_name ?? firstStore.name ?? 'N/A'}"`);

    // ΓöÇΓöÇ 4. Dispatch Order ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
    // Ensure 11 digit BD phone number format commonly required by BD couriers
    let cleanPhone = order.customerPhone.replace(/[^0-9]/g, '');
    if (cleanPhone.startsWith('880') && cleanPhone.length > 11) {
        cleanPhone = cleanPhone.substring(2);
    }

    const orderPayload = {
        store_id: storeId,
        merchant_order_id: order.id,
        delivery_type: 1, // Standard Delivery
        product_type: 1, // Parcel
        recipient_phone: cleanPhone,
        recipient_name: order.customerName,
        recipient_address: order.customerAddress,
        city_id: cityId,
        zone_id: zoneId,
        item_weight: 0.5,
        item_quantity: 1,
        collectable_amount: order.amount
    };

    console.log(`[CARRYBEE] Dispatching order ${order.id} ΓåÆ Store ${storeId} (City: ${cityId}, Zone: ${zoneId})`);
    console.log(`[CARRYBEE] Payload: ${JSON.stringify(orderPayload)}`);

    const orderRes = await fetch(`${baseUrl}/api/v2/orders`, {
        method: 'POST',
        headers,
        body: JSON.stringify(orderPayload)
    });

    const orderResult = await orderRes.json() as any;

    if (orderResult.error || !orderRes.ok) {
        throw new Error(`CarryBee Order Dispatch Failed (HTTP ${orderRes.status}): ${JSON.stringify(orderResult)}`);
    }

    const consignmentId =
        orderResult?.data?.order?.consignment_id ??
        orderResult?.data?.consignment_id ??
        orderResult?.data?.order_id ??
        orderResult?.data?.id ??
        orderResult?.consignment_id;

    console.log(`Γ£à [CARRYBEE] SUCCESS: Order created for ${order.id}, consignment_id=${consignmentId}`);

    return { consignment_id: consignmentId };
};

// ΓöÇΓöÇ Dispatcher ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
export type CourierName = "steadfast" | "pathao" | "redx" | "carrybee";

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
            } else if (activeProvider === "carrybee") {
                apiResult = await sendToCarryBee(orderData);
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
