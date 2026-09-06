import { orderService } from "../order/order.service.js";
import { Ui } from "../../models/ui.model.js";
import { courierManager } from "./courier.manager.js";

export type CourierName = "steadfast" | "pathao" | "redx" | "carrybee";

/**
 * Send multiple orders to a chosen courier service using CourierManager.
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
            if (!order || !order.customer) { 
                results.push({ orderId, success: false, error: "Order or customer details not found" }); 
                continue; 
            }

            // Create shipment via abstracted manager
            const shipment = await courierManager.createShipment(activeProvider, order);

            // Extract tracking code and consignment ID
            const trackingCode = shipment.trackingCode || shipment.consignmentId || orderId;

            await orderService.updateCourierInfo(
                orderId, 
                activeProvider, 
                trackingCode, 
                shipment.consignmentId || trackingCode, 
                "courier_assigned"
            );
            
            results.push({ orderId, success: true, tracking: trackingCode });
        } catch (error: unknown) {
            const err = error as Error;
            results.push({ orderId, success: false, error: err.message });
        }
    }

    return results;
};
