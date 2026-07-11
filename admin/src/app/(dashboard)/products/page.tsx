/* ═══════════════════════════════════════════════════════════════════════════════
   ADMIN PRODUCTS PAGE
   Lists all products in a styled table with thumbnail, name, price, stock,
   and status. Supports delete with confirmation and navigation to edit/create.
   
   Uses theme CSS variables from globals.css for all colors, so it automatically
   adapts when the theme is changed.
   ═══════════════════════════════════════════════════════════════════════════════ */
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { productService, ProductData } from "@/services/product";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, Edit2, Trash2, Loader2, Image as ImageIcon, Search, MoreHorizontal, Eye } from "lucide-react";
import { ProductDetailsModal } from "./ProductDetailsModal";

export default function ProductsPage() {
    /* State for the products list fetched from the API */
    const [products, setProducts] = useState<ProductData[]>([]);
    /* Loading state while fetching products */
    const [isLoading, setIsLoading] = useState(true);
    /* Tracks which product is currently being deleted (for spinner) */
    const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
    /* State for searching products by name */
    const [searchQuery, setSearchQuery] = useState("");
    /* State for viewing product details */
    const [viewingProduct, setViewingProduct] = useState<ProductData | null>(null);

    /* Fetch all products from the admin API endpoint */
    const fetchProducts = async () => {
        setIsLoading(true);
        try {
            const res = await productService.getProducts();
            if (res.success && res.data?.products) {
                setProducts(res.data.products);
            }
        } catch (err: any) {
            toast.error(err.message || "Failed to fetch products.");
        } finally {
            setIsLoading(false);
        }
    };

    /* Fetch products on component mount */
    useEffect(() => {
        fetchProducts();
    }, []);

    /* Delete a product after user confirmation */
    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this product?")) return;

        setIsDeletingId(id);
        try {
            const res = await productService.deleteProduct(id);
            if (res.success) {
                toast.success("Product deleted successfully.");
                /* Remove the deleted product from local state to avoid refetch */
                setProducts(products.filter(p => p._id !== id));
            } else {
                toast.error(res.message || "Failed to delete product.");
            }
        } catch (err: any) {
            toast.error(err.message || "Failed to delete product.");
        } finally {
            setIsDeletingId(null);
        }
    };

    const filteredProducts = products.filter((product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
            {/* Page header — title and Add Product button */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    {/* Title uses foreground color from theme */}
                    <h2 className="text-3xl font-bold tracking-tight text-foreground">Products</h2>
                    <p className="text-sm text-muted-foreground">
                        Manage your store&apos;s inventory, details, and pricing.
                    </p>
                </div>
                <div className="flex items-center gap-4 w-full sm:w-auto">
                    {/* Search Bar */}
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search products..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-8 bg-card"
                        />
                    </div>
                    {/* Link to the "New Product" form */}
                    <Link href="/products/new">
                        <Button className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/20 whitespace-nowrap">
                            <Plus className="mr-2 h-4 w-4" /> Add Product
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Products table container */}
            <div className="rounded-xl border border-border bg-card/30 overflow-hidden">
                {isLoading ? (
                    /* Loading spinner while fetching */
                    <div className="flex h-[300px] items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : filteredProducts.length === 0 ? (
                    /* Empty state when no products exist or no search results */
                    <div className="flex h-[200px] flex-col items-center justify-center text-muted-foreground">
                        <ImageIcon className="h-12 w-12 mb-2" />
                        <p>{searchQuery ? "No products match your search." : "No products found. Create your first product!"}</p>
                    </div>
                ) : (
                    /* Products table */
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-muted/50 border-b border-border">
                                <TableRow>
                                    <TableHead className="w-[80px] text-muted-foreground">Image</TableHead>
                                    <TableHead className="text-muted-foreground">Name</TableHead>
                                    <TableHead className="text-muted-foreground">Price</TableHead>
                                    <TableHead className="text-muted-foreground">Inventory</TableHead>
                                    <TableHead className="text-muted-foreground">Status</TableHead>
                                    <TableHead className="text-right text-muted-foreground">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredProducts.map((product) => (
                                    <TableRow key={product._id} className="border-b border-border hover:bg-muted/20">
                                        {/* Product thumbnail */}
                                        <TableCell>
                                            <div className="relative h-12 w-12 overflow-hidden rounded-lg bg-muted border border-border/50">
                                                {product.thumbnail ? (
                                                    <Image
                                                        src={product.thumbnail}
                                                        alt={product.name}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center">
                                                        <ImageIcon className="h-4 w-4 text-muted-foreground" />
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        {/* Product name, ID, and slug */}
                                        <TableCell className="font-semibold text-foreground">
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-2">
                                                    <span>{product.name}</span>
                                                    {product.productId && (
                                                        <span className="text-[10px] text-primary font-mono">[{product.productId}]</span>
                                                    )}
                                                </div>
                                                <div className="text-xs text-muted-foreground font-normal mt-0.5">slug: {product.slug}</div>
                                            </div>
                                        </TableCell>
                                        {/* Price with optional original price strikethrough */}
                                        <TableCell className="text-foreground/80 font-semibold">
                                            ৳{product.price}
                                            {product.originalPrice && (
                                                <span className="ml-2 text-xs text-muted-foreground line-through">
                                                    ৳{product.originalPrice}
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-foreground/80">
                                            {(() => {
                                                const hasVariants = product.variants && product.variants.length > 0;
                                                const totalStock = hasVariants 
                                                    ? product.variants!.reduce((sum, v) => sum + (v.stock ?? 0), 0)
                                                    : product.stock;
                                                
                                                const totalOnHand = hasVariants
                                                    ? product.variants!.reduce((sum, v) => sum + (v.quantity_on_hand ?? 0), 0)
                                                    : (product.quantity_on_hand ?? product.stock);
                                                    
                                                const totalReserved = hasVariants
                                                    ? product.variants!.reduce((sum, v) => sum + (v.quantity_reserved ?? 0), 0)
                                                    : (product.quantity_reserved ?? 0);

                                                return (
                                                    <div className="flex flex-col gap-0.5 whitespace-nowrap">
                                                        <span className="font-semibold text-primary">{totalStock} Available</span>
                                                        <span className="text-[10px] text-muted-foreground">
                                                            On Hand: {totalOnHand} | Reserved: {totalReserved}
                                                        </span>
                                                        {hasVariants && <span className="text-[9px] text-muted-foreground/60 leading-none">Sum of {product.variants.length} colors</span>}
                                                    </div>
                                                );
                                            })()}
                                        </TableCell>
                                        {/* Active/Inactive badge */}
                                        <TableCell>
                                            <Badge
                                                variant={product.isActive ? "default" : "secondary"}
                                                className={
                                                    product.isActive
                                                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/15"
                                                        : "bg-muted text-muted-foreground border border-border"
                                                }
                                            >
                                                {product.isActive ? "Active" : "Inactive"}
                                            </Badge>
                                        </TableCell>
                                        {/* Action buttons — Edit and Delete */}
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0 text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => setViewingProduct(product)}>
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            View Details
                                                        </DropdownMenuItem>
                                                        <Link href={`/products/${product._id}`}>
                                                            <DropdownMenuItem>
                                                                <Edit2 className="mr-2 h-4 w-4" />
                                                                Edit Product
                                                            </DropdownMenuItem>
                                                        </Link>
                                                        <DropdownMenuItem 
                                                            className="text-red-600 focus:text-red-600"
                                                            onClick={() => product._id && handleDelete(product._id)}
                                                        >
                                                            {isDeletingId === product._id ? (
                                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                            ) : (
                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                            )}
                                                            Delete Product
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </div>
            
            {/* View Details Modal */}
            <ProductDetailsModal 
                product={viewingProduct} 
                isOpen={!!viewingProduct} 
                onClose={() => setViewingProduct(null)} 
            />
        </div>
    );
}
