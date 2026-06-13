"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateUiData } from "@/services/ui";
import { toast } from "sonner";

interface CTASectionProps {
    cta?: {
        title: string;
        subtitle: string;
        buttonText: string;
    };
    id: string;
}

export default function CTASection({ cta, id }: CTASectionProps) {
    const [title, setTitle] = useState(cta?.title || "Stay Confident");
    const [subtitle, setSubtitle] = useState(cta?.subtitle || "Explore our latest collection.");
    const [buttonText, setButtonText] = useState(cta?.buttonText || "Order Now");
    const [isUpdating, setIsUpdating] = useState(false);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUpdating(true);
        const toastId = toast.loading("Updating CTA settings...");

        try {
            await updateUiData(id, {
                "cta.title": title.trim(),
                "cta.subtitle": subtitle.trim(),
                "cta.buttonText": buttonText.trim(),
            });
            toast.success("CTA settings updated successfully!", { id: toastId });
        } catch (error) {
            console.error(error);
            toast.error("Failed to update CTA settings", { id: toastId });
        } finally {
            setIsUpdating(false);
        }
    };

    return (
      <div className="border border-border rounded-xl p-6 bg-muted/40 space-y-5">
        <div>
          <h4 className="text-xl font-bold">Call to Action (CTA) Banner</h4>
          <p className="text-sm text-muted-foreground">
            Modify the promotional banner section on the client landing page.
          </p>
        </div>

        <form onSubmit={handleUpdate} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-foreground">CTA Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="CTA Header Text"
              className="w-full border-border bg-background"
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="text-foreground">CTA Subtitle</Label>
            <Textarea
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="CTA Description Subtitle Text"
              className="w-full border-border bg-background min-h-20"
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="text-foreground">CTA Button Text</Label>
            <Input
              value={buttonText}
              onChange={(e) => setButtonText(e.target.value)}
              placeholder="Button Action Label"
              className="w-full border-border bg-background"
              required
            />
          </div>

          <Button
            type="submit"
            disabled={isUpdating}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            Update CTA
          </Button>
        </form>
      </div>
    );
}
