"use client";

import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import React, { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { authService } from "@/services/auth";
import { categoryService, CategoryData } from "@/services/category";
import { productService, ProductData } from "@/services/product";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose,
} from "@/components/ui/dialog";
import {
    Loader2,
    Layers,
    Plus,
    Pencil,
    Trash2,
    GripVertical,
    Power,
    Eye,
    EyeOff,
    ShieldAlert,
    ArrowUp,
    ArrowDown,
    FolderPlus,
    Tag,
    CheckCircle2,
} from "lucide-react";
import { useRouter } from "next/navigation";


function SortableCategoryItem({ category, index, productCount, isToggling, onToggle, onEdit, onDelete }: any) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: category._id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 10 : 0,
        position: 'relative' as any,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`group flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border transition-all duration-200 ${
                category.isActive
                    ? "border-border bg-card hover:bg-accent/30 hover:border-primary/20"
                    : "border-border/50 bg-muted/20 opacity-70 hover:opacity-90"
            } ${isDragging ? "shadow-lg border-primary/50" : ""}`}
        >
            {/* Reorder Controls */}
            <div
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing p-2 rounded hover:bg-accent text-muted-foreground/50 hover:text-foreground transition-colors shrink-0"
                title="Drag to reorder"
            >
                <GripVertical className="h-5 w-5" />
            </div>

            {/* Category Info */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                    <h3 className={`font-semibold truncate ${category.isActive ? "text-foreground" : "text-muted-foreground"}`}>
                        {category.name}
                    </h3>
                    <Badge
                        variant="outline"
                        className={`text-[10px] px-1.5 py-0 ${
                            category.isActive
                                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                : "bg-orange-500/10 text-orange-600 border-orange-500/20"
                        }`}
                    >
                        {category.isActive ? "Active" : "Inactive"}
                    </Badge>
                </div>
                {category.description && (
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {category.description}
                    </p>
                )}
                <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-muted-foreground">
                        {productCount} {productCount === 1 ? "product" : "products"}
                    </span>
                    <span className="text-xs text-muted-foreground/50">•</span>
                    <span className="text-xs text-muted-foreground">
                        Order: #{index + 1}
                    </span>
                </div>
            </div>

            {/* Toggle Switch */}
            <button
                onClick={() => onToggle(category)}
                disabled={isToggling}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2 focus:ring-offset-background shrink-0 ${
                    category.isActive
                        ? "bg-emerald-500"
                        : "bg-muted-foreground/30"
                } ${isToggling ? "opacity-50 cursor-wait" : "cursor-pointer"}`}
                title={category.isActive ? "Click to hide from storefront" : "Click to show on storefront"}
            >
                <span
                    className={`inline-block h-5 w-5 rounded-full bg-white shadow-md transform transition-transform duration-300 ${
                        category.isActive ? "translate-x-6" : "translate-x-1"
                    }`}
                />
            </button>

            {/* Action Buttons */}
            <div className="flex items-center gap-1 shrink-0">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(category)}
                    className="h-8 w-8 p-0 hover:bg-accent"
                    title="Edit category"
                >
                    <Pencil className="h-4 w-4 text-muted-foreground" />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(category)}
                    className="h-8 w-8 p-0 hover:bg-red-500/10 hover:text-red-500"
                    title="Delete category"
                >
                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                </Button>
            </div>
        </div>
    );
}

export default function CategoriesPage() {

    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [categories, setCategories] = useState<CategoryData[]>([]);
    const [products, setProducts] = useState<ProductData[]>([]);

    // Add/Edit state
    const [showAddForm, setShowAddForm] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState("");
    const [newCategoryDescription, setNewCategoryDescription] = useState("");
    const [isCreating, setIsCreating] = useState(false);

    // Edit state
    const [editingCategory, setEditingCategory] = useState<CategoryData | null>(null);
    const [editName, setEditName] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const [isUpdating, setIsUpdating] = useState(false);

    // Delete state
    const [deletingCategory, setDeletingCategory] = useState<CategoryData | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Toggle state
    const [togglingId, setTogglingId] = useState<string | null>(null);

    // Reorder state
    const [isReordering, setIsReordering] = useState(false);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            // Check authorization
            const authRes = await authService.getMe();
            if (!authRes.success || authRes.data?.role !== "ADMIN") {
                setIsAuthorized(false);
                setIsLoading(false);
                return;
            }
            setIsAuthorized(true);

            // Fetch categories and products
            const [catRes, prodRes] = await Promise.all([
                categoryService.getCategories(),
                productService.getProducts(1, 500),
            ]);

            if (catRes.success && catRes.data) {
                setCategories(catRes.data);
            }
            if (prodRes.success && prodRes.data?.products) {
                setProducts(prodRes.data.products);
            }
        } catch (error) {
            console.error("Failed to fetch data:", error);
            toast.error("Failed to load category data.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Get product count for a category
    const getProductCount = (categoryId: string) => {
        return products.filter((p) => {
            const cat = p.category as any;
            if (!cat) return false;
            const catId = typeof cat === "string" ? cat : cat._id;
            return catId === categoryId;
        }).length;
    };

    // Create category
    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCategoryName.trim()) {
            toast.error("Category name is required.");
            return;
        }

        setIsCreating(true);
        const toastId = toast.loading("Creating category...");
        try {
            const res = await categoryService.createCategory({
                name: newCategoryName.trim(),
                description: newCategoryDescription.trim(),
            });
            if (res.success) {
                toast.success("Category created successfully!", { id: toastId });
                setNewCategoryName("");
                setNewCategoryDescription("");
                setShowAddForm(false);
                await fetchData();
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to create category.", { id: toastId });
        } finally {
            setIsCreating(false);
        }
    };

    // Update category
    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingCategory || !editName.trim()) return;

        setIsUpdating(true);
        const toastId = toast.loading("Updating category...");
        try {
            const res = await categoryService.updateCategory(editingCategory._id, {
                name: editName.trim(),
                description: editDescription.trim(),
            });
            if (res.success) {
                toast.success("Category updated successfully!", { id: toastId });
                setEditingCategory(null);
                await fetchData();
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to update category.", { id: toastId });
        } finally {
            setIsUpdating(false);
        }
    };

    // Toggle active/inactive
    const handleToggle = async (category: CategoryData) => {
        setTogglingId(category._id);
        try {
            const res = await categoryService.toggleCategory(category._id);
            if (res.success) {
                const newStatus = res.data.isActive;
                toast.success(
                    `"${category.name}" is now ${newStatus ? "active — visible on storefront" : "inactive — hidden from storefront"}`
                );
                setCategories((prev) =>
                    prev.map((c) =>
                        c._id === category._id ? { ...c, isActive: newStatus } : c
                    )
                );
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to toggle category.");
        } finally {
            setTogglingId(null);
        }
    };

    // Delete category
    const handleDelete = async () => {
        if (!deletingCategory) return;

        setIsDeleting(true);
        const toastId = toast.loading("Deleting category...");
        try {
            const res = await categoryService.deleteCategory(deletingCategory._id);
            if (res.success) {
                toast.success("Category deleted successfully!", { id: toastId });
                setDeletingCategory(null);
                await fetchData();
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to delete category.", { id: toastId });
        } finally {
            setIsDeleting(false);
        }
    };

    // Move category up/down in sort order
    
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = categories.findIndex((c) => c._id === active.id);
            const newIndex = categories.findIndex((c) => c._id === over.id);

            const newCategories = arrayMove(categories, oldIndex, newIndex);
            setCategories(newCategories);

            setIsReordering(true);
            try {
                await categoryService.reorderCategories(newCategories.map((c) => c._id));
                toast.success("Category order updated.");
            } catch (error: any) {
                toast.error("Failed to reorder categories.");
                await fetchData(); // Revert on failure
            } finally {
                setIsReordering(false);
            }
        }
    };


    // Start editing
    const openEditDialog = (category: CategoryData) => {
        setEditingCategory(category);
        setEditName(category.name);
        setEditDescription(category.description || "");
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Loading categories...</p>
                </div>
            </div>
        );
    }

    // Unauthorized
    if (!isAuthorized) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-red-900/10 border border-red-500/20 mb-6">
                    <ShieldAlert className="h-10 w-10 text-red-500" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight mb-2 text-foreground">Access Denied</h1>
                <p className="text-muted-foreground max-w-md mx-auto mb-6 text-sm">
                    Category management is restricted to Super Administrators only.
                </p>
                <Button onClick={() => router.push("/products")} className="bg-primary text-primary-foreground">
                    Go to Products
                </Button>
            </div>
        );
    }

    const activeCount = categories.filter((c) => c.isActive).length;
    const inactiveCount = categories.filter((c) => !c.isActive).length;

    return (
        <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
                        <Layers className="h-8 w-8 text-primary" />
                        Manage Categories
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        Create, organize, and control which categories appear on your storefront.
                    </p>
                </div>
                <Button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/20 h-11 px-6 font-semibold"
                >
                    <Plus className="h-5 w-5 mr-2" />
                    Add Category
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="border-border bg-card/40">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Tag className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-foreground">{categories.length}</p>
                            <p className="text-xs text-muted-foreground">Total Categories</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-border bg-card/40">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                            <Eye className="h-5 w-5 text-emerald-500" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-foreground">{activeCount}</p>
                            <p className="text-xs text-muted-foreground">Active (Visible)</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-border bg-card/40">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                            <EyeOff className="h-5 w-5 text-orange-500" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-foreground">{inactiveCount}</p>
                            <p className="text-xs text-muted-foreground">Inactive (Hidden)</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Add Category Form */}
            {showAddForm && (
                <Card className="border-primary/20 bg-card/60 border-dashed animate-in fade-in-50 slide-in-from-top-2 duration-300">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <FolderPlus className="h-5 w-5 text-primary" />
                            Create New Category
                        </CardTitle>
                        <CardDescription>
                            Add a new product category. It will be active by default and appear on the storefront.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleCreate} className="flex flex-col sm:flex-row gap-4 items-end">
                            <div className="flex-1 space-y-2">
                                <Label htmlFor="new-category-name" className="font-semibold">Category Name *</Label>
                                <Input
                                    id="new-category-name"
                                    value={newCategoryName}
                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                    placeholder="e.g. Summer Collection"
                                    className="h-11"
                                    required
                                    autoFocus
                                />
                            </div>
                            <div className="flex-1 space-y-2">
                                <Label htmlFor="new-category-desc">Description (Optional)</Label>
                                <Input
                                    id="new-category-desc"
                                    value={newCategoryDescription}
                                    onChange={(e) => setNewCategoryDescription(e.target.value)}
                                    placeholder="Short description for this category"
                                    className="h-11"
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => { setShowAddForm(false); setNewCategoryName(""); setNewCategoryDescription(""); }}
                                    className="h-11"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isCreating || !newCategoryName.trim()}
                                    className="h-11 bg-primary text-primary-foreground hover:bg-primary/90 px-6 font-semibold"
                                >
                                    {isCreating ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Creating...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle2 className="mr-2 h-4 w-4" />
                                            Create
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {/* Category List */}
            <Card className="border-border bg-card/40">
                <CardHeader>
                    <CardTitle className="text-xl">All Categories</CardTitle>
                    <CardDescription>
                        Toggle visibility, reorder, edit, or delete categories. Active categories are shown on your storefront.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {categories.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="h-16 w-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
                                <Layers className="h-8 w-8 text-muted-foreground/50" />
                            </div>
                            <h3 className="text-lg font-semibold text-foreground mb-1">No categories yet</h3>
                            <p className="text-sm text-muted-foreground max-w-sm">
                                Create your first category to organize products on your storefront.
                            </p>
                            <Button
                                onClick={() => setShowAddForm(true)}
                                className="mt-4 bg-primary text-primary-foreground"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Add First Category
                            </Button>
                        </div>
                    ) : (
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                        >
                            <SortableContext
                                items={categories.map(c => c._id)}
                                strategy={verticalListSortingStrategy}
                            >
                                <div className="space-y-2">
                                    {categories.map((category, index) => (
                                        <SortableCategoryItem
                                            key={category._id}
                                            category={category}
                                            index={index}
                                            productCount={getProductCount(category._id)}
                                            isToggling={togglingId === category._id}
                                            onToggle={handleToggle}
                                            onEdit={openEditDialog}
                                            onDelete={setDeletingCategory}
                                        />
                                    ))}
                                </div>
                            </SortableContext>
                        </DndContext>
                    )}
                </CardContent>
            </Card>

            {/* Info Card */}
            <Card className="border-border bg-card/40">
                <CardHeader>
                    <CardTitle className="text-lg">How Categories Work</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm text-muted-foreground leading-relaxed">
                    <div className="space-y-2 border-l-2 border-primary/50 pl-3 py-1">
                        <p className="font-medium text-foreground">Visibility Control:</p>
                        <p>
                            Use the <strong>toggle switch</strong> to control whether a category appears on your storefront.
                            <span className="inline-block mx-1 h-3 w-6 rounded-full bg-emerald-500 align-middle"></span>
                            = visible, <span className="inline-block mx-1 h-3 w-6 rounded-full bg-muted-foreground/30 align-middle"></span> = hidden.
                        </p>
                    </div>
                    <div className="space-y-2 border-l-2 border-primary/50 pl-3 py-1">
                        <p className="font-medium text-foreground">Assigning Products:</p>
                        <p>
                            To assign products to a category, go to <strong>Products</strong>, click <strong>Edit Product</strong>,
                            and select the desired category from the dropdown.
                        </p>
                    </div>
                    <p className="text-xs bg-muted p-3 rounded-lg border border-border">
                        💡 <strong>Tip:</strong> Categories with 0 assigned products will still appear on the storefront if active.
                        Use the toggle to hide empty categories.
                    </p>
                </CardContent>
            </Card>

            {/* Edit Dialog */}
            <Dialog open={!!editingCategory} onOpenChange={(open) => { if (!open) setEditingCategory(null); }}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Edit Category</DialogTitle>
                        <DialogDescription>
                            Update the category name and description.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleUpdate}>
                        <div className="space-y-4 py-2">
                            <div className="space-y-2">
                                <Label htmlFor="edit-name" className="font-semibold">Category Name *</Label>
                                <Input
                                    id="edit-name"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    placeholder="Category name"
                                    className="h-11"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-desc">Description (Optional)</Label>
                                <Input
                                    id="edit-desc"
                                    value={editDescription}
                                    onChange={(e) => setEditDescription(e.target.value)}
                                    placeholder="Short description"
                                    className="h-11"
                                />
                            </div>
                        </div>
                        <DialogFooter className="mt-4">
                            <DialogClose render={<Button variant="outline" />}>
                                Cancel
                            </DialogClose>
                            <Button
                                type="submit"
                                disabled={isUpdating || !editName.trim()}
                                className="bg-primary text-primary-foreground hover:bg-primary/90"
                            >
                                {isUpdating ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    "Save Changes"
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={!!deletingCategory} onOpenChange={(open) => { if (!open) setDeletingCategory(null); }}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-red-500 flex items-center gap-2">
                            <Trash2 className="h-5 w-5" />
                            Delete Category
                        </DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete <strong>"{deletingCategory?.name}"</strong>?
                            This action cannot be undone. Products in this category will become uncategorized.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <DialogClose render={<Button variant="outline" />}>
                            Cancel
                        </DialogClose>
                        <Button
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="bg-red-600 text-white hover:bg-red-700"
                        >
                            {isDeleting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                <>
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
