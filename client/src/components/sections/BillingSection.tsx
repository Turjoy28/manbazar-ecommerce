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
        <div className="flex lg:flex-row flex-col items-center gap-3 py-2 relative">
          {/* Thumbnail */}
          <div className="relative w-14 h-14 rounded border border-gray-200 overflow-hidden shrink-0">
            <Image
              src={
                item?.product?.thumbnail ||
                item?.product?.images?.[0] ||
                "/placeholder.png"
              }
              alt={item?.product?.name || "Product"}
              fill
              className="object-cover"
              sizes="56px"
            />
          </div>

          {/* Name + qty controls */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate">
              {item?.product?.name}
            </p>
            <div className="flex md:flex-row lg:flex-row flex-col gap-2 mt-1">
              <div className="flex items-center gap-1">
                <button
                  onClick={onDecrease}
                  className="w-6 h-6 rounded border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100 text-sm font-bold"
                >
                  −
                </button>
                <span className="text-sm font-semibold w-5 text-center">
                  {item?.quantity}
                </span>
                <button
                  onClick={onIncrease}
                  className="w-6 h-6 rounded border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100 text-sm font-bold"
                >
                  +
                </button>
              </div>

              {/* select size */}
              <Select
                value={item.size}
                onValueChange={(val) => val && onSizeChange(val)}
              >
                <SelectTrigger className="w-full max-w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Size</SelectLabel>
                    {item?.product?.sizes?.map((size) => (
                      <SelectItem key={size} value={size}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>

              {/* select color */}
              <Select
                value={item.color}
                onValueChange={(val) => val && onColorChange(val)}
              >
                <SelectTrigger className="w-full max-w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Color</SelectLabel>
                    {item?.product?.colors?.map((color) => (
                      <SelectItem key={color} value={color}>
                        {color}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Price */}
          <p className="text-sm font-semibold text-gray-800 shrink-0">
            ৳ {(item?.product?.price * item?.quantity).toFixed(2)}
          </p>
          <Button
            onClick={onDelete}
            className="absolute -top-4 -right-9 cursor-pointer bg-red-500 "
          >
            <X />
          </Button>
        </div>
      ) : (
        ""
      )}
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

  return (
    <div className="mt-4 border border-gray-200 rounded-lg overflow-hidden text-sm">
      {/* Header row */}
      <div className="flex justify-between bg-gray-50 px-4 py-2 font-semibold text-gray-700 border-b border-gray-200">
        <span>Product</span>
        <span>Subtotal</span>
      </div>

      {/* Items */}
      {cart.map((item, idx) => (
        <div
          key={idx}
          className="flex items-center justify-between px-4 py-3 border-b border-gray-100 gap-3"
        >
          <div className="flex items-center gap-2">
            <div className="relative w-8 h-8 rounded overflow-hidden border border-gray-200 shrink-0">
              <Image
                src={
                  item.product.thumbnail ||
                  item.product.images?.[0] ||
                  "/placeholder.png"
                }
                alt={item.product.name}
                fill
                className="object-cover"
                sizes="32px"
              />
            </div>
            <span className="text-gray-700">
              {item.product.name}
              <span className="text-gray-400 text-xs ml-1">
                × {item.quantity}
              </span>
            </span>
          </div>
          <span className="text-gray-800 font-medium">
            ৳ {(item.product.price * item.quantity).toFixed(2)}
          </span>
        </div>
      ))}

      {/* Subtotal */}
      <div className="flex justify-between px-4 py-2 border-b border-gray-200">
        <span className="text-gray-600">Subtotal</span>
        <span className="font-medium text-gray-800">
          ৳ {subtotal.toFixed(2)}
        </span>
      </div>

      <div className="flex justify-between px-4 py-2 border-b border-gray-200">
        <span>Delivery Charge</span>
        <span>৳ {deliveryCharge.toFixed(2)}</span>
      </div>

      {/* Total */}
      <div className="flex justify-between px-4 py-3 bg-gray-50">
        <span className="font-bold text-gray-800">Total</span>
        <span className="font-bold text-gray-900">
          ৳ {(subtotal + deliveryCharge).toFixed(2)}
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

  // Billing form state
  const [billing, setBilling] = useState({
    name: "",
    address: "",
    phone: "",
    paymantMethod: "",
    transactionId: "",
    senderNumber: "",
    location: "dhaka",
  });

  const handleBillingChange =
    (field: keyof typeof billing) => (e: React.ChangeEvent<HTMLInputElemant>) =>
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
  const deliveryCharge = billing.location === "dhaka" ? 80 : 150;

  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item?.product?.price * item.quantity,
    0,
  );

  const grandTotal = totalAmount + deliveryCharge;

  const orderPayload = {
    customer: billing,

    products: cartItems.map((item) => ({
      productId: item.product._id,
      name: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
      size: item.size,
      color: item.color,
    })),

    subtotal: totalAmount,

    deliveryCharge,

    total: grandTotal,
  };

  const handlePlaceOrder = async () => {
    if (
      !billing.name.trim() ||
      !billing.address.trim() ||
      !billing.phone.trim()
    ) {
      alert("Please fill in all required billing fields.");
      return;
    }

    if (cartItems.length === 0) {
      toast.error("Please select a product before placing your order.");
      return;
    }

    try {
      await createOrder(orderPayload);
      clearCart();
      setBilling({
        name: "",
        address: "",
        phone: "",
        paymantMethod: "",
        transactionId: "",
        senderNumber: "",
        location: "dhaka",
      });
      toast.success(`অর্ডার দেওয়া হয়েছে! মোট: ৳${grandTotal.toFixed(2)}`);
    } catch (err: any) {
      toast.error(
        err.message ||
          "Sorry, we could not place your order. Please try again.",
      );
    }
  };

  return (
    <section id="billing" className="py-10 px-4 max-w-5xl mx-auto">
      {cartItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          {/* ── Left: Billing form ── */}
          <form>
            <h2 className="text-lg font-bold text-gray-800 mb-5 border-b border-gray-200 pb-2">
              Billing details
            </h2>

            <div className="flex flex-col gap-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  আপনার নাম <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
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
                  type="text"
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
                  type="tel"
                  value={billing.phone}
                  onChange={handleBillingChange("phone")}
                  placeholder="01XXXXXXXXX"
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
                      <Label htmlFor="dhaka">Inside Dhaka</Label>
                    </div>

                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="outside" id="outside" />
                      <Label htmlFor="outside">Outside Dhaka</Label>
                    </div>
                  </div>
                </RadioGroup>
              </div>
            </div>

            {/* Paymant option */}
            <Label className="mt-5 mb-2 text-base">Paymant option</Label>
            <RadioGroup
              value={billing.paymantMethod}
              onValueChange={(e) =>
                setBilling((prev) => ({ ...prev, paymantMethod: e }))
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
              <FieldLabel htmlFor="online">
                <Field orientation="horizontal">
                  <FieldContent className="flex items-center justify-center h-12.5">
                    <Image
                      src="https://dailyinqilab.com/mediaStorage/content/images/2025November/7-20251104001021.jpg"
                      alt="online paymant"
                      width={100}
                      height={10}
                    />
                  </FieldContent>
                  <RadioGroupItem value="online" id="online" />
                </Field>
              </FieldLabel>
            </RadioGroup>

            {billing.paymantMethod === "online" && (
              <div className="p-3 border border-amber-500 rounded-2xl mt-5">
                <p className="mb-3 text-red-400">
                  এই নাম্বারে টাকা পাঠান: 024254254540
                </p>
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    আপনার ফোন নম্বর <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={billing.senderNumber}
                    onChange={handleBillingChange("senderNumber")}
                    placeholder="যে নাম্বার থেকে টাকা পাঠিয়েছেন সেটি লিখুন"
                    className="w-full border border-gray-300 rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ট্রানজেকশন আইডি <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={billing.transactionId}
                    onChange={handleBillingChange("transactionId")}
                    placeholder="পেমেন্ট করার পর যেই ট্রানজেকশন আইডি পেয়েছেন সেটি লিখুন"
                    className="w-full border border-gray-300 rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                  />
                </div>
              </div>
            )}
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

            {/* Paymant warning */}
            <div className="mt-4 bg-orange-50 border border-orange-200 rounded p-3 text-xs text-orange-700 flex gap-2 items-start">
              <span className="text-orange-400 mt-0.5 shrink-0">ℹ️</span>
              <span>
                Sorry, it seems that there are no available paymant methods for
                your state. Please contact us if you require assistance or wish
                to make alternative arrangemants.
              </span>
            </div>

            {/* Privacy note */}
            <p className="text-xs text-gray-400 mt-3 leading-relaxed">
              Your personal data will be used to process your order, support
              your experience throughout this website, and for other purposes
              described in our{" "}
              <a href="#" className="underline hover:text-gray-600">
                Privacy Policy
              </a>
              .
            </p>

            {/* Place order button */}
            <button
              onClick={handlePlaceOrder}
              className="w-full mt-4 bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-lg text-base transition-colors duration-200 flex items-center justify-center gap-2"
            >
              🔒 Place Order — ৳ {grandTotal.toFixed(2)}
            </button>
          </div>
        </div>
      ) : (
        ""
      )}
    </section>
  );
}
