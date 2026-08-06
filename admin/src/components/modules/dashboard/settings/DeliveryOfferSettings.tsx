"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { updateUiData } from "@/services/ui";
import { toast } from "sonner";
import { Loader2, Truck, Check } from "lucide-react";

export default function DeliveryOfferSettings({
    deliveryOffer,
    id
}: {
    deliveryOffer?: {
        minQuantity: number;
        deliveryCharge: number;
        isActive: boolean;
    };
    id: string;
}) {
    const [minQuantity, setMinQuantity] = useState(deliveryOffer?.minQuantity ?? "");
    const [deliveryCharge, setDeliveryCharge] = useState(deliveryOffer?.deliveryCharge ?? "");
    const [isActive, setIsActive] = useState(deliveryOffer?.isActive ?? true);
    const [isUpdating, setIsUpdating] = useState(false);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!id) {
            toast.error("Settings ID is missing. Cannot update.");
            return;
        }

        const toastId = toast.loading("Updating Delivery Offer settings...");
        setIsUpdating(true);

        try {
            const payload = {
                deliveryOffer: {
                    minQuantity: Number(minQuantity),
                    deliveryCharge: Number(deliveryCharge),
                    isActive: Boolean(isActive)
                }
            };
            
            const res = await updateUiData(id, payload as any);

            if (!res.success) {
                if (res.message === "jwt expired") {
                    throw new Error("Your session has expired. Please log in again.");
                } else {
                    throw new Error(res.message || "Failed to update settings");
                }
            }

            toast.success("Delivery Offer updated successfully!", { id: toastId });
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Failed to update Delivery Offer settings", { id: toastId });
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-orange-50 text-orange-600">
                        <Truck className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Delivery Offer</h3>
                        <p className="text-sm text-gray-500 mt-0.5">Override delivery charges based on quantity</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Label htmlFor="offer-status" className="text-sm font-medium text-gray-700 cursor-pointer">
                        {isActive ? "Active" : "Disabled"}
                    </Label>
                    <Switch
                        id="offer-status"
                        checked={isActive}
                        onCheckedChange={setIsActive}
                        className="data-[state=checked]:bg-orange-600"
                    />
                </div>
            </div>

            <form onSubmit={handleUpdate} className="flex-1 flex flex-col">
                <div className={`space-y-5 flex-1 transition-opacity duration-200 ${!isActive ? 'opacity-50 pointer-events-none' : ''}`}>
                    <div className="space-y-2">
                        <Label htmlFor="minQty" className="text-sm font-medium text-gray-700">Minimum Product Quantity</Label>
                        <p className="text-xs text-gray-500 mb-2">The number of products needed to trigger this offer.</p>
                        <div className="relative">
                            <Input
                                id="minQty"
                                type="number"
                                min="1"
                                value={minQuantity}
                                onChange={(e) => setMinQuantity(Number(e.target.value))}
                                className="bg-white border-gray-300 text-gray-900 focus:border-orange-500 focus:ring-orange-500 h-11 pr-12"
                                required
                            />
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                <span className="text-gray-500 text-sm">items</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="delCharge" className="text-sm font-medium text-gray-700">Override Delivery Charge (৳)</Label>
                        <p className="text-xs text-gray-500 mb-2">Set to 0 for free delivery, or set a discounted rate.</p>
                        <div className="relative">
                            <Input
                                id="delCharge"
                                type="number"
                                min="0"
                                value={deliveryCharge}
                                onChange={(e) => setDeliveryCharge(Number(e.target.value))}
                                className="bg-white border-gray-300 text-gray-900 focus:border-orange-500 focus:ring-orange-500 h-11 pl-8"
                                required
                            />
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <span className="text-gray-500 font-medium">৳</span>
                            </div>
                        </div>
                    </div>
                    
                    {isActive && minQuantity > 0 && (
                        <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3 mt-4 flex items-start gap-2">
                            <Check className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                            <p className="text-sm text-emerald-800">
                                <strong>Active Rule:</strong> If a customer orders {minQuantity} or more items, their total delivery charge will be exactly ৳{deliveryCharge}.
                            </p>
                        </div>
                    )}
                </div>

                <div className="pt-6 mt-auto">
                    <Button 
                        type="submit" 
                        disabled={isUpdating}
                        className="w-full bg-orange-600 hover:bg-orange-700 text-white transition-colors h-11 text-base font-medium"
                    >
                        {isUpdating ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : "Save Delivery Offer"}
                    </Button>
                </div>
            </form>
        </div>
    );
}
