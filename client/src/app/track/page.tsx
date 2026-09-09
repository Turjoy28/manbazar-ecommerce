"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { io, Socket } from "socket.io-client";
import { useSearchParams } from "next/navigation";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5001/api/v1";
const socketUrl = baseUrl.replace("/api/v1", "");

const STATUS_STEPS = [
  { key: "pending", label: "অর্ডার গৃহীত", icon: "📋" },
  { key: "confirmed", label: "নিশ্চিত করা হয়েছে", icon: "✅" },
  { key: "processing", label: "প্রস্তুত হচ্ছে", icon: "⚙️" },
  { key: "courier_assigned", label: "কুরিয়ারে পাঠানো হয়েছে", icon: "📦" },
  { key: "picked_up", label: "কুরিয়ার সংগ্রহ করেছে", icon: "🤝" },
  { key: "in_transit", label: "পথে আছে", icon: "🚚" },
  { key: "out_for_delivery", label: "ডেলিভারিতে যাচ্ছে", icon: "🏍️" },
  { key: "delivered", label: "ডেলিভারি সম্পন্ন", icon: "🎉" },
];

const CANCELLED_STATUS = { key: "cancelled", label: "বাতিল করা হয়েছে", icon: "❌" };
const RETURNED_STATUS = { key: "returned", label: "ফেরত এসেছে", icon: "↩️" };

function getStepIndex(status: string) {
  const idx = STATUS_STEPS.findIndex((s) => s.key === status);
  return idx === -1 ? 0 : idx;
}

interface TrackingOrder {
  _id: string;
  status: string;
  customer: {
    name: string;
    phone?: string;
    address?: string;
  };
  products: { name: string; quantity: number }[];
  total: number;
  grandTotal?: number;
  deliveryCharge: number;
  courier?: {
    provider?: string;
    consignmentId?: string;
    trackingCode?: string;
    rawStatus?: string;
    lastSyncedAt?: string;
    rider?: {
      name?: string;
      phone?: string;
      type?: "pickup" | "delivery";
      assignedAt?: string;
    };
  };
  trackingHistory?: {
    status: string;
    rawStatus: string;
    message: string;
    provider: string;
    timestamp: string;
    rider?: {
      name?: string;
      phone?: string;
      type?: string;
    };
  }[];
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
}

