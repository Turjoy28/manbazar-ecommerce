"use client";

import React, { useState, useRef } from "react";
import { toast } from "sonner";
import { productService } from "@/services/product";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Upload, Download, FileSpreadsheet, Loader2, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";

interface CsvUploadModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

// CSV template headers
const CSV_HEADERS = [
    "name", "slug", "description", "base_price", "offerType", "offerValue",
    "vatPercentage", "thumbnail", "fabric", "fit", "sizes", "category",
    "isActive", "videoUrl", "deliveryCharge_text", "deliveryCharge_price",
    "color_name", "color_hex", "variant_sku", "variant_stock",
    "variant_price", "variant_sale_price", "variant_images", "variant_sizes"
];

const SAMPLE_ROWS = [
    [
        "Premium Polo T-Shirt", "premium-polo-tshirt", "Ultra-soft pure cotton polo", "600",
        "PERCENTAGE", "34", "0", "https://example.com/thumb.jpg", "100% Cotton", "Regular Fit",
        "S,M,L,XL", "", "true", "", "Inside Dhaka,Outside Dhaka", "60,120",
        "Black", "#000000", "POLO-BLK", "600", "", "", "https://example.com/black.jpg", "S:100,M:200,L:200,XL:100"
    ],
    [
        "Premium Polo T-Shirt", "premium-polo-tshirt", "Ultra-soft pure cotton polo", "600",
        "PERCENTAGE", "34", "0", "https://example.com/thumb.jpg", "100% Cotton", "Regular Fit",
        "S,M,L,XL", "", "true", "", "Inside Dhaka,Outside Dhaka", "60,120",
        "White", "#FFFFFF", "POLO-WHT", "500", "", "", "https://example.com/white.jpg", "S:100,M:150,L:150,XL:100"
    ],
];

interface ParsedRow {
    [key: string]: string;
}

