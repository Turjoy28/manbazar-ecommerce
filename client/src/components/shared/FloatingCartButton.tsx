"use client";
 
import { useContext } from "react";
import { ShoppingBag } from "lucide-react";
import { OrderContext } from "@/providers/OrderProvider";
 
export default function FloatingCartButton() {
    /* Access the global cart state from OrderContext */
    const { cartItems } = useContext(OrderContext);
 
    /* Calculate total quantity across all cart items */
    const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);
 
    /* Calculate total price of cart items */
    const totalPrice = cartItems.reduce(
        (sum, item) => sum + (item?.product?.price || 0) * item.quantity,
        0
    );
 
    /* Don't render the button if the cart is empty */
    if (totalQuantity === 0) return null;
 
    const handleClick = () => {
        const billingSection = document.getElementById("billing");
        if (billingSection) {
            billingSection.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };
 
    return (
        <button
            onClick={handleClick}
            aria-label={`View cart with ${totalQuantity} items, total price ৳${totalPrice}`}
            className="fixed bottom-1/2 translate-y-1/2 right-4 z-50
                flex flex-col items-center justify-between
                w-20 rounded-lg overflow-hidden border border-primary/90 shadow-xl
                transition-all duration-300 hover:scale-105 active:scale-95
                cursor-pointer select-none bg-primary/[0.04]
                animate-bounce-slow
            "
        >
            {/* Top section: Icon and item count */}
            <div className="flex flex-col items-center justify-center pt-2.5 pb-2 px-1 w-full text-center">
                <ShoppingBag 
                    size={22} 
                    className="text-secondary mb-1 stroke-[1.8]" 
                />
                <span className="text-base font-bold text-secondary leading-none">
                    {totalQuantity}
                </span>
                <span className="text-[9px] font-semibold text-secondary/80 tracking-wider uppercase mt-0.5 leading-none">
                    ITEMS
                </span>
            </div>
 
            {/* Bottom section: Price banner */}
            <div className="w-full bg-primary text-white py-1 px-1 text-xs font-bold border-t border-primary/20 text-center flex items-center justify-center gap-0.5">
                <span>৳</span>
                <span>{totalPrice}</span>
            </div>
        </button>
    );
}