function TrackOrderContent() {
  const [phone, setPhone] = useState("");
  const [orders, setOrders] = useState<TrackingOrder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  // Connect to socket for real-time updates
  useEffect(() => {
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
                trackingHistory: [...(o.trackingHistory || []), data.tracking],
              }
            : o
        )
      );
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Join socket rooms when orders change
  useEffect(() => {
    if (socketRef.current && orders.length > 0) {
      orders.forEach((o) => {
        socketRef.current?.emit("join_order_room", o._id);
      });
    }
  }, [orders]);

  const handleSearch = async (e?: React.FormEvent, searchPhone?: string) => {
    if (e) e.preventDefault();
    const phoneToSearch = searchPhone || phone;
    if (!phoneToSearch.trim()) return;

    setIsLoading(true);
    setHasSearched(true);
    try {
      const res = await fetch(`${baseUrl}/orders/track?phone=${encodeURIComponent(phoneToSearch.trim())}`);
      const data = await res.json();
      if (data.success) {
        setOrders(data.data || []);
        if (data.data?.length > 0) {
          setExpandedOrder(data.data[0]._id);
        }
      } else {
        setOrders([]);
      }
    } catch {
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  const isCancelledOrReturned = (status: string) => status === "cancelled" || status === "returned";

  // Read URL query param to auto-search on load
  const searchParams = useSearchParams();
  useEffect(() => {
    const phoneQuery = searchParams.get("phone");
    if (phoneQuery) {
      setPhone(phoneQuery);
      handleSearch(undefined, phoneQuery);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-50/60 pb-32">
      {/* Hero Section */}
      <div
        className="relative overflow-hidden py-10 md:py-14 px-4 shadow-sm"
        style={{
          background: `linear-gradient(135deg, var(--secondary-brand) 0%, color-mix(in srgb, var(--secondary-brand) 85%, var(--primary-brand)) 100%)`,
        }}
      >
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[var(--primary-brand)] rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-[var(--tertiary-brand)] rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-2xl mx-auto text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white mb-2 tracking-tight">
            🚚 অর্ডার ট্র্যাক করুন
          </h1>
          <p className="text-white/80 text-xs sm:text-sm md:text-base mb-6 font-medium">
            আপনার মোবাইল নম্বর দিয়ে অর্ডারের বর্তমান ডেলিভারি অবস্থা জানুন
          </p>
          <form onSubmit={handleSearch} className="flex gap-2 max-w-md mx-auto">
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="আপনার ফোন নম্বর (01XXXXXXXXX)"
              className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-brand)] focus:border-transparent text-sm transition-all"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 rounded-xl font-semibold text-white text-sm transition-all duration-200 hover:opacity-95 active:scale-95 disabled:opacity-50 shrink-0 shadow-sm"
              style={{ background: `var(--primary-brand)` }}
            >
              {isLoading ? (
                <span className="inline-flex items-center gap-1.5">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" opacity=".25" />
                    <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" opacity=".75" />
                  </svg>
                  খুঁজছি...
                </span>
              ) : (
                "ট্র্যাক করুন"
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Results Section with generous margin */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 mt-8 sm:mt-10 relative z-10">
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="h-9 w-9 border-4 border-[var(--primary-brand)] border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-sm text-gray-500 font-medium">অর্ডার তথ্য লোড হচ্ছে...</p>
          </div>
        )}

        {!isLoading && hasSearched && orders.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 p-8 sm:p-12 text-center">
            <div className="text-5xl mb-3">📭</div>
            <h3 className="text-lg font-bold text-gray-900 mb-1.5">কোন অর্ডার পাওয়া যায়নি</h3>
            <p className="text-gray-500 text-sm max-w-sm mx-auto">
              এই ফোন নম্বরে কোন সক্রিয় অর্ডার নেই। দয়া করে সঠিক নম্বর দিয়ে পুনরায় অনুসন্ধান করুন।
            </p>
          </div>
        )}

        {!isLoading && orders.length > 0 && (
          <div className="space-y-5">
            <div className="flex items-center justify-between text-xs text-gray-500 px-1 font-medium">
              <span>মোট {orders.length}টি অর্ডার পাওয়া গেছে</span>
              <span>বিস্তারিত দেখতে অর্ডারে ক্লিক করুন</span>
            </div>

            {orders.map((order) => {
              const isExpanded = expandedOrder === order._id;
              const currentStep = getStepIndex(order.status);
              const isCancelled = isCancelledOrReturned(order.status);

              return (
                <div
                  key={order._id}
                  className="bg-white rounded-2xl shadow-sm hover:shadow-md border border-gray-200/80 overflow-hidden transition-all duration-300"
                >
                  {/* Order Header Card */}
                  <button
                    onClick={() => setExpandedOrder(isExpanded ? null : order._id)}
                    className="w-full px-5 py-4 sm:px-6 sm:py-5 flex items-center justify-between gap-3 sm:gap-4 hover:bg-gray-50/70 transition-colors cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                      <div
                        className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center text-xl shrink-0 transition-transform shadow-xs"
                        style={{
                          background: isCancelled
                            ? "rgb(254 226 226)"
                            : `color-mix(in srgb, var(--primary-brand) 12%, transparent)`,
                        }}
                      >
                        {isCancelled
                          ? order.status === "cancelled"
                            ? CANCELLED_STATUS.icon
                            : RETURNED_STATUS.icon
                          : STATUS_STEPS[currentStep]?.icon}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-gray-900 text-sm sm:text-base tracking-tight truncate">
                          অর্ডার #{order._id.slice(-8).toUpperCase()}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-500 mt-0.5">
                          {new Date(order.createdAt).toLocaleDateString("bn-BD", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
                      <span
                        className="text-xs font-semibold px-3 py-1.5 rounded-full inline-flex items-center gap-1.5"
                        style={{
                          background: isCancelled
                            ? "rgb(254 226 226)"
                            : order.status === "delivered"
                            ? "rgb(220 252 231)"
                            : `color-mix(in srgb, var(--primary-brand) 12%, transparent)`,
                          color: isCancelled
                            ? "rgb(185 28 28)"
                            : order.status === "delivered"
                            ? "rgb(22 101 52)"
                            : `var(--primary-brand)`,
                        }}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{
                            background: isCancelled
                              ? "rgb(185 28 28)"
                              : order.status === "delivered"
                              ? "rgb(22 101 52)"
                              : `var(--primary-brand)`,
                          }}
                        />
                        {isCancelled
                          ? order.status === "cancelled"
                            ? CANCELLED_STATUS.label
                            : RETURNED_STATUS.label
                          : STATUS_STEPS[currentStep]?.label}
                      </span>
                      <div
                        className={`p-1.5 rounded-lg text-gray-400 hover:text-gray-600 transition-transform duration-200 ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                      >
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </button>

                  {/* Expanded Delivery Details */}
                  {isExpanded && (
                    <div className="px-5 sm:px-6 pb-6 pt-3 border-t border-gray-100 space-y-6">
                      {/* Summary Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                        <div className="bg-gray-50/80 rounded-xl p-3.5 border border-gray-100">
                          <div className="text-[11px] uppercase font-bold text-gray-400 mb-1">মোট মূল্য</div>
                          <div className="text-xl font-bold text-gray-900">
                            ৳{(order.grandTotal || order.total).toLocaleString()}
                          </div>
                          {order.deliveryCharge > 0 && (
                            <div className="text-[11px] text-gray-500 mt-0.5">
                              ডেলিভারি চার্জ: ৳{order.deliveryCharge}
                            </div>
                          )}
                        </div>
                        <div className="bg-gray-50/80 rounded-xl p-3.5 border border-gray-100">
                          <div className="text-[11px] uppercase font-bold text-gray-400 mb-1">পেমেন্ট অবস্থা</div>
                          <div className="text-base font-bold text-gray-900">
                            {order.paymentMethod === "bkash" ? "bKash" : "ক্যাশ অন ডেলিভারি (COD)"}
                          </div>
                          <div className="text-[11px] font-medium text-gray-500 mt-0.5">
                            {order.paymentStatus === "paid" ? "✅ পরিশোধিত" : "⏳ বাকি (ডেলিভারির সময় প্রদেয়)"}
                          </div>
                        </div>
                      </div>

                      {/* Customer Delivery Details */}
                      {(order.customer?.name || order.customer?.address) && (
                        <div className="bg-amber-50/40 rounded-xl p-3.5 border border-amber-100 flex items-start gap-3">
                          <span className="text-base mt-0.5">📍</span>
                          <div className="min-w-0 flex-1">
                            <div className="text-[11px] uppercase font-bold text-amber-900/60 mb-0.5">
                              ডেলিভারির ঠিকানা
                            </div>
                            {order.customer?.name && (
                              <div className="text-sm font-semibold text-gray-900">{order.customer.name}</div>
                            )}
                            {order.customer?.address && (
                              <div className="text-xs text-gray-600 mt-0.5 break-words">
                                {order.customer.address}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Courier Info Banner */}
                      {order.courier?.provider && (
                        <div className="bg-blue-50/70 rounded-xl p-4 border border-blue-100">
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-base">📦</span>
                              <span className="text-xs font-bold text-blue-800 uppercase tracking-wider">
                                কুরিয়ার সার্ভিস
                              </span>
                            </div>
                            <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-blue-100 text-blue-800 uppercase">
                              {order.courier.provider}
                            </span>
                          </div>
                          <div className="text-sm text-gray-700 flex flex-wrap items-center gap-x-4 gap-y-1">
                            {order.courier.trackingCode && (
                              <span className="text-xs">
                                ট্র্যাকিং নম্বর:{" "}
                                <span className="font-mono font-bold text-gray-900 bg-white px-2 py-0.5 rounded border border-blue-200">
                                  {order.courier.trackingCode}
                                </span>
                              </span>
                            )}
                            {order.courier.consignmentId && order.courier.consignmentId !== order.courier.trackingCode && (
                              <span className="text-xs">
                                কনসাইনমেন্ট:{" "}
                                <span className="font-mono font-semibold text-gray-900">
                                  {order.courier.consignmentId}
                                </span>
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Nearest Assigned Rider Card */}
                      {order.courier?.rider?.name && (
                        <div className="bg-emerald-50/90 rounded-xl p-4 border border-emerald-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-xl bg-emerald-100/90 flex items-center justify-center text-2xl shrink-0 shadow-xs">
                              🏍️
                            </div>
                            <div>
                              <div className="text-[11px] uppercase font-bold text-emerald-800 tracking-wider flex items-center gap-1.5">
                                <span>{order.courier.rider.type === "pickup" ? "পিকআপ রাইডার" : "ডেলিভারি রাইডার"} (নিকটস্থ)</span>
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              </div>
                              <div className="text-sm font-bold text-gray-900 mt-0.5">
                                {order.courier.rider.name}
                              </div>
                              {order.courier.rider.phone && (
                                <div className="text-xs text-gray-600 font-mono mt-0.5">
                                  {order.courier.rider.phone}
                                </div>
                              )}
                            </div>
                          </div>
                          {order.courier.rider.phone && (
                            <a
                              href={`tel:${order.courier.rider.phone}`}
                              className="self-start sm:self-auto px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold inline-flex items-center gap-1.5 transition-all shrink-0 shadow-sm"
                            >
                              <span>📞</span>
                              <span>রাইডারকে কল করুন</span>
                            </a>
                          )}
                        </div>
                      )}

                      {/* Products List */}
                      <div>
                        <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2.5">
                          পণ্য সমূহ ({order.products.length})
                        </div>
                        <div className="space-y-2">
                          {order.products.map((p, i) => (
                            <div
                              key={i}
                              className="flex items-center justify-between bg-gray-50/70 rounded-xl px-4 py-2.5 border border-gray-100/90"
                            >
                              <span className="text-sm text-gray-800 font-medium">{p.name}</span>
                              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-gray-200/80 text-gray-700 shrink-0">
                                ×{p.quantity}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Delivery Status Timeline */}
                      {!isCancelled ? (
                        <div className="pt-2">
                          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">
                            ডেলিভারি স্ট্যাটাস
                          </div>
                          <div className="relative pl-1">
                            {STATUS_STEPS.map((step, idx) => {
                              const isActive = idx <= currentStep;
                              const isCurrent = idx === currentStep;
                              const isLast = idx === STATUS_STEPS.length - 1;

                              return (
                                <div key={step.key} className="relative flex items-start gap-4 pb-6 last:pb-1">
                                  {/* Vertical connector line */}
                                  {!isLast && (
                                    <div
                                      className="absolute left-4 top-8 -bottom-1 w-0.5 -translate-x-1/2 transition-colors duration-300"
                                      style={{
                                        background:
                                          isActive && idx < currentStep
                                            ? `var(--primary-brand)`
                                            : "rgb(229 231 235)",
                                      }}
                                    />
                                  )}

                                  {/* Step Circle */}
                                  <div
                                    className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 shrink-0 ${
                                      isCurrent
                                        ? "ring-4 ring-offset-2 scale-110 shadow-sm"
                                        : ""
                                    }`}
                                    style={{
                                      background: isActive
                                        ? `var(--primary-brand)`
                                        : "rgb(243 244 246)",
                                      color: isActive ? "white" : "rgb(156 163 175)",
                                      "--tw-ring-color": isCurrent
                                        ? `color-mix(in srgb, var(--primary-brand) 30%, transparent)`
                                        : undefined,
                                    } as any}
                                  >
                                    {isActive ? (
                                      <svg
                                        className="w-4 h-4"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth={3}
                                      >
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                      </svg>
                                    ) : (
                                      <span className="text-xs opacity-60">{step.icon}</span>
                                    )}
                                  </div>

                                  {/* Step Information */}
                                  <div className="flex-1 pt-0.5 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span
                                        className={`text-sm font-semibold ${
                                          isActive ? "text-gray-900" : "text-gray-400"
                                        }`}
                                      >
                                        {step.label}
                                      </span>
                                      {isCurrent && (
                                        <span
                                          className="text-[10px] font-semibold px-2 py-0.5 rounded-full text-white animate-pulse"
                                          style={{ background: `var(--primary-brand)` }}
                                        >
                                          বর্তমান অবস্থা
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        <div className="bg-red-50 rounded-xl p-5 text-center border border-red-100">
                          <div className="text-4xl mb-2">
                            {order.status === "cancelled" ? "❌" : "↩️"}
                          </div>
                          <div className="font-bold text-red-700 text-base">
                            {order.status === "cancelled"
                              ? "অর্ডার বাতিল করা হয়েছে"
                              : "পণ্য ফেরত এসেছে"}
                          </div>
                        </div>
                      )}

                      {/* Live Tracking History */}
                      {order.trackingHistory && order.trackingHistory.length > 0 && (
                        <div className="mt-4 border-t border-gray-100 pt-4">
                          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                            ট্র্যাকিং হিস্টোরি
                          </div>
                          <div className="space-y-2">
                            {order.trackingHistory
                              .slice()
                              .reverse()
                              .map((entry, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-start gap-3 text-sm bg-gray-50/70 rounded-xl p-3 border border-gray-100"
                                >
                                  <div
                                    className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                                    style={{ background: `var(--primary-brand)` }}
                                  />
                                  <div className="min-w-0 flex-1">
                                    <div className="font-medium text-gray-800 text-xs sm:text-sm">
                                      {entry.message || entry.rawStatus}
                                    </div>
                                    {entry.rider?.name && (
                                      <div className="text-xs font-semibold text-emerald-700 mt-1 flex items-center gap-1">
                                        <span>🏍️ রাইডার:</span>
                                        <span>{entry.rider.name}</span>
                                        {entry.rider.phone && (
                                          <a
                                            href={`tel:${entry.rider.phone}`}
                                            className="underline font-mono text-emerald-600 hover:text-emerald-800 ml-1"
                                          >
                                            ({entry.rider.phone})
                                          </a>
                                        )}
                                      </div>
                                    )}
                                    <div className="flex items-center gap-2 mt-1 text-[11px] text-gray-400">
                                      <span>
                                        {new Date(entry.timestamp).toLocaleDateString("bn-BD", {
                                          month: "short",
                                          day: "numeric",
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        })}
                                      </span>
                                      {entry.provider && (
                                        <>
                                          <span>•</span>
                                          <span className="uppercase font-semibold text-gray-500">
                                            {entry.provider}
                                          </span>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50/60" />}>
      <TrackOrderContent />
    </Suspense>
  );
}
