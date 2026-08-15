"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { OrderData } from "@/services/order";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface OrderDetailsModalProps {
  order: OrderData | null;
  isOpen: boolean;
  onClose: () => void;
}

export function OrderDetailsModal({
  order,
  isOpen,
  onClose,
}: OrderDetailsModalProps) {
  if (!order) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-4xl w-[95vw] max-h-[90vh] overflow-y-auto overflow-x-hidden">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Order Details - {order._id.slice(-8).toUpperCase()}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {/* Order Information */}
          <div className="bg-muted/30 p-4 rounded-xl border border-border">
            <h3 className="font-semibold text-lg mb-3 text-foreground/80 border-b pb-2">
              Order Information
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex">
                <span className="w-24 text-muted-foreground">Date:</span>
                <span className="font-medium">
                  {new Date(order.createdAt).toLocaleString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <div className="flex">
                <span className="w-24 text-muted-foreground">Status:</span>
                <span className="font-medium capitalize">{order.status}</span>
              </div>
              <div className="flex">
                <span className="w-24 text-muted-foreground">Payment:</span>
                <span className="font-medium">
                  {order.paymentMethod === "bkash" ? "bKash" : "Cash on Delivery"} (
                  <span className="capitalize">{order.paymentStatus}</span>)
                </span>
              </div>
              {order.paymentMethod === "bkash" && order.bkashTxnId && (
                <div className="flex">
                  <span className="w-24 text-muted-foreground">Txn ID:</span>
                  <span className="font-mono">{order.bkashTxnId}</span>
                </div>
              )}
            </div>
          </div>

          {/* Customer Information */}
          <div className="bg-muted/30 p-4 rounded-xl border border-border">
            <h3 className="font-semibold text-lg mb-3 text-foreground/80 border-b pb-2">
              Customer Information
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex">
                <span className="w-24 text-muted-foreground">Name:</span>
                <span className="font-medium">{order.customer.name}</span>
              </div>
              <div className="flex">
                <span className="w-24 text-muted-foreground">Mobile:</span>
                <span className="font-medium">{order.customer.phone}</span>
              </div>
              <div className="flex">
                <span className="w-24 text-muted-foreground">Email:</span>
                <span className="font-medium text-muted-foreground">N/A</span>
              </div>
              <div className="flex">
                <span className="w-24 text-muted-foreground">Address:</span>
                <span className="font-medium">{order.customer.address}</span>
              </div>
            </div>
          </div>

          {/* Courier Information */}
          <div className="bg-muted/30 p-4 rounded-xl border border-border md:col-span-2">
            <h3 className="font-semibold text-lg mb-3 text-foreground/80 border-b pb-2">
              Courier Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex">
                <span className="w-24 text-muted-foreground">Courier:</span>
                <span className="font-medium uppercase">
                  {order.courierName || "N/A"}
                </span>
              </div>
              <div className="flex">
                <span className="w-24 text-muted-foreground">Status:</span>
                <span className="font-medium">
                  {order.courierName ? order.courierStatus || "Dispatched" : "Not Sent"}
                </span>
              </div>
              {order.courierTrackingCode && (
                <div className="flex">
                  <span className="w-24 text-muted-foreground">Tracking ID:</span>
                  <span className="font-mono">{order.courierTrackingCode}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="mt-6">
          <h3 className="font-semibold text-lg mb-3 text-foreground/80">
            Line Items
          </h3>
          <div className="rounded-xl border border-border overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead className="text-center">Qty</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.products.map((item, idx) => (
                  <TableRow key={idx}>
                    <TableCell>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {item.size && <span className="mr-2">Size: {item.size}</span>}
                        {item.color && <span>Color: {item.color}</span>}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {item.productId || "N/A"}
                    </TableCell>
                    <TableCell className="text-center">{item.quantity}</TableCell>
                    <TableCell className="text-right">৳{item.price}</TableCell>
                    <TableCell className="text-right font-medium">
                      ৳{item.price * item.quantity}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          <div className="flex justify-end mt-4">
            <div className="w-64 space-y-2 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>৳{(order.subtotal || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping</span>
                <span>৳{order.deliveryCharge.toLocaleString()}</span>
              </div>
              {order.coupon && (
                <div className="flex justify-between text-muted-foreground">
                  <span>Coupon</span>
                  <span className="text-emerald-500 font-medium">Yes</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
                <span>Total</span>
                <span>৳{(order.grandTotal || order.total).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
