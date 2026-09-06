export interface ICourierShipmentResponse {
    provider: string;
    consignmentId: string;
    trackingCode: string;
    raw: any;
}

export interface ICourierProvider {
    createShipment(order: any): Promise<ICourierShipmentResponse>;
    getTrackingStatus(trackingCode: string): Promise<any>;
    cancelShipment?(consignmentId: string): Promise<any>;
}
