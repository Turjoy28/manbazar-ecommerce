"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateUiData } from "@/services/ui";
import { toast } from "sonner";

interface ChatbotSettingsProps {
    chatbot?: {
        messenger?: string;
        facebook?: string;
        tiktok?: string;
    };
    id: string;
}

export default function ChatbotSettings({ chatbot, id }: ChatbotSettingsProps) {
    const [messenger, setMessenger] = useState(chatbot?.messenger || "");
    const [facebook, setFacebook]   = useState(chatbot?.facebook || "");
    const [tiktok, setTiktok]       = useState(chatbot?.tiktok || "");
    const [isUpdating, setIsUpdating] = useState(false);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUpdating(true);
        const toastId = toast.loading("Updating chatbot & social links...");
        try {
            await updateUiData(id, {
                "chatbot.messenger": messenger.trim(),
                "chatbot.facebook": facebook.trim(),
                "chatbot.tiktok": tiktok.trim(),
            });
            toast.success("Chatbot & social links updated successfully!", { id: toastId });
        } catch (error) {
            console.error(error);
            toast.error("Failed to update chatbot & social links", { id: toastId });
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="border border-border rounded-xl p-6 bg-card space-y-5 shadow-sm">
            <div>
                <h4 className="text-xl font-bold">Chatbot & Social Links</h4>
                <p className="text-sm text-muted-foreground mt-1">
                    Configure the floating chat links visible on the storefront right-side column.
                </p>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
                <div className="space-y-3">
                    <div className="space-y-1.5">
                        <Label htmlFor="messenger" className="text-sm font-semibold">Messenger URL</Label>
                        <Input
                            id="messenger"
                            value={messenger}
                            onChange={(e) => setMessenger(e.target.value)}
                            className="bg-background/40 text-foreground"
                            placeholder="https://m.me/your_page"
                        />
                        <p className="text-[11px] text-muted-foreground">Direct link to open Messenger (e.g., `https://m.me/page_username` or `https://messenger.com/t/page_id`).</p>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="facebook" className="text-sm font-semibold">Facebook Page URL</Label>
                        <Input
                            id="facebook"
                            value={facebook}
                            onChange={(e) => setFacebook(e.target.value)}
                            className="bg-background/40 text-foreground"
                            placeholder="https://facebook.com/your_page"
                        />
                        <p className="text-[11px] text-muted-foreground">Link to your Facebook page or profile.</p>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="tiktok" className="text-sm font-semibold">TikTok Profile URL</Label>
                        <Input
                            id="tiktok"
                            value={tiktok}
                            onChange={(e) => setTiktok(e.target.value)}
                            className="bg-background/40 text-foreground"
                            placeholder="https://tiktok.com/@your_username"
                        />
                        <p className="text-[11px] text-muted-foreground">Link to your TikTok account profile.</p>
                    </div>
                </div>

                <Button
                    type="submit"
                    disabled={isUpdating}
                    className="bg-primary hover:bg-primary/90 text-white"
                >
                    {isUpdating ? "Saving..." : "Save Chatbot Settings"}
                </Button>
            </form>
        </div>
    );
}
