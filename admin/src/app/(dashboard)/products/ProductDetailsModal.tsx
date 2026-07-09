"use client";

import React from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ProductData } from "@/services/product";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface ProductDetailsModalProps {
  product: ProductData | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ProductDetailsModal({
  product,
  isOpen,
  onClose,
}: ProductDetailsModalProps) {
  if (!product) return null;

  const hasVariants = Array.isArray(product.variants) && product.variants.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-4xl w-[95vw] max-h-[90vh] overflow-y-auto overflow-x-hidden">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-3">
            Product Details
            {product.productId && (
              <span className="text-sm font-mono text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                [{product.productId}]
              </span>
            )}
            <Badge
              variant={product.isActive ? "default" : "secondary"}
              className={
                product.isActive
                  ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 ml-auto"
                  : "bg-muted text-muted-foreground border border-border ml-auto"
              }
            >
              {product.isActive ? "Active" : "Inactive"}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
          {/* Left Column: Media & Highlights */}
          <div className="space-y-6">
            {/* Thumbnail */}
            <div className="bg-muted/30 p-4 rounded-xl border border-border flex flex-col items-center">
              <h3 className="font-semibold text-sm w-full mb-3 text-foreground/80 border-b pb-2">
                Thumbnail
              </h3>
              <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-muted border border-border">
                {product.thumbnail ? (
                  <Image
                    src={product.thumbnail}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    No Thumbnail
                  </div>
                )}
              </div>
            </div>

            {/* Specifications */}
            <div className="bg-muted/30 p-4 rounded-xl border border-border">
              <h3 className="font-semibold text-sm mb-3 text-foreground/80 border-b pb-2">
                Specifications
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fabric:</span>
                  <span className="font-medium">{product.fabric || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fit:</span>
                  <span className="font-medium">{product.fit || "N/A"}</span>
                </div>
                <div className="flex flex-col mt-2">
                  <span className="text-muted-foreground mb-1">Sizes:</span>
                  <div className="flex flex-wrap gap-1">
                    {product.sizes?.map((size, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {size}
                      </Badge>
                    )) || <span className="text-xs text-muted-foreground">None</span>}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Information & Pricing */}
          <div className="md:col-span-2 space-y-6">
            {/* General Info */}
            <div className="bg-muted/30 p-4 rounded-xl border border-border">
              <h3 className="font-semibold text-sm mb-3 text-foreground/80 border-b pb-2">
                General Information
              </h3>
              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-12 gap-2">
                  <span className="col-span-3 text-muted-foreground">Name:</span>
                  <span className="col-span-9 font-medium">{product.name}</span>
                </div>
                <div className="grid grid-cols-12 gap-2">
                  <span className="col-span-3 text-muted-foreground">Slug:</span>
                  <span className="col-span-9 font-medium text-primary">{product.slug}</span>
                </div>
                <div className="grid grid-cols-12 gap-2">
                  <span className="col-span-3 text-muted-foreground">Description:</span>
                  <span className="col-span-9 font-medium text-foreground/80 leading-relaxed max-h-24 overflow-y-auto break-words whitespace-pre-wrap">
                    {product.description || "No description provided."}
                  </span>
                </div>
                {product.videoUrl && (
                  <div className="grid grid-cols-12 gap-2">
                    <span className="col-span-3 text-muted-foreground">Video:</span>
                    <a href={product.videoUrl} target="_blank" rel="noreferrer" className="col-span-9 font-medium text-blue-500 hover:underline truncate">
                      {product.videoUrl}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Pricing & Stock */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-muted/30 p-4 rounded-xl border border-border">
                <h3 className="font-semibold text-sm mb-3 text-foreground/80 border-b pb-2">
                  Pricing
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Current Price:</span>
                    <span className="font-bold text-lg text-primary">৳{product.price}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Original Price:</span>
                    <span className="font-medium line-through text-muted-foreground">
                      {product.originalPrice ? `৳${product.originalPrice}` : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Offer:</span>
                    <span className="font-medium">
                      {product.offerType !== "NONE" ? `${product.offerValue}${product.offerType === "PERCENTAGE" ? "%" : "৳"} OFF` : "None"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">VAT:</span>
                    <span className="font-medium">{product.vatPercentage || 0}%</span>
                  </div>
                </div>
              </div>

              <div className="bg-muted/30 p-4 rounded-xl border border-border">
                <h3 className="font-semibold text-sm mb-3 text-foreground/80 border-b pb-2">
                  Inventory
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Available Stock:</span>
                    <span className={`font-bold text-lg ${product.stock <= 0 ? "text-red-500" : "text-primary"}`}>
                      {product.stock}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Physical On Hand:</span>
                    <span className="font-medium text-foreground">
                      {product.quantity_on_hand ?? product.stock}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Reserved (Orders):</span>
                    <span className="font-medium text-foreground">
                      {product.quantity_reserved ?? 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Category Block:</span>
                    <span className="font-medium capitalize">{product.categoryAssignment?.toLowerCase() || "None"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Variants Section */}
        {hasVariants && (
          <div className="mt-6 bg-muted/30 p-4 rounded-xl border border-border">
            <h3 className="font-semibold text-sm mb-3 text-foreground/80 border-b pb-2">
              Color Variants
            </h3>
            <div className="rounded-lg border border-border overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead>Color</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead className="text-center">Available</TableHead>
                    <TableHead className="text-center">On Hand</TableHead>
                    <TableHead className="text-center">Reserved</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Images</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {product.variants!.map((variant, idx) => (
                    <TableRow key={idx}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-6 h-6 rounded-full border shadow-sm"
                            style={{ backgroundColor: variant.color.hex }}
                          />
                          <span className="font-medium">{variant.color.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {variant.sku || "N/A"}
                      </TableCell>
                      <TableCell className="text-center font-bold text-primary">
                        {variant.stock}
                      </TableCell>
                      <TableCell className="text-center text-muted-foreground">
                        {variant.quantity_on_hand ?? variant.stock}
                      </TableCell>
                      <TableCell className="text-center text-muted-foreground">
                        {variant.quantity_reserved ?? 0}
                      </TableCell>
                      <TableCell className="text-right">
                        {variant.price ? `৳${variant.price}` : <span className="text-muted-foreground italic">Base Price</span>}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground text-xs">
                        {variant.images?.length || 0} pics
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* Legacy Flat Images (If no variants) */}
        {!hasVariants && product.images?.length > 0 && (
          <div className="mt-6 bg-muted/30 p-4 rounded-xl border border-border">
            <h3 className="font-semibold text-sm mb-3 text-foreground/80 border-b pb-2">
              Gallery Images
            </h3>
            <div className="flex flex-wrap gap-2">
              {product.images.map((img, idx) => (
                <div key={idx} className="relative w-20 h-20 rounded-lg overflow-hidden border border-border">
                  <Image src={img} alt={`Gallery ${idx}`} fill className="object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}

      </DialogContent>
    </Dialog>
  );
}
