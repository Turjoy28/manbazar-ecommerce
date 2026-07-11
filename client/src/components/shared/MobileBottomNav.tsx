"use client";

import React, { useState, useContext, useEffect, useRef } from "react";
import { Home, Menu, ShoppingBag, Phone, X } from "lucide-react";
import { OrderContext } from "@/providers/OrderProvider";
import { useRouter, usePathname } from "next/navigation";

interface MobileBottomNavProps {
  phoneNumber?: string;
  categories?: { label: string; id: string }[];
}

export default function MobileBottomNav({ phoneNumber, categories }: MobileBottomNavProps) {
  const [activeTab, setActiveTab] = useState("home");
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const { cartItems } = useContext(OrderContext);
  const sheetRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Close bottom sheet on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (sheetRef.current && !sheetRef.current.contains(e.target as Node)) {
        setIsCategoriesOpen(false);
      }
    };
    if (isCategoriesOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isCategoriesOpen]);

  // Prevent body scroll when bottom sheet is open
  useEffect(() => {
    if (isCategoriesOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isCategoriesOpen]);

  const handleHomeClick = () => {
    setActiveTab("home");
    setIsCategoriesOpen(false);
    if (pathname !== "/") {
      router.push("/");
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleCategoriesClick = () => {
    setActiveTab("categories");
    setIsCategoriesOpen((prev) => !prev);
  };

  const handleCartClick = () => {
    setActiveTab("cart");
    setIsCategoriesOpen(false);
    if (pathname !== "/") {
      router.push("/#billing");
    } else {
      const billing = document.getElementById("billing");
      if (billing) {
        billing.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        router.push("/#billing");
      }
    }
  };

  const handleCallClick = () => {
    setActiveTab("call");
    setIsCategoriesOpen(false);
    if (phoneNumber) {
      window.location.href = `tel:${phoneNumber}`;
    }
  };

  const handleCategorySelect = (categoryId: string) => {
    setIsCategoriesOpen(false);
    if (pathname !== "/") {
      router.push(`/#category-${categoryId}`);
    } else {
      // Try to scroll to the specific category section first
      const categorySection = document.getElementById(`category-${categoryId}`);
      if (categorySection) {
        categorySection.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        // Fallback to the general products section
        const section = document.getElementById("products");
        if (section) {
          section.scrollIntoView({ behavior: "smooth", block: "start" });
        } else {
          router.push(`/#category-${categoryId}`);
        }
      }
    }
  };

  const defaultCategories = categories && categories.length > 0
    ? categories
    : [
        { label: "Electronics", id: "electronics" },
        { label: "Fashion", id: "fashion" },
        { label: "Home Appliance", id: "home-appliance" },
        { label: "Beauty", id: "beauty" },
      ];

  const tabs = [
    { id: "home", label: "Home", icon: Home, onClick: handleHomeClick },
    { id: "categories", label: "Categories", icon: Menu, onClick: handleCategoriesClick },
    { id: "cart", label: "Cart", icon: ShoppingBag, onClick: handleCartClick, badge: totalQuantity },
    { id: "call", label: "Call", icon: Phone, onClick: handleCallClick },
  ];

  return (
    <>
      {/* Backdrop overlay when categories sheet is open */}
      <div
        className={`fixed inset-0 z-[998] bg-black/40 backdrop-blur-[2px] transition-opacity duration-300 md:hidden ${
          isCategoriesOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsCategoriesOpen(false)}
      />

      {/* Categories Bottom Sheet / Dropup */}
      <div
        ref={sheetRef}
        className={`fixed left-0 right-0 z-[999] bg-white rounded-t-2xl shadow-[0_-8px_30px_rgba(0,0,0,0.12)] transition-all duration-300 ease-out md:hidden ${
          isCategoriesOpen
            ? "bottom-[68px] translate-y-0 opacity-100"
            : "bottom-[68px] translate-y-full opacity-0 pointer-events-none"
        }`}
      >
        {/* Sheet header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-gray-100">
          <h3 className="text-base font-bold text-gray-800 tracking-tight">
            Categories
          </h3>
          <button
            onClick={() => setIsCategoriesOpen(false)}
            className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="h-4.5 w-4.5 text-gray-500" />
          </button>
        </div>

        {/* Category list */}
        <div className="max-h-[50vh] overflow-y-auto overscroll-contain">
          {defaultCategories.map((cat, index) => (
            <button
              key={cat.id}
              onClick={() => handleCategorySelect(cat.id)}
              className={`w-full flex items-center justify-between px-5 py-3.5 text-left text-[15px] font-medium text-gray-700 hover:bg-primary/5 hover:text-primary active:bg-primary/10 transition-colors duration-150 ${
                index < defaultCategories.length - 1 ? "border-b border-gray-50" : ""
              }`}
            >
              <span>{cat.label}</span>
              <svg
                className="h-4 w-4 text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ))}
        </div>

        {/* Bottom safe area padding */}
        <div className="h-2" />
      </div>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-[1000] bg-white border-t border-gray-200 md:hidden safe-area-bottom">
        <div className="flex items-stretch justify-around h-[68px] max-w-lg mx-auto">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;

            return (
              <button
                key={tab.id}
                onClick={tab.onClick}
                className={`relative flex flex-col items-center justify-center flex-1 gap-0.5 transition-colors duration-200 active:scale-95 ${
                  isActive ? "text-primary" : "text-gray-400"
                }`}
              >
                {/* Icon with optional badge */}
                <div className="relative">
                  <Icon
                    className={`h-[22px] w-[22px] transition-all duration-200 ${
                      isActive ? "stroke-[2.2px]" : "stroke-[1.6px]"
                    }`}
                  />

                  {/* Cart badge */}
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span className="absolute -top-1.5 -right-2.5 min-w-[18px] h-[18px] flex items-center justify-center bg-primary text-white text-[10px] font-bold rounded-full px-1 shadow-sm ring-2 ring-white">
                      {tab.badge > 99 ? "99+" : tab.badge}
                    </span>
                  )}
                </div>

                {/* Label */}
                <span
                  className={`text-[10px] font-semibold leading-tight mt-0.5 tracking-wide ${
                    isActive ? "text-primary" : "text-gray-400"
                  }`}
                >
                  {tab.label}
                </span>

                {/* Active indicator dot */}
                {isActive && (
                  <span className="absolute -top-px left-1/2 -translate-x-1/2 w-5 h-[3px] bg-primary rounded-b-full" />
                )}
              </button>
            );
          })}
        </div>

        {/* iOS safe area */}
        <div className="h-[env(safe-area-inset-bottom)]" />
      </nav>
    </>
  );
}
