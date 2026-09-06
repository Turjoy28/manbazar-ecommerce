import { ICourierProvider, ICourierShipmentResponse } from "./courier.interface.js";
import { PathaoService } from "./providers/pathao.service.js";
import { SteadfastService } from "./providers/steadfast.service.js";
import { CarryBeeService } from "./providers/carrybee.service.js";

class CourierManager {
    private providers: Record<string, ICourierProvider>;

    constructor() {
        this.providers = {
            pathao: new PathaoService(),
            steadfast: new SteadfastService(),
            carrybee: new CarryBeeService(),
        };
    }

    getProvider(providerName: string): ICourierProvider {
        const provider = this.providers[providerName];
        if (!provider) {
            throw new Error(`Unsupported courier: ${providerName}`);
        }
        return provider;
    }

    async createShipment(providerName: string, order: any): Promise<ICourierShipmentResponse> {
        const provider = this.getProvider(providerName);
        return provider.createShipment(order);
    }

    async getTrackingStatus(providerName: string, trackingCode: string): Promise<any> {
        const provider = this.getProvider(providerName);
        return provider.getTrackingStatus(trackingCode);
    }
}

export const courierManager = new CourierManager();
