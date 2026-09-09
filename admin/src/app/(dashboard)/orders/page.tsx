"use client";

import React, { useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import { io, Socket } from "socket.io-client";
import { orderService, OrderData } from "@/services/order";
import { authService } from "@/services/auth";
import { getUiData } from "@/services/ui";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Loader2,
  Trash2,
  Send,
  Search,
  RefreshCw,
  Truck,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  CheckCircle2,
  ShoppingBag,
  MoreHorizontal,
  Eye,
  Printer,
  Pencil,
  ExternalLink,
} from "lucide-react";
import { InvoicePrintOverlay } from "./InvoicePrintOverlay";
import { OrderDetailsModal } from "./OrderDetailsModal";
import { OrderEditModal } from "./OrderEditModal";

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [role, setRole] = useState<string>("");

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [selectedCourier, setSelectedCourier] = useState<
    "steadfast" | "pathao" | "redx" | "carrybee"
  >("steadfast");

  const [isCourierSending, setIsCourierSending] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);
  const [reconcilingId, setReconcilingId] = useState<string | null>(null);
  const [viewingOrder, setViewingOrder] = useState<OrderData | null>(null);
  const [printingOrder, setPrintingOrder] = useState<OrderData | null>(null);
  const [editingOrder, setEditingOrder] = useState<OrderData | null>(null);

  // Steadfast Pickup Request URL from admin settings
  const [sfPickupUrl, setSfPickupUrl] = useState("https://steadfast.com.bd/user/pickup-request");

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const res = await orderService.getOrders(page, limit);
      if (res.success && res.data) {
        setOrders(res.data.orders);
        setTotalPages(res.data.pages);
        setTotalOrders(res.data.total);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to load orders.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page, limit]);

  useEffect(() => {
    authService.getMe()
      .then((res) => {
        if (res.success && res.data?.role) {
          setRole(res.data.role);
        }
      })
      .catch(console.error);

    // Load Steadfast pickup URL from admin settings
    getUiData()
      .then((res) => {
        const url = res?.data?.[0]?.courier?.steadfast?.pickupRequestUrl;
        if (url) setSfPickupUrl(url);
      })
      .catch(() => {});
  }, []);

  // ── Socket.IO: Real-time courier status updates ──────────────────────────
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5001/api/v1";
    const socketUrl = BASE_URL.replace("/api/v1", "");
    const socket = io(socketUrl, { transports: ["websocket", "polling"] });
    socketRef.current = socket;

    socket.on("order:status:update", (data: any) => {
      setOrders((prev) =>
        prev.map((o) =>
          o._id === data.orderId
            ? {
                ...o,
                status: data.status,
                courier: {
                  ...o.courier,
                  rawStatus: data.tracking?.rawStatus,
                  rider: data.rider || data.tracking?.rider || o.courier?.rider,
                },
                trackingHistory: [
                  ...(o.trackingHistory || []),
                  data.tracking,
                ],
              }
            : o
        )
      );
      
      setViewingOrder((prev) => {
        if (prev && prev._id === data.orderId) {
          return {
            ...prev,
            status: data.status,
            courier: {
              ...prev.courier,
              rawStatus: data.tracking?.rawStatus,
              rider: data.rider || data.tracking?.rider || prev.courier?.rider,
            },
            trackingHistory: [
              ...(prev.trackingHistory || []),
              data.tracking,
            ],
          };
        }
        return prev;
      });

      const rider = data.rider || data.tracking?.rider;
      toast.info(`Order ${data.orderId.slice(-8).toUpperCase()} → ${data.status}`, {
        description: rider?.name
          ? `🏍️ Rider ${rider.name} assigned${rider.phone ? ` (${rider.phone})` : ""}`
          : "Real-time courier update received.",
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Join rooms for visible orders
  useEffect(() => {
    if (socketRef.current && orders.length > 0) {
      orders.forEach((o) => {
        socketRef.current?.emit("join_order_room", o._id);
      });
    }
  }, [orders]);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingStatusId(orderId);
    try {
      const res = await orderService.updateOrderStatus(orderId, newStatus);
      if (res.success) {
        toast.success("Order status updated.");
        setOrders(
          orders.map((o) =>
            o._id === orderId ? { ...o, status: newStatus as any } : o,
          ),
        );
      } else {
        toast.error(res.message || "Failed to update status.");
      }
    } catch (err: any) {
      toast.error(err.message || "Something went wrong.");
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const handleReconcilePayment = async (orderId: string) => {
    setReconcilingId(orderId);
    try {
      const res = await orderService.reconcilePayment(orderId);
      if (res.success) {
        toast.success("Payment marked as completed.");
        setOrders(
          orders.map((o) =>
            o._id === orderId ? { ...o, paymentStatus: "completed" } : o,
          ),
        );
      } else {
        toast.error(res.message || "Failed to reconcile payment.");
      }
    } catch (err: any) {
      toast.error(err.message || "Something went wrong.");
    } finally {
      setReconcilingId(null);
    }
  };

  const handleDeleteOrder = (orderId: string) => {
    toast.warning("এই অর্ডারটি মুছে ফেলবেন?", {
      description: "এই কাজটি ফিরানো যাবে না।",
      action: {
        label: "হ্যাঁ, মুছুন",
        onClick: async () => {
          try {
            const res = await orderService.deleteOrders([orderId]);
            if (res.success) {
              toast.success("অর্ডার মুছে ফেলা হয়েছে।");
              setOrders((prev) => prev.filter((o) => o._id !== orderId));
              setSelectedOrderIds((prev) =>
                prev.filter((id) => id !== orderId),
              );
            } else {
              toast.error("অর্ডার মুছতে ব্যর্থ হয়েছে।");
            }
          } catch (err: any) {
            toast.error(err.message || "Something went wrong.");
          }
        },
      },
    });
  };

  const handleBulkDelete = () => {
    if (!selectedOrderIds.length) {
      toast.error("কোনো অর্ডার সিলেক্ট করা হয়নি।");
      return;
    }
    toast.warning(`${selectedOrderIds.length}টি অর্ডার মুছে ফেলবেন?`, {
      description: "এই কাজটি ফিরানো যাবে না।",
      action: {
        label: "হ্যাঁ, মুছুন",
        onClick: async () => {
          setIsBulkDeleting(true);
          try {
            const res = await orderService.deleteOrders(selectedOrderIds);
            if (res.success) {
              toast.success("সিলেক্টেড অর্ডারগুলো মুছে ফেলা হয়েছে।");
              setOrders((prev) =>
                prev.filter((o) => !selectedOrderIds.includes(o._id)),
              );
              setSelectedOrderIds([]);
            } else {
              toast.error("অর্ডার মুছতে ব্যর্থ হয়েছে।");
            }
          } catch (err: any) {
            toast.error(err.message || "Failed to delete orders.");
          } finally {
            setIsBulkDeleting(false);
          }
        },
      },
    });
  };

  const [isDeletingAll, setIsDeletingAll] = useState(false);

  const handleDeleteAllOrders = () => {
    toast.warning("সব অর্ডার কি সত্যি মুছে ফেলতে চান?", {
      description: "এই কাজটি ডাটাবেস থেকে সব অর্ডার স্থায়ীভাবে মুছে ফেলবে। এটি আর ফিরিয়ে আনা যাবে না!",
      action: {
        label: "হ্যাঁ, সব মুছুন",
        onClick: async () => {
          setIsDeletingAll(true);
          try {
            const res = await orderService.deleteAllOrders();
            if (res.success) {
              toast.success("সব অর্ডার স্থায়ীভাবে মুছে ফেলা হয়েছে।");
              setOrders([]);
              setSelectedOrderIds([]);
              setTotalOrders(0);
              setTotalPages(1);
            } else {
              toast.error("সব অর্ডার মুছতে ব্যর্থ হয়েছে।");
            }
          } catch (err: any) {
            toast.error(err.message || "Failed to delete all orders.");
          } finally {
            setIsDeletingAll(false);
          }
        },
      },
    });
  };

  const handleSendToCourier = async () => {
    if (!selectedOrderIds.length) {
      toast.error("কুরিয়ারে পাঠানোর জন্য অন্তত একটি অর্ডার সিলেক্ট করুন।");
      return;
    }
    setIsCourierSending(true);
    try {
      const res = await orderService.sendToCourier(
        selectedOrderIds,
        selectedCourier,
      );
      console.log("res", res);
      if (res.success) {
        const data = res.data || [];
        const successCount = data.filter((item: any) => item.success).length;
        const failedCount = data.filter((item: any) => !item.success).length;

        if (failedCount > 0) {
          const firstError = data.find((item: any) => !item.success)?.error;
          toast.error(`${failedCount}টি অর্ডার পাঠাতে ব্যর্থ হয়েছে। Error: ${firstError}`);
        }

        if (successCount > 0) {
          toast.success(
            `${successCount}টি অর্ডার ${selectedCourier.toUpperCase()}-এ পাঠানো হয়েছে!`,
          );
          // If all succeeded, clear selection
          if (failedCount === 0) {
             setSelectedOrderIds([]);
          }
          fetchOrders();
        }
      } else {
        toast.error(res.message || "কুরিয়ারে পাঠাতে ব্যর্থ হয়েছে।");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to dispatch to courier.");
    } finally {
      setIsCourierSending(false);
    }
  };

  const toggleSelectOrder = (orderId: string) => {
    setSelectedOrderIds((prev) =>
      prev.includes(orderId)
        ? prev.filter((id) => id !== orderId)
        : [...prev, orderId],
    );
  };

  const toggleSelectAll = () => {
    const pageIds = filteredOrders.map((o) => o._id);
    const allSelected = pageIds.every((id) => selectedOrderIds.includes(id));
    if (allSelected) {
      setSelectedOrderIds((prev) => prev.filter((id) => !pageIds.includes(id)));
    } else {
      setSelectedOrderIds((prev) => Array.from(new Set([...prev, ...pageIds])));
    }
  };

  const filteredOrders = orders.filter((order) => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      order.customer.name.toLowerCase().includes(q) ||
      order.customer.phone.toLowerCase().includes(q) ||
      order._id.toLowerCase().includes(q);
    const matchStatus = statusFilter === "all" || order.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const getStatusColor = (status: string) => {
    const map: Record<string, string> = {
      pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      confirmed: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      processing: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
      shipped: "bg-purple-500/10 text-purple-400 border-purple-500/20",
      courier_assigned: "bg-sky-500/10 text-sky-400 border-sky-500/20",
      picked_up: "bg-teal-500/10 text-teal-400 border-teal-500/20",
      in_transit: "bg-violet-500/10 text-violet-400 border-violet-500/20",
      out_for_delivery: "bg-orange-500/10 text-orange-400 border-orange-500/20",
      delivered: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      cancelled: "bg-rose-500/10 text-rose-400 border-rose-500/20",
      returned: "bg-red-500/10 text-red-400 border-red-500/20",
    };
    return map[status] ?? "bg-muted text-muted-foreground border-border";
  };

  const getPaymentStatusColor = (ps: string) => {
    const map: Record<string, string> = {
      pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      completed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      failed: "bg-rose-500/10 text-rose-400 border-rose-500/20",
      refunded: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    };
    return map[ps] ?? "bg-muted text-muted-foreground border-border";
  };

  // ── Shared order card for mobile ─────────────────────────────────────────
  const OrderCard = ({ order }: { order: OrderData }) => (
    <div
      className={`rounded-xl border p-4 space-y-3 transition-colors ${selectedOrderIds.includes(order._id) ? "border-primary/50 bg-primary/5" : "border-border bg-card/40"}`}
    >
      {/* Top row: checkbox + ID + date + delete */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <Checkbox
            checked={selectedOrderIds.includes(order._id)}
            onCheckedChange={() => toggleSelectOrder(order._id)}
          />
          <div>
            <div className="font-mono text-xs font-semibold text-foreground">
              #{order._id.slice(-8).toUpperCase()}
            </div>
            <div className="text-[10px] text-muted-foreground">
              {new Date(order.createdAt).toLocaleDateString("bn-BD")}
            </div>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0 text-muted-foreground shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
            <MoreHorizontal className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setViewingOrder(order)}>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setEditingOrder(order)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit Order
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setPrintingOrder(order)}>
              <Printer className="mr-2 h-4 w-4" />
              Print Invoice
            </DropdownMenuItem>
            {role === "ADMIN" && (
              <DropdownMenuItem
                className="text-red-600 focus:text-red-600"
                onClick={() => handleDeleteOrder(order._id)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Order
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Customer */}
      <div className="space-y-0.5">
        <div className="font-semibold text-foreground text-sm">
          {order.customer.name}
        </div>
        <div className="text-xs text-muted-foreground">
          {order.customer.phone}
        </div>
        <div className="text-xs text-muted-foreground line-clamp-1">
          {order.customer.address}
        </div>
      </div>

      {/* Products */}
      <div className="space-y-0.5">
        {order.products.map((p, i) => (
          <div key={i} className="text-xs">
            {p.productId && (
              <span className="font-mono text-primary mr-1">[{p.productId}]</span>
            )}
            <span className="font-medium text-foreground">{p.name}</span>
            <span className="text-muted-foreground"> ×{p.quantity}</span>
            {p.size && (
              <span className="text-[10px] bg-muted px-1 rounded ml-1">
                {p.size}
              </span>
            )}
            {p.color && (
              <span className="text-[10px] bg-muted px-1 rounded ml-1">
                {p.color}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Meta row */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="font-bold text-foreground">৳{order.total}</span>
        <span className="text-muted-foreground">
          +৳{order.deliveryCharge} delivery
        </span>
        {/* Payment method badge */}
        <Badge
          variant="outline"
          className={`text-[10px] uppercase font-semibold ${order.paymentMethod === "bkash"
            ? "bg-pink-500/10 text-pink-400 border-pink-500/20"
            : "bg-amber-500/10 text-amber-400 border-amber-500/20"
            }`}
        >
          {order.paymentMethod === "bkash" ? "bKash" : "COD"}
        </Badge>
        {/* Payment status badge */}
        <Badge
          variant="outline"
          className={`text-[10px] capitalize ${getPaymentStatusColor(order.paymentStatus)}`}
        >
          {order.paymentStatus}
        </Badge>
        {order.coupon && (
          <Badge variant="outline" className="text-[10px]">
            {order.coupon}
          </Badge>
        )}
      </div>

      {/* bKash TxnID or COD placeholder */}
      <div className="text-xs">
        {order.paymentMethod === "bkash" && order.bkashTxnId ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-pink-500/10 text-pink-400 border border-pink-500/20 font-mono">
            TxnID: {order.bkashTxnId}
          </span>
        ) : order.paymentMethod === "cod" ? (
          <span className="text-muted-foreground italic">N/A – Cash on Delivery</span>
        ) : null}
      </div>

      {/* Courier info */}
      {order.courierName && (
        <div className="flex items-center gap-2 text-xs">
          <Truck className="h-3 w-3 text-primary" />
          <span className="font-bold text-primary uppercase">
            {order.courierName}
          </span>
          <span className="text-muted-foreground">
            {order.courierTrackingCode || "N/A"}
          </span>
          <Badge className="text-[9px] bg-muted text-muted-foreground border border-border">
            {order.courierStatus || "Dispatched"}
          </Badge>
        </div>
      )}

      {/* Status selector + Mark as Paid */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-muted-foreground shrink-0">Status:</span>
        {updatingStatusId === order._id ? (
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
        ) : (
          <Select
            value={order.status}
            onValueChange={(val) => handleStatusChange(order._id, val || "")}
          >
            <SelectTrigger
              className={`h-8 text-xs font-semibold rounded-full border w-[130px] ${getStatusColor(order.status)}`}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-border bg-card text-foreground">
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="courier_assigned">Courier Assigned</SelectItem>
              <SelectItem value="picked_up">Picked Up</SelectItem>
              <SelectItem value="in_transit">In Transit</SelectItem>
              <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="returned">Returned</SelectItem>
            </SelectContent>
          </Select>
        )}
        {/* Mark as Paid — only for COD + pending payment */}
        {order.paymentMethod === "cod" && order.paymentStatus === "pending" && (
          <Button
            size="sm"
            className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
            disabled={reconcilingId === order._id}
            onClick={() => handleReconcilePayment(order._id)}
          >
            {reconcilingId === order._id ? (
              <Loader2 className="h-3 w-3 animate-spin mr-1" />
            ) : (
              <CheckCircle2 className="h-3 w-3 mr-1" />
            )}
            Mark as Paid
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 min-w-0 overflow-hidden">
      {/* Page header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
            Orders
          </h2>
          <p className="text-sm text-muted-foreground hidden sm:block">
            Manage customer purchases, update status, and dispatch to courier.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {role === "ADMIN" && (
            <Button
              onClick={handleDeleteAllOrders}
              variant="destructive"
              size="sm"
              disabled={isDeletingAll || orders.length === 0}
              className="text-xs h-9 bg-rose-600 hover:bg-rose-700 text-white border-0"
            >
              {isDeletingAll ? (
                <Loader2 className="h-4 w-4 animate-spin sm:mr-2" />
              ) : (
                <Trash2 className="h-4 w-4 sm:mr-2" />
              )}
              <span className="hidden sm:inline">Delete All Orders</span>
              <span className="sm:hidden">Delete All</span>
            </Button>
          )}
          <Button
            onClick={fetchOrders}
            variant="outline"
            size="sm"
            className="border-border text-foreground hover:bg-muted h-9"
          >
            <RefreshCw className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>
      </div>

      {/* ── Metrics Ribbon ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="flex items-center gap-4 rounded-xl border border-border bg-card/40 px-5 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <ShoppingBag className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total Orders</p>
            <p className="text-2xl font-bold text-foreground">{totalOrders}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-xl border border-border bg-card/40 px-5 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10">
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">bKash Paid</p>
            <p className="text-2xl font-bold text-foreground">
              {orders.filter((o) => o.paymentMethod === "bkash" && o.paymentStatus === "completed").length}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-xl border border-border bg-card/40 px-5 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10">
            <Truck className="h-5 w-5 text-amber-400" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">COD Pending Payment</p>
            <p className="text-2xl font-bold text-foreground">
              {orders.filter((o) => o.paymentMethod === "cod" && o.paymentStatus === "pending").length}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 bg-card/20 border border-border p-4 rounded-xl">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by Order ID, Name, Phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 border-border bg-background/40 text-foreground"
            />
          </div>
          <Select
            value={statusFilter}
            onValueChange={(val) => setStatusFilter(val || "all")}
          >
            <SelectTrigger className="sm:w-[180px] border-border bg-background/40 text-foreground/80">
              <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent className="border-border bg-card text-foreground">
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="courier_assigned">Courier Assigned</SelectItem>
              <SelectItem value="picked_up">Picked Up</SelectItem>
              <SelectItem value="in_transit">In Transit</SelectItem>
              <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="returned">Returned</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Bulk actions */}
        {selectedOrderIds.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 bg-primary/10 border border-primary/20 p-2 rounded-lg">
            <span className="text-xs text-primary font-semibold px-1">
              {selectedOrderIds.length} Selected
            </span>
            <Select
              value={selectedCourier}
              onValueChange={(val: any) => setSelectedCourier(val)}
            >
              <SelectTrigger className="w-[120px] h-8 border-border bg-card/80 text-foreground text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-border bg-card text-foreground">
                <SelectItem value="steadfast">SteadFast</SelectItem>
                <SelectItem value="pathao">Pathao</SelectItem>
                <SelectItem value="redx">RedX</SelectItem>
                <SelectItem value="carrybee">CarryBee</SelectItem>
              </SelectContent>
            </Select>
            <Button
              size="sm"
              onClick={handleSendToCourier}
              disabled={isCourierSending}
              className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs h-8"
            >
              {isCourierSending ? (
                <Loader2 className="h-3 w-3 animate-spin mr-1" />
              ) : (
                <Send className="h-3 w-3 mr-1" />
              )}
              Dispatch
            </Button>

            {/* Steadfast Pickup Request shortcut — only visible when Steadfast is selected */}
            {selectedCourier === "steadfast" && (
              <a
                href={sfPickupUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="After dispatching to Steadfast, click here to submit your daily Pickup Request so their rider comes to collect."
              >
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs border-orange-400 text-orange-400 hover:bg-orange-400/10 hover:text-orange-300 gap-1.5"
                >
                  <Truck className="h-3 w-3" />
                  Pickup Request
                  <ExternalLink className="h-3 w-3 opacity-70" />
                </Button>
              </a>
            )}

            {role === "ADMIN" && (
              <Button
                size="sm"
                variant="destructive"
                onClick={handleBulkDelete}
                disabled={isBulkDeleting}
                className="text-xs h-8"
              >
                {isBulkDeleting ? (
                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                ) : (
                  <Trash2 className="h-3 w-3 mr-1" />
                )}
                Delete
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex h-[300px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="flex h-[200px] flex-col items-center justify-center text-muted-foreground rounded-xl border border-border bg-card/30">
          <Search className="h-12 w-12 text-muted-foreground/50 mb-2" />
          <p>No orders matched your criteria.</p>
        </div>
      ) : (
        <>
          {/* Mobile: card list */}
          <div className="flex flex-col gap-3 lg:hidden">
            {/* Select all for mobile */}
            <div className="flex items-center gap-2 px-1">
              <Checkbox
                checked={
                  filteredOrders.length > 0 &&
                  filteredOrders.every((o) => selectedOrderIds.includes(o._id))
                }
                onCheckedChange={toggleSelectAll}
              />
              <span className="text-xs text-muted-foreground">
                Select all on this page
              </span>
            </div>
            {filteredOrders.map((order) => (
              <OrderCard key={order._id} order={order} />
            ))}
          </div>

          {/* Desktop: table */}
          <div className="hidden lg:block rounded-xl border border-border bg-card/30 overflow-hidden min-w-0">
            <div className="overflow-x-auto w-full">
              <Table>
                <TableHeader className="bg-muted/40 border-b border-border">
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={
                          filteredOrders.length > 0 &&
                          filteredOrders.every((o) =>
                            selectedOrderIds.includes(o._id),
                          )
                        }
                        onCheckedChange={toggleSelectAll}
                      />
                    </TableHead>
                    <TableHead className="text-muted-foreground font-semibold">
                      Order ID
                    </TableHead>
                    <TableHead className="text-muted-foreground font-semibold">
                      Products
                    </TableHead>
                    <TableHead className="text-muted-foreground font-semibold">
                      Payment Status
                    </TableHead>
                    <TableHead className="text-muted-foreground font-semibold">
                      Total Price
                    </TableHead>
                    <TableHead className="text-muted-foreground font-semibold">
                      Payment Method
                    </TableHead>
                    <TableHead className="text-muted-foreground font-semibold">
                      Customer Info
                    </TableHead>
                    <TableHead className="text-muted-foreground font-semibold">
                      Update Status
                    </TableHead>
                    <TableHead className="text-right text-muted-foreground font-semibold">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow
                      key={order._id}
                      className="border-b border-border hover:bg-muted/20"
                    >
                      <TableCell>
                        <Checkbox
                          checked={selectedOrderIds.includes(order._id)}
                          onCheckedChange={() => toggleSelectOrder(order._id)}
                        />
                      </TableCell>
                      <TableCell className="font-mono text-xs text-foreground/80">
                        <div className="font-medium text-sm text-foreground">
                          ORD-{order._id.slice(-10).toUpperCase()}
                        </div>
                      </TableCell>
                      <TableCell className="min-w-[250px]">
                        {order.products.map((p, i) => (
                          <div key={i} className="mb-4 last:mb-0 border-b border-border/50 pb-3 last:border-0 last:pb-0">
                            <div className="font-semibold text-foreground text-sm line-clamp-2 leading-tight">
                              {p.name}
                            </div>
                            <div className="font-bold text-foreground text-sm mt-1.5">
                              {p.price || 0}.00 x {p.quantity}
                            </div>
                            <div className="text-[11px] text-muted-foreground mt-1.5">
                              Color: {p.color || "N/A"}
                            </div>
                            <div className="text-[11px] text-muted-foreground mt-0.5">
                              Size: {p.size || "N/A"}
                            </div>
                          </div>
                        ))}
                      </TableCell>
                      <TableCell className="align-top pt-5">
                        <div className="space-y-2">
                          <Badge
                            variant="outline"
                            className={`text-[10px] capitalize block w-fit ${getPaymentStatusColor(order.paymentStatus)}`}
                          >
                            {order.paymentStatus}
                          </Badge>
                          {order.paymentStatus === "pending" && (
                            <Button
                              size="sm"
                              className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-2 w-full justify-start"
                              disabled={reconcilingId === order._id}
                              onClick={() => handleReconcilePayment(order._id)}
                            >
                              {reconcilingId === order._id ? (
                                <Loader2 className="h-3 w-3 animate-spin mr-1" />
                              ) : (
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                              )}
                              Mark as Paid
                            </Button>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="align-top pt-5 min-w-[160px]">
                        <div className="space-y-1.5 text-[13px]">
                          <div className="flex justify-between gap-4 text-muted-foreground">
                            <span>Subtotal:</span>
                            <span className="font-semibold text-foreground">৳ {order.subtotal || 0}</span>
                          </div>
                          <div className="flex justify-between gap-4 text-muted-foreground">
                            <span>Shipping:</span>
                            <span className="font-semibold text-primary">+ ৳ {order.deliveryCharge}</span>
                          </div>
                          <div className="flex justify-between items-center gap-4 font-bold text-sm bg-black text-white px-2.5 py-1.5 rounded mt-1.5 shadow-sm">
                            <span>Total:</span>
                            <span>৳ {order.grandTotal || order.total}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="align-top pt-5">
                        <div className="text-sm font-medium text-foreground">
                          {order.paymentMethod === "bkash" ? "bKash" : "CashOnDelivery"}
                        </div>
                        {order.paymentMethod === "bkash" && order.bkashTxnId && (
                          <div className="text-xs text-muted-foreground mt-1 bg-pink-500/10 text-pink-500 w-fit px-1.5 py-0.5 rounded border border-pink-500/20">
                            Txn: {order.bkashTxnId}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="align-top pt-5 min-w-[220px]">
                        <div className="space-y-1 text-[13px]">
                          <div className="flex">
                            <span className="text-muted-foreground w-16 shrink-0">Name:</span>
                            <span className="font-medium text-foreground line-clamp-1">{order.customer.name}</span>
                          </div>
                          <div className="flex">
                            <span className="text-muted-foreground w-16 shrink-0">Phone:</span>
                            <span className="font-medium text-foreground">{order.customer.phone}</span>
                          </div>
                          <div className="flex">
                            <span className="text-muted-foreground w-16 shrink-0">Email:</span>
                            <span className="font-medium text-foreground">N/A</span>
                          </div>
                          <div className="flex">
                            <span className="text-muted-foreground w-16 shrink-0">Address:</span>
                            <span className="font-medium text-foreground line-clamp-2">{order.customer.address}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="align-top pt-4">
                        {updatingStatusId === order._id ? (
                          <div className="flex items-center justify-center w-[130px] h-9">
                            <Loader2 className="h-4 w-4 animate-spin text-primary" />
                          </div>
                        ) : (
                          <Select
                            value={order.status}
                            onValueChange={(val) =>
                              handleStatusChange(order._id, val || "")
                            }
                          >
                            <SelectTrigger
                              className={`w-[130px] h-9 text-xs font-semibold rounded border bg-transparent ${getStatusColor(order.status)}`}
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="border-border bg-card text-foreground">
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="confirmed">Confirmed</SelectItem>
                              <SelectItem value="processing">Processing</SelectItem>
                              <SelectItem value="shipped">Shipped</SelectItem>
                              <SelectItem value="courier_assigned">Courier Assigned</SelectItem>
                              <SelectItem value="picked_up">Picked Up</SelectItem>
                              <SelectItem value="in_transit">In Transit</SelectItem>
                              <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                              <SelectItem value="delivered">Delivered</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                              <SelectItem value="returned">Returned</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </TableCell>
                      <TableCell className="text-right align-top pt-4">
                        <div className="flex items-center justify-end">
                          <DropdownMenu>
                            <DropdownMenuTrigger className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-muted border border-transparent hover:border-border focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-[160px] border-border bg-card shadow-md rounded-md p-1">
                              <DropdownMenuItem onClick={() => setViewingOrder(order)} className="cursor-pointer flex items-center py-2 px-2 hover:bg-muted rounded-sm">
                                <Eye className="h-4 w-4 mr-2 text-indigo-500" />
                                <span>View details</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setEditingOrder(order)} className="cursor-pointer flex items-center py-2 px-2 hover:bg-muted rounded-sm">
                                <Pencil className="h-4 w-4 mr-2 text-blue-500" />
                                <span>Edit order</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setPrintingOrder(order)} className="cursor-pointer flex items-center py-2 px-2 hover:bg-muted rounded-sm">
                                <Printer className="h-4 w-4 mr-2 text-slate-500" />
                                <span>Print invoice</span>
                              </DropdownMenuItem>
                              {role === "ADMIN" && (
                                <DropdownMenuItem onClick={() => handleDeleteOrder(order._id)} className="cursor-pointer flex items-center py-2 px-2 text-red-600 focus:text-red-600 focus:bg-red-50 hover:bg-red-50 rounded-sm">
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  <span>Delete order</span>
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </>
      )}

      {/* Pagination */}
      {totalOrders > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border pt-4">
          {/* Rows per page */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="hidden sm:inline">Rows per page:</span>
            <Select
              value={String(limit)}
              onValueChange={(v) => {
                setLimit(Number(v));
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[65px] h-8 border-border bg-background/40 text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[5, 10, 20, 50].map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-xs">
              Page <span className="font-semibold text-foreground">{page}</span>{" "}
              of{" "}
              <span className="font-semibold text-foreground">
                {totalPages}
              </span>
              <span className="hidden sm:inline"> ({totalOrders} total)</span>
            </span>
          </div>

          {/* Page nav */}
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 border-border text-foreground"
              onClick={() => setPage(1)}
              disabled={page === 1 || isLoading}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 border-border text-foreground"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || isLoading}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 border-border text-foreground"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || isLoading}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 border-border text-foreground"
              onClick={() => setPage(totalPages)}
              disabled={page === totalPages || isLoading}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
      {printingOrder && (
        <InvoicePrintOverlay order={printingOrder} onClose={() => setPrintingOrder(null)} />
      )}
      <OrderEditModal
        order={editingOrder}
        isOpen={!!editingOrder}
        onClose={() => setEditingOrder(null)}
        onUpdate={() => {
          fetchOrders();
          setEditingOrder(null);
        }}
      />
      <OrderDetailsModal
        order={viewingOrder}
        isOpen={!!viewingOrder}
        onClose={() => setViewingOrder(null)}
      />
    </div>
  );
}
