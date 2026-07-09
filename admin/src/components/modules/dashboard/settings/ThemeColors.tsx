"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateUiData } from "@/services/ui";
import { toast } from "sonner";

interface ThemeColorsProps {
    theme?: {
        primaryColor: string;
        secondaryColor: string;
        tertiaryColor?: string;
    };
    id: string;
}

const ColorField = ({
    label,
    hint,
    value,
    onChange,
}: {
    label: string;
    hint: string;
    value: string;
    onChange: (v: string) => void;
}) => (
    <div className="space-y-1.5">
        <Label className="text-sm font-semibold">{label}</Label>
        <p className="text-xs text-muted-foreground">{hint}</p>
        <div className="flex gap-2">
            <Input
                type="color"
                value={value?.startsWith('#') && (value.length === 4 || value.length === 7) ? value : "#000000"}
                onChange={(e) => onChange(e.target.value)}
                className="w-12 h-10 p-1 cursor-pointer rounded-lg border"
            />
            <Input
                value={value}
                onChange={(e) => {
                    let val = e.target.value;
                    if (val.length > 0 && !val.startsWith('#')) {
                        val = '#' + val;
                    }
                    onChange(val);
                }}
                className="flex-1 font-mono uppercase"
                placeholder="#000000"
                required
            />
        </div>
    </div>
);

export default function ThemeColors({ theme, id }: ThemeColorsProps) {
    const [primary, setPrimary]     = useState(theme?.primaryColor   || "#e07b39");
    const [secondary, setSecondary] = useState(theme?.secondaryColor  || "#111827");
    const [tertiary, setTertiary]   = useState(theme?.tertiaryColor   || "#f97316");
    const [isUpdating, setIsUpdating] = useState(false);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUpdating(true);
        const toastId = toast.loading("Updating brand theme colors...");
        try {
            await updateUiData(id, {
                "theme.primaryColor":   primary,
                "theme.secondaryColor": secondary,
                "theme.tertiaryColor":  tertiary,
            });
            toast.success("Theme colors updated successfully!", { id: toastId });
        } catch (error) {
            console.error(error);
            toast.error("Failed to update theme colors", { id: toastId });
        } finally {
            setIsUpdating(false);
        }
    };



    return (
        <div className="border border-border rounded-xl p-6 bg-card space-y-5 shadow-sm">
            <div>
                <h4 className="text-xl font-bold">Brand Identity Colors</h4>
                <p className="text-sm text-muted-foreground mt-1">
                    Set the 3 brand colors applied site-wide on the client storefront.
                </p>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <ColorField
                        label="Primary"
                        hint="Buttons, CTAs, icons, highlights"
                        value={primary}
                        onChange={setPrimary}
                    />
                    <ColorField
                        label="Secondary"
                        hint="Footer, hero bg, section dark areas"
                        value={secondary}
                        onChange={setSecondary}
                    />
                    <ColorField
                        label="Tertiary"
                        hint="Hover states, borders, badges"
                        value={tertiary}
                        onChange={setTertiary}
                    />
                </div>

                {/* Live preview */}
                <div className="rounded-lg bg-muted/40 p-4 border border-border space-y-3">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Live Preview
                    </span>
                    <div className="flex flex-wrap gap-2 items-center">
                        <button
                            type="button"
                            style={{ backgroundColor: primary }}
                            className="px-4 py-2 text-xs font-bold text-white rounded-lg shadow-sm transition active:scale-[0.97]"
                        >
                            Primary Button
                        </button>
                        <button
                            type="button"
                            style={{ backgroundColor: secondary }}
                            className="px-4 py-2 text-xs font-bold text-white rounded-lg shadow-sm transition active:scale-[0.97]"
                        >
                            Secondary Bg
                        </button>
                        <button
                            type="button"
                            style={{ backgroundColor: tertiary }}
                            className="px-4 py-2 text-xs font-bold text-white rounded-lg shadow-sm transition active:scale-[0.97]"
                        >
                            Tertiary Accent
                        </button>
                        <span
                            style={{ borderColor: primary, color: primary }}
                            className="px-3 py-1.5 text-xs font-semibold border rounded-full"
                        >
                            Outline Tag
                        </span>
                        <span
                            style={{
                                backgroundColor: `${tertiary}20`,
                                color: tertiary,
                                borderColor: `${tertiary}40`,
                            }}
                            className="px-3 py-1.5 text-xs font-semibold border rounded-full"
                        >
                            Badge
                        </span>
                    </div>
                </div>

                <Button
                    type="submit"
                    disabled={isUpdating}
                    className="bg-primary hover:bg-primary/90 text-white"
                >
                    {isUpdating ? "Saving..." : "Apply Colors to Client"}
                </Button>
            </form>
        </div>
    );
}
