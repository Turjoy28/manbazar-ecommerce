"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  incompleteOrderService,
  IncompleteOrderData,
} from "@/services/incomplete-order";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Trash2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ClipboardList,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";

// ── Helpers ────────────────────────────────────────────────────────────────────
function generateOrderId(id: string, createdAt: string): string {
  const date = new Date(createdAt);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const suffix = id.slice(-4).toUpperCase();
  return `INC-${y}${m}${d}${suffix}`;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }) + ", " + d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function getLocationLabel(loc: string): string {
  const map: Record<string, string> = {
    dhaka: "Dhaka",
    outside: "Outside Dhaka",
    subcity: "Sub-city",
  };
  return map[loc] || loc || "Not Selected";
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function IncompleteOrdersPage() {
  const [orders, setOrders] = useState<IncompleteOrderData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const res = await incompleteOrderService.getIncompleteOrders(page, limit);
      if (res.success && res.data) {
        setOrders(res.data.orders);
        setTotalPages(res.data.pages);
        setTotalOrders(res.data.total);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to load incomplete orders.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page]);

  const handleDeleteOrder = (orderId: string) => {
    toast.warning("এই ইনকমপ্লিট অর্ডারটি মুছে ফেলবেন?", {
      description: "এই কাজটি ফিরানো যাবে না।",
      action: {
        label: "হ্যাঁ, মুছুন",
        onClick: async () => {
          setDeletingId(orderId);
          try {
            const res = await incompleteOrderService.deleteIncompleteOrder(orderId);
            if (res.success) {
              toast.success("ইনকমপ্লিট অর্ডার মুছে ফেলা হয়েছে।");
              setOrders((prev) => prev.filter((o) => o._id !== orderId));
              setTotalOrders((prev) => prev - 1);
            } else {
              toast.error("মুছতে ব্যর্থ হয়েছে।");
            }
          } catch (err: any) {
            toast.error(err.message || "Something went wrong.");
          } finally {
            setDeletingId(null);
          }
        },
      },
    });
  };

  // ── Mobile Card ────────────────────────────────────────────────────────────
  const IncompleteOrderCard = ({ order, index }: { order: IncompleteOrderData; index: number }) => (
    <div className="rounded-xl border border-border bg-card/40 p-4 space-y-3">
      {/* Top row: ID + Delete */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="font-mono text-xs font-semibold text-foreground">
            #{generateOrderId(order._id, order.createdAt)}
          </div>
          <div className="text-[10px] text-muted-foreground mt-0.5">
            {formatDate(order.updatedAt)}
          </div>
        </div>
        <Button
          variant="destructive"
          size="sm"
          className="h-7 text-xs gap-1 px-2"
          onClick={() => handleDeleteOrder(order._id)}
          disabled={deletingId === order._id}
        >
          {deletingId === order._id ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Trash2 className="h-3 w-3" />
          )}
          Delete
        </Button>
      </div>

      {/* Customer */}
      <div className="space-y-1">
        <div className="font-semibold text-foreground text-sm">{order.customer.name}</div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Phone className="h-3 w-3" />
          {order.customer.phone || "N/A"}
        </div>
        {order.customer.email && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Mail className="h-3 w-3" />
            {order.customer.email}
          </div>
        )}
        <div className="flex items-center gap-1.5 text-xs">
          <MapPin className="h-3 w-3 text-rose-500" />
          <span className="text-muted-foreground">{getLocationLabel(order.customer.location)}</span>
        </div>
      </div>

      {/* Products */}
      <div className="space-y-1">
        {order.products.map((p, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            {p.thumbnail && (
              <img src={p.thumbnail} alt={p.name} className="w-8 h-8 rounded object-cover border border-border shrink-0" />
            )}
            <div className="min-w-0">
              <span className="font-medium text-foreground line-clamp-1">{p.name}</span>
              {p.productId && (
                <span className="text-[10px] text-muted-foreground block font-mono">ID: {p.productId.slice(-10)}</span>
              )}
              <span className="text-muted-foreground">৳{p.price} × {p.quantity}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom meta */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="font-bold text-foreground">৳{order.totalPrice}</span>
        <Badge
          variant="outline"
          className="text-[10px] uppercase font-semibold bg-amber-500/10 text-amber-600 border-amber-500/20"
        >
          {order.paymentMethod}
        </Badge>
        <Badge
          variant="outline"
          className="text-[10px] bg-orange-500/10 text-orange-500 border-orange-500/20 font-semibold"
        >
          Incomplete
        </Badge>
      </div>
    </div>
  );

  // ── Page Render ────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-orange-500/10">
            <ClipboardList className="h-5 w-5 text-orange-500" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
              Incomplete Orders
              <Badge className="bg-rose-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                {totalOrders} total
              </Badge>
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Orders where customers started checkout but didn&apos;t complete
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchOrders}
          disabled={isLoading}
          className="gap-1.5 self-start"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <ClipboardList className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-semibold text-muted-foreground">No incomplete orders</h3>
          <p className="text-sm text-muted-foreground/60 mt-1">
            When customers start filling the checkout form but don&apos;t complete, they&apos;ll appear here.
          </p>
        </div>
      ) : (
        <>
          {/* ── Mobile cards ── */}
          <div className="flex flex-col gap-3 lg:hidden">
            {orders.map((order, index) => (
              <IncompleteOrderCard
                key={order._id}
                order={order}
                index={(page - 1) * limit + index}
              />
            ))}
          </div>

          {/* ── Desktop table ── */}
          <div className="hidden lg:block rounded-xl border border-border overflow-hidden bg-card">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="w-12 text-center font-bold text-xs">SL</TableHead>
                  <TableHead className="font-bold text-xs">Order ID</TableHead>
                  <TableHead className="font-bold text-xs">Customer Info</TableHead>
                  <TableHead className="font-bold text-xs">Products</TableHead>
                  <TableHead className="font-bold text-xs text-center">Total Price</TableHead>
                  <TableHead className="font-bold text-xs text-center">Payment</TableHead>
                  <TableHead className="font-bold text-xs">Incomplete At</TableHead>
                  <TableHead className="font-bold text-xs text-center">Status</TableHead>
                  <TableHead className="font-bold text-xs text-center">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order, index) => (
                  <TableRow
                    key={order._id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    {/* SL */}
                    <TableCell className="text-center text-sm font-medium text-muted-foreground">
                      {(page - 1) * limit + index + 1}
                    </TableCell>

                    {/* Order ID */}
                    <TableCell>
                      <span className="font-mono text-xs font-semibold text-foreground">
                        {generateOrderId(order._id, order.createdAt)}
                      </span>
                    </TableCell>

                    {/* Customer Info */}
                    <TableCell>
                      <div className="space-y-1 min-w-[160px]">
                        <div className="font-semibold text-sm text-foreground">
                          {order.customer.name}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Phone className="h-3 w-3 shrink-0" />
                          {order.customer.phone || "N/A"}
                        </div>
                        {order.customer.email && (
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Mail className="h-3 w-3 shrink-0" />
                            <span className="truncate max-w-[140px]">{order.customer.email}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1.5 text-xs">
                          <MapPin className="h-3 w-3 text-rose-500 shrink-0" />
                          <span className="text-muted-foreground">
                            {getLocationLabel(order.customer.location)}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    {/* Products */}
                    <TableCell>
                      <div className="space-y-2 min-w-[200px]">
                        {order.products.map((p, i) => (
                          <div key={i} className="flex items-center gap-2.5">
                            {p.thumbnail ? (
                              <img
                                src={p.thumbnail}
                                alt={p.name}
                                className="w-10 h-10 rounded-md object-cover border border-border shrink-0 shadow-sm"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center shrink-0 border border-border">
                                <ClipboardList className="h-4 w-4 text-muted-foreground" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <div className="text-xs font-medium text-foreground line-clamp-1">
                                {p.name}
                              </div>
                              {p.productId && (
                                <div className="text-[10px] text-primary font-mono">
                                  ID: PRO-{p.productId.slice(-8)}
                                </div>
                              )}
                              <div className="text-[10px] text-muted-foreground">
                                ৳{p.price} × {p.quantity}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </TableCell>

                    {/* Total Price */}
                    <TableCell className="text-center">
                      <span className="font-bold text-sm text-foreground">
                        ৳{order.totalPrice}
                      </span>
                    </TableCell>

                    {/* Payment */}
                    <TableCell className="text-center">
                      <span className="text-xs text-muted-foreground">
                        {order.paymentMethod}
                      </span>
                    </TableCell>

                    {/* Incomplete At */}
                    <TableCell>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDate(order.updatedAt)}
                      </span>
                    </TableCell>

                    {/* Status */}
                    <TableCell className="text-center">
                      <Badge
                        variant="outline"
                        className="bg-orange-500/10 text-orange-500 border-orange-500/20 font-semibold text-[10px]"
                      >
                        Incomplete
                      </Badge>
                    </TableCell>

                    {/* Action */}
                    <TableCell className="text-center">
                      <Button
                        variant="destructive"
                        size="sm"
                        className="h-7 text-xs gap-1 px-2.5"
                        onClick={() => handleDeleteOrder(order._id)}
                        disabled={deletingId === order._id}
                      >
                        {deletingId === order._id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Trash2 className="h-3 w-3" />
                        )}
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* ── Pagination ── */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <span className="text-sm text-muted-foreground">
                Showing {(page - 1) * limit + 1}–{Math.min(page * limit, totalOrders)} of {totalOrders}
              </span>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setPage(1)}
                  disabled={page === 1}
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium px-3 text-foreground">
                  {page} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setPage(totalPages)}
                  disabled={page === totalPages}
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
