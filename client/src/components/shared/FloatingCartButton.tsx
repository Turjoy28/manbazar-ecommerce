/* ═══════════════════════════════════════════════════════════════════════════════
   FLOATING CART BUTTON
   A sticky button fixed at the bottom-right of the viewport.
   - Shows the total number of items currently in the cart.
   - On click, smoothly scrolls the user to the #billing section.
   - Hidden when the cart is empty to avoid visual clutter.
   ═══════════════════════════════════════════════════════════════════════════════ */
"use client";

import { useContext } from "react";
import { ShoppingCart } from "lucide-react";
import { OrderContext } from "@/providers/OrderProvider";

export default function FloatingCartButton() {
    /* Access the global cart state from OrderContext */
    const { cartItems } = useContext(OrderContext);

    /* Calculate total quantity across all cart items (not just unique products) */
    const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    /* Don't render the button if the cart is empty */
    if (totalQuantity === 0) return null;

    /**
     * handleClick — smooth-scroll to the billing section
     * We manually scroll instead of using <Link href="#billing"> because
     * Next.js Link triggers a full route navigation which breaks smooth scroll.
     */
    const handleClick = () => {
        const billingSection = document.getElementById("billing");
        if (billingSection) {
            billingSection.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };

    return (
        <button
            onClick={handleClick}
            aria-label={`View cart with ${totalQuantity} items`}
            className="fixed bottom-1/2 right-6 z-50 bg-primary hover:bg-primary/90 text-white p-4 rounded-full shadow-lg shadow-orange-500/30
                transition-all duration-300
                hover:scale-110 hover:shadow-xl hover:shadow-orange-500/40
                active:scale-95
                animate-bounce-slow
            "
        >
            {/* Cart icon with badge overlay showing total quantity */}
            <div className="relative">
                <ShoppingCart size={24} />
                {/* Badge — positioned at top-right corner of the icon */}
                <span className="
                    absolute -top-2.5 -right-2.5
                    bg-white text-primary
                    text-xs font-bold
                    min-w-[20px] h-5
                    flex items-center justify-center
                    rounded-full shadow-sm
                    px-1
                ">
                    {totalQuantity}
                </span>
            </div>
        </button>
    );
}
