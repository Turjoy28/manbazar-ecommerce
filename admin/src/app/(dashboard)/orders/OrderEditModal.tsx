"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Plus, Save } from "lucide-react";
import { OrderData, OrderItem, orderService } from "@/services/order";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface OrderEditModalProps {
  order: OrderData | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export function OrderEditModal({ order, isOpen, onClose, onUpdate }: OrderEditModalProps) {
  const [formData, setFormData] = useState<Partial<OrderData>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (order && isOpen) {
      // Deep copy to avoid mutating the original prop
      setFormData(JSON.parse(JSON.stringify(order)));
    }
  }, [order, isOpen]);

  if (!order || !isOpen) return null;

  const handleCustomerChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      customer: {
        ...(prev.customer as any),
        [field]: value,
      },
    }));
  };

  const handleProductChange = (index: number, field: keyof OrderItem, value: string | number) => {
    setFormData((prev) => {
      const newProducts = [...(prev.products || [])];
      newProducts[index] = { ...newProducts[index], [field]: value };
      
      // Auto-recalculate subtotal
      const newSubtotal = newProducts.reduce((acc, p) => acc + (p.price * p.quantity), 0);
      const newTotal = newSubtotal + (prev.deliveryCharge || 0);

      return { ...prev, products: newProducts, subtotal: newSubtotal, total: newTotal };
    });
  };

  const removeProduct = (index: number) => {
    setFormData((prev) => {
      const newProducts = [...(prev.products || [])];
      newProducts.splice(index, 1);

      // Auto-recalculate subtotal
      const newSubtotal = newProducts.reduce((acc, p) => acc + (p.price * p.quantity), 0);
      const newTotal = newSubtotal + (prev.deliveryCharge || 0);

      return { ...prev, products: newProducts, subtotal: newSubtotal, total: newTotal };
    });
  };

  const handleFinancialChange = (field: string, value: number) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      
      // Recalculate total if subtotal or deliveryCharge changes
      if (field === 'subtotal' || field === 'deliveryCharge') {
        const sub = field === 'subtotal' ? value : (prev.subtotal || 0);
        const del = field === 'deliveryCharge' ? value : (prev.deliveryCharge || 0);
        updated.total = sub + del;
      }
      
      return updated;
    });
  };

  const handleSave = async () => {
    if (!formData.products || formData.products.length === 0) {
      toast.error("Order must have at least one product.");
      return;
    }

    setIsSaving(true);
    try {
      const res = await orderService.updateOrder(order._id, formData);
      if (res.success) {
        toast.success("Order updated successfully!");
        onUpdate();
        onClose();
      } else {
        toast.error(res.message || "Failed to update order");
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-4xl w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Edit Order - {order._id.slice(-8).toUpperCase()}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
          
          {/* Customer & Status Section */}
          <div className="space-y-6">
            <div className="bg-muted/30 p-4 rounded-xl border border-border space-y-4">
              <h3 className="font-semibold text-foreground border-b pb-2">Customer Info</h3>
              <div className="grid gap-3">
                <div className="grid gap-1">
                  <Label>Name</Label>
                  <Input 
                    value={formData.customer?.name || ""} 
                    onChange={(e) => handleCustomerChange("name", e.target.value)} 
                  />
                </div>
                <div className="grid gap-1">
                  <Label>Phone</Label>
                  <Input 
                    value={formData.customer?.phone || ""} 
                    onChange={(e) => handleCustomerChange("phone", e.target.value)} 
                  />
                </div>
                <div className="grid gap-1">
                  <Label>Address</Label>
                  <Input 
                    value={formData.customer?.address || ""} 
                    onChange={(e) => handleCustomerChange("address", e.target.value)} 
                  />
                </div>
              </div>
            </div>

            <div className="bg-muted/30 p-4 rounded-xl border border-border space-y-4">
              <h3 className="font-semibold text-foreground border-b pb-2">Order Status</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-1">
                  <Label>Status</Label>
                  <Select 
                    value={formData.status || ""} 
                    onValueChange={(val) => setFormData(prev => ({ ...prev, status: val as any }))}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-1">
                  <Label>Payment Method</Label>
                  <Select 
                    value={formData.paymentMethod || ""} 
                    onValueChange={(val) => setFormData(prev => ({ ...prev, paymentMethod: val as any }))}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cod">Cash on Delivery</SelectItem>
                      <SelectItem value="bkash">bKash</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-1">
                  <Label>Payment Status</Label>
                  <Select 
                    value={formData.paymentStatus || ""} 
                    onValueChange={(val) => setFormData(prev => ({ ...prev, paymentStatus: val as any }))}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                      <SelectItem value="refunded">Refunded</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.paymentMethod === "bkash" && (
                  <div className="grid gap-1">
                    <Label>bKash Txn ID</Label>
                    <Input 
                      value={formData.bkashTxnId || ""} 
                      onChange={(e) => setFormData(prev => ({ ...prev, bkashTxnId: e.target.value }))} 
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Products & Financials Section */}
          <div className="space-y-6">
            <div className="bg-muted/30 p-4 rounded-xl border border-border space-y-4">
              <h3 className="font-semibold text-foreground border-b pb-2">Products</h3>
              <div className="space-y-3">
                {formData.products?.map((p, i) => (
                  <div key={i} className="flex flex-col gap-2 p-3 bg-background border border-border rounded-lg relative">
                    <div className="font-medium text-sm pr-6">{p.name}</div>
                    <button 
                      onClick={() => removeProduct(i)}
                      className="absolute top-3 right-3 text-red-500 hover:text-red-700 bg-red-500/10 p-1.5 rounded-md"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <div className="grid grid-cols-4 gap-2 mt-1">
                      <div className="grid gap-1">
                        <Label className="text-xs">Price</Label>
                        <Input 
                          type="number" 
                          className="h-8 text-sm"
                          value={p.price || 0} 
                          onChange={(e) => handleProductChange(i, "price", Number(e.target.value))} 
                        />
                      </div>
                      <div className="grid gap-1">
                        <Label className="text-xs">Qty</Label>
                        <Input 
                          type="number" 
                          className="h-8 text-sm"
                          value={p.quantity || 1} 
                          onChange={(e) => handleProductChange(i, "quantity", Number(e.target.value))} 
                        />
                      </div>
                      <div className="grid gap-1">
                        <Label className="text-xs">Size</Label>
                        <Input 
                          className="h-8 text-sm"
                          value={p.size || ""} 
                          onChange={(e) => handleProductChange(i, "size", e.target.value)} 
                        />
                      </div>
                      <div className="grid gap-1">
                        <Label className="text-xs">Color</Label>
                        <Input 
                          className="h-8 text-sm"
                          value={p.color || ""} 
                          onChange={(e) => handleProductChange(i, "color", e.target.value)} 
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-muted/30 p-4 rounded-xl border border-border space-y-4">
              <h3 className="font-semibold text-foreground border-b pb-2">Financials</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-1">
                  <Label>Subtotal</Label>
                  <Input 
                    type="number" 
                    value={formData.subtotal || 0} 
                    onChange={(e) => handleFinancialChange("subtotal", Number(e.target.value))} 
                  />
                </div>
                <div className="grid gap-1">
                  <Label>Delivery Charge</Label>
                  <Input 
                    type="number" 
                    value={formData.deliveryCharge || 0} 
                    onChange={(e) => handleFinancialChange("deliveryCharge", Number(e.target.value))} 
                  />
                </div>
                <div className="grid gap-1 col-span-2">
                  <Label className="text-lg font-bold">Total</Label>
                  <Input 
                    type="number" 
                    className="font-bold text-lg bg-primary/5 border-primary/20"
                    value={formData.total || 0} 
                    onChange={(e) => handleFinancialChange("total", Number(e.target.value))} 
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6 border-t pt-4">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : <><Save className="h-4 w-4 mr-2" /> Save Changes</>}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
