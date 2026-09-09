"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateUiData } from "@/services/ui";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function CourierSettings({ courier, id, contactInfo }: { courier: any; id: string; contactInfo?: any }) {
    const [isUpdating, setIsUpdating] = useState(false);
    
    const [activeProvider, setActiveProvider] = useState(courier?.activeProvider || "none");

    // Contact Numbers
    const [number, setNumber] = useState(contactInfo?.number || "");
    const [bkashNumber, setBkashNumber] = useState(contactInfo?.bkashNumber || "");
    const [nagadNumber, setNagadNumber] = useState(contactInfo?.nagadNumber || "");
    
    // Steadfast
    const [sfApiKey, setSfApiKey] = useState(courier?.steadfast?.apiKey || "");
    const [sfApiSecret, setSfApiSecret] = useState(courier?.steadfast?.apiSecret || "");
    const [sfPickupRequestUrl, setSfPickupRequestUrl] = useState(courier?.steadfast?.pickupRequestUrl || "https://steadfast.com.bd/user/pickup-request");
    
    // Pathao
    const [ptClientId, setPtClientId] = useState(courier?.pathao?.clientId || "");
    const [ptClientSecret, setPtClientSecret] = useState(courier?.pathao?.clientSecret || "");
    const [ptAccessToken, setPtAccessToken] = useState(courier?.pathao?.accessToken || "");
    const [ptStoreId, setPtStoreId] = useState(courier?.pathao?.storeId || "");
    
    // RedX
    const [rxApiKey, setRxApiKey] = useState(courier?.redx?.apiKey || "");

    // CarryBee
    const [cbClientId, setCbClientId] = useState(courier?.carrybee?.clientId || "");
    const [cbClientSecret, setCbClientSecret] = useState(courier?.carrybee?.clientSecret || "");
    const [cbClientContext, setCbClientContext] = useState(courier?.carrybee?.clientContext || "");

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUpdating(true);
        const toastId = toast.loading("Updating Courier Settings...");
        try {
            await updateUiData(id, {
                "courier.activeProvider": activeProvider,
                "courier.steadfast.apiKey": sfApiKey,
                "courier.steadfast.apiSecret": sfApiSecret,
                "courier.steadfast.pickupRequestUrl": sfPickupRequestUrl,
                "courier.pathao.clientId": ptClientId,
                "courier.pathao.clientSecret": ptClientSecret,
                "courier.pathao.accessToken": ptAccessToken,
                "courier.pathao.storeId": ptStoreId,
                "courier.redx.apiKey": rxApiKey,
                "courier.carrybee.clientId": cbClientId,
                "courier.carrybee.clientSecret": cbClientSecret,
                "courier.carrybee.clientContext": cbClientContext,
                "footer.contactInfo.number": number,
                "footer.contactInfo.bkashNumber": bkashNumber,
                "footer.contactInfo.nagadNumber": nagadNumber,
            });
            toast.success("Settings updated successfully!", { id: toastId });
        } catch (error) {
            console.error(error);
            toast.error("Failed to update courier settings", { id: toastId });
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="border border-border rounded-xl p-6 bg-card space-y-5 shadow-sm">
            <div>
                <h4 className="text-xl font-bold">Courier API & payment gateway Settings</h4>
                <p className="text-sm text-muted-foreground mt-1">
                    Manage active courier for automated dispatch and store contact numbers.
                </p>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
                <div className="space-y-4 pb-4 border-b">
                    <h5 className="font-semibold text-sm">Contact Numbers</h5>
                    <div className="space-y-2">
                        <Label>General Contact Number</Label>
                        <Input value={number} onChange={(e) => setNumber(e.target.value)} placeholder="e.g. +8801700000000" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Bkash Personal Number</Label>
                            <Input value={bkashNumber} onChange={(e) => setBkashNumber(e.target.value)} placeholder="Bkash Number" />
                        </div>
                        <div className="space-y-2">
                            <Label>Nagad Personal Number</Label>
                            <Input value={nagadNumber} onChange={(e) => setNagadNumber(e.target.value)} placeholder="Nagad Number" />
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label className="text-sm font-semibold">Active Courier Provider</Label>
                    <Select value={activeProvider} onValueChange={setActiveProvider}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a courier" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none">None (Manual Dispatch)</SelectItem>
                            <SelectItem value="steadfast">Steadfast Courier</SelectItem>
                            <SelectItem value="pathao">Pathao Courier</SelectItem>
                            <SelectItem value="redx">RedX</SelectItem>
                            <SelectItem value="carrybee">CarryBee</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {activeProvider === "steadfast" && (
                    <div className="space-y-4 pt-2 border-t mt-4">
                        <h5 className="font-semibold text-sm">Steadfast Configuration</h5>
                        <div className="space-y-2">
                            <Label>API Key</Label>
                            <Input value={sfApiKey} onChange={(e) => setSfApiKey(e.target.value)} placeholder="Enter Steadfast API Key" />
                        </div>
                        <div className="space-y-2">
                            <Label>Secret Key</Label>
                            <Input value={sfApiSecret} onChange={(e) => setSfApiSecret(e.target.value)} type="password" placeholder="Enter Steadfast Secret Key" />
                        </div>
                        <div className="space-y-2">
                            <Label>Pickup Request URL</Label>
                            <Input value={sfPickupRequestUrl} onChange={(e) => setSfPickupRequestUrl(e.target.value)} placeholder="https://steadfast.com.bd/user/pickup-request" />
                            <p className="text-xs text-muted-foreground">This link appears as a shortcut button on the Orders page after dispatching to Steadfast.</p>
                        </div>
                    </div>
                )}

                {activeProvider === "pathao" && (
                    <div className="space-y-4 pt-2 border-t mt-4">
                        <h5 className="font-semibold text-sm">Pathao Configuration</h5>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Client ID</Label>
                                <Input value={ptClientId} onChange={(e) => setPtClientId(e.target.value)} placeholder="Pathao Client ID" />
                            </div>
                            <div className="space-y-2">
                                <Label>Client Secret</Label>
                                <Input value={ptClientSecret} onChange={(e) => setPtClientSecret(e.target.value)} type="password" placeholder="Pathao Client Secret" />
                            </div>
                            <div className="space-y-2 sm:col-span-2">
                                <Label>Access Token</Label>
                                <Input value={ptAccessToken} onChange={(e) => setPtAccessToken(e.target.value)} type="password" placeholder="Pathao Developer Access Token" />
                            </div>
                            <div className="space-y-2 sm:col-span-2">
                                <Label>Store ID</Label>
                                <Input value={ptStoreId} onChange={(e) => setPtStoreId(e.target.value)} placeholder="Pathao Store ID" />
                            </div>
                        </div>
                    </div>
                )}

                {activeProvider === "redx" && (
                    <div className="space-y-4 pt-2 border-t mt-4">
                        <h5 className="font-semibold text-sm">RedX Configuration</h5>
                        <div className="space-y-2">
                            <Label>API Access Token</Label>
                            <Input value={rxApiKey} onChange={(e) => setRxApiKey(e.target.value)} type="password" placeholder="Enter RedX Bearer Token" />
                        </div>
                    </div>
                )}

                {activeProvider === "carrybee" && (
                    <div className="space-y-4 pt-2 border-t mt-4">
                        <h5 className="font-semibold text-sm">CarryBee Configuration</h5>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Client ID</Label>
                                <Input value={cbClientId} onChange={(e) => setCbClientId(e.target.value)} placeholder="Enter CarryBee Client ID" />
                            </div>
                            <div className="space-y-2">
                                <Label>Client Secret</Label>
                                <Input value={cbClientSecret} onChange={(e) => setCbClientSecret(e.target.value)} type="password" placeholder="Enter CarryBee Client Secret" />
                            </div>
                            <div className="space-y-2 sm:col-span-2">
                                <Label>Client Context</Label>
                                <Input value={cbClientContext} onChange={(e) => setCbClientContext(e.target.value)} type="password" placeholder="Enter CarryBee Client Context" />
                            </div>
                        </div>
                    </div>
                )}

                <Button
                    type="submit"
                    disabled={isUpdating}
                    className="bg-primary hover:bg-primary/90 text-white w-full"
                >
                    {isUpdating ? "Saving..." : "Save Settings"}
                </Button>
            </form>
        </div>
    );
}
