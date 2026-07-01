"use client";

import { createContext, ReactNode, useState, useEffect } from "react";
import { CartItem, Product } from "@/types";

interface OrderContextType {
    cartItems: CartItem[];
    addToCart: (product: Product, quantity?: number, size?: string, color?: string) => void;
    removeFromCart: (productId: string, size?: string, color?: string) => void;
    updateQuantity: (productId: string, size: string | undefined, color: string | undefined, quantity: number) => void;
    updateItemSize: (productId: string, oldSize: string | undefined, color: string | undefined, newSize: string) => void;
    updateItemColor: (productId: string, size: string | undefined, oldColor: string | undefined, newColor: string) => void;
    clearCart: () => void;
}

export const OrderContext = createContext<OrderContextType>({
    cartItems: [],
    addToCart: () => { },
    removeFromCart: () => { },
    updateQuantity: () => { },
    updateItemSize: () => { },
    updateItemColor: () => { },
    clearCart: () => { },
});

export const OrderProvider = ({ children }: { children: ReactNode }) => {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);

    // Load from local storage
    useEffect(() => {
        const stored = localStorage.getItem("manbazar-cart");
        if (stored) {
            try {
                setCartItems(JSON.parse(stored));
            } catch (e) {
                console.error("Failed to parse cart", e);
            }
        }
    }, []);

    // Save to local storage
    useEffect(() => {
        localStorage.setItem("manbazar-cart", JSON.stringify(cartItems));
    }, [cartItems]);

    const addToCart = (product: Product, quantity = 1, size?: string, color?: string) => {
        setCartItems(prev => {
            const existingIndex = prev.findIndex(item =>
                item.product._id === product._id && item.size === size && item.color === color
            );
            if (existingIndex >= 0) {
                const newItems = [...prev];
                newItems[existingIndex].quantity += quantity;
                return newItems;
            }
            return [...prev, { product, quantity, size, color }];
        });
    };

    const removeFromCart = (productId: string, size?: string, color?: string) => {
        setCartItems(prev => prev.filter(item =>
            !(item.product._id === productId && item.size === size && item.color === color)
        ));
    };

    const updateQuantity = (productId: string, size: string | undefined, color: string | undefined, quantity: number) => {
        if (quantity < 1) return;
        setCartItems(prev => {
            const newItems = [...prev];
            const idx = newItems.findIndex(item => item.product._id === productId && item.size === size && item.color === color);
            if (idx >= 0) {
                newItems[idx].quantity = quantity;
            }
            return newItems;
        });
    };

    const updateItemSize = (productId: string, oldSize: string | undefined, color: string | undefined, newSize: string) => {
        setCartItems(prev => {
            const newItems = [...prev];
            const idx = newItems.findIndex(item => item.product._id === productId && item.size === oldSize && item.color === color);
            if (idx >= 0) {
                newItems[idx].size = newSize;
            }
            return newItems;
        });
    };

    const updateItemColor = (productId: string, size: string | undefined, oldColor: string | undefined, newColor: string) => {
        setCartItems(prev => {
            const newItems = [...prev];
            const idx = newItems.findIndex(item => item.product._id === productId && item.size === size && item.color === oldColor);
            if (idx >= 0) {
                newItems[idx].color = newColor;
            }
            return newItems;
        });
    };

    const clearCart = () => setCartItems([]);

    return (
        <OrderContext.Provider
            value={{
                cartItems,
                addToCart,
                removeFromCart,
                updateQuantity,
                updateItemSize,
                updateItemColor,
                clearCart
            }}
        >
            {children}
        </OrderContext.Provider>
    );
};