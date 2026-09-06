import axios from "axios";
import { ICourierProvider, ICourierShipmentResponse } from "../courier.interface.js";
import { Ui } from "../../../models/ui.model.js";

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

    async createShipment(order: any): Promise<ICourierShipmentResponse> {
        const creds = await this.getCredentials();
        const response = await axios.post(
            `${this.baseURL}/create_order`,
            {
                invoice: order._id.toString(),
                recipient_name: order.customer.name,
                recipient_phone: order.customer.phone,
                recipient_address: order.customer.address,
                cod_amount: order.paymentStatus === "completed" ? 0 : order.grandTotal,
                note: `Order ${order._id}`,
            },
            {
                headers: {
                    "Api-Key": creds.apiKey,
                    "Secret-Key": creds.apiSecret,
                    "Content-Type": "application/json",
                },
            }
        );

        const consignment = response.data.consignment;
        return {
            provider: "steadfast",
            consignmentId: consignment.consignment_id,
            trackingCode: consignment.tracking_code,
            raw: response.data,
        };
    }

    async getTrackingStatus(trackingCode: string): Promise<any> {
        const creds = await this.getCredentials();
        const response = await axios.get(
            `${this.baseURL}/status_by_trackingcode/${trackingCode}`,
            {
                headers: {
                    "Api-Key": creds.apiKey,
                    "Secret-Key": creds.apiSecret,
                },
            }
        );
        return response.data;
    }
}
