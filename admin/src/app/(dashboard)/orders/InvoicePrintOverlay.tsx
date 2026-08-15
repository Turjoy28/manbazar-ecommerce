"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { OrderData } from "@/services/order";
import { secureFetch } from "@/lib/secureFetch";

interface InvoicePrintOverlayProps {
  order: OrderData;
  onClose: () => void;
}

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5001/api/v1";

export function InvoicePrintOverlay({ order, onClose }: InvoicePrintOverlayProps) {
  const [uiData, setUiData] = useState<any>(null);

  useEffect(() => {
    secureFetch(`${BASE_URL}/ui/all-data`).then((res: any) => {
      if (res?.data?.[0]) setUiData(res.data[0]);
    });
  }, []);

  useEffect(() => {
    if (!uiData) return;
    const timer = setTimeout(() => { window.print(); }, 500);
    const handleAfterPrint = () => { onClose(); };
    window.addEventListener("afterprint", handleAfterPrint);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("afterprint", handleAfterPrint);
    };
  }, [onClose, uiData]);

  if (!uiData) return (
    <div className="fixed inset-0 z-[9999] bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="text-4xl mb-3">🛵</div>
        <div className="text-gray-500 font-medium">Preparing Invoice...</div>
      </div>
    </div>
  );

  const logo = uiData?.banner?.logo;
  const storeName = uiData?.footer?.storeName || "Manbazar";
  const storePhone = uiData?.footer?.contactDetails?.phone || "+880 1XXXXXXXXX";
  const storeEmail = uiData?.footer?.contactDetails?.email || "contact@manbazar.com";
  const storeAddress = uiData?.footer?.contactDetails?.address || "Dhaka, Bangladesh";

  const totalQty = order.products.reduce((acc, item) => acc + (item.quantity || 0), 0);
  const grandTotal = order.grandTotal || order.total;

  return (
    <div className="fixed inset-0 z-[9999] bg-gray-100 text-black overflow-y-auto">
      <div className="max-w-3xl mx-auto my-8 print:my-0 print:max-w-full">

        {/* Invoice Paper */}
        <div className="relative bg-white shadow-2xl print:shadow-none overflow-hidden">

          {/* Watermark */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 flex items-center justify-center select-none z-0"
            style={{ transform: "rotate(-35deg)" }}
          >
            <span
              className="text-[110px] font-black uppercase whitespace-nowrap"
              style={{ color: "rgba(0,0,0,0.04)", letterSpacing: "0.2em" }}
            >
              {storeName}
            </span>
          </div>

          {/* Top accent bar */}
          <div className="h-2 w-full" style={{ background: "linear-gradient(90deg, #111827 0%, #374151 50%, #111827 100%)" }} />

          {/* Main content */}
          <div className="relative z-10 px-10 pt-8 pb-6">

            {/* HEADER */}
            <div className="flex items-center justify-between mb-6 relative">
              {/* Left: Logo */}
              <div className="flex-1">
                {logo ? (
                  <div className="relative h-28 w-72">
                    <Image src={logo} alt="Logo" fill className="object-contain object-left" />
                  </div>
                ) : (
                  <div className="text-3xl font-black tracking-tight">{storeName}</div>
                )}
                <div className="text-[11px] text-gray-400 mt-1 tracking-wide">{storePhone}</div>
              </div>

              {/* Center: INVOICE */}
              <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center whitespace-nowrap">
                <h1 className="text-4xl font-black tracking-[0.25em] text-black uppercase">INVOICE</h1>
              </div>

              {/* Right: Invoice meta */}
              <div className="flex-1 flex flex-col items-end gap-2 text-right">
                <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5">
                  <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Invoice No</div>
                  <div className="text-sm font-black text-black font-mono">ORD-{order._id.slice(-10).toUpperCase()}</div>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5">
                  <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Date</div>
                  <div className="text-sm font-bold text-black">
                    {new Date(order.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative divider */}
            <div className="flex items-center gap-3 mb-6">
              <div className="h-[2px] flex-1 bg-black" />
              <div className="w-2 h-2 rotate-45 bg-black flex-shrink-0" />
              <div className="h-[2px] w-6 bg-black" />
            </div>

            {/* ADDRESSES */}
            <div className="flex justify-between mb-7 gap-4">
              <div className="bg-gray-50 rounded-xl border border-gray-200 px-5 py-4 flex-1">
                <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">📦 Bill To</div>
                <div className="font-black text-base text-black">{order.customer.name}</div>
                <div className="text-sm text-gray-600 mt-0.5">{order.customer.phone}</div>
                <div className="text-sm text-gray-500 mt-0.5 leading-snug">{order.customer.address}</div>
              </div>
              <div className="bg-gray-50 rounded-xl border border-gray-200 px-5 py-4 flex-1 text-right">
                <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">🏪 From</div>
                <div className="font-black text-base text-black">{storeName}</div>
                <div className="text-sm text-gray-600 mt-0.5">{storePhone}</div>
                <div className="text-sm text-gray-500 mt-0.5">{storeEmail}</div>
                <div className="text-sm text-gray-500 mt-0.5 leading-snug">{storeAddress}</div>
              </div>
            </div>

            {/* PRODUCTS TABLE */}
            <div className="mb-6 rounded-xl overflow-hidden border border-gray-200">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: "linear-gradient(90deg, #111827, #374151)" }} className="text-white">
                    <th className="py-3 px-4 font-semibold text-left">Product Name</th>
                    <th className="py-3 px-3 font-semibold text-center">Color / Size</th>
                    <th className="py-3 px-3 font-semibold text-center">Qty</th>
                    <th className="py-3 px-3 font-semibold text-right">Unit Price</th>
                    <th className="py-3 px-4 font-semibold text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.products.map((p, i) => (
                    <tr
                      key={i}
                      className="border-b border-gray-100"
                      style={{ background: i % 2 === 0 ? "#fff" : "#f9fafb" }}
                    >
                      <td className="py-3 px-4 font-medium text-black">{p.name}</td>
                      <td className="py-3 px-3 text-center text-xs text-gray-500">
                        <span className="bg-gray-100 px-2 py-0.5 rounded-full">{p.color || "—"} / {p.size || "—"}</span>
                      </td>
                      <td className="py-3 px-3 text-center font-bold">{p.quantity}</td>
                      <td className="py-3 px-3 text-right text-gray-700">৳ {(p.price || 0).toLocaleString()}</td>
                      <td className="py-3 px-4 text-right font-black">৳ {((p.price || 0) * p.quantity).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* TOTALS */}
            <div className="flex justify-end mb-8">
              <div className="w-72 rounded-xl overflow-hidden border border-gray-200">
                <div className="flex justify-between px-4 py-2.5 bg-gray-50 border-b border-gray-200 text-sm">
                  <span className="text-gray-500">Total Items</span>
                  <span className="font-bold">{totalQty}</span>
                </div>
                <div className="flex justify-between px-4 py-2.5 bg-gray-50 border-b border-gray-200 text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-bold">৳ {(order.subtotal || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between px-4 py-2.5 bg-gray-50 border-b border-gray-200 text-sm">
                  <span className="text-gray-500 flex items-center gap-1"><span>🛵</span> Delivery</span>
                  <span className="font-bold">৳ {(order.deliveryCharge || 0).toLocaleString()}</span>
                </div>
                <div
                  className="flex justify-between items-center px-4 py-3 text-white"
                  style={{ background: "linear-gradient(90deg, #111827, #374151)" }}
                >
                  <span className="font-bold text-sm uppercase tracking-wider">Grand Total</span>
                  <span className="font-black text-lg">৳ {(grandTotal || 0).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Thin divider */}
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px flex-1 bg-gray-200" />
              <div className="w-1.5 h-1.5 rotate-45 bg-gray-300 flex-shrink-0" />
              <div className="h-px w-4 bg-gray-200" />
            </div>

            {/* FOOTER: Payment + Signature + Thank You */}
            <div className="flex justify-between items-end gap-6">

              {/* Payment info */}
              <div className="flex-1">
                <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Payment Information</div>
                <div className="text-sm text-gray-700">
                  <span className="font-bold text-black">Method: </span>
                  {order.paymentMethod === "bkash" ? "bKash" : "Cash on Delivery"}
                </div>
                {order.paymentMethod === "bkash" && order.bkashTxnId && (
                  <div className="text-sm text-gray-700 mt-0.5">
                    <span className="font-bold text-black">TxnID: </span>{order.bkashTxnId}
                  </div>
                )}
                <div className="mt-5 flex items-center gap-4">
                  <div className="relative w-12 h-10 flex items-center justify-center">
                    {/* Speed lines trailing behind (right side) */}
                    <div className="absolute top-[35%] right-0 w-6 h-[2px] bg-gray-400 rounded-full opacity-0" style={{ animation: "speed-line 0.4s linear infinite" }} />
                    <div className="absolute top-[60%] -right-2 w-4 h-[2px] bg-gray-300 rounded-full opacity-0" style={{ animation: "speed-line 0.3s linear infinite 0.15s" }} />
                    <div className="absolute bottom-[20%] right-1 w-5 h-[2px] bg-gray-400 rounded-full opacity-0" style={{ animation: "speed-line 0.5s linear infinite 0.3s" }} />
                    {/* Scooter */}
                    <div className="text-4xl z-10 drop-shadow-md" style={{ animation: "scooter-fast 0.15s infinite alternate" }}>🛵</div>
                  </div>
                  <div className="flex flex-col justify-center">
                    <div className="font-black text-xs text-green-700 uppercase tracking-wider">Fast Delivery</div>
                    <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">Guaranteed in Dhaka</div>
                  </div>
                </div>
              </div>

              {/* Signature */}
              <div className="flex flex-col items-center text-center translate-y-19">
                <div className="w-48 h-12 flex items-end justify-center pb-1 border-b-2 border-black">
                  <span className="text-4xl" style={{ fontFamily: "'Dancing Script', cursive", color: "#111" }}>
                    {storeName}
                  </span>
                </div>
                <div className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Authorized Signature</div>
              </div>

              {/* Thank you */}
              <div className="flex-1 flex flex-col items-end">
                <div className="text-3xl font-black text-black">Thank You! </div>
                <div className="text-xs text-gray-400 mt-1 text-right leading-relaxed">
                  We appreciate your business.<br />Come back soon!
                </div>
              </div>

            </div>
          </div>

          {/* Bottom accent bar */}
          <div className="h-2 w-full mt-6" style={{ background: "linear-gradient(90deg, #111827 0%, #374151 50%, #111827 100%)" }} />
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&display=swap');

        @keyframes scooter-fast {
          0% { transform: translateY(0px) rotate(-5deg); }
          100% { transform: translateY(-3px) rotate(-10deg); }
        }
        @keyframes speed-line {
          0% { transform: translateX(0px); opacity: 0; }
          20% { opacity: 1; }
          100% { transform: translateX(35px); opacity: 0; }
        }
        @media print {
          @page { margin: 8mm; }
          body * { visibility: hidden; }
          .fixed.inset-0.z-\\[9999\\] {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            background: white !important;
          }
          .fixed.inset-0.z-\\[9999\\], .fixed.inset-0.z-\\[9999\\] * {
            visibility: visible;
          }
          .shadow-2xl { box-shadow: none !important; }
          .my-8 { margin-top: 0 !important; margin-bottom: 0 !important; }
        }
      `}} />
    </div>
  );
}

