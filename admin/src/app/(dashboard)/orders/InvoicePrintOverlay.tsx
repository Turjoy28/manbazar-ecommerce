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
    // Fetch settings for logo and store details
    secureFetch(`${BASE_URL}/ui/all-data`).then((res: any) => {
      if (res?.data?.[0]) setUiData(res.data[0]);
    });
  }, []);

  useEffect(() => {
    if (!uiData) return; // Wait for UI data to render logo properly

    const timer = setTimeout(() => {
      window.print();
    }, 500);

    const handleAfterPrint = () => {
      onClose();
    };

    window.addEventListener("afterprint", handleAfterPrint);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("afterprint", handleAfterPrint);
    };
  }, [onClose, uiData]);

  if (!uiData) return <div className="fixed inset-0 z-[9999] bg-white flex items-center justify-center">Loading Invoice...</div>;

  const logo = uiData?.banner?.logo;
  const storeName = uiData?.footer?.storeName || "Manbazar";
  const storePhone = uiData?.footer?.contactDetails?.phone || "+880 1XXXXXXXXX";
  const storeEmail = uiData?.footer?.contactDetails?.email || "contact@manbazar.com";
  const storeAddress = uiData?.footer?.contactDetails?.address || "Dhaka, Bangladesh";

  const totalQty = order.products.reduce((acc, item) => acc + (item.quantity || 0), 0);

  return (
    <div className="fixed inset-0 z-[9999] bg-white text-black overflow-y-auto">
      <div className="max-w-4xl mx-auto p-10 bg-white min-h-screen print:p-0 print:min-h-0">
        
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div className="flex items-center gap-4">
            {logo && (
              <div className="relative h-12 w-32">
                <Image src={logo} alt="Logo" fill className="object-contain object-left" />
              </div>
            )}
            <h1 className="text-3xl font-bold tracking-tight">INVOICE</h1>
          </div>
          <div className="text-right">
            <div className="text-xs font-semibold text-gray-500">INVOICE NO</div>
            <div className="text-lg font-bold">ORD-{order._id.slice(-10).toUpperCase()}</div>
            <div className="text-xs font-semibold text-gray-500 mt-2">DATE</div>
            <div className="text-sm font-bold">{new Date(order.createdAt).toLocaleDateString("en-GB", { day: '2-digit', month: 'long', year: 'numeric' })}</div>
          </div>
        </div>

        <hr className="border-t-2 border-black mb-8" />

        {/* Addresses */}
        <div className="flex justify-between mb-10">
          <div>
            <div className="text-xs font-bold text-gray-500 uppercase mb-2">Bill To:</div>
            <div className="font-bold text-base">{order.customer.name}</div>
            <div className="text-sm text-gray-600">{order.customer.phone}</div>
            <div className="text-sm text-gray-600">{order.customer.address}</div>
          </div>
          <div className="text-right">
            <div className="text-xs font-bold text-gray-500 uppercase mb-2">From:</div>
            <div className="font-bold text-base">{storeName}</div>
            <div className="text-sm text-gray-600">{storePhone}</div>
            <div className="text-sm text-gray-600">{storeEmail}</div>
            <div className="text-sm text-gray-600 max-w-[250px]">{storeAddress}</div>
          </div>
        </div>

        {/* Table */}
        <div className="mb-8">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-black text-white text-left">
                <th className="py-2 px-3 font-semibold">Product Name</th>
                <th className="py-2 px-3 font-semibold text-center">Color / Size</th>
                <th className="py-2 px-3 font-semibold text-center">Qty</th>
                <th className="py-2 px-3 font-semibold text-right">Price</th>
                <th className="py-2 px-3 font-semibold text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {order.products.map((p, i) => (
                <tr key={i} className="border-b border-gray-200">
                  <td className="py-3 px-3">
                    <div className="font-medium text-black">{p.name}</div>
                  </td>
                  <td className="py-3 px-3 text-center text-gray-600 text-xs">
                    {(p.color || "N/A")} / {(p.size || "N/A")}
                  </td>
                  <td className="py-3 px-3 text-center font-medium">
                    {p.quantity}
                  </td>
                  <td className="py-3 px-3 text-right">
                    ৳ {p.price}
                  </td>
                  <td className="py-3 px-3 text-right font-bold">
                    ৳ {p.price * p.quantity}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end mb-16">
          <div className="w-72">
            <div className="flex justify-between py-1 border-b border-gray-200 text-sm">
              <span className="text-gray-600">Total Qty:</span>
              <span className="font-bold">{totalQty}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-200 text-sm mt-1">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-bold">৳ {(order.total || 0) - (order.deliveryCharge || 0)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-200 text-sm mt-1">
              <span className="text-gray-600">Delivery:</span>
              <span className="font-bold">৳ {order.deliveryCharge}</span>
            </div>
            <div className="flex justify-between items-center bg-black text-white px-3 py-2 mt-2">
              <span className="font-bold text-sm">Grand Total</span>
              <span className="font-bold">৳ {order.total}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-end">
          <div>
            <div className="font-bold text-sm mb-1">Payment Information:</div>
            <div className="text-xs text-gray-600">
              <span className="font-bold text-black">Method:</span> {order.paymentMethod === "bkash" ? "bKash" : "CashOnDelivery"}
            </div>
            {order.paymentMethod === "bkash" && order.bkashTxnId && (
              <div className="text-xs text-gray-600">
                <span className="font-bold text-black">TxnID:</span> {order.bkashTxnId}
              </div>
            )}
            <div className="text-xs text-gray-500 mt-3 italic">
              Items exchangeable within 7 days. No cash refund.
            </div>
          </div>
          <div>
            <div className="text-2xl font-black">Thank You!</div>
          </div>
        </div>

      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * {
            visibility: hidden;
          }
          .fixed.inset-0.z-\\[9999\\] {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
          }
          .fixed.inset-0.z-\\[9999\\], .fixed.inset-0.z-\\[9999\\] * {
            visibility: visible;
          }
        }
      `}} />
    </div>
  );
}
