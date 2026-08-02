const fs = require('fs');
const content = fs.readFileSync('src/app/(dashboard)/categories/page.tsx', 'utf8');

// 1. Add dnd-kit imports
const dndImports = `import {
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
import { CSS } from '@dnd-kit/utilities';\n`;

let newContent = content.replace('import React, { useEffect, useState, useCallback } from "react";', dndImports + 'import React, { useEffect, useState, useCallback } from "react";');

// 2. Add SortableCategoryItem component before CategoriesPage
const sortableComponent = `
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
            className={\`group flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border transition-all duration-200 \${
                category.isActive
                    ? "border-border bg-card hover:bg-accent/30 hover:border-primary/20"
                    : "border-border/50 bg-muted/20 opacity-70 hover:opacity-90"
            } \${isDragging ? "shadow-lg border-primary/50" : ""}\`}
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
                    <h3 className={\`font-semibold truncate \${category.isActive ? "text-foreground" : "text-muted-foreground"}\`}>
                        {category.name}
                    </h3>
                    <Badge
                        variant="outline"
                        className={\`text-[10px] px-1.5 py-0 \${
                            category.isActive
                                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                : "bg-orange-500/10 text-orange-600 border-orange-500/20"
                        }\`}
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
                className={\`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2 focus:ring-offset-background shrink-0 \${
                    category.isActive
                        ? "bg-emerald-500"
                        : "bg-muted-foreground/30"
                } \${isToggling ? "opacity-50 cursor-wait" : "cursor-pointer"}\`}
                title={category.isActive ? "Click to hide from storefront" : "Click to show on storefront"}
            >
                <span
                    className={\`inline-block h-5 w-5 rounded-full bg-white shadow-md transform transition-transform duration-300 \${
                        category.isActive ? "translate-x-6" : "translate-x-1"
                    }\`}
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
`;

newContent = newContent.replace('export default function CategoriesPage() {', sortableComponent);

// 3. Replace handleMove with handleDragEnd
const dragEndLogic = `
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
`;

newContent = newContent.replace(/const handleMove = async[\s\S]*?setIsReordering\(false\);\n\s*\}\n\s*\};/, dragEndLogic);

// 4. Wrap categories list in DndContext and SortableContext
const mapStartRegex = /<div className="space-y-2">\s*\{categories\.map\(\(category, index\) => \{[\s\S]*?return \([\s\S]*?<div[\s\S]*?key=\{category\._id\}[\s\S]*?>[\s\S]*?<\/div>\s*\);\s*\}\)\}\s*<\/div>/;

const newMapStr = `<DndContext
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
                        </DndContext>`;

newContent = newContent.replace(mapStartRegex, newMapStr);

fs.writeFileSync('src/app/(dashboard)/categories/page.tsx', newContent);
console.log('Patched!');
