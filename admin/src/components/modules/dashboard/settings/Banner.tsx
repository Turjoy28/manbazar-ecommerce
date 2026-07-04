"use client";

import { useState } from "react";

import ImageUpload from "@/components/shared/imageUpload";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

import { updateUiData } from "@/services/ui";
import { toast } from "sonner";

interface BannerProps {
    currentBanner: string;
    title: string;
    id: string;
    currentNavbarText?: string;
}

export default function Banner({
    currentBanner,
    title,
    id,
    currentNavbarText = "",
}: BannerProps) {

    const [banner, setBanner] =
        useState(currentBanner);

    const [bannerTitle, setBannerTitle] =
        useState(title);

    const [navbarText, setNavbarText] =
        useState(currentNavbarText);

    const [loading, setLoading] =
        useState(false);

    const isChanged =
        banner !== currentBanner ||
        bannerTitle !== title ||
        navbarText !== currentNavbarText;

    const handleUpdate = async () => {
        try {
            setLoading(true);

            await updateUiData(
                id,
                {
                    "banner.bannerImage": banner,
                    "banner.title": bannerTitle,
                    "banner.navbarText": navbarText,
                }
            );

            toast.success("Banner updated successfully")
        }
        catch (error) {
            console.error(error);
            toast.error("Banner update failed")
        }
        finally {
            setLoading(false);
        }
    };

    return (
        <div className="border rounded-xl p-4 space-y-5">

            <h4 className="text-2xl">
                Update Banner
            </h4>
            
            <div className="space-y-2">
                <Label>Banner Title</Label>
                <Input
                    value={bannerTitle}
                    onChange={(e) =>
                        setBannerTitle(
                            e.target.value
                        )
                    }
                    placeholder="Banner title"
                    className="w-full h-14"
                />
            </div>

            <div className="space-y-2">
                <Label>Navbar Notice Text</Label>
                <Input
                    value={navbarText}
                    onChange={(e) =>
                        setNavbarText(
                            e.target.value
                        )
                    }
                    placeholder="E.g., Free delivery on all orders!"
                    className="w-full h-14"
                />
            </div>

            <ImageUpload
                title="Banner Image"
                description="Upload your website banner"
                value={
                    banner
                        ? [banner]
                        : []
                }
                onChange={(images) => {
                    setBanner(
                        images[0] || ""
                    );
                }}
                maxFiles={1}
            />

            <Button
                onClick={handleUpdate}
                disabled={
                    !isChanged ||
                    loading
                }
                className="w-full"
            >
                {
                    loading
                        ? "Updating..."
                        : "Update Banner"
                }
            </Button>

        </div>
    );
}