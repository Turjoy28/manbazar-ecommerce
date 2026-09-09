import axios from "axios";
import { redisClient } from "../../../config/redis.js";
import { ICourierProvider, ICourierShipmentResponse } from "../courier.interface.js";
import { Ui } from "../../../models/ui.model.js";

export class PathaoService implements ICourierProvider {
    private baseURL = "https://api-hermes.pathao.com/aladdin/api/v1";

    private async getCredentials() {
        const ui = await Ui.findOne();
        if (!ui || !ui.courier?.pathao?.clientId || !ui.courier?.pathao?.clientSecret) {
            throw new Error("Pathao API credentials are not configured in Admin Settings.");
        }
        return ui.courier.pathao;
    }

    private inMemoryToken: { token: string; expiresAt: number } | null = null;

    private async getAccessToken(): Promise<string> {
        if (this.inMemoryToken && Date.now() < this.inMemoryToken.expiresAt) {
            return this.inMemoryToken.token;
        }

        try {
            const cachedToken = await redisClient.get("pathao_access_token");
            if (cachedToken) {
                return cachedToken;
            }
        } catch {
            // Redis unavailable - proceed to fetch
        }

        const creds = await this.getCredentials();

        // If direct Access Token is configured in Admin Settings, use it
        if (creds.accessToken) {
            return creds.accessToken;
        }

        const response = await axios.post(`${this.baseURL}/issue-token`, {
            client_id: creds.clientId,
            client_secret: creds.clientSecret,
            username: creds.clientId,
            password: creds.clientSecret,
            grant_type: "password",
        });

        const token = response.data.access_token;
        const expiresIn = response.data.expires_in || 3600;

        this.inMemoryToken = {
            token,
            expiresAt: Date.now() + (expiresIn - 60) * 1000,
        };

        try {
            await redisClient.set("pathao_access_token", token, "EX", expiresIn - 60);
        } catch {
            // Redis unavailable - in-memory cache is sufficient
        }

        return token;
    }

    async createShipment(order: any): Promise<ICourierShipmentResponse> {
        const token = await this.getAccessToken();
        const creds = await this.getCredentials();
        const response = await axios.post(
            `${this.baseURL}/orders`,
            {
                store_id: creds.storeId,
                merchant_order_id: order._id.toString(),
                recipient_name: order.customer.name,
                recipient_phone: order.customer.phone,
                recipient_address: order.customer.address,
                item_quantity: order.products.length,
                item_weight: 1,
                amount_to_collect: order.paymentStatus === "completed" ? 0 : order.grandTotal,
                delivery_type: 48,
                item_type: 2,
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            }
        );

        return {
            provider: "pathao",
            consignmentId: response.data.data.consignment_id,
            trackingCode: response.data.data.consignment_id, // For Pathao, they are usually the same
            raw: response.data,
        };
    }

    async getTrackingStatus(trackingCode: string): Promise<any> {
        const token = await this.getAccessToken();
        const response = await axios.get(`${this.baseURL}/orders/${trackingCode}/tracking`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    }
}
