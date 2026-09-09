import axios from "axios";
import { ICourierProvider, ICourierShipmentResponse } from "../courier.interface.js";
import { Ui } from "../../../models/ui.model.js";

/**
 * Steadfast Courier integration.
 * Official API Base: https://portal.packzy.com/api/v1
 * Authentication: Api-Key + Secret-Key headers on every request.
 *
 * Official statuses (status check API):
 *   in_review, pending, hold, delivered, partial_delivered,
 *   cancelled, delivered_approval_pending, partial_delivered_approval_pending,
 *   cancelled_approval_pending, unknown_approval_pending, unknown
 *
 * NOTE: "in_review" is Steadfast's internal review state.
 *       It auto-transitions to "pending" once approved (usually within hours).
 *       From "pending", the merchant must submit a daily Pickup Request from their dashboard.
 *       Steadfast's webhooks will push status updates (including rider info) automatically.
 */
export class SteadfastService implements ICourierProvider {
    private baseURL = "https://portal.packzy.com/api/v1";

    private async getCredentials() {
        const ui = await Ui.findOne();
        if (!ui || !ui.courier?.steadfast?.apiKey || !ui.courier?.steadfast?.apiSecret) {
            throw new Error("Steadfast API credentials are not configured in Admin Settings.");
        }
        return {
            apiKey: ui.courier.steadfast.apiKey,
            apiSecret: ui.courier.steadfast.apiSecret,
        };
    }

    private getHeaders(creds: { apiKey: string; apiSecret: string }) {
        return {
            "Api-Key": creds.apiKey,
            "Secret-Key": creds.apiSecret,
            "Content-Type": "application/json",
        };
    }

    /**
     * Create a single shipment via POST /create_order
     * Uses all officially documented fields for best compatibility.
     */
    async createShipment(order: any): Promise<ICourierShipmentResponse> {
        const creds = await this.getCredentials();

        const itemDescription = order.products
            ?.map((p: any) => `${p.name}${p.quantity > 1 ? ` x${p.quantity}` : ""}`)
            .join(", ") || "";

        const response = await axios.post(
            `${this.baseURL}/create_order`,
            {
                invoice: order._id.toString(),          // Unique order ID — used for status_by_invoice lookup
                recipient_name: order.customer.name,
                recipient_phone: order.customer.phone,
                recipient_address: order.customer.address,
                cod_amount: order.paymentStatus === "completed" ? 0 : (order.grandTotal || order.total || 0),
                note: order.note || `Manbazar Order #${order._id.toString().slice(-8).toUpperCase()}`,
                item_description: itemDescription,
                delivery_type: 0,                       // 0 = Home Delivery (required per official docs)
                total_lot: order.products?.reduce((sum: number, p: any) => sum + (p.quantity || 1), 0) || 1,
            },
            {
                headers: this.getHeaders(creds),
            }
        );

        const consignment = response.data.consignment;
        if (!consignment) {
            throw new Error(`Steadfast createShipment failed: ${JSON.stringify(response.data)}`);
        }

        console.log(`[Steadfast] Shipment created: consignment_id=${consignment.consignment_id}, tracking_code=${consignment.tracking_code}, invoice=${consignment.invoice}`);

        return {
            provider: "steadfast",
            consignmentId: String(consignment.consignment_id),
            trackingCode: consignment.tracking_code,
            raw: response.data,
        };
    }

    /**
     * Get delivery status using multiple fallback strategies (per official docs):
     *   1. status_by_trackingcode/{trackingCode}   — most common
     *   2. status_by_cid/{consignmentId}            — if tracking code lookup fails
     *   3. status_by_invoice/{invoice}              — invoice = order._id (most reliable fallback)
     *
     * Response format: { status: 200, delivery_status: "pending" }
     */
    async getTrackingStatus(trackingCode: string): Promise<any> {
        const creds = await this.getCredentials();
        const headers = {
            "Api-Key": creds.apiKey,
            "Secret-Key": creds.apiSecret,
        };

        // Strategy 1: by tracking code
        try {
            const res = await axios.get(`${this.baseURL}/status_by_trackingcode/${trackingCode}`, { headers });
            if (res.data?.status === 200) {
                return { ...res.data, tracking_code: trackingCode };
            }
        } catch {
            // fall through to next strategy
        }

        // Strategy 2: by consignment ID (numeric IDs)
        try {
            const res = await axios.get(`${this.baseURL}/status_by_cid/${trackingCode}`, { headers });
            if (res.data?.status === 200) {
                return { ...res.data, consignment_id: trackingCode };
            }
        } catch {
            // fall through to next strategy
        }

        // Strategy 3: by invoice (order._id — set during createShipment)
        try {
            const res = await axios.get(`${this.baseURL}/status_by_invoice/${trackingCode}`, { headers });
            if (res.data?.status === 200) {
                return { ...res.data, invoice: trackingCode };
            }
        } catch (e: any) {
            throw new Error(`Steadfast: all tracking strategies failed for "${trackingCode}": ${e.message}`);
        }

        throw new Error(`Steadfast: no valid status returned for "${trackingCode}"`);
    }

    /**
     * Get current wallet balance via GET /get_balance
     * Useful for monitoring.
     */
    async getBalance(): Promise<number> {
        const creds = await this.getCredentials();
        const res = await axios.get(`${this.baseURL}/get_balance`, {
            headers: { "Api-Key": creds.apiKey, "Secret-Key": creds.apiSecret },
        });
        return res.data?.current_balance ?? 0;
    }
}
