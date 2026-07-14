"use client";

import { useContext, useEffect, useState } from "react";
import Image from "next/image";
import { CartItem } from "@/types";
import { OrderContext } from "@/providers/OrderProvider";
import { createOrder } from "@/services/order";
import { toast } from "sonner";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Field, FieldContent, FieldLabel } from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { X } from "lucide-react";

// ─── Cart item row ─────────────────────────────────────────────────────────
function CartItemRow({
  item,
  onIncrease,
  onDecrease,
  onSizeChange,
  onColorChange,
  onDelete,
}: {
  item: CartItem;
  onIncrease: () => void;
  onDecrease: () => void;
  onSizeChange: (value: string) => void;
  onColorChange: (value: string) => void;
  onDelete: () => void;
}) {
  return (
    <>
      {item?.product ? (
        <div className="flex flex-row items-start gap-3 py-3 relative pr-8">
          {/* Thumbnail */}
          <div className="relative w-20 h-20 rounded-md border border-gray-200 overflow-hidden shrink-0 bg-gray-50">
            <Image
              src={
                item?.product?.thumbnail ||
                item?.product?.images?.[0] ||
                "/placeholder.png"
              }
              alt={item?.product?.name || "Product"}
              fill
              className="object-cover"
              sizes="80px"
            />
          </div>

          {/* Name + controls */}
          <div className="flex-1 min-w-0 flex flex-col gap-1.5">
            <p className="text-sm font-medium text-gray-800 line-clamp-2 leading-tight pr-2">
              {item?.product?.name}
            </p>
            
            <p className="text-[15px] font-bold text-gray-900">
              ৳ {(item?.product?.price * item?.quantity).toFixed(2)}
            </p>

            <div className="flex flex-wrap items-center gap-2 mt-0.5">
              {/* Qty */}
              <div className="flex items-center bg-white border border-gray-300 rounded">
                <button onClick={onDecrease} className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-gray-100 text-sm font-bold active:bg-gray-200">−</button>
                <span className="text-xs font-semibold w-6 text-center">{item?.quantity}</span>
                <button onClick={onIncrease} className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-gray-100 text-sm font-bold active:bg-gray-200">+</button>
              </div>

              {/* select size */}
              {item.size && (
                <Select
                  value={item.size}
                  onValueChange={(val) => val && onSizeChange(val)}
                >
                  <SelectTrigger className="h-7 px-2 py-0 text-xs w-auto min-w-[60px] border-gray-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel className="text-xs">Size</SelectLabel>
                      {item?.product?.sizes?.map((size) => (
                        <SelectItem key={size} value={size} className="text-xs">
                          {size}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              )}

              {/* select color */}
              {item.color && (
                <Select
                  value={item.color}
                  onValueChange={(val) => val && onColorChange(val)}
                >
                  <SelectTrigger className="h-7 px-2 py-0 text-xs w-auto min-w-[70px] border-gray-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel className="text-xs">Color</SelectLabel>
                      {item?.product?.colors?.map((color) => (
                        <SelectItem key={color} value={color} className="text-xs">
                          {color}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          {/* Delete Button */}
          <button
            onClick={onDelete}
            className="absolute top-2 right-0 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
            title="Remove item"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : null}
    </>
  );
}

// ─── Order summary table ───────────────────────────────────────────────────
function OrderSummary({
  cart,
  deliveryCharge,
}: {
  cart: CartItem[];
  deliveryCharge: number;
}) {
  const subtotal = cart.reduce(
    (sum, item) => sum + item?.product?.price * item.quantity,
    0,
  );

  const totalVat = cart.reduce((sum, item, idx) => {
    const vatPercent = item?.product?.vatPercentage || 0;
    return sum + (item?.product?.price * item.quantity * (vatPercent / 100));
  }, 0);

  const total = subtotal + totalVat;
  const grandTotal = total + deliveryCharge;

  return (
    <div className="mt-4 border border-gray-200 rounded-xl overflow-hidden text-sm bg-white shadow-sm">
      {/* Header row */}
      <div className="flex justify-between bg-gray-50/80 px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200">
        <span>Product</span>
        <span>Subtotal</span>
      </div>

      {/* Items List */}
      <div className="divide-y divide-gray-100">
        {cart.map((item, idx) => {
          const itemVatPercent = item?.product?.vatPercentage || 0;
          return (
            <div
              key={idx}
              className="flex items-center justify-between px-5 py-4 gap-4 bg-white"
            >
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-md overflow-hidden border border-gray-100 shrink-0 shadow-sm">
                  <Image
                    src={
                      item.variant?.images?.[0] ||
                      item.product.thumbnail ||
                      item.product.images?.[0] ||
                      "/placeholder.png"
                    }
                    alt={item.product.name}
                    fill
                    className="object-cover"
                    sizes="40px"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-800 font-medium leading-tight">
                    {item.product.name}
                  </span>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className="text-gray-500 text-xs">
                      Qty: {item.quantity}
                    </span>
                    
                    {/* Display Size & Color */}
                    {(item.size || item.color) && (
                      <span className="text-gray-400 text-[10px] bg-gray-100 px-1.5 py-0.5 rounded-sm whitespace-nowrap">
                        {[item.size, item.color].filter(Boolean).join(" · ")}
                      </span>
                    )}

                    {itemVatPercent > 0 && (
                      <span className="bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded text-[10px] font-semibold">
                        VAT {itemVatPercent}%
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <span className="text-gray-900 font-medium tabular-nums shrink-0">
                ৳ {(item.product.price * item.quantity).toFixed(2)}
              </span>
            </div>
          );
        })}
      </div>

      {/* Breakdown Section */}
      <div className="bg-gray-50/50 px-5 py-4 space-y-3 border-t border-gray-200">
        {/* Subtotal Row */}
        <div className="flex justify-between items-center text-gray-600">
          <span>Subtotal</span>
          <span className="font-medium tabular-nums">
            ৳ {subtotal.toFixed(2)}
          </span>
        </div>

        {/* VAT Row */}
        <div className="flex justify-between items-center text-gray-600">
          <span>VAT Amount</span>
          <span className="font-medium tabular-nums">
            ৳ {totalVat.toFixed(2)}
          </span>
        </div>

        {/* Midway Total Row */}
        <div className="flex justify-between items-center text-gray-800 font-semibold pt-2 border-t border-gray-200/60">
          <span>Total (incl. VAT)</span>
          <span className="tabular-nums">
            ৳ {total.toFixed(2)}
          </span>
        </div>

        {/* Delivery Charge Row */}
        <div className="flex justify-between items-center text-gray-600">
          <span>Delivery Charge</span>
          <span className="font-medium tabular-nums">
            ৳ {deliveryCharge.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Grand Total Row */}
      <div className="flex justify-between items-center px-5 py-4 bg-gray-50 border-t border-gray-200">
        <span className="font-bold text-gray-900 text-base">Grand Total</span>
        <span className="font-bold text-primary text-xl tabular-nums">
          ৳ {grandTotal.toFixed(2)}
        </span>
      </div>
    </div>
  );
}

// ─── Main billing section ──────────────────────────────────────────────────
export default function BillingSection() {
  const {
    cartItems,
    updateQuantity,
    updateItemSize,
    updateItemColor,
    removeFromCart,
    clearCart,
  } = useContext(OrderContext);

  const [isSuccess, setIsSuccess] = useState(false);

  // Billing form state
  const [billing, setBilling] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
    paymentMethod: "",
    bkashTxnId: "",
    senderNumber: "",
    location: "dhaka",
  });

  const handleBillingChange =
    (field: keyof typeof billing) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setBilling((prev) => ({ ...prev, [field]: e.target.value }));

  const handleIncrease = (item: CartItem) =>
    updateQuantity(item.product._id, item.size, item.color, item.quantity + 1);

  const handleDecrease = (item: CartItem) =>
    updateQuantity(item.product._id, item.size, item.color, item.quantity - 1);

  const handleSizeChange = (item: CartItem, size: string) =>
    updateItemSize(item.product._id, item.size, item.color, size);

  const handleColorChange = (item: CartItem, color: string) =>
    updateItemColor(item.product._id, item.size, item.color, color);

  const handleRemoveItem = (item: CartItem) =>
    removeFromCart(item.product._id, item.size, item.color);
  // Calculate dynamic delivery charge by summing the delivery charges of items in the cart
  const deliveryCharge = cartItems.length === 0 ? 0 : Math.max(
    ...cartItems.map((item) => {
      const charges = item.product?.deliveryCharge || [];
      const isDhaka = billing.location === "dhaka";
      const match = charges.find((d) =>
        d.text.toLowerCase().includes(isDhaka ? "inside" : "outside")
      );
      return (match && typeof match.price === 'number') ? match.price : (isDhaka ? 50 : 150);
    })
  );

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item?.product?.price * item.quantity,
    0,
  );

  const totalVat = cartItems.reduce((sum, item, idx) => {
    const vatPercent = item?.product?.vatPercentage || 0;
    return sum + (item?.product?.price * item.quantity * (vatPercent / 100));
  }, 0);

  const totalAmount = subtotal + totalVat; // Total including VAT

  const grandTotal = totalAmount + deliveryCharge;

  const orderPayload = {
    customer: { ...billing, email: billing.email || undefined },

    // Top-level payment fields for lifecycle management
    paymentMethod: billing.paymentMethod || "cod",
    bkashTxnId: billing.paymentMethod === "bkash" ? billing.bkashTxnId : null,

    products: cartItems.map((item) => ({
      id: item.product._id,
      productId: item.product.productId || item.product._id || "",
      name: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
      size: item.size,
      color: item.color,
    })),

    subtotal: subtotal,
    vat: totalVat,
    deliveryCharge,
    total: grandTotal,
  };

  const handlePlaceOrder = async () => {
    if (
      !billing.name.trim() ||
      !billing.address.trim() ||
      !billing.phone.trim()
    ) {
      toast.error("Please fill in all required billing fields.");
      return;
    }

    const phoneRegex = /^01[0-9]{9}$/;
    if (!phoneRegex.test(billing.phone.trim())) {
      toast.error("আপনার ফোন নম্বরটি সঠিক নয়। দয়া করে ১১ ডিজিটের সঠিক নম্বর দিন (যেমন: 01XXXXXXXXX)।");
      return;
    }

    if (cartItems.length === 0) {
      toast.error("Please select a product before placing your order.");
      return;
    }

    if (billing.paymentMethod === "bkash" && !billing.bkashTxnId.trim()) {
      toast.error("Please enter your bKash Transaction ID before placing the order.");
      return;
    }

    try {
      await createOrder(orderPayload);
      clearCart();
      setBilling({
        name: "",
        address: "",
        phone: "",
        email: "",
        paymentMethod: "",
        bkashTxnId: "",
        senderNumber: "",
        location: "dhaka",
      });
      setIsSuccess(true);
      toast.success(`অর্ডার দেওয়া হয়েছে! মোট: ৳${grandTotal.toFixed(2)}`);
    } catch (err: any) {
      toast.error(
        err.message ||
        "Sorry, we could not place your order. Please try again.",
      );
    }
  };

  return (
    <section id="billing" className="py-2 px-4 max-w-5xl mx-auto scroll-mt-24">
      {isSuccess ? (
        <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in duration-500">
          <div className="w-24 h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-6 shadow-sm">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-3">Order Placed Successfully!</h2>
          <p className="text-gray-600 max-w-md mx-auto text-lg mb-8">
            Thank you for your purchase. We have received your order and will contact you shortly for confirmation.
          </p>
          <button
            onClick={() => {
              setIsSuccess(false);
              const productsSection = document.getElementById("products");
              if (productsSection) {
                productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
              } else {
                window.location.href = "/#products";
              }
            }}
            className="px-8 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      ) : cartItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12">
          {/* ── Left: Billing form ── */}
          <form>
            <h2 className="text-lg font-bold text-gray-800 mb-3 border-b border-gray-200">
              Billing details
            </h2>

            <div className="flex flex-col gap-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  আপনার নাম <span className="text-red-500">*</span>
                </label>
                <input
                  type="name"
                  value={billing.name}
                  onChange={handleBillingChange("name")}
                  placeholder="আপনার পুরো নাম লিখুন"
                  className="w-full border border-gray-300 rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                />
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  আপনার সম্পূর্ণ ঠিকানা <span className="text-red-500">*</span>
                </label>
                <input
                  type="address"
                  value={billing.address}
                  onChange={handleBillingChange("address")}
                  placeholder="House number and street name"
                  className="w-full border border-gray-300 rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  আপনার ফোন নম্বর <span className="text-red-500">*</span>
                </label>

                <input
                  type="number"
                  value={billing.phone}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, "");
                    handleBillingChange("phone")({ target: { value: val } } as any);
                  }}
                  maxLength={11}
                  placeholder="01XXXXXXXXX"
                  className="w-full border border-gray-300 rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                />
              </div>

              {/* Email (Optional) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ইমেইল <span className="text-gray-400 text-xs font-normal">(ঐচ্ছিক — ইনভয়েস পেতে)</span>
                </label>
                <input
                  type="email"
                  value={billing.email}
                  onChange={handleBillingChange("email")}
                  placeholder="example@email.com"
                  className="w-full border border-gray-300 rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                />
              </div>

              {/* delivery area */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Delivery Area
                </label>

                <RadioGroup
                  value={billing.location}
                  onValueChange={(v) =>
                    setBilling((prev) => ({
                      ...prev,
                      location: v,
                    }))
                  }
                >
                  <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="dhaka" id="dhaka" />
                      <Label htmlFor="dhaka">ঢাকার ভিতরে</Label>
                    </div>

                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="outside" id="outside" />
                      <Label htmlFor="outside">ঢাকার বাইরে</Label>
                    </div>
                  </div>
                </RadioGroup>
              </div>
            </div>

            {/* Payment option */}
            <Label className="mt-5 mb-2 text-base">Payment option</Label>
            <RadioGroup
              value={billing.paymentMethod}
              onValueChange={(e) =>
                setBilling((prev) => ({ ...prev, paymentMethod: e }))
              }
              className="flex"
            >
              <FieldLabel htmlFor="COD">
                <Field orientation="horizontal">
                  <FieldContent className="flex items-center justify-center h-12.5">
                    <Image
                      src="https://urbanattire-bd.com/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fcash-on-delivery.aeaebb08.png&w=128&q=75"
                      alt="cash on delivery"
                      width={100}
                      height={100}
                      className=""
                    />
                  </FieldContent>
                  <RadioGroupItem value="cod" id="COD" />
                </Field>
              </FieldLabel>
              <FieldLabel htmlFor="bkash">
                <Field orientation="horizontal">
                  <FieldContent className="flex items-center justify-center h-12.5">
                    <Image
                      src="https://dailyinqilab.com/mediaStorage/content/images/2025November/7-20251104001021.jpg"
                      alt="bKash payment"
                      width={100}
                      height={10}
                    />
                  </FieldContent>
                  <RadioGroupItem value="bkash" id="bkash" />
                </Field>
              </FieldLabel>
            </RadioGroup>

            {billing.paymentMethod === "bkash" && (
              <div className="p-3 border border-pink-400 rounded-2xl mt-5">
                <p className="mb-3 text-red-400 font-medium">
                  এই bKash নাম্বারে টাকা পাঠান: 01XXXXXXXXX
                </p>
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    আপনার bKash নম্বর <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={billing.senderNumber}
                    onChange={handleBillingChange("senderNumber")}
                    placeholder="যে নাম্বার থেকে টাকা পাঠিয়েছেন সেটি লিখুন"
                    className="w-full border border-gray-300 rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    bKash ট্রানজেকশন আইডি <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={billing.bkashTxnId}
                    onChange={handleBillingChange("bkashTxnId")}
                    placeholder="পেমেন্ট করার পর যেই ট্রানজেকশন আইডি পেয়েছেন সেটি লিখুন"
                    className="w-full border border-gray-300 rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition"
                  />
                </div>
              </div>
            )}
            
            {/* Place order button under form */}
            <button
              onClick={(e) => {
                e.preventDefault();
                handlePlaceOrder();
              }}
              className="w-full mt-6 bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-lg text-lg shadow-md transition-all duration-300 flex items-center justify-center gap-2 animate-cta-bounce hover:shadow-lg"
            >
              🔒 Confirm Order — ৳ {grandTotal.toFixed(2)}
            </button>
          </form>

          {/* ── Right: Cart + Order Summary ── */}
          <div>
            {/* Cart selector heading */}
            <h2 className="text-sm font-semibold text-gray-700 mb-3">
              কোন শার্টটি নিবেন তার কোন সাইজেরটা সিলেক্ট করুন
            </h2>

            {/* Cart items */}
            <div className="border border-gray-200 rounded-lg px-4 divide-y divide-gray-100">
              {cartItems.map((item, idx) => (
                <CartItemRow
                  key={item.product._id + "-" + item.size + "-" + item.color}
                  item={item}
                  onIncrease={() => handleIncrease(item)}
                  onDecrease={() => handleDecrease(item)}
                  onSizeChange={(size) => handleSizeChange(item, size)}
                  onColorChange={(color) => handleColorChange(item, color)}
                  onDelete={() => handleRemoveItem(item)}
                />
              ))}
            </div>

            {/* Your order summary */}
            <h2 className="text-base font-bold text-gray-800 mt-6 mb-2">
              Your order
            </h2>
            <OrderSummary cart={cartItems} deliveryCharge={deliveryCharge} />



            {/* Privacy note */}
            <p className="text-xs text-gray-400 mt-3 leading-relaxed">
              Your personal data will be used to process your order, support
              your experience throughout this website, and for other purposes
              described in our{" "}
              <a href="#" className="underline hover:text-gray-600">
                Privacy Policy
              </a>

            </p>

      
          </div>
        </div>
      ) : (
        ""
      )}
    </section>
  );
}
