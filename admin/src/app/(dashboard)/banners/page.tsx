"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { bannerService, PromotionalBannerData } from "@/services/banner";
import ImageUpload from "@/components/shared/imageUpload";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  Trash2,
  ExternalLink,
  Eye,
  EyeOff,
  Plus,
  Loader2
} from "lucide-react";
import Image from "next/image";


export default function BannersPage() {
  const [banners, setBanners] = useState<PromotionalBannerData[]>([]);
  const [imageUrl, setImageUrl] = useState("");
  const [destinationUrl, setDestinationUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchBanners = async () => {
    setIsLoading(true);
    try {
      const res = await bannerService.listBanners();
      if (res.success) {
        setBanners(res.data || []);
      }
    } catch (err: any) {
      console.error("Failed to load banners", err);
      toast.error("Failed to retrieve banners.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleAddBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl) {
      toast.error("Please upload a banner image.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await bannerService.createBanner(imageUrl, destinationUrl);
      if (res.success) {
        toast.success("Promotional banner uploaded successfully!");
        setImageUrl("");
        setDestinationUrl("");
        fetchBanners();
      } else {
        toast.error(res.message || "Failed to create banner.");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to create banner.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBanner = async (id: string) => {
    try {
      const res = await bannerService.deleteBanner(id);
      if (res.success) {
        toast.success("Banner deleted successfully!");
        setBanners(banners.filter((b) => b._id !== id));
      } else {
        toast.error(res.message || "Failed to delete banner.");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to delete banner.");
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const res = await bannerService.updateBanner(id, { isActive: !currentStatus });
      if (res.success) {
        toast.success(`Banner ${!currentStatus ? "activated" : "deactivated"} successfully!`);
        setBanners(
          banners.map((b) => (b._id === id ? { ...b, isActive: !currentStatus } : b))
        );
      } else {
        toast.error(res.message || "Failed to update banner status.");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update banner status.");
    }
  };

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 bg-gray-50 text-black min-h-screen">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Banner Management</h2>
        <p className="text-sm text-gray-600">
          Upload and configure marketing/promotional banners displayed on the storefront.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 items-start">
        {/* Banner Upload Form */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
            <Sparkles className="h-5 w-5 text-[#e07b39]" />
            <h3 className="text-lg font-bold">New Promotional Banner</h3>
          </div>

          <form onSubmit={handleAddBanner} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Banner Asset</Label>
              <ImageUpload
                title=""
                description="Upload promotional banner (.jpg, .png, .webp)"
                value={imageUrl ? [imageUrl] : []}
                onChange={(images) => setImageUrl(images[0] || "")}
                maxFiles={1}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="destinationUrl" className="text-sm font-medium text-gray-700">
                Destination Redirect URL (Optional)
              </Label>
              <div className="relative">
                <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="destinationUrl"
                  type="text"
                  placeholder="e.g. /products or https://facebook.com"
                  value={destinationUrl}
                  onChange={(e) => setDestinationUrl(e.target.value)}
                  className="border-gray-200 bg-white pl-10 text-black placeholder-gray-400 focus:border-[#e07b39] focus:ring-[#e07b39] h-12"
                  disabled={isSubmitting}
                />
              </div>
              <p className="text-xs text-gray-500">
                When a user clicks on this banner on the home page, they will be redirected to this link.
              </p>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-[#e07b39] to-amber-500 hover:from-[#c96a2a] hover:to-amber-600 font-semibold py-6 text-white shadow-md shadow-[#e07b39]/20"
              disabled={isSubmitting || !imageUrl}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Publishing Banner...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Publish Banner
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Active Banners List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <h3 className="text-lg font-bold mb-4">Active Banner Grid</h3>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-[#e07b39]" />
                <p className="text-sm text-gray-500">Loading banners...</p>
              </div>
            ) : banners.length > 0 ? (
              <div className="grid sm:grid-cols-2 gap-4">
                {banners.map((b) => (
                  <div
                    key={b._id}
                    className="border border-gray-200 bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col"
                  >
                    <div className="relative h-40 w-full bg-gray-100">
                      <Image
                        src={b.imageUrl}
                        alt="Storefront banner"
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                      {!b.isActive && (
                        <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center">
                          <span className="bg-red-50 border border-red-200 text-red-600 text-xs px-2.5 py-1 rounded-full font-semibold">
                            Inactive / Hidden
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <div className="text-xs text-gray-500 font-medium">Redirect URL</div>
                        <div className="text-sm font-semibold truncate text-[#e07b39] flex items-center gap-1 mt-0.5">
                          {b.destinationUrl ? (
                            <>
                              <ExternalLink className="h-3.5 w-3.5" />
                              <span className="truncate">{b.destinationUrl}</span>
                            </>
                          ) : (
                            <span className="text-gray-400 italic font-normal">None (static display)</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-auto">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleActive(b._id, b.isActive)}
                          className={`text-xs flex items-center gap-1.5 ${b.isActive
                            ? "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                            : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                            }`}
                        >
                          {b.isActive ? (
                            <>
                              <Eye className="h-3.5 w-3.5" />
                              Active
                            </>
                          ) : (
                            <>
                              <EyeOff className="h-3.5 w-3.5" />
                              Inactive
                            </>
                          )}
                        </Button>

                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteBanner(b._id)}
                          className="bg-red-50 border border-red-200 text-red-600 hover:bg-red-500 hover:text-white"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-gray-500 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center space-y-2">
                <EyeOff className="h-8 w-8 text-gray-400" />
                <p>No promotional banners found.</p>
                <p className="text-xs text-gray-500">Upload a banner using the left form to activate storefront promotions.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
