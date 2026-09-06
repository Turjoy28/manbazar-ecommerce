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
  customer: { name: string };
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
  };
  trackingHistory?: {
    status: string;
    rawStatus: string;
    message: string;
    provider: string;
    timestamp: string;
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
            ? { ...o, status: data.status, trackingHistory: [...(o.trackingHistory || []), data.tracking] }
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
        if (data.data?.length === 1) {
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
    <div className="min-h-screen bg-[var(--background)] pb-24">
      {/* Hero Section */}
      <div
        className="relative overflow-hidden py-16 md:py-24 px-4"
        style={{
          background: `linear-gradient(135deg, var(--secondary-brand) 0%, color-mix(in srgb, var(--secondary-brand) 85%, var(--primary-brand)) 100%)`,
        }}
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[var(--primary-brand)] rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-[var(--tertiary-brand)] rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-2xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            🚚 অর্ডার ট্র্যাক করুন
          </h1>
          <p className="text-white/70 text-sm md:text-base mb-8">
            আপনার মোবাইল নম্বর দিয়ে অর্ডারের বর্তমান অবস্থা জানুন
          </p>
          <form onSubmit={handleSearch} className="flex gap-2 max-w-md mx-auto">
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="আপনার ফোন নম্বর (01XXXXXXXXX)"
              className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-brand)] focus:border-transparent text-sm"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 rounded-xl font-semibold text-white text-sm transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50"
              style={{ background: `var(--primary-brand)` }}
            >
              {isLoading ? (
                <span className="inline-flex items-center gap-1">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" opacity=".25" /><path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" opacity=".75" /></svg>
                  খুঁজছি...
                </span>
              ) : "ট্র্যাক করুন"}
            </button>
          </form>
        </div>
      </div>

      {/* Results Section */}
      <div className="max-w-3xl mx-auto px-4 -mt-8">
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 border-4 border-[var(--primary-brand)] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!isLoading && hasSearched && orders.length === 0 && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-10 text-center">
            <div className="text-5xl mb-4">📭</div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">কোন অর্ডার পাওয়া যায়নি</h3>
            <p className="text-gray-500 text-sm">এই নম্বরে কোন অর্ডার নেই। দয়া করে সঠিক নম্বর দিয়ে আবার চেষ্টা করুন।</p>
          </div>
        )}

        {!isLoading && orders.length > 0 && (
          <div className="space-y-4">
            {orders.map((order) => {
              const isExpanded = expandedOrder === order._id;
              const currentStep = getStepIndex(order.status);
              const isCancelled = isCancelledOrReturned(order.status);

              return (
                <div
                  key={order._id}
                  className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden transition-all duration-300"
                >
                  {/* Order Header */}
                  <button
                    onClick={() => setExpandedOrder(isExpanded ? null : order._id)}
                    className="w-full px-5 py-4 flex items-center justify-between gap-3 hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0"
                        style={{
                          background: isCancelled
                            ? "rgb(254 226 226)"
                            : `color-mix(in srgb, var(--primary-brand) 15%, transparent)`,
                        }}
                      >
                        {isCancelled
                          ? (order.status === "cancelled" ? CANCELLED_STATUS.icon : RETURNED_STATUS.icon)
                          : STATUS_STEPS[currentStep]?.icon}
                      </div>
                      <div className="text-left min-w-0">
                        <div className="font-bold text-gray-900 text-sm">
                          অর্ডার #{order._id.slice(-8).toUpperCase()}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString("bn-BD", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span
                        className="text-xs font-semibold px-3 py-1 rounded-full"
                        style={{
                          background: isCancelled
                            ? "rgb(254 226 226)"
                            : order.status === "delivered"
                            ? "rgb(220 252 231)"
                            : `color-mix(in srgb, var(--primary-brand) 15%, transparent)`,
                          color: isCancelled
                            ? "rgb(185 28 28)"
                            : order.status === "delivered"
                            ? "rgb(22 101 52)"
                            : `var(--primary-brand)`,
                        }}
                      >
                        {isCancelled
                          ? (order.status === "cancelled" ? CANCELLED_STATUS.label : RETURNED_STATUS.label)
                          : STATUS_STEPS[currentStep]?.label}
                      </span>
                      <svg
                        className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="px-5 pb-5 border-t border-gray-100">
                      {/* Order Summary */}
                      <div className="grid grid-cols-2 gap-3 mt-4 mb-5">
                        <div className="bg-gray-50 rounded-xl p-3">
                          <div className="text-[10px] uppercase font-semibold text-gray-400 mb-0.5">মোট মূল্য</div>
                          <div className="font-bold text-gray-900">৳{(order.grandTotal || order.total).toLocaleString()}</div>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-3">
                          <div className="text-[10px] uppercase font-semibold text-gray-400 mb-0.5">পেমেন্ট</div>
                          <div className="font-bold text-gray-900">
                            {order.paymentMethod === "bkash" ? "bKash" : "ক্যাশ অন ডেলিভারি"}
                          </div>
                        </div>
                      </div>

                      {/* Products */}
                      <div className="mb-5">
                        <div className="text-xs font-semibold text-gray-500 uppercase mb-2">পণ্য সমূহ</div>
                        <div className="space-y-1.5">
                          {order.products.map((p, i) => (
                            <div key={i} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                              <span className="text-sm text-gray-800 font-medium">{p.name}</span>
                              <span className="text-xs text-gray-500 shrink-0">×{p.quantity}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Courier Info */}
                      {order.courier?.provider && (
                        <div className="mb-5 bg-blue-50 rounded-xl p-3">
                          <div className="text-xs font-semibold text-blue-600 uppercase mb-1">কুরিয়ার তথ্য</div>
                          <div className="text-sm text-gray-800">
                            <span className="font-bold uppercase">{order.courier.provider}</span>
                            {order.courier.trackingCode && (
                              <span className="ml-2 text-gray-500">
                                ট্র্যাকিং: <span className="font-mono">{order.courier.trackingCode}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Status Timeline */}
                      {!isCancelled ? (
                        <div className="relative">
                          <div className="text-xs font-semibold text-gray-500 uppercase mb-4">ডেলিভারি স্ট্যাটাস</div>
                          <div className="space-y-0">
                            {STATUS_STEPS.map((step, idx) => {
                              const isActive = idx <= currentStep;
                              const isCurrent = idx === currentStep;
                              return (
                                <div key={step.key} className="flex items-start gap-3">
                                  <div className="flex flex-col items-center">
                                    <div
                                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all duration-300 ${
                                        isCurrent
                                          ? "ring-4 ring-offset-2 scale-110"
                                          : ""
                                      }`}
                                      style={{
                                        background: isActive
                                          ? `var(--primary-brand)`
                                          : "rgb(229 231 235)",
                                        color: isActive ? "white" : "rgb(156 163 175)",
                                        "--tw-ring-color": isCurrent ? `color-mix(in srgb, var(--primary-brand) 30%, transparent)` : undefined,
                                      } as any}
                                    >
                                      {isActive ? "✓" : step.icon}
                                    </div>
                                    {idx < STATUS_STEPS.length - 1 && (
                                      <div
                                        className="w-0.5 h-8"
                                        style={{
                                          background: isActive
                                            ? `var(--primary-brand)`
                                            : "rgb(229 231 235)",
                                        }}
                                      />
                                    )}
                                  </div>
                                  <div className="pt-1 pb-4">
                                    <div
                                      className={`text-sm font-semibold ${
                                        isActive ? "text-gray-900" : "text-gray-400"
                                      }`}
                                    >
                                      {step.label}
                                    </div>
                                    {isCurrent && (
                                      <div className="text-[11px] text-gray-500 mt-0.5">
                                        বর্তমান অবস্থা
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        <div className="bg-red-50 rounded-xl p-4 text-center">
                          <div className="text-3xl mb-2">
                            {order.status === "cancelled" ? "❌" : "↩️"}
                          </div>
                          <div className="font-bold text-red-700">
                            {order.status === "cancelled" ? "অর্ডার বাতিল করা হয়েছে" : "পণ্য ফেরত এসেছে"}
                          </div>
                        </div>
                      )}

                      {/* Tracking History */}
                      {order.trackingHistory && order.trackingHistory.length > 0 && (
                        <div className="mt-5 border-t border-gray-100 pt-4">
                          <div className="text-xs font-semibold text-gray-500 uppercase mb-3">ট্র্যাকিং হিস্টোরি</div>
                          <div className="space-y-2">
                            {order.trackingHistory
                              .slice()
                              .reverse()
                              .map((entry, idx) => (
                                <div key={idx} className="flex gap-3 text-sm">
                                  <div className="text-gray-400 text-xs w-24 shrink-0 pt-0.5">
                                    {new Date(entry.timestamp).toLocaleDateString("bn-BD", {
                                      month: "short",
                                      day: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </div>
                                  <div>
                                    <div className="font-medium text-gray-800">{entry.message || entry.rawStatus}</div>
                                    <div className="text-[10px] text-gray-400 uppercase">{entry.provider}</div>
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
    <Suspense fallback={<div className="min-h-screen bg-[var(--background)]" />}>
      <TrackOrderContent />
    </Suspense>
  );
}
