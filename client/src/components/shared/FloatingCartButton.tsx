"use client";

import { useContext, useState, useRef } from "react";
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

    const buttonRef = useRef<HTMLButtonElement>(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const isDragging = useRef(false);
    const hasDragged = useRef(false);
    const dragOffset = useRef({ x: 0, y: 0 });

    const handleTouchStart = (e: React.TouchEvent<HTMLButtonElement>) => {
        if (window.innerWidth > 768) return; // Only draggable on mobile
        const touch = e.touches[0];
        if (buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            dragOffset.current = {
                x: touch.clientX - rect.left,
                y: touch.clientY - rect.top,
            };
            buttonRef.current.style.transition = 'none';
        }
        isDragging.current = true;
        hasDragged.current = false;
    };

    const handleTouchMove = (e: React.TouchEvent<HTMLButtonElement>) => {
        if (!isDragging.current || window.innerWidth > 768) return;

        const touch = e.touches[0];
        hasDragged.current = true;

        let newX = touch.clientX - dragOffset.current.x;
        let newY = touch.clientY - dragOffset.current.y;

        if (buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            const padding = 10;
            if (newX < padding) newX = padding;
            if (newY < padding) newY = padding;
            if (newX + rect.width > window.innerWidth - padding) newX = window.innerWidth - rect.width - padding;
            if (newY + rect.height > window.innerHeight - padding) newY = window.innerHeight - rect.height - padding;
        }

        setPosition({ x: newX, y: newY });
    };

    const handleTouchEnd = () => {
        if (window.innerWidth > 768) return;
        isDragging.current = false;
        if (buttonRef.current) {
            buttonRef.current.style.transition = '';
        }
    };

    /* Don't render the button if the cart is empty */
    if (totalQuantity === 0) return null;

    const handleClick = (e: React.MouseEvent) => {
        // Prevent click action if the user was just dragging the button
        if (hasDragged.current) {
            hasDragged.current = false;
            e.preventDefault();
            return;
        }
        const billingSection = document.getElementById("billing");
        if (billingSection) {
            billingSection.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };

    const isMoved = position.x !== 0 || position.y !== 0;

    return (
        <button
            ref={buttonRef}
            onClick={handleClick}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            aria-label={`View cart with ${totalQuantity} items, total price ৳${totalPrice}`}
            style={isMoved ? {
                left: `${position.x}px`,
                top: `${position.y}px`,
                bottom: 'auto',
                right: 'auto',
                transform: 'none'
            } : {}}
            className={`fixed z-50 touch-none
                flex flex-col items-center justify-between
                w-14 md:w-20 rounded-lg overflow-hidden border border-primary/90 shadow-xl
                transition-all duration-300 hover:scale-105 active:scale-95
                cursor-pointer select-none bg-primary/[0.04]
                ${!isMoved ? 'bottom-1/2 translate-y-1/2 right-4 animate-bounce-slow' : ''}
            `}
        >
            {/* Top section: Icon and item count */}
            <div className="flex flex-col items-center justify-center pt-2 md:pt-2.5 pb-1.5 md:pb-2 px-1 w-full text-center pointer-events-none">
                <ShoppingBag
                    className="w-5 h-5 md:w-[22px] md:h-[22px] text-secondary mb-1 stroke-[1.8]"
                />
                <span className="text-sm md:text-base font-bold text-secondary leading-none">
                    {totalQuantity}
                </span>
                <span className="text-[8px] md:text-[9px] font-semibold text-secondary/80 tracking-wider uppercase mt-0.5 leading-none">
                    ITEMS
                </span>
            </div>

            {/* Bottom section: Price banner */}
            <div className="w-full bg-primary text-white py-1 px-1 text-[10px] md:text-xs font-bold border-t border-primary/20 text-center flex items-center justify-center gap-0.5 pointer-events-none">
                <span>৳</span>
                <span>{totalPrice}</span>
            </div>
        </button>
    );
}
