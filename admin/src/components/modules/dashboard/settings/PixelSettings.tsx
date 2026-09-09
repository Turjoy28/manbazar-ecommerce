"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateUiData } from "@/services/ui";
import { toast } from "sonner";

interface PixelSettingsProps {
    pixel?: {
        facebookPixelId?: string;
    };
    id: string;
}

export default function PixelSettings({ pixel, id }: PixelSettingsProps) {
    const [facebookPixelId, setFacebookPixelId] = useState(pixel?.facebookPixelId || "");
    const [isUpdating, setIsUpdating] = useState(false);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUpdating(true);
        const toastId = toast.loading("Saving pixel settings...");
        try {
            await updateUiData(id, {
                "pixel.facebookPixelId": facebookPixelId.trim(),
            });
            toast.success("Pixel settings saved successfully!", { id: toastId });
        } catch (error) {
            console.error(error);
            toast.error("Failed to save pixel settings", { id: toastId });
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="border border-border rounded-xl p-6 bg-card space-y-5 shadow-sm">
            <div>
                <h4 className="text-xl font-bold">Pixel & Tracking</h4>
                <p className="text-sm text-muted-foreground mt-1">
                    Configure tracking pixels to measure ad performance and conversions on your storefront.
                </p>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
                <div className="space-y-1.5">
                    <Label htmlFor="facebookPixelId" className="text-sm font-semibold">
                        Facebook Pixel ID
                    </Label>
                    <Input
                        id="facebookPixelId"
                        value={facebookPixelId}
                        onChange={(e) => setFacebookPixelId(e.target.value)}
                        className="bg-background/40 text-foreground font-mono"
                        placeholder="e.g. 1519962375868494"
                    />
                    <p className="text-[11px] text-muted-foreground">
                        Found in Facebook Events Manager → Data Sources → your Pixel → Settings. Leave blank to disable the pixel.
                    </p>
                </div>

                <Button
                    type="submit"
                    disabled={isUpdating}
                    className="bg-primary hover:bg-primary/90 text-white"
                >
                    {isUpdating ? "Saving..." : "Save Pixel Settings"}
                </Button>
            </form>
        </div>
    );
}