export function CsvUploadModal({ open, onOpenChange, onSuccess }: CsvUploadModalProps) {
    const [file, setFile] = useState<File | null>(null);
    const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [result, setResult] = useState<{ created: string[]; skipped: string[]; errors: { name: string; error: string }[] } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDownloadTemplate = () => {
        const csvContent = [
            CSV_HEADERS.join(","),
            ...SAMPLE_ROWS.map(row => row.map(cell => {
                // Wrap cells containing commas in quotes
                if (cell.includes(",")) return `"${cell}"`;
                return cell;
            }).join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "product_import_template.csv";
        link.click();
        URL.revokeObjectURL(url);
        toast.success("Template downloaded!");
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0];
        if (!selected) return;

        if (!selected.name.endsWith(".csv")) {
            toast.error("Please select a .csv file.");
            return;
        }

        setFile(selected);
        setResult(null);

        // Parse for preview
        const reader = new FileReader();
        reader.onload = (ev) => {
            const text = ev.target?.result as string;
            const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
            if (lines.length < 2) {
                toast.error("CSV file has no data rows.");
                return;
            }

            // Simple CSV parsing for preview (handles quoted fields with commas)
            const parseCSVLine = (line: string): string[] => {
                const result: string[] = [];
                let current = "";
                let inQuotes = false;
                for (let i = 0; i < line.length; i++) {
                    const char = line[i];
                    if (char === '"') {
                        inQuotes = !inQuotes;
                    } else if (char === "," && !inQuotes) {
                        result.push(current.trim());
                        current = "";
                    } else {
                        current += char;
                    }
                }
                result.push(current.trim());
                return result;
            };

            const headers = parseCSVLine(lines[0]);
            const rows: ParsedRow[] = [];
            for (let i = 1; i < lines.length; i++) {
                const values = parseCSVLine(lines[i]);
                const row: ParsedRow = {};
                headers.forEach((h, idx) => {
                    row[h] = values[idx] || "";
                });
                rows.push(row);
            }
            setParsedRows(rows);
        };
        reader.readAsText(selected);
    };

    const handleUpload = async () => {
        if (!file) {
            toast.error("No file selected.");
            return;
        }

        setIsUploading(true);
        setResult(null);

        try {
            const res = await productService.bulkUploadCSV(file);
            if (res.success) {
                setResult(res.data);
                toast.success(res.message);
                onSuccess?.();
            } else {
                toast.error(res.message || "Upload failed.");
            }
        } catch (err: any) {
            toast.error(err.message || "Upload failed.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleClose = (isOpen: boolean) => {
        if (!isOpen) {
            setFile(null);
            setParsedRows([]);
            setResult(null);
        }
        onOpenChange(isOpen);
    };

    // Count unique products from parsed rows
    const uniqueProducts = new Set(parsedRows.map(r => r.name).filter(Boolean)).size;
    const totalVariants = parsedRows.filter(r => r.color_name).length;

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FileSpreadsheet className="h-5 w-5 text-primary" />
                        Import Products from CSV
                    </DialogTitle>
                    <DialogDescription>
                        Upload a CSV file to bulk-create products. Rows with the same product name are grouped into one product with multiple color variants.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-5 pt-2">
                    {/* Step 1: Download Template */}
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border">
                        <div className="flex-1">
                            <p className="text-sm font-medium">Step 1: Download the CSV template</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Get the template with all required headers and sample data.
                            </p>
                        </div>
                        <Button variant="outline" size="sm" onClick={handleDownloadTemplate}>
                            <Download className="h-4 w-4 mr-1.5" />
                            Download Template
                        </Button>
                    </div>

                    {/* Step 2: Select File */}
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border">
                        <div className="flex-1">
                            <p className="text-sm font-medium">Step 2: Select your CSV file</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                {file ? (
                                    <span className="text-primary font-medium">{file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
                                ) : "Choose a .csv file from your computer."}
                            </p>
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".csv"
                            className="hidden"
                            onChange={handleFileSelect}
                        />
                        <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                            <Upload className="h-4 w-4 mr-1.5" />
                            {file ? "Change File" : "Select File"}
                        </Button>
                    </div>

                    {/* Preview Table */}
                    {parsedRows.length > 0 && (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-medium">
                                    Preview: <span className="text-primary">{uniqueProducts}</span> product(s), <span className="text-primary">{totalVariants}</span> variant(s)
                                </p>
                                <p className="text-xs text-muted-foreground">{parsedRows.length} rows total</p>
                            </div>
                            <div className="rounded-lg border border-border overflow-hidden max-h-[250px] overflow-y-auto">
                                <Table>
                                    <TableHeader className="bg-muted/50 sticky top-0">
                                        <TableRow>
                                            <TableHead className="text-xs">#</TableHead>
                                            <TableHead className="text-xs">Name</TableHead>
                                            <TableHead className="text-xs">Color</TableHead>
                                            <TableHead className="text-xs">Price</TableHead>
                                            <TableHead className="text-xs">Stock</TableHead>
                                            <TableHead className="text-xs">Sizes</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {parsedRows.map((row, idx) => (
                                            <TableRow key={idx}>
                                                <TableCell className="text-xs text-muted-foreground">{idx + 1}</TableCell>
                                                <TableCell className="text-xs font-medium max-w-[150px] truncate">{row.name}</TableCell>
                                                <TableCell className="text-xs">
                                                    <div className="flex items-center gap-1.5">
                                                        <div
                                                            className="w-3 h-3 rounded-full border"
                                                            style={{ backgroundColor: row.color_hex || "#000" }}
                                                        />
                                                        {row.color_name}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-xs">৳{row.base_price}</TableCell>
                                                <TableCell className="text-xs">{row.variant_stock || "—"}</TableCell>
                                                <TableCell className="text-xs text-muted-foreground max-w-[120px] truncate">
                                                    {row.variant_sizes || "—"}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    )}

                    {/* Upload Button */}
                    {parsedRows.length > 0 && !result && (
                        <Button
                            className="w-full"
                            onClick={handleUpload}
                            disabled={isUploading}
                        >
                            {isUploading ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Uploading {uniqueProducts} product(s)...
                                </>
                            ) : (
                                <>
                                    <Upload className="h-4 w-4 mr-2" />
                                    Upload & Create {uniqueProducts} Product(s)
                                </>
                            )}
                        </Button>
                    )}

                    {/* Result Summary */}
                    {result && (
                        <div className="space-y-3 p-4 rounded-lg bg-muted/30 border border-border">
                            <p className="text-sm font-semibold">Upload Results</p>

                            {result.created.length > 0 && (
                                <div className="flex items-start gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                                    <div>
                                        <p className="text-sm text-green-600 font-medium">{result.created.length} product(s) created successfully</p>
                                        <p className="text-xs text-muted-foreground">{result.created.join(", ")}</p>
                                    </div>
                                </div>
                            )}

                            {result.skipped.length > 0 && (
                                <div className="flex items-start gap-2">
                                    <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 shrink-0" />
                                    <div>
                                        <p className="text-sm text-yellow-600 font-medium">{result.skipped.length} product(s) skipped (already exist)</p>
                                        <p className="text-xs text-muted-foreground">{result.skipped.join(", ")}</p>
                                    </div>
                                </div>
                            )}

                            {result.errors.length > 0 && (
                                <div className="flex items-start gap-2">
                                    <XCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                                    <div>
                                        <p className="text-sm text-red-600 font-medium">{result.errors.length} product(s) failed</p>
                                        {result.errors.map((e, i) => (
                                            <p key={i} className="text-xs text-muted-foreground">
                                                <span className="font-medium">{e.name}:</span> {e.error}
                                            </p>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
