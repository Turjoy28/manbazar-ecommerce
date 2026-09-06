import { ICourierProvider, ICourierShipmentResponse } from "../courier.interface.js";
import { Ui } from "../../../models/ui.model.js";

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
    const qWords = q.split(/[\s,.\-/]+/).filter(w => w.length > 2);
    let bestScore = 0;
    let bestId: number | null = null;
    
    for (const item of items) {
        const nWords = item.name.toLowerCase().split(/[\s,.\-/]+/).filter(w => w.length > 2);
        const score = qWords.filter(w => nWords.some(nw => nw.includes(w) || w.includes(nw))).length;
        if (score > bestScore) { bestScore = score; bestId = item.id; }
    }
    
    if (bestScore > 0 && bestId !== null) return bestId;

    // 4. Handle typos with Levenshtein Distance
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
        let dist = levenshtein(q, n);
        for (const w of qWords) {
             const wordDist = levenshtein(w, n);
             if (wordDist < dist) dist = wordDist;
        }
        if (dist < bestLevenshteinDist && dist <= 2) {
            bestLevenshteinDist = dist;
            bestLevenshteinId = item.id;
        }
    }

    return bestLevenshteinId;
};

export class CarryBeeService implements ICourierProvider {
    async createShipment(order: any): Promise<ICourierShipmentResponse> {
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

        const customerAddress = order.customerAddress || "";
        const customerName = order.customerName || "";
        const customerPhone = order.customerPhone || "";
        const amount = order.amount || 0;

        // 1. Resolve city_id from customer address
        console.log(`[CARRYBEE] Looking up city for address: "${customerAddress}"`);
        const citiesRes = await fetch(`${baseUrl}/api/v2/cities`, { method: 'GET', headers });

        if (!citiesRes.ok) throw new Error(`CarryBee Network Error (Cities): ${citiesRes.status} ${citiesRes.statusText}`);
        const citiesJson = await citiesRes.json() as any;
        console.log(`[CARRYBEE] Cities response keys: ${JSON.stringify(Object.keys(citiesJson))}`);

        const citiesList: { id: number; name: string }[] =
            citiesJson?.data?.cities ?? citiesJson?.data?.data ?? (Array.isArray(citiesJson?.data) ? citiesJson.data : []);

        if (!citiesList.length) {
            throw new Error(`CarryBee Error: Could not retrieve cities list. Raw response: ${JSON.stringify(citiesJson).slice(0, 500)}`);
        }

        const cityId = fuzzyMatchLocation(customerAddress, citiesList);
        if (!cityId) {
            const available = citiesList.slice(0, 15).map(c => c.name).join(', ');
            throw new Error(`CarryBee Address Error: Could not match a city from address "${customerAddress}". Available cities (first 15): ${available}`);
        }
        console.log(`[CARRYBEE] Matched city_id=${cityId} for address "${customerAddress}"`);

        // 2. Resolve zone_id from customer address
        const zonesRes = await fetch(`${baseUrl}/api/v2/cities/${cityId}/zones`, { method: 'GET', headers });

        if (!zonesRes.ok) throw new Error(`CarryBee Network Error (Zones): ${zonesRes.status} ${zonesRes.statusText}`);
        const zonesJson = await zonesRes.json() as any;
        console.log(`[CARRYBEE] Zones response keys: ${JSON.stringify(Object.keys(zonesJson))}`);

        const zonesList: { id: number; name: string }[] =
            zonesJson?.data?.zones ?? zonesJson?.data?.data ?? (Array.isArray(zonesJson?.data) ? zonesJson.data : []);

        let zoneId: number | null = null;
        if (zonesList.length) {
            zoneId = fuzzyMatchLocation(customerAddress, zonesList);
            if (!zoneId) {
                zoneId = zonesList[0].id;
                console.log(`[CARRYBEE] ⚠️ Could not fuzzy-match zone, falling back to first zone: id=${zoneId} (${zonesList[0].name})`);
            } else {
                console.log(`[CARRYBEE] Matched zone_id=${zoneId} for address "${customerAddress}"`);
            }
        } else {
            throw new Error(`CarryBee Error: No zones found for city_id=${cityId}. Raw response: ${JSON.stringify(zonesJson).slice(0, 500)}`);
        }

        // 3. Fetch the first available Store ID
        const storeRes = await fetch(`${baseUrl}/api/v2/stores`, { method: 'GET', headers });

        if (!storeRes.ok) throw new Error(`CarryBee Network Error (Stores): ${storeRes.status} ${storeRes.statusText}`);
        const storeJson = await storeRes.json() as any;
        console.log(`[CARRYBEE] Stores response keys: ${JSON.stringify(Object.keys(storeJson))}`);

        const storesList: any[] =
            storeJson?.data?.stores ?? storeJson?.data?.data ?? (Array.isArray(storeJson?.data) ? storeJson.data : []);

        if (!storesList.length) {
            throw new Error(`CarryBee Error: No pickup stores found. Please create a store in your CarryBee merchant dashboard.`);
        }

        const firstStore = storesList[0];
        const storeId = firstStore.store_id ?? firstStore.id;

        if (!storeId) {
            throw new Error(`CarryBee Error: First store has no ID field. Store object: ${JSON.stringify(firstStore)}`);
        }

        console.log(`[CARRYBEE] Using store: id=${storeId}`);

        // 4. Dispatch Order
        let cleanPhone = customerPhone.replace(/[^0-9]/g, '');
        if (cleanPhone.startsWith('880') && cleanPhone.length > 11) {
            cleanPhone = cleanPhone.substring(2);
        }

        const orderPayload = {
            store_id: storeId,
            merchant_order_id: order.id,
            delivery_type: 1, 
            product_type: 1, 
            recipient_phone: cleanPhone,
            recipient_name: customerName,
            recipient_address: customerAddress,
            city_id: cityId,
            zone_id: zoneId,
            item_weight: 0.5,
            item_quantity: 1,
            collectable_amount: amount
        };

        console.log(`[CARRYBEE] Dispatching order ${order.id} → Store ${storeId}`);

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

        console.log(`✅ [CARRYBEE] SUCCESS: Order created for ${order.id}, consignment_id=${consignmentId}`);

        return { 
            consignmentId: String(consignmentId), 
            trackingCode: String(consignmentId),
            provider: "carrybee",
            raw: orderResult
        };
    }

    async getTrackingStatus(trackingCode: string): Promise<any> {
        // Not implemented in original code, so this remains unimplemented
        throw new Error("CarryBee getTrackingStatus is not implemented yet.");
    }
}
